import { Action, IAgentRuntime, Memory, ActionExample, Content } from '../packages/core/src/types';
import { fal } from '@fal-ai/client';

/**
 * Custom action for generating character art using fal-ai/fast-lightning-sdxl model
 */
export const generateCharacterArt: Action = {
  name: "GENERATE_CHARACTER_ART",
  similes: ["CREATE_CHARACTER_IMAGE", "MAKE_CHARACTER_ART", "RENDER_CHARACTER"],
  description: "Generates character artwork based on text descriptions using the fal-ai/fast-lightning-sdxl model",
  
  examples: [
    [
      {
        user: "user1",
        content: {
          text: "Generate a character art of a cyberpunk samurai with glowing red eyes"
        }
      }
    ],
    [
      {
        user: "user2",
        content: {
          text: "Can you create art for my D&D character? She's an elf druid with green hair"
        }
      }
    ]
  ],
  
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    // Check if the message contains a character description
    if (!message.content || typeof message.content.text !== 'string') {
      return false;
    }
    
    // Check if the message seems to be requesting a character image
    const lowerContent = message.content.text.toLowerCase();
    return (
      lowerContent.includes('character') &&
      (lowerContent.includes('generate') || 
       lowerContent.includes('create') || 
       lowerContent.includes('draw') || 
       lowerContent.includes('make'))
    );
  },
  
  handler: async (runtime: IAgentRuntime, message: Memory) => {
    try {
      // Extract description from the message
      const description = message.content.text;
      
      // Get the FAL AI API key from environment or config
      const apiKey = runtime.getSetting('FAL_KEY'); // Updated to match FAL's recommended env var name
      
      if (!apiKey) {
        // Create error response memory
        const responseMemory: Memory = {
          id: undefined,
          userId: message.userId,
          agentId: runtime.agentId,
          roomId: message.roomId,
          content: {
            text: "Error: FAL AI API key is not configured. Please set the FAL_KEY in your environment or character configuration."
          }
        };
        
        // Process the response
        await runtime.processActions(message, [responseMemory]);
        return false;
      }
      
      console.log(`Generating character art using fal-ai/fast-lightning-sdxl`);
      console.log(`Prompt: ${description}`);
      
      // Configure FAL AI client with API key
      fal.config({
        credentials: apiKey
      });
      
      // Use the FAL AI client to generate the image
      const result = await fal.subscribe("fal-ai/fast-lightning-sdxl", {
        input: {
          prompt: description,
          image_size: "square_hd", // 1024x1024
          num_inference_steps: "4", // Must be a string enum value ("1", "2", "4", or "8")
          seed: Math.floor(Math.random() * 2147483647)
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });
      
      // Access the image URL from the response based on the API's structure
      if (result?.data?.images && result.data.images.length > 0) {
        const imageUrl = result.data.images[0].url;
        
        // Create response memory with image attachment
        const responseContent: Content = {
          text: "Here's your generated character art:",
          attachments: [{
            id: `fal-img-${Date.now()}`,
            url: imageUrl,
            title: "Generated Character Art",
            source: "FAL AI",
            description: description,
            text: "",
            contentType: "image/jpeg"
          }]
        };
        
        const responseMemory: Memory = {
          id: undefined,
          userId: message.userId,
          agentId: runtime.agentId,
          roomId: message.roomId,
          content: responseContent
        };
        
        // Process the response
        await runtime.processActions(message, [responseMemory]);
        return true;
      } else {
        throw new Error('No image URL in the response');
      }
    } catch (error) {
      console.error('Error generating character art:', error);
      
      // Create error response memory
      const responseMemory: Memory = {
        id: undefined,
        userId: message.userId,
        agentId: runtime.agentId,
        roomId: message.roomId,
        content: {
          text: `Sorry, I encountered an error while generating character art: ${error.message}`
        }
      };
      
      // Process the response
      await runtime.processActions(message, [responseMemory]);
      return false;
    }
  }
};

export default generateCharacterArt;
