import { embed, getEmbeddingZeroVector } from "./embedding.ts";
import elizaLogger from "./logger.ts";
import type { IAgentRuntime, IMemoryManager, Memory, UUID } from "./types.ts";

/**
 * Manage memories in the database.
 */
export class MemoryManager implements IMemoryManager {
    /**
     * The AgentRuntime instance associated with this manager.
     */
    public runtime: IAgentRuntime;

    /**
     * The name of the database table this manager operates on.
     */
    tableName = "memories";

    /**
     * Constructs a new MemoryManager instance.
     * @param runtime The AgentRuntime instance associated with this manager.
     */
    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;
    }

    /**
     * Adds an embedding vector to a memory object. If the memory already has an embedding, it is returned as is.
     * @param memory The memory object to add an embedding to.
     * @returns A Promise resolving to the memory object, potentially updated with an embedding vector.
     */
    async addEmbeddingToMemory(memory: Memory): Promise<Memory> {
        if (!memory.content || !memory.content.text) {
            elizaLogger.warn("No text content to embed");
            return memory;
        }

        try {
            // Generate embedding from text content
            const embedding = await embed(this.runtime, memory.content.text);
            return {
                ...memory,
                embedding,
            };
        } catch (error) {
            elizaLogger.error("Failed to generate embedding:", error);
            // Fallback to zero vector if embedding fails
            return {
                ...memory,
                embedding: getEmbeddingZeroVector(),
            };
        }
    }

    /**
     * Retrieves a list of memories by user IDs, with optional deduplication.
     * @param opts Options including user IDs, count, and uniqueness.
     * @param opts.roomId The room ID to retrieve memories for.
     * @param opts.count The number of memories to retrieve.
     * @param opts.unique Whether to retrieve unique memories only.
     * @returns A Promise resolving to an array of Memory objects.
     */
    async getMemories({
        roomId,
        count = 100,
        unique = false,
        start,
        end,
    }: {
        roomId: UUID;
        count?: number;
        unique?: boolean;
        start?: number;
        end?: number;
    }): Promise<Memory[]> {
        return await this.runtime.databaseAdapter.getMemories({
            roomId,
            count,
            unique,
            start,
            end,
            tableName: this.tableName,
            agentId: this.runtime.agentId,
        });
    }

    /**
     * Retrieves cached embeddings from the database.
     * @param content The content to retrieve cached embeddings for.
     * @returns A Promise resolving to an array of cached embeddings.
     */
    async getCachedEmbeddings(content: string): Promise<
        {
            embedding: number[];
            levenshtein_score: number;
        }[]
    > {
        const memories = await this.runtime.databaseAdapter.getCachedEmbeddings({
            roomId: this.runtime.agentId,
        });

        // Filter and transform memories to match expected return type
        return memories
            .filter(memory => memory.embedding)
            .map(memory => ({
                embedding: memory.embedding!,
                levenshtein_score: 0, // Default score since we don't have Levenshtein distance
            }));
    }

    /**
     * Searches for memories similar to a given embedding vector.
     * @param embedding The embedding vector to search with.
     * @param opts Options including match threshold, count, user IDs, and uniqueness.
     * @param opts.match_threshold The similarity threshold for matching memories.
     * @param opts.count The maximum number of memories to retrieve.
     * @param opts.roomId The room ID to retrieve memories for.
     * @param opts.unique Whether to retrieve unique memories only.
     * @returns A Promise resolving to an array of Memory objects that match the embedding.
     */
    async searchMemoriesByEmbedding(
        embedding: number[],
        opts: {
            match_threshold?: number;
            count?: number;
            roomId: UUID;
            unique?: boolean;
        }
    ): Promise<Memory[]> {
        const {
            match_threshold = 0.1,
            count = 10,
            roomId,
            unique,
        } = opts;

        const result = await this.runtime.databaseAdapter.searchMemories({
            tableName: this.tableName,
            roomId,
            agentId: this.runtime.agentId,
            embedding: embedding,
            match_threshold: match_threshold,
            match_count: count,
            unique: !!unique,
        });

        return result;
    }

    /**
     * Creates a new memory in the database, with an option to check for similarity before insertion.
     * @param memory The memory object to create.
     * @param unique Whether to check for similarity before insertion.
     * @returns A Promise that resolves when the operation completes.
     */
    async createMemory(memory: Memory, unique = false): Promise<void> {
        // TODO: check memory.agentId == this.runtime.agentId

        const existingMessage =
            await this.runtime.databaseAdapter.getMemoryById(memory.id);

        if (existingMessage) {
            elizaLogger.debug("Memory already exists, skipping");
            return;
        }

        elizaLogger.log("Creating Memory", memory.id, memory.content.text);

        await this.runtime.databaseAdapter.createMemory(
            memory,
            this.tableName,
            unique
        );
    }

    async getMemoriesByRoomIds(params: { roomIds: UUID[], limit?: number; }): Promise<Memory[]> {
        return await this.runtime.databaseAdapter.getMemoriesByRoomIds({
            tableName: this.tableName,
            agentId: this.runtime.agentId,
            roomIds: params.roomIds,
            limit: params.limit
        });
    }

    async getMemoryById(id: UUID): Promise<Memory | null> {
        const result = await this.runtime.databaseAdapter.getMemoryById(id);
        if (result && result.agentId !== this.runtime.agentId) return null;
        return result;
    }

    async getMemory(query: {
        id?: UUID;
        agentId?: UUID;
        userId?: UUID;
        type?: string;
    }): Promise<Memory | null> {
        const memories = await this.getMemories({
            roomId: query.agentId || this.runtime.agentId,
            count: 100,
            unique: true,
        });

        for (const memory of memories) {
            if (
                (!query.id || memory.id === query.id) &&
                (!query.agentId || memory.agentId === query.agentId) &&
                (!query.userId || memory.userId === query.userId) &&
                (!query.type || memory.type === query.type)
            ) {
                return memory;
            }
        }
        return null;
    }

    /**
     * Removes a memory from the database by its ID.
     * @param memoryId The ID of the memory to remove.
     * @returns A Promise that resolves when the operation completes.
     */
    async removeMemory(memoryId: UUID): Promise<void> {
        await this.runtime.databaseAdapter.removeMemory(
            memoryId,
            this.tableName
        );
    }

    /**
     * Removes all memories associated with a set of user IDs.
     * @param roomId The room ID to remove memories for.
     * @returns A Promise that resolves when the operation completes.
     */
    async removeAllMemories(roomId: UUID): Promise<void> {
        await this.runtime.databaseAdapter.removeAllMemories(
            roomId,
            this.tableName
        );
    }

    /**
     * Counts the number of memories associated with a set of user IDs, with an option for uniqueness.
     * @param roomId The room ID to count memories for.
     * @param unique Whether to count unique memories only.
     * @returns A Promise resolving to the count of memories.
     */
    async countMemories(roomId: UUID, unique = true): Promise<number> {
        return await this.runtime.databaseAdapter.countMemories(
            roomId,
            unique,
            this.tableName
        );
    }
}
