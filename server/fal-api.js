const express = require('express');
const axios = require('axios');
const router = express.Router();

// Environment variables should be set for production
const FAL_API_KEY = process.env.FAL_API_KEY || '6e204267-48f9-42d6-bbde-f97ca68b47d2:3c31a5673c3fc4312a1af06db27b1edd';

/**
 * Generate art using fal.ai API based on a text prompt
 */
router.post('/generate-art', async (req, res) => {
  try {
    const {
      prompt,
      model = 'fast-sdxl',
      width = 768,
      height = 768,
      seed,
      steps = 25,
      style = 'abstract',
    } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    // Enhance the prompt based on the selected style
    let enhancedPrompt = prompt;
    if (style === 'digital') {
      enhancedPrompt += ', digital art style, high tech, glowing elements';
    } else if (style === 'cinematic') {
      enhancedPrompt += ', cinematic lighting, movie scene, dramatic atmosphere';
    } else if (style === 'anime') {
      enhancedPrompt += ', anime style, cel shaded, vibrant colors';
    }

    // Add quality terms to all prompts
    enhancedPrompt += ', high quality, masterpiece, highly detailed';

    // Configure the fal.ai API request
    let apiUrl;
    let requestBody;

    if (model === 'fast-sdxl') {
      apiUrl = 'https://110602490-fast-sdxl.gateway.alpha.fal.ai/';
      requestBody = {
        prompt: enhancedPrompt,
        negative_prompt: 'blurry, ugly, malformed, distorted, disfigured',
        width,
        height,
        num_inference_steps: steps,
        guidance_scale: 7.5,
        seed: seed || Math.floor(Math.random() * 1000000000),
      };
    } else if (model === 'sdxl') {
      apiUrl = 'https://110602490-sdxl.gateway.alpha.fal.ai/';
      requestBody = {
        prompt: enhancedPrompt,
        negative_prompt: 'blurry, ugly, malformed, distorted, disfigured',
        width,
        height,
        num_inference_steps: steps,
        guidance_scale: 7.5,
        seed: seed || Math.floor(Math.random() * 1000000000),
      };
    } else if (model === 'sd-1.5') {
      apiUrl = 'https://110602490-stable-diffusion-v1-5.gateway.alpha.fal.ai/';
      requestBody = {
        prompt: enhancedPrompt,
        negative_prompt: 'blurry, ugly, malformed, distorted, disfigured',
        width: Math.min(width, 768), // SD 1.5 has lower max resolution
        height: Math.min(height, 768),
        num_inference_steps: steps,
        guidance_scale: 7.5,
        seed: seed || Math.floor(Math.random() * 1000000000),
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid model specified'
      });
    }

    // Make the request to fal.ai
    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Check if image URL is in the response
    if (response.data && response.data.images && response.data.images[0]) {
      return res.json({
        success: true,
        imageUrl: response.data.images[0].url,
        metadata: {
          seed: requestBody.seed,
          prompt: enhancedPrompt,
          model,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'No image found in the response'
      });
    }
  } catch (error) {
    console.error('Error using fal.ai API:', error.message);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message
    });
  }
});

module.exports = router;
