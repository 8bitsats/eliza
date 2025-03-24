# Eliza Custom Image Generation Actions

This directory contains custom actions for the Eliza agent that enable image generation using different AI models:

1. **Character Art Generator** - Uses the `fal-ai/fast-lightning-sdxl` model to generate character artwork
2. **Grok Image Generator** - Uses Grok's image generation capabilities

## Setup Instructions

### 1. Install Dependencies

```bash
cd custom_actions
npm install
```

### 2. Configure API Keys

You'll need to set up the following API keys in your environment or Eliza configuration:

- **FAL AI**: Set `FAL_KEY` environment variable with your FAL AI API key
- **Grok**: Set `GROK_API_KEY` environment variable with your Grok API key

### 3. Testing

To test these custom actions, ensure they are properly configured in your `elizaConfig.yaml` file:

```yaml
customActions:
  - ../custom_actions/generateCharacterArt.ts
  - ../custom_actions/generateGrokImage.ts
```

## Usage Examples

### Generate Character Art

Prompt the agent with something like:

```
Generate a character art of a cyberpunk samurai with glowing red eyes
```

### Generate Image with Grok

Prompt the agent with something like:

```
Create a Grok image of a futuristic city
```

## Implementation Details

### Character Art Generator

The Character Art Generator uses the `@fal-ai/client` library to interact with the Fast Lightning SDXL model. The action:

1. Validates whether the user request is asking for character art generation
2. Configures the FAL AI client with your API key
3. Submits the prompt to the model
4. Returns the generated image as an attachment in the response

### Grok Image Generator

The Grok Image Generator uses an OpenAI-compatible API format to interact with Grok's image generation capabilities. The action:

1. Validates whether the user request is asking for Grok image generation
2. Enhances the prompt to ensure it's Grok-specific if needed
3. Submits the prompt to the Grok API
4. Returns the generated image as an attachment in the response

## Troubleshooting

If you encounter issues:

1. Ensure your API keys are correctly set in the environment or configuration
2. Check the console logs for error messages
3. Verify that the elizaConfig.yaml file has the correct paths to the custom action files
