import type { IAgentRuntime, UUID } from "./types.ts";
import { z } from "zod";
import { embed } from "./embedding.ts";
import { getMemory, MemoryManager, type Memory, type Content } from "./memory.ts";
import { getRelationshipScore, calculateScore } from "./scoring.ts";
import { stringToUuid } from "./uuid.ts";

export async function createRelationship({
    runtime,
    userA,
    userB,
}: {
    runtime: IAgentRuntime;
    userA: UUID;
    userB: UUID;
}): Promise<boolean> {
    return runtime.databaseAdapter.createRelationship({
        userA,
        userB,
    });
}

export async function getRelationship({
    runtime,
    userA,
    userB,
}: {
    runtime: IAgentRuntime;
    userA: UUID;
    userB: UUID;
}) {
    return runtime.databaseAdapter.getRelationship({
        userA,
        userB,
    });
}

export async function getRelationships({
    runtime,
    userId,
}: {
    runtime: IAgentRuntime;
    userId: UUID;
}) {
    return runtime.databaseAdapter.getRelationships({ userId });
}

export async function formatRelationships({
    runtime,
    userId,
}: {
    runtime: IAgentRuntime;
    userId: UUID;
}) {
    const relationships = await getRelationships({ runtime, userId });

    const formattedRelationships = relationships.map(
        (relationship: Relationship) => {
            const { userA, userB } = relationship;

            if (userA === userId) {
                return userB;
            }

            return userA;
        }
    );

    return formattedRelationships;
}

export interface RelationshipData {
    id: UUID;
    agentId: UUID;
    userId: UUID;
    score: number;
    lastUpdated: Date;
}

export interface RelationshipManager {
    getRelationship(agentId: UUID, userId: UUID): Promise<RelationshipData | null>;
    updateRelationship(agentId: UUID, userId: UUID, score: number): Promise<void>;
}

export class DefaultRelationshipManager implements RelationshipManager {
    private memoryManager: MemoryManager;

    constructor(memoryManager: MemoryManager) {
        this.memoryManager = memoryManager;
    }

    async getRelationship(agentId: UUID, userId: UUID): Promise<RelationshipData | null> {
        const memory = await this.memoryManager.getMemory({
            agentId,
            userId,
            type: "relationship",
        });

        if (!memory) {
            return null;
        }

        return this.memoryToRelationship(memory);
    }

    async updateRelationship(agentId: UUID, userId: UUID, score: number): Promise<void> {
        const relationship = await this.getRelationship(agentId, userId);
        const newScore = relationship ? calculateScore(relationship.score, score) : score;

        await this.memoryManager.createMemory({
            id: stringToUuid(`${agentId}-${userId}-relationship`),
            agentId,
            userId,
            type: "relationship",
            content: {
                text: "",
                score: newScore,
            },
            lastUpdated: new Date(),
        });
    }

    private memoryToRelationship(memory: Memory): RelationshipData {
        return {
            id: memory.id,
            agentId: memory.agentId,
            userId: memory.userId,
            score: memory.content.score,
            lastUpdated: memory.lastUpdated,
        };
    }
}
