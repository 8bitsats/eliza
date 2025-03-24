import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DNANFTAvatar } from "@/components/dna-generator";
import { TrendingToken } from "@/types/token";
import { dnaService } from "@/api/dna-service";
import { useTestMode } from "@/contexts/test-mode-context";
import { BreadcrumbItem, Breadcrumb } from "@/components/ui/breadcrumb";
import { Home, ChevronRight, Dna } from "lucide-react";
import { Link } from "react-router-dom";

// Mock trending tokens for demo purpose when no token is selected
const MOCK_TOKENS: TrendingToken[] = [
  {
    address: "89dj92md9jK92Md9nKGmD92mdKG",
    name: "DNA Token",
    symbol: "DNAT",
    price: 0.00128,
    priceChange24h: 5.2,
    volume24h: 34520,
    marketCap: 1200000,
    imageUrl: "https://picsum.photos/seed/dnat/200/200"
  },
  {
    address: "aSKL2dl20fk20gkKLSDm2kfk2",
    name: "Helix",
    symbol: "HLX",
    price: 0.0235,
    priceChange24h: 12.7,
    volume24h: 78450,
    marketCap: 4500000,
    imageUrl: "https://picsum.photos/seed/hlx/200/200"
  }
];

export function DNANFTAvatarPage() {
  const [selectedToken, setSelectedToken] = useState<TrendingToken | null>(null);
  const [dnaSequence, setDnaSequence] = useState<string | null>(null);
  const [dnaHash, setDnaHash] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { testMode } = useTestMode();

  // For demo purposes, set a default token if in test mode
  useEffect(() => {
    if (testMode.enabled && !selectedToken) {
      handleSelectToken(MOCK_TOKENS[0]);
    }
  }, [testMode.enabled, selectedToken]);

  // Function to generate DNA from token data
  const generateDNAFromToken = async (token: TrendingToken) => {
    try {
      // Use the token's address and name as a seed for DNA generation
      const seed = `${token.name}_${token.address}`;
      const response = await dnaService.generateDNA({
        numTokens: 120,
        startSequence: seed.substring(0, 10).toUpperCase().replace(/[^A-Z]/g, 'A'),
        temperature: 0.7,
        topK: 40,
        enableSampledProbs: true
      });

      if (response && response.sequence) {
        setDnaSequence(response.sequence);
        setDnaHash(response.hash);
      }
    } catch (error) {
      console.error("Error generating DNA from token:", error);
      // Fallback to a mock DNA sequence if the API fails
      const mockSequence = "ATGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCT";
      setDnaSequence(mockSequence);
      
      // Generate a simple hash for the fallback sequence
      let hash = 0;
      for (let i = 0; i < mockSequence.length; i++) {
        hash = ((hash << 5) - hash) + mockSequence.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }
      setDnaHash(Math.abs(hash).toString(16).substring(0, 16));
    }
  };

  // Handle token selection
  const handleSelectToken = (token: TrendingToken) => {
    setSelectedToken(token);
    generateDNAFromToken(token);
  };

  // Handle avatar generation completion
  const handleAvatarGenerated = (imageUrl: string) => {
    setGeneratedImage(imageUrl);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to="/" className="flex items-center">
            <Home className="mr-1 h-4 w-4" />
            Home
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to="/tokens" className="flex items-center">
            Tokens
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <div className="flex items-center">
            <Dna className="mr-1 h-4 w-4" />
            DNA NFT Avatar Generator
          </div>
        </BreadcrumbItem>
      </Breadcrumb>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>DNA NFT Avatar Generator</CardTitle>
          <CardDescription>
            Generate unique NFT avatars from DNA sequences derived from your tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {selectedToken ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-md bg-secondary/10">
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                        {selectedToken.imageUrl && (
                          <img src={selectedToken.imageUrl} alt={selectedToken.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      {selectedToken.name} ({selectedToken.symbol})
                    </h3>
                    <div className="text-sm text-muted-foreground">
                      <p>Price: ${selectedToken.price.toFixed(6)}</p>
                      <p>Using this token's data as seed for DNA generation</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedToken(null);
                      setDnaSequence(null);
                      setDnaHash(null);
                      setGeneratedImage(null);
                    }}
                  >
                    Select a Different Token
                  </Button>
                </div>
              ) : (
                <div className="p-6 bg-muted/50 rounded-lg flex flex-col items-center justify-center h-full">
                  <Dna className="h-12 w-12 text-primary/60 mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-center">No Token Selected</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Please select a token to generate a DNA-based NFT avatar
                  </p>
                  <Button 
                    variant="default"
                    asChild
                  >
                    <Link to="/tokens">Browse Tokens</Link>
                  </Button>
                </div>
              )}
            </div>

            <div>
              {selectedToken && dnaSequence ? (
                <DNANFTAvatar 
                  dnaSequence={dnaSequence}
                  dnaHash={dnaHash}
                  tokenName={selectedToken.name}
                  tokenSymbol={selectedToken.symbol}
                  onAvatarGenerated={handleAvatarGenerated}
                />
              ) : selectedToken ? (
                <div className="p-6 bg-muted/50 rounded-lg flex flex-col items-center justify-center h-full">
                  <p className="text-center text-muted-foreground">
                    Generating DNA sequence from token data...
                  </p>
                </div>
              ) : (
                <div className="p-6 bg-muted/50 rounded-lg flex flex-col items-center justify-center h-full">
                  <p className="text-center text-muted-foreground">
                    Select a token to get started with DNA NFT generation
                  </p>
                </div>
              )}
            </div>
          </div>

          {generatedImage && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Your Generated NFT Avatar</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="aspect-square rounded-lg overflow-hidden border">
                  <img src={generatedImage} alt="Generated NFT Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">NFT Details</h4>
                    <p className="text-sm text-muted-foreground">
                      This unique NFT avatar was generated based on the DNA sequence derived from your token's data.
                      The colors, patterns, and overall aesthetic are directly influenced by the genetic signature of your token.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">What's Next?</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      <li>Share your unique NFT avatar on social media</li>
                      <li>Use it as your profile picture in Web3 platforms</li>
                      <li>Mint it on the blockchain as a Core NFT</li>
                      <li>Create a collection of DNA-derived avatars from your tokens</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => window.open(generatedImage, '_blank')}>
                      Download Avatar
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/tokens/mint-nft">Mint as NFT</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {testMode.enabled && (
            <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-md">
              <h4 className="font-medium">Test Mode Active</h4>
              <p className="text-sm">Running in {testMode.mode} test mode. No actual blockchain transactions will be made.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
