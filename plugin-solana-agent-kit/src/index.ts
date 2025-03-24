import { Plugin } from "@elizaos/core";
import { deployCollectionAction } from "./actions/deployCollection";
import { deploySplTokenAction } from "./actions/deployToken";
import { voiceAssistantAction, startVoiceListeningAction, stopVoiceListeningAction } from "./actions/voiceAssistant";

export const solanaAgentKitPlugin: Plugin = {
  name: 'solana-agent-kit',
  description: 'Solana Agent Kit plugin',
  actions: [
    deploySplTokenAction, 
    deployCollectionAction, 
    voiceAssistantAction,
    startVoiceListeningAction,
    stopVoiceListeningAction
  ],
}
