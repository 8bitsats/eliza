import React, { useState, useEffect } from 'react';
import PageTitle from '../components/page-title';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ImageGenerator from '../components/art-studio/image-generator';
import Image3DViewer from '../components/art-studio/image-3d-viewer';
import ImageGallery, { GeneratedImage } from '../components/art-studio/image-gallery';
import ThemeToggle from '../components/art-studio/theme-toggle';

const ArtStudio: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'fal' | 'grok'>('fal');
  const [images, setImages] = useState<GeneratedImage[]>(() => {
    // Load saved images from localStorage
    const savedImages = localStorage.getItem('art-studio-images');
    return savedImages ? JSON.parse(savedImages) : [];
  });
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  // Save images to localStorage when they change
  useEffect(() => {
    localStorage.setItem('art-studio-images', JSON.stringify(images));
  }, [images]);

  // Handle new generated image
  const handleImageGenerated = (imageUrl: string, prompt: string) => {
    const newImage: GeneratedImage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      url: imageUrl,
      prompt,
      provider: selectedTab,
      timestamp: Date.now(),
    };
    
    const updatedImages = [newImage, ...images];
    setImages(updatedImages);
    setSelectedImage(newImage);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle title="Art Studio" />
        <ThemeToggle />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Tabs defaultValue="fal" onValueChange={(value) => setSelectedTab(value as 'fal' | 'grok')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fal">FAL AI Studio</TabsTrigger>
              <TabsTrigger value="grok">Grok Studio</TabsTrigger>
            </TabsList>
            <TabsContent value="fal" className="mt-4">
              <ImageGenerator
                title="FAL AI Character Art Generator"
                provider="fal"
                description="Generate character artwork using FAL AI's fast-lightning-sdxl model"
                onImageGenerated={handleImageGenerated}
              />
            </TabsContent>
            <TabsContent value="grok" className="mt-4">
              <ImageGenerator
                title="Grok Image Generator"
                provider="grok"
                description="Generate images using Grok's image generation capabilities"
                onImageGenerated={handleImageGenerated}
              />
            </TabsContent>
          </Tabs>
          
          <ImageGallery 
            images={images} 
            onSelectImage={setSelectedImage} 
            selectedImageId={selectedImage?.id || null} 
          />
        </div>
        
        <Image3DViewer 
          imageUrl={selectedImage?.url || null} 
          title="3D Art Viewer" 
        />
      </div>
    </div>
  );
};

export default ArtStudio;
