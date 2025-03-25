declare module '@elizaos/core' {
  export interface PluginContext {
    config: {
      get: (key: string) => any;
      set: (key: string, value: any) => void;
    };
    logger: {
      info: (message: string) => void;
      error: (message: string) => void;
      warn: (message: string) => void;
      debug: (message: string) => void;
    };
  }

  export interface Plugin {
    init: (context: PluginContext) => Promise<void>;
  }
}
