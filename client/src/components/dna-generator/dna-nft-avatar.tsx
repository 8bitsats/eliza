import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Zap, Image as ImageIcon, CopyCheck } from "lucide-react";
import { dnaService, DNAGenerationOptions } from "@/api/dna-service";

import { 
  AvatarColorPalette, 
  AvatarAesthetics,
  generateAvatarColorPalette, 
  determineAvatarAesthetics,
  generateAvatarPrompt
} from "@/utils/dna-color-utils";

interface DNANFTAvatarProps {
  dnaHash?: string | null;
  dnaSequence?: string | null;
  tokenName?: string;
  tokenSymbol?: string;
  onAvatarGenerated?: (imageUrl: string) => void;
}

export function DNANFTAvatar({ 
  dnaHash, 
  dnaSequence, 
  tokenName = "DNA Avatar", 
  tokenSymbol = "DNA",
  onAvatarGenerated 
}: DNANFTAvatarProps) {
  const [activeTab, setActiveTab] = useState("palette");
  const [loading, setLoading] = useState(false);
  const [sequence, setSequence] = useState<string | null>(dnaSequence || null);
  const [colorPalette, setColorPalette] = useState<AvatarColorPalette | null>(null);
  const [aesthetics, setAesthetics] = useState<AvatarAesthetics | null>(null);
  const [imagePrompt, setImagePrompt] = useState<string>("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [mintStatus, setMintStatus] = useState<{ status: string; address?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize with provided DNA if available
  useEffect(() => {
    if (dnaSequence && !sequence) {
      setSequence(dnaSequence);
      generateColorPalette(dnaSequence);
    }
  }, [dnaSequence]);

  // Generate color palette and aesthetics from DNA sequence
  const generateColorPalette = (dnaSeq: string) => {
    try {
      const palette = generateAvatarColorPalette(dnaSeq);
      const style = determineAvatarAesthetics(dnaSeq);
      
      setColorPalette(palette);
      setAesthetics(style);
      
      // Generate prompt for image generation
      const prompt = generateAvatarPrompt(palette, style);
      setImagePrompt(prompt);
      
      // Move to the next tab
      setActiveTab("preview");
    } catch (err) {
      setError("Failed to generate color palette from DNA sequence");
      console.error(err);
    }
  };

  // Generate DNA sequence if not provided
  const handleGenerateDNA = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call the DNA service to generate a sequence
      const options: DNAGenerationOptions = {
        numTokens: 100,
        temperature: 0.8,
        topK: 40,
        startSequence: "AGENTDNA",
        enableSampledProbs: true
      };
      
      const response = await dnaService.generateDNA(options);
      
      if (response && response.sequence) {
        setSequence(response.sequence);
        generateColorPalette(response.sequence);
      } else {
        throw new Error("Failed to generate DNA sequence");
      }
      
      setLoading(false);
    } catch (err) {
      // Fallback to mock DNA for testing if the API call fails
      console.error("DNA API call failed, using mock data", err);
      setTimeout(() => {
        // This is a placeholder DNA sequence for demonstration
        const mockDnaSequence = "AGENTDNAATGCTGACTAGCTAGCTAGCTAGCTAGCTACGTAGCTAGCTAGCTAGCTGATCGATCGATCGATCGATCGATCGATCGATCG";
        setSequence(mockDnaSequence);
        generateColorPalette(mockDnaSequence);
        setLoading(false);
      }, 1500);
    }
  };

  // Generate NFT avatar image from prompt
  const handleGenerateImage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call an image generation API
      // For now, we'll simulate an image generation response
      setTimeout(() => {
        // This is a placeholder image URL for demonstration
        const mockImageUrl = `https://picsum.photos/seed/${Date.now()}/500/500`;
        setGeneratedImageUrl(mockImageUrl);
        setLoading(false);
        // Notify parent component
        if (onAvatarGenerated) {
          onAvatarGenerated(mockImageUrl);
        }
      }, 2000);
    } catch (err) {
      setError("Failed to generate avatar image");
      setLoading(false);
      console.error(err);
    }
  };

  // Mint NFT with generated image
  const handleMintNFT = async () => {
    if (!sequence || !colorPalette || !generatedImageUrl) {
      setError("Please generate an avatar image first");
      return;
    }
    
    setLoading(true);
    setError(null);
    setMintStatus({ status: "minting" });
    
    try {
      // In a real implementation, this would call the Metaplex Core service
      // For now, we'll simulate a minting response
      setTimeout(() => {
        const mockMintAddress = `DNA${Math.random().toString(36).substring(2, 10)}`;
        setMintStatus({ status: "success", address: mockMintAddress });
        setLoading(false);
      }, 3000);
    } catch (err) {
      setError("Failed to mint NFT");
      setMintStatus({ status: "failed" });
      setLoading(false);
      console.error(err);
    }
  };

  // Render color palette preview
  const renderColorPalette = () => {
    if (!colorPalette) return null;
    
    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label>Skin Tone</Label>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: colorPalette.skinTone }}></div>
            <code className="text-xs">{colorPalette.skinTone}</code>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Hair Color</Label>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: colorPalette.hairColor }}></div>
            <code className="text-xs">{colorPalette.hairColor}</code>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Eye Color</Label>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: colorPalette.eyeColor }}></div>
            <code className="text-xs">{colorPalette.eyeColor}</code>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Clothing Color</Label>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: colorPalette.clothingColor }}></div>
            <code className="text-xs">{colorPalette.clothingColor}</code>
          </div>
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Background Color</Label>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: colorPalette.backgroundColor }}></div>
            <code className="text-xs">{colorPalette.backgroundColor}</code>
          </div>
        </div>
      </div>
    );
  };

  // Render avatar aesthetics
  const renderAesthetics = () => {
    if (!aesthetics) return null;
    
    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label>Style</Label>
          <div className="p-2 bg-secondary/30 rounded text-sm capitalize">{aesthetics.style}</div>
        </div>
        <div className="space-y-2">
          <Label>Complexity</Label>
          <div className="p-2 bg-secondary/30 rounded text-sm capitalize">{aesthetics.complexity}</div>
        </div>
        <div className="space-y-2">
          <Label>Pattern</Label>
          <div className="p-2 bg-secondary/30 rounded text-sm capitalize">{aesthetics.pattern}</div>
        </div>
        <div className="space-y-2">
          <Label>Accessories</Label>
          <div className="p-2 bg-secondary/30 rounded text-sm">{aesthetics.accessories ? "Yes" : "No"}</div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>DNA NFT Avatar Generator</CardTitle>
        <CardDescription>
          Create unique NFT avatars derived from DNA sequences with automatic color palette generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-4 mb-4 rounded-md bg-red-50 text-red-700">
            {error}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sequence">1. DNA</TabsTrigger>
            <TabsTrigger value="palette">2. Palette</TabsTrigger>
            <TabsTrigger value="preview">3. Preview</TabsTrigger>
            <TabsTrigger value="mint">4. Mint</TabsTrigger>
          </TabsList>

          <TabsContent value="sequence" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="dna-sequence">DNA Sequence</Label>
              {sequence ? (
                <div className="relative">
                  <Textarea 
                    id="dna-sequence" 
                    value={sequence} 
                    rows={4} 
                    className="font-mono text-xs" 
                    readOnly 
                  />
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute top-2 right-2"
                    onClick={() => navigator.clipboard.writeText(sequence)}
                  >
                    <CopyCheck size={14} />
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-md flex flex-col items-center justify-center">
                  <p className="text-sm text-muted-foreground mb-2">No DNA sequence available</p>
                  <Button onClick={handleGenerateDNA} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Generate Random DNA
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {sequence && (
              <Button 
                className="w-full" 
                onClick={() => generateColorPalette(sequence)}
              >
                Generate Color Palette
              </Button>
            )}
          </TabsContent>

          <TabsContent value="palette" className="space-y-4 mt-4">
            {colorPalette ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-2">Color Palette</h3>
                  {renderColorPalette()}
                </div>
                
                <div>
                  <h3 className="text-md font-medium mb-2">Aesthetic Style</h3>
                  {renderAesthetics()}
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => setActiveTab("preview")}
                >
                  Continue to Preview
                </Button>
              </div>
            ) : sequence ? (
              <Button 
                className="w-full" 
                onClick={() => generateColorPalette(sequence)}
              >
                Generate Color Palette
              </Button>
            ) : (
              <div className="p-4 bg-muted rounded-md flex flex-col items-center justify-center">
                <p className="text-sm text-muted-foreground mb-2">Please generate a DNA sequence first</p>
                <Button onClick={() => setActiveTab("sequence")}>
                  Go to DNA Generator
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 mt-4">
            {colorPalette && aesthetics ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Image Generation Prompt</Label>
                  <Textarea 
                    value={imagePrompt} 
                    rows={8} 
                    className="font-mono text-xs"
                    readOnly
                  />
                </div>
                
                <div>
                  {generatedImageUrl ? (
                    <div className="space-y-4">
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-border">
                        <img src={generatedImageUrl} alt="Generated Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button onClick={handleGenerateImage} variant="outline" disabled={loading}>
                          Regenerate
                        </Button>
                        <Button onClick={() => setActiveTab("mint")}>
                          Continue to Mint
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={handleGenerateImage} 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Image...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Generate Avatar Image
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-md flex flex-col items-center justify-center">
                <p className="text-sm text-muted-foreground mb-2">Please generate a color palette first</p>
                <Button onClick={() => setActiveTab("palette")}>
                  Go to Color Palette
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="mint" className="space-y-4 mt-4">
            {generatedImageUrl ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <img src={generatedImageUrl} alt="Generated Avatar" className="w-full aspect-square rounded-lg object-cover border border-border" />
                  </div>
                  <div className="col-span-2 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nft-name">NFT Name</Label>
                      <Input 
                        id="nft-name" 
                        value={`${tokenName} ${dnaHash ? `#${dnaHash.substring(0, 6)}` : 'Avatar'}`} 
                        readOnly 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nft-symbol">NFT Symbol</Label>
                      <Input id="nft-symbol" value={tokenSymbol} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nft-description">Description</Label>
                      <Textarea 
                        id="nft-description" 
                        value={`A unique NFT avatar generated from a DNA sequence. This avatar represents the genetic signature of ${tokenName} token.`}
                        rows={3}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                
                {mintStatus?.status === "success" ? (
                  <div className="p-4 rounded-md bg-green-50 text-green-700">
                    <h4 className="font-medium mb-2">NFT Minted Successfully!</h4>
                    <p className="text-sm">Mint Address: <code className="text-xs">{mintStatus.address}</code></p>
                    <div className="mt-4">
                      <Button variant="outline" className="w-full" onClick={() => window.open(`https://explorer.solana.com/address/${mintStatus.address}`, "_blank")}>
                        View on Solana Explorer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={handleMintNFT} 
                    disabled={loading || mintStatus?.status === "minting"}
                  >
                    {loading || mintStatus?.status === "minting" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Minting NFT...
                      </>
                    ) : (
                      "Mint as NFT"
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-md flex flex-col items-center justify-center">
                <p className="text-sm text-muted-foreground mb-2">Please generate an avatar image first</p>
                <Button onClick={() => setActiveTab("preview")}>
                  Go to Preview
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
