declare module '@elizaos/core' {
  export type UUID = string;
  export interface Character {
    id?: UUID;
    name: string;
    username?: string;
    email?: string;
    settings?: Record<string, any>;
    modelProvider?: string;
    imageModelProvider?: string;
    imageVisionModelProvider?: string;
    plugins?: any[];
    lore?: string[];
    knowledge?: any[];
    adjectives?: string[];
    topics?: string[];
    messageExamples?: any[][];
    postExamples?: string[];
    bio?: string | string[];
    style?: {
      all?: string[];
      chat?: string[];
      post?: string[];
    };
    templates?: {
      evaluationTemplate?: string;
    };
  }
}
