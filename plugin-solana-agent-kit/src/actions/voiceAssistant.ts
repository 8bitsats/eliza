import { Action, composeContext, elizaLogger, GoalStatus, ModelClass } from "@elizaos/core";
import { z } from "zod";
import { voiceAssistantService } from "../../plugins/pumpfun-plugin/src/voice-assistant-service";

export const VoiceCommandSchema = z.object({
  command: z.string().nullable(),
  enable: z.boolean().optional(),
  configureApi: z.boolean().optional(),
  deepgramKey: z.string().optional(),
  openaiKey: z.string().optional(),
  livekitKey: z.string().optional()
});

export type VoiceCommandParams = z.infer<typeof VoiceCommandSchema>;

export function isVoiceCommandParamsValid(params: any): params is VoiceCommandParams {
  return VoiceCommandSchema.safeParse(params).success;
}

export const voiceAssistantAction: Action = {
  name: 'VOICE_ASSISTANT',
  similes: ["VOICE_COMMAND", "SPEECH_RECOGNITION"],
  description: 'Process voice commands for token operations using Deepgram AI',
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Process voice command: Create a token called SpaceToken with symbol SPACE",
          action: "VOICE_ASSISTANT",
          content: {
            command: "Create a token called SpaceToken with symbol SPACE"
          }
        }
      },
      {
        user: "voicebot",
        content: {
          text: "I've processed your voice command to create SpaceToken with symbol SPACE. Would you like me to proceed with launching this token?"
        }
      }
    ]
  ],
  handler: async (runtime, message, state, options?, callback?) => {
    if (message.userId === runtime.agentId) {
      return;
    }

    elizaLogger.info('Starting voice assistant process', { messageId: message.id });

    // Extract command from message content
    const content = message.content;
    if (!content) {
      callback({
        text: 'Please provide a voice command.',
      });
      return false;
    }

    // Parse the command
    const params = content as VoiceCommandParams;
    elizaLogger.info('Voice command parameters', { params });

    // Check if we're enabling/disabling the voice assistant
    if (params.enable !== undefined) {
      const result = await voiceAssistantService.setEnabled(params.enable);
      if (result.success) {
        callback({
          text: params.enable 
            ? 'Voice assistant has been enabled.' 
            : 'Voice assistant has been disabled.'
        });
      } else {
        callback({
          text: `Failed to ${params.enable ? 'enable' : 'disable'} voice assistant: ${result.error}`
        });
      }
      return true;
    }

    // Check if we're configuring API keys
    if (params.configureApi) {
      const apiKeys: {[key: string]: string} = {};
      if (params.deepgramKey) apiKeys.deepgram = params.deepgramKey;
      if (params.openaiKey) apiKeys.openai = params.openaiKey;
      if (params.livekitKey) apiKeys.livekit = params.livekitKey;

      const result = await voiceAssistantService.configureApiKeys(apiKeys);
      if (result.success) {
        callback({
          text: 'Voice assistant API keys have been configured successfully.'
        });
      } else {
        callback({
          text: `Failed to configure API keys: ${result.error}`
        });
      }
      return true;
    }

    // Process the voice command
    if (params.command) {
      const result = await voiceAssistantService.processVoiceCommand(params.command);
      if (result.success) {
        callback({
          text: result.response
        });
      } else {
        callback({
          text: `Failed to process voice command: ${result.error}`
        });
      }
      return true;
    }

    callback({
      text: 'Please provide a valid voice command or configuration option.'
    });
    return false;
  },
  validate: (runtime, message, state) => {
    const content = message.content || {};
    const text = message.text || '';

    // Check if this is a voice command message
    const isVoiceCommand = 
      text.toLowerCase().includes('voice command') ||
      text.toLowerCase().includes('voice assistant') ||
      content.action === 'VOICE_ASSISTANT' ||
      content.action === 'VOICE_COMMAND' ||
      content.action === 'SPEECH_RECOGNITION';
    
    if (!isVoiceCommand) {
      return { probability: 0, status: GoalStatus.IRRELEVANT };
    }

    return { probability: 1, status: GoalStatus.READY };
  }
};

export const startVoiceListeningAction: Action = {
  name: 'START_VOICE_LISTENING',
  similes: ["BEGIN_LISTENING", "START_LISTENING"],
  description: 'Start listening for voice commands',
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Start listening for voice commands",
          action: "START_VOICE_LISTENING"
        }
      },
      {
        user: "voicebot",
        content: {
          text: "I'm now listening for voice commands. You can speak to give instructions."
        }
      }
    ]
  ],
  handler: async (runtime, message, state, options?, callback?) => {
    if (message.userId === runtime.agentId) {
      return;
    }

    elizaLogger.info('Starting voice listening', { messageId: message.id });

    const result = await voiceAssistantService.startListening();
    if (result.success) {
      callback({
        text: "I'm now listening for voice commands. You can speak to give instructions."
      });
    } else {
      callback({
        text: `Failed to start listening: ${result.error}`
      });
    }
    return true;
  },
  validate: (runtime, message, state) => {
    const text = message.text || '';

    // Check if this is a start listening command
    const isStartListeningCommand = 
      text.toLowerCase().includes('start listening') ||
      text.toLowerCase().includes('begin listening') ||
      text.toLowerCase().includes('listen for voice');
    
    if (!isStartListeningCommand) {
      return { probability: 0, status: GoalStatus.IRRELEVANT };
    }

    return { probability: 1, status: GoalStatus.READY };
  }
};

export const stopVoiceListeningAction: Action = {
  name: 'STOP_VOICE_LISTENING',
  similes: ["END_LISTENING", "STOP_LISTENING"],
  description: 'Stop listening for voice commands',
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Stop listening for voice commands",
          action: "STOP_VOICE_LISTENING"
        }
      },
      {
        user: "voicebot",
        content: {
          text: "I've stopped listening for voice commands."
        }
      }
    ]
  ],
  handler: async (runtime, message, state, options?, callback?) => {
    if (message.userId === runtime.agentId) {
      return;
    }

    elizaLogger.info('Stopping voice listening', { messageId: message.id });

    const result = await voiceAssistantService.stopListening();
    if (result.success) {
      callback({
        text: "I've stopped listening for voice commands."
      });
    } else {
      callback({
        text: `Failed to stop listening: ${result.error}`
      });
    }
    return true;
  },
  validate: (runtime, message, state) => {
    const text = message.text || '';

    // Check if this is a stop listening command
    const isStopListeningCommand = 
      text.toLowerCase().includes('stop listening') ||
      text.toLowerCase().includes('end listening') ||
      text.toLowerCase().includes('stop voice listening');
    
    if (!isStopListeningCommand) {
      return { probability: 0, status: GoalStatus.IRRELEVANT };
    }

    return { probability: 1, status: GoalStatus.READY };
  }
};
