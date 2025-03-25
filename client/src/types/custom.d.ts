declare module '@elizaos/core' {
  export type UUID = string;
  
  export interface Character {
    id: UUID;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Content {
    text?: string;
    attachments?: Attachment[];
  }
  
  export interface Attachment {
    id: string;
    url: string;
    title?: string;
    source?: string;
    description?: string;
    text?: string;
    contentType: string;
  }
}
