import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  provider: 'fal' | 'grok';
  timestamp: number;
}

interface ImageGalleryProps {
  images: GeneratedImage[];
  onSelectImage: (image: GeneratedImage) => void;
  selectedImageId: string | null;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  onSelectImage, 
  selectedImageId 
}) => {
  if (images.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 text-muted-foreground">
            No images generated yet. Use the generators to create some art!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div 
                key={image.id} 
                className={`relative cursor-pointer rounded-md overflow-hidden transition-all ${selectedImageId === image.id ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-90'}`}
                onClick={() => onSelectImage(image)}
              >
                <img 
                  src={image.url} 
                  alt={image.prompt}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 text-[10px] text-white truncate">
                  {image.prompt}
                </div>
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-1 py-0.5 rounded-bl-md">
                  {image.provider === 'fal' ? 'FAL' : 'Grok'}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ImageGallery;
