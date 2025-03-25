import { Action, IAgentRuntime, Memory, ActionExample, Content } from '../packages/core/src/types';
// @ts-ignore - Ignoring to suppress missing types error
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
      
      // Parse optional parameters if present in the message
      const imageSize = parseImageSize(description) || "1024x1024";
      const imageCount = parseImageCount(description) || 1;
      const responseFormat = "url"; // Default to URL
      
      // Get the Grok API key from environment or config
      const apiKey = runtime.getSetting('XAI_API_KEY') || runtime.getSetting('GROK_API_KEY');
      
      if (!apiKey) {
        // Create error response memory
        const responseMemory: Memory = {
          id: undefined,
          userId: message.userId,
          agentId: runtime.agentId,
          roomId: message.roomId,
          type: 'grok_image',
          lastUpdated: new Date(),
          content: {
            text: "Error: Grok API key is not configured. Please set the XAI_API_KEY or GROK_API_KEY in your environment or character configuration."
          }
        };
        
        // Process the response
        await runtime.processActions(message, [responseMemory]);
        return false;
      }
      
      console.log(`Generating image with Grok`);
      console.log(`Prompt: ${description}`);
      console.log(`Size: ${imageSize}, Count: ${imageCount}`);
      
      // Make sure the prompt is Grok-specific
      const grokPrompt = description.toLowerCase().includes('grok') 
        ? description 
        : `Using Grok's image generation capabilities: ${description}`;
      
      // Send the API request to Grok API (using standard OpenAI-compatible format)
      const response = await axios.post('https://api.x.ai/v1/images/generations', {
        prompt: grokPrompt,
        n: imageCount, // Generate the specified number of images
        model: "grok-2-image",
        size: imageSize,
        response_format: responseFormat
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        // Process and attach all generated images
        const attachments = response.data.data.map((imageData: any, index: number) => {
          const imageUrl = imageData.url;
          const revisedPrompt = imageData.revised_prompt || "";
          
          return {
            id: `grok-img-${Date.now()}-${index}`,
            url: imageUrl,
            title: `Generated Grok Image ${index + 1}`,
            source: "Grok",
            description: revisedPrompt || grokPrompt,
            text: "",
            contentType: "image/png"
          };
        });
        
        // Create response memory with image attachments
        const responseContent: Content = {
          text: imageCount > 1 
            ? `Here are your ${imageCount} generated images from Grok:`
            : "Here's your generated image from Grok:",
          attachments
        };
        
        // If there's revised prompt info, add it to the response
        if (response.data.data[0]?.revised_prompt) {
          responseContent.text += `\n\nGrok revised your prompt to: "${response.data.data[0].revised_prompt}"`;
        }
        
        const responseMemory: Memory = {
          id: undefined,
          userId: message.userId,
          agentId: runtime.agentId,
          roomId: message.roomId,
          type: 'grok_image',
          lastUpdated: new Date(),
          content: responseContent
        };
        
        // Process the response
        await runtime.processActions(message, [responseMemory]);
        return true;
      } else {
        throw new Error('No image URL in the response');
      }
    } catch (error: any) {
      console.error('Error generating image with Grok:', error);
      
      // Create error response memory
      const responseMemory: Memory = {
        id: undefined,
        userId: message.userId,
        agentId: runtime.agentId,
        roomId: message.roomId,
        type: 'grok_image',
        lastUpdated: new Date(),
        content: {
          text: `Sorry, I encountered an error while generating an image with Grok: ${error.message || 'Unknown error'}`
        }
      };
      
      // Process the response
      await runtime.processActions(message, [responseMemory]);
      return false;
    }
  }
};

// Helper function to parse image size from message
function parseImageSize(message: string): string | null {
  // Check for common size mentions
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("portrait") || lowerMessage.includes("vertical")) {
    return "1024x1792";
  } else if (lowerMessage.includes("landscape") || lowerMessage.includes("horizontal")) {
    return "1792x1024";
  } else if (lowerMessage.includes("square")) {
    return "1024x1024";
  }
  
  // Check for specific dimensions
  const sizeRegex = /(\d+)\s*[x×]\s*(\d+)/i;
  const match = message.match(sizeRegex);
  if (match) {
    const width = parseInt(match[1]);
    const height = parseInt(match[2]);
    
    // Validate that dimensions are within allowed values
    const validSizes = ["1024x1024", "1024x1792", "1792x1024"];
    const requestedSize = `${width}x${height}`;
    
    if (validSizes.includes(requestedSize)) {
      return requestedSize;
    }
    
    // Find closest valid size
    if (width === height) {
      return "1024x1024";
    } else if (width > height) {
      return "1792x1024";
    } else {
      return "1024x1792";
    }
  }
  
  return null;
}

// Helper function to parse image count from message
function parseImageCount(message: string): number | null {
  const lowerMessage = message.toLowerCase();
  
  // Check for explicit count mentions
  const countRegex = /\b(\d+)\s+(images?|pictures?|photos?)\b/i;
  const match = message.match(countRegex);
  
  if (match) {
    const count = parseInt(match[1]);
    // Return between 1-4 images
    return Math.min(Math.max(count, 1), 4);
  }
  
  // Check for multiple or several
  if (lowerMessage.includes("multiple") || lowerMessage.includes("several")) {
    return 3;
  }
  
  // Check for pair, couple, two
  if (lowerMessage.includes("pair") || lowerMessage.includes("couple") || lowerMessage.includes("two images")) {
    return 2;
  }
  
  return null;
}

export default generateGrokImage;
