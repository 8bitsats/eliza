import { Action, IAgentRuntime, Memory, ActionExample, Content } from '../packages/core/src/types';
import axios from 'axios';

/**
 * Custom action for generating images using Grok's image generation model
 */
export const generateGrokImage: Action = {
  name: "GENERATE_GROK_IMAGE",
  similes: ["CREATE_GROK_IMAGE", "MAKE_GROK_IMAGE", "RENDER_WITH_GROK"],
  description: "Generates images based on text descriptions using Grok's image generation model",
  
  examples: [
    [
      {
        user: "user1",
        content: {
          text: "Generate an image of a sunset over the mountains using Grok"
        }
      }
    ],
    [
      {
        user: "user2",
        content: {
          text: "Can you create a Grok image of a futuristic city?"
        }
      }
    ]
  ],
  
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    // Check if the message contains a description
    if (!message.content || typeof message.content.text !== 'string') {
      return false;
    }
    
    // Check if the message seems to be requesting a Grok image
    const lowerContent = message.content.text.toLowerCase();
    return (
      lowerContent.includes('grok') &&
      (lowerContent.includes('image') || 
       lowerContent.includes('generate') || 
       lowerContent.includes('create') || 
       lowerContent.includes('make'))
    );
  },
  
  handler: async (runtime: IAgentRuntime, message: Memory) => {
    try {
      // Extract description from the message
      const description = message.content.text;
      
      // Get the Grok API key from environment or config
      const apiKey = runtime.getSetting('GROK_API_KEY');
      
      if (!apiKey) {
        // Create error response memory
        const responseMemory: Memory = {
          id: undefined,
          userId: message.userId,
          agentId: runtime.agentId,
          roomId: message.roomId,
          content: {
            text: "Error: Grok API key is not configured. Please set the GROK_API_KEY in your environment or character configuration."
          }
        };
        
        // Process the response
        await runtime.processActions(message, [responseMemory]);
        return false;
      }
      
      console.log(`Generating image with Grok`);
      console.log(`Prompt: ${description}`);
      
      // Make sure the prompt is Grok-specific
      const grokPrompt = description.toLowerCase().includes('grok') 
        ? description 
        : `Using Grok's image generation capabilities: ${description}`;
      
      // Send the API request to Grok API (using standard OpenAI-compatible format)
      const response = await axios.post('https://api.grok.ai/v1/images/generations', {
        prompt: grokPrompt,
        n: 1, // Generate one image
        size: "1024x1024", // Standard size
        response_format: "url" // Get URL to the image
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.data && response.data.data[0]?.url) {
        const imageUrl = response.data.data[0].url;
        
        // Create response memory with image attachment
        const responseContent: Content = {
          text: "Here's your generated image from Grok:",
          attachments: [{
            id: `grok-img-${Date.now()}`,
            url: imageUrl,
            title: "Generated Grok Image",
            source: "Grok",
            description: grokPrompt,
            text: "",
            contentType: "image/png"
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
      console.error('Error generating image with Grok:', error);
      
      // Create error response memory
      const responseMemory: Memory = {
        id: undefined,
        userId: message.userId,
        agentId: runtime.agentId,
        roomId: message.roomId,
        content: {
          text: `Sorry, I encountered an error while generating an image with Grok: ${error.message}`
        }
      };
      
      // Process the response
      await runtime.processActions(message, [responseMemory]);
      return false;
    }
  }
};

export default generateGrokImage;
