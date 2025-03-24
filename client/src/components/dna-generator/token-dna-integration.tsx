import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DNAGenerator } from "./dna-generator";
import { TokenMetadata, TrendingToken } from "@/types/token";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TokenDNAIntegrationProps {
  token?: TokenMetadata | TrendingToken | null;
  onTokenSelect?: (token: TrendingToken) => void;
}

/**
 * Component that integrates DNA generation with token creation
 * This allows users to generate unique DNA for their tokens
 */
export function TokenDNAIntegration({ token, onTokenSelect }: TokenDNAIntegrationProps) {
  const [activeTab, setActiveTab] = useState<string>("generator");
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>DNA Generator</CardTitle>
        <CardDescription>
          Generate and visualize DNA sequences for your tokens
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="generator">DNA Generator</TabsTrigger>
            <TabsTrigger value="integrations">Token Integration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator" className="mt-4">
            <DNAGenerator />
          </TabsContent>
          
          <TabsContent value="integrations" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-medium mb-2">DNA-Based NFT Avatars</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate unique NFT avatars using your token's DNA sequence. The DNA sequence determines the color palette
                  and aesthetic style of your NFT.
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => {
                    // If we have onTokenSelect function, pass the token for processing
                    if (onTokenSelect && token && 'symbol' in token) {
                      onTokenSelect(token as TrendingToken);
                    }
                  }}
                >
                  Generate NFT Avatar
                </Button>
              </div>
              
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-medium mb-2">Token DNA Metadata</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add unique DNA metadata to your token. This can be used for on-chain verification,
                  creating uniqueness, or integrating with other DNA-based applications.
                </p>
                <Button variant="outline" className="w-full" disabled={!token}>
                  {token ? "Generate DNA Metadata" : "Select a token first"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
