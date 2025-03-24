import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ImageGeneratorProps {
  title: string;
  provider: 'fal' | 'grok';
  description?: string;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
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

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Call the appropriate custom action endpoint based on the provider
      const endpoint = `/api/actions/${
        provider === 'fal' ? 'GENERATE_CHARACTER_ART' : 'GENERATE_GROK_IMAGE'
      }`;

      const response = await axios.post(endpoint, {
        prompt,
        imageSize,
      });

      if (response.data && response.data.imageUrl) {
        onImageGenerated(response.data.imageUrl, prompt);
      } else {
        throw new Error('No image URL in the response');
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
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
              {provider === 'fal' ? (
                <>
                  <SelectItem value="square_hd">Square HD (1024x1024)</SelectItem>
                  <SelectItem value="square">Square (512x512)</SelectItem>
                  <SelectItem value="portrait_4_3">Portrait 4:3</SelectItem>
                  <SelectItem value="portrait_16_9">Portrait 16:9</SelectItem>
                  <SelectItem value="landscape_4_3">Landscape 4:3</SelectItem>
                  <SelectItem value="landscape_16_9">Landscape 16:9</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="1024x1024">Square (1024x1024)</SelectItem>
                  <SelectItem value="1024x1792">Portrait (1024x1792)</SelectItem>
                  <SelectItem value="1792x1024">Landscape (1792x1024)</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button
          onClick={generateImage}
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? 'Generating...' : `Generate with ${provider === 'fal' ? 'FAL AI' : 'Grok'}`}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ImageGenerator;
