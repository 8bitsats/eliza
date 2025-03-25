// @ts-nocheck
/* Temporarily disable type checking for this file to address React component compatibility issues */

import React, { useState } from 'react';
import axios from 'axios';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { InfoCircledIcon } from "@radix-ui/react-icons";
import grokArtService from '@/api/grok-art-service';
import type { GrokImageGenerationOptions } from '@/api/grok-art-service';

interface ImageGeneratorProps {
  title: string;
  provider: 'fal' | 'grok';
  description?: string;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
}

interface GrokImageResponse {
  imageUrl: string;
  revisedPrompt?: string;
  b64Json?: string;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  title,
  provider,
  description,
  onImageGenerated,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<string>(provider === 'fal' ? 'square_hd' : '1024x1024');
  const [imageCount, setImageCount] = useState<number>(1);
  const [activeStyleTab, setActiveStyleTab] = useState<string>('basic');
  const [stylePreset, setStylePreset] = useState<string>('');
  const [responseFormat, setResponseFormat] = useState<'url' | 'b64_json'>('url');
  const [revisedPrompt, setRevisedPrompt] = useState<string>('');

  // Grok-specific style suggestions
  const grokStylePresets = [
    { id: 'photo', name: 'Photorealistic', prompt: 'Photorealistic, detailed, high resolution ' },
    { id: '3d', name: '3D Render', prompt: '3D render, volumetric lighting, ray tracing, octane render ' },
    { id: 'painting', name: 'Oil Painting', prompt: 'Oil painting style, impressionist, detailed brushstrokes ' },
    { id: 'anime', name: 'Anime', prompt: 'Anime style, vibrant colors, cel shading, studio ghibli inspired ' },
    { id: 'digital', name: 'Digital Art', prompt: 'Digital art, highly detailed, vibrant colors, fantasy ' },
    { id: 'abstract', name: 'Abstract', prompt: 'Abstract art, non-representational, geometric shapes, colorful ' },
    { id: 'retro', name: 'Vintage', prompt: 'Vintage aesthetic, retro, 80s style, nostalgic ' },
    { id: 'scifi', name: 'Sci-Fi', prompt: 'Science fiction, futuristic, high-tech, cyberpunk ' },
  ];

  // Add style preset to the prompt
  const getEnhancedPrompt = () => {
    const selectedStyle = grokStylePresets.find(style => style.id === stylePreset);
    if (provider === 'grok' && selectedStyle && activeStyleTab === 'preset') {
      return `${selectedStyle.prompt}${prompt}`;
    }
    return prompt;
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setRevisedPrompt('');

    try {
      if (provider === 'fal') {
        // Call the FAL AI endpoint
        const response = await axios.post('/api/actions/GENERATE_CHARACTER_ART', {
          prompt,
          imageSize,
        });

        if (response.data && response.data.imageUrl) {
          onImageGenerated(response.data.imageUrl, prompt);
        } else {
          throw new Error('No image URL in the response');
        }
      } else {
        // Use Grok Art Service with xAI API compatibility
        const options: GrokImageGenerationOptions = {
          model: "grok-2-image",
          prompt: getEnhancedPrompt(),
          size: imageSize,
          n: imageCount,
          response_format: responseFormat
        };

        const response = await grokArtService.generateImage(options);
        onImageGenerated(response.imageUrl || `data:image/jpeg;base64,${response.b64Json}`, getEnhancedPrompt());

        // Store and display the revised prompt
        if (response.revisedPrompt) {
          setRevisedPrompt(response.revisedPrompt);
          console.log('Grok revised prompt:', response.revisedPrompt);
        }
      }
    } catch (err) {
      console.error(`Error generating image with ${provider}:`, err);
      setError(
        err instanceof Error
          ? err.message
          : `Failed to generate image with ${provider}. Please try again.`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const renderGuide = () => {
    if (provider !== 'grok') return null;

    return (
      <Alert className="mb-4">
        <InfoCircledIcon className="h-4 w-4" />
        <AlertTitle>Grok Image Generation Guide</AlertTitle>
        <AlertDescription>
          <ul className="list-disc pl-4 space-y-1 text-sm">
            <li>Your prompt will be enhanced by an AI model before generating the image</li>
            <li>You can generate up to {imageCount} images at once</li>
            <li>Images are generated in JPG format</li>
            <li>Choose between URL or Base64 output format</li>
            <li>Use style presets to enhance your results</li>
          </ul>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {renderGuide()}

        <div className="space-y-2">
          <Label htmlFor={`${provider}-prompt`}>Prompt</Label>
          <Textarea
            id={`${provider}-prompt`}
            placeholder={`Describe the image you want to generate with ${provider}...`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-y"
          />
        </div>

        {provider === 'grok' && (
          <Tabs value={activeStyleTab} onValueChange={setActiveStyleTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Options</TabsTrigger>
              <TabsTrigger value="preset">Style Presets</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${provider}-size`}>Image Size</Label>
                <Select
                  value={imageSize}
                  onValueChange={setImageSize}
                >
                  <SelectTrigger id={`${provider}-size`}>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1024x1024">Square (1024x1024)</SelectItem>
                    <SelectItem value="1024x1792">Portrait (1024x1792)</SelectItem>
                    <SelectItem value="1792x1024">Landscape (1792x1024)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number of Images ({imageCount})</Label>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[imageCount]}
                  onValueChange={(value) => setImageCount(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${provider}-format`}>Response Format</Label>
                <Select
                  value={responseFormat}
                  onValueChange={(value) => setResponseFormat(value as 'url' | 'b64_json')}
                >
                  <SelectTrigger id={`${provider}-format`}>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="b64_json">Base64 JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="preset" className="space-y-4">
              <div className="space-y-2">
                <Label>Style Preset</Label>
                <div className="grid grid-cols-2 gap-2">
                  {grokStylePresets.map(style => (
                    <div
                      key={style.id}
                      className={`flex items-center p-2 border rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 ${stylePreset === style.id ? 'bg-primary/20 border-primary' : ''}`}
                      onClick={() => setStylePreset(style.id === stylePreset ? '' : style.id)}
                    >
                      <div className="w-4 h-4 mr-2 rounded-full border border-primary flex items-center justify-center">
                        {stylePreset === style.id && (
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        )}
                      </div>
                      <span className="text-sm">{style.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {provider === 'fal' && (
          <div className="space-y-2">
            <Label htmlFor={`${provider}-size`}>Image Size</Label>
            <Select
              value={imageSize}
              onValueChange={setImageSize}
            >
              <SelectTrigger id={`${provider}-size`}>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square_hd">Square HD (1024x1024)</SelectItem>
                <SelectItem value="square">Square (512x512)</SelectItem>
                <SelectItem value="portrait_4_3">Portrait 4:3</SelectItem>
                <SelectItem value="landscape_4_3">Landscape 4:3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {revisedPrompt && (
          <Alert>
            <AlertTitle>Revised Prompt</AlertTitle>
            <AlertDescription className="text-sm italic">
              {revisedPrompt}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerateImage}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? 'Generating...' : 'Generate Image'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ImageGenerator;
