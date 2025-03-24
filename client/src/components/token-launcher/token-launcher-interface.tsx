import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TradeToken } from "./trade-token";
import { TokenList } from "./token-list";
import { TrendingTokens } from "./trending-tokens";
import { TrendingTokenTicker } from "./trending-token-ticker";
import { TokenDNAIntegration } from "@/components/dna-generator";
import { useTestMode } from "@/contexts/test-mode-context";
import { Link } from "react-router-dom";
import { Dna } from "lucide-react";
import { TokenMetadata, TrendingToken } from "@/types/token";

export function TokenLauncherInterface() {
  const [activeTab, setActiveTab] = useState("trade");
  const [selectedToken, setSelectedToken] = useState<TokenMetadata | TrendingToken | undefined>();
  const { testMode } = useTestMode();

  const handleTokenSelect = (token: TokenMetadata | TrendingToken) => {
    setSelectedToken(token);
    setActiveTab("trade");
  };

  const handleDNATabClick = () => {
    // Reset selected token when switching to DNA tab
    setSelectedToken(undefined);
    setActiveTab("dna");
  };

  return (
    <div className="container mx-auto py-6">
      <TrendingTokenTicker />
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Token Launcher</h1>
            <p className="text-muted-foreground">
              Trade, launch and manage your pump fun tokens.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link to="/dna-nft-avatar" className="flex items-center gap-1">
                <Dna className="h-4 w-4" />
                Create DNA NFT Avatar
              </Link>
            </Button>
            <Badge variant={testMode.enabled ? "default" : "outline"} className="text-xs">
              {testMode.enabled ? "Test Mode" : "Live Mode"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Token Trading Center</CardTitle>
                <CardDescription>
                  Buy, sell, and manage your tokens in the marketplace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="trade">Trade</TabsTrigger>
                    <TabsTrigger value="list">My Tokens</TabsTrigger>
                    <TabsTrigger value="dna" onClick={handleDNATabClick}>DNA Integration</TabsTrigger>
                  </TabsList>
                  <TabsContent value="trade" className="pt-4">
                    <TradeToken initialToken={selectedToken} />
                  </TabsContent>
                  <TabsContent value="list" className="pt-4">
                    <TokenList onTokenSelect={handleTokenSelect} />
                  </TabsContent>
                  <TabsContent value="dna" className="pt-4">
                    <TokenDNAIntegration onTokenSelect={handleTokenSelect} />
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="border-t pt-6 flex justify-between">
                <div className="text-xs text-muted-foreground">
                  {testMode.enabled && (
                    <p>
                      <span className="font-medium">Test Mode Active:</span> No real transactions will be
                      executed.
                    </p>
                  )}
                </div>
                <div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/docs/token-launcher">
                      Documentation
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          <div>
            <TrendingTokens onTokenSelect={handleTokenSelect} />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>NFT Avatars From DNA</CardTitle>
            <CardDescription>
              Create unique NFT avatars based on DNA sequences derived from your tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Transform your tokens into NFT art</h3>
                <p className="text-sm text-muted-foreground">
                  Generate custom avatars where colors and aesthetics are derived from your token's DNA sequence.
                </p>
              </div>
              <Button asChild>
                <Link to="/dna-nft-avatar" className="flex items-center gap-1">
                  <Dna className="h-4 w-4" />
                  Get Started
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
