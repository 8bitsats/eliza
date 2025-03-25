import { DatabaseAdapter } from './DatabaseAdapter.js';
import { elizaLogger } from '../logger.js';
import {
    type Account,
    type Actor,
    type GoalStatus,
    type Goal,
    type Memory,
    type Relationship,
    type UUID,
    type RAGKnowledgeItem,
    type Participant,
} from "../types.js";

// import { Float32Array } from 'util';
// declare global {
//     interface Float32Array {}
// }

class TestDatabase extends DatabaseAdapter {
    async init(): Promise<void> {
        elizaLogger.info('Setting up test database...');
        // Initialize test data
        elizaLogger.info('Test database setup complete');
    }
    async close(): Promise<void> {
        elizaLogger.info('Closing test database...');
    }
    async getAccountById(userId: UUID): Promise<Account | null> {
        console.log('getAccountById');
        return null as any;
    }
    async createAccount(account: Account): Promise<boolean> {
        console.log('createAccount');
        return true as any;
    }
    async getMemories(params: { agentId: UUID; roomId: UUID; count?: number | undefined; unique?: boolean | undefined; tableName: string; }): Promise<Memory[]> {
        console.log('getMemories');
        return [] as any;
    }
    async getMemoriesByRoomIds(params: { agentId: UUID; roomIds: UUID[]; tableName: string; limit?: number | undefined; }): Promise<Memory[]> {
        console.log('getMemoriesByRoomIds');
        return [] as any;
    }
    async getMemoryById(id: UUID): Promise<Memory | null> {
        console.log('getMemoryById');
        return null;
    }
    async getMemoriesByIds(memoryIds: UUID[], tableName?: string | undefined): Promise<Memory[]> {
        console.log('getMemoriesByIds');
        return [] as any;
    }
    async getCachedEmbeddings(params: { query_table_name: string; query_threshold: number; query_input: string; query_field_name: string; query_field_sub_name: string; query_match_count: number; }): Promise<{ embedding: number[]; levenshtein_score: number; }[]> {
        console.log('getCachedEmbeddings');
        return [];
    }
    async log(params: { body: { [key: string]: unknown; }; userId: UUID; roomId: UUID; type: string; }): Promise<void> {
        console.log('log');
         return;
    }
    async getActorDetails(params: { roomId: UUID; }): Promise<Actor[]> {
        console.log('getActorDetails');
        return [] as any;
    }
    async searchMemories(params: { tableName: string; agentId: UUID; roomId: UUID; embedding: any; match_threshold: number; match_count: number; unique: boolean; }): Promise<Memory[]> {
        console.log('searchMemories');
        return [] as any;
    }
    async updateGoalStatus(params: { goalId: UUID; status: GoalStatus; }): Promise<void> {
        console.log('updateGoalStatus');
         return;
    }
    async searchMemoriesByEmbedding(embedding: number[], params: { match_threshold?: number | undefined; count?: number | undefined; roomId?: UUID | undefined; agentId?: UUID | undefined; unique?: boolean | undefined; tableName: string; }): Promise<Memory[]> {
        console.log('searchMemoriesByEmbedding');
        return [] as any;
    }
    async createMemory(memory: Memory, tableName: string, unique?: boolean | undefined): Promise<void> {
        console.log('createMemory');
         return;
    }
    async removeMemory(memoryId: UUID, tableName: string): Promise<void> {
        console.log('removeMemory');
         return;
    }
    async removeAllMemories(roomId: UUID, tableName: string): Promise<void> {
        console.log('removeAllMemories');
    }
    async countMemories(roomId: UUID, unique?: boolean | undefined, tableName?: string | undefined): Promise<number> {
        console.log('countMemories');
        return 0;
    }
    async getGoals(params: { agentId: UUID; roomId: UUID; userId?: UUID | null | undefined; onlyInProgress?: boolean | undefined; count?: number | undefined; }): Promise<Goal[]> {
        console.log('getGoals');
        return [] as any;
    }
    async updateGoal(goal: Goal): Promise<void> {
        console.log('updateGoal');
         return;
    }
    async createGoal(goal: Goal): Promise<void> {
        console.log('createGoal');
         return;
    }
    async removeGoal(goalId: UUID): Promise<void> {
        console.log('removeGoal');
         return;
    }
    async removeAllGoals(roomId: UUID): Promise<void> {
        console.log('removeAllGoals');
         return;
    }
    getRoom(roomId: UUID): Promise<UUID | null> {
        console.log('getRoom');
        return null;
    }
    createRoom(roomId?: UUID | undefined): Promise<UUID> {
        console.log('createRoom');
         return "" as UUID;
    }
    removeRoom(roomId: UUID): Promise<void> {
        console.log('removeRoom');
         return;
    }
    async getRoomsForParticipant(userId: UUID): Promise<UUID[]> {
        console.log('getRoomsForParticipant');
        return [];
    }
    async getRoomsForParticipants(userIds: UUID[]): Promise<UUID[]> {
        console.log('getRoomsForParticipants');
        return [];
    }
    async addParticipant(userId: UUID, roomId: UUID): Promise<boolean> {
        console.log('addParticipant');
        return true;
    }
    async removeParticipant(userId: UUID, roomId: UUID): Promise<boolean> {
        console.log('removeParticipant');
        return true;
    }
    async getParticipantsForAccount(userId: UUID): Promise<Participant[]> {
        console.log('getParticipantsForAccount');
        return [];
    }
    async getParticipantsForRoom(roomId: UUID): Promise<UUID[]> {
        console.log('getParticipantsForRoom');
        return [];
    }
    async getParticipantUserState(roomId: UUID, userId: UUID): Promise<"FOLLOWED" | "MUTED" | null> {
        console.log('getParticipantUserState');
        return null;
    }
    async setParticipantUserState(roomId: UUID, userId: UUID, state: "FOLLOWED" | "MUTED" | null): Promise<void> {
        console.log('setParticipantUserState');
         return;
    }
    async createRelationship(params: { userA: UUID; userB: UUID; }): Promise<boolean> {
        console.log('createRelationship');
        return true;
    }
    async getRelationship(params: { userA: UUID; userB: UUID; }): Promise<Relationship | null> {
        console.log('getRelationship');
        return null;
    }
    async getRelationships(params: { userId: UUID; }): Promise<Relationship[]> {
        console.log('getRelationships');
        return [];
    }
        async getKnowledge(params: { id?: UUID; agentId: UUID; limit?: number; query?: string; conversationContext?: string; }): Promise<RAGKnowledgeItem[]> {
                console.log('getKnowledge');
        return [];
    }
    async searchKnowledge(params: { agentId: UUID; embedding: any; match_threshold: number; match_count: number; searchText?: string; }): Promise<RAGKnowledgeItem[]> {
                console.log('searchKnowledge');
        return [];
    }
    async createKnowledge(knowledge: RAGKnowledgeItem): Promise<void> {
                console.log('createKnowledge');
         return;
    }
    async removeKnowledge(id: UUID): Promise<void> {
                console.log('removeKnowledge');
         return;
    }
    async clearKnowledge(agentId: UUID, shared?: boolean): Promise<void> {
                console.log('clearKnowledge');
    }
}

export async function setupTestDatabase() {
    elizaLogger.info('Setting up test database...');
    // Create a mock database adapter for testing
    const testDb = new TestDatabase();

    // Initialize test data
    await testDb.init();

    elizaLogger.info('Test database setup complete');
    return testDb;
}
