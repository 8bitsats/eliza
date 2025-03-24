import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, ArrowUp, ArrowDown, Info, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TokenMetadata, TrendingToken } from "@/types/token";
import { useTestMode } from "@/contexts/test-mode-context";

export interface TokenVisualizerProps {
  token: TokenMetadata | TrendingToken;
  dnaHash?: string | null;
}

// Helper functions to normalize different token types to a common format
function isTokenMetadata(token: TokenMetadata | TrendingToken): token is TokenMetadata {
  return 'balance' in token && 'value' in token;
}

interface NormalizedToken {
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  description: string;
  launchDate: string;
  initialPrice: number;
  currentPrice: number;
  imageUrl?: string;
  marketCap?: number;
  volume24h?: number;
  balance?: number;
  dnaHash?: string | null;
  tradeActivity?: Array<{
    type: string;
    amount: number;
    time: string;
    txId: string;
  }>;
  social?: {
    telegram?: string;
    twitter?: string;
    website?: string;
  };
}

function normalizeToken(token: TokenMetadata | TrendingToken, dnaHash?: string | null): NormalizedToken {
  // Create a normalized token object that works with the visualizer
  const normalizedToken: NormalizedToken = {
    tokenName: token.name,
    tokenSymbol: token.symbol,
    tokenAddress: token.address,
    description: isTokenMetadata(token) ? token.description || '' : '',
    launchDate: isTokenMetadata(token) ? token.launchDate : new Date().toISOString(),
    initialPrice: isTokenMetadata(token) ? token.price || 0 : token.price || 0,
    currentPrice: isTokenMetadata(token) ? token.price || 0 : token.price || 0,
    imageUrl: token.imageUrl,
    dnaHash: dnaHash || null,
    // Handle trending token specific properties
    marketCap: !isTokenMetadata(token) ? (token as TrendingToken).marketCap : undefined,
    volume24h: !isTokenMetadata(token) ? (token as TrendingToken).volume24h : undefined,
    // Handle token metadata specific properties
    balance: isTokenMetadata(token) ? token.balance : 0,
    // Initialize with empty arrays for safety
    tradeActivity: [],
    social: {}
  };
  
  return normalizedToken;
}

export function TokenVisualizer({ token, dnaHash }: TokenVisualizerProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [priceChange, setPriceChange] = useState<{
    value: number;
    percentage: number;
    positive: boolean;
  }>({ value: 0, percentage: 0, positive: true });
  
  const { testMode } = useTestMode();
  const normalizedToken = normalizeToken(token, dnaHash);

  // Calculate price change when token changes
  useEffect(() => {
    if (normalizedToken) {
      const change = normalizedToken.currentPrice - normalizedToken.initialPrice;
      const percentage = normalizedToken.initialPrice > 0 
        ? (change / normalizedToken.initialPrice) * 100 
        : 0;
      
      setPriceChange({
        value: change,
        percentage: percentage,
        positive: change >= 0
      });
    }
  }, [normalizedToken]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!token) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No token selected for visualization.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {normalizedToken.imageUrl ? (
              <img 
                src={normalizedToken.imageUrl} 
                alt={normalizedToken.tokenSymbol} 
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">{normalizedToken.tokenSymbol.substring(0, 2)}</span>
              </div>
            )}
            <div>
              <CardTitle className="flex items-center gap-2">
                {normalizedToken.tokenName}
                <Badge variant="outline" className="ml-1">
                  {normalizedToken.tokenSymbol}
                </Badge>
                {testMode.enabled && (
                  <Badge className="ml-1 text-xs bg-amber-500">
                    Test Mode
                  </Badge>
                )}
              </CardTitle>
              <div className="text-xs text-muted-foreground font-mono mt-1 truncate">
                {normalizedToken.tokenAddress}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">
              ${normalizedToken.currentPrice.toFixed(8)}
            </div>
            <div className={`flex items-center justify-end text-sm ${priceChange.positive ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange.positive ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              ${Math.abs(priceChange.value).toFixed(8)} ({priceChange.percentage.toFixed(2)}%)
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Trading Activity</TabsTrigger>
            <TabsTrigger value="info">Token Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Current Price</div>
                    <div className="text-2xl font-bold">
                      ${normalizedToken.currentPrice.toFixed(6)}
                    </div>
                    <div className={`text-xs ${priceChange.positive ? 'text-green-500' : 'text-red-500'}`}>
                      {priceChange.positive ? '+' : ''}{priceChange.percentage.toFixed(2)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Volume (24h)</div>
                    <div className="text-2xl font-bold">
                      {normalizedToken.volume24h 
                        ? `$${normalizedToken.volume24h.toLocaleString()}` 
                        : 'N/A'}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Your Holdings</div>
                    <div className="text-2xl font-bold">
                      {normalizedToken.balance 
                        ? normalizedToken.balance.toLocaleString() 
                        : '0'} {normalizedToken.tokenSymbol}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {normalizedToken.balance && normalizedToken.currentPrice
                        ? `≈ $${(normalizedToken.balance * normalizedToken.currentPrice).toFixed(2)}`
                        : '$0.00'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="h-60 flex items-center justify-center bg-muted/20 rounded-md">
                  <div className="text-center text-muted-foreground">
                    <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Price chart visualization would appear here</p>
                    <p className="text-sm">Historical price data not available in this demo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">About {normalizedToken.tokenName}</h3>
              <p className="text-muted-foreground">
                {normalizedToken.description || 
                  `${normalizedToken.tokenName} (${normalizedToken.tokenSymbol}) is a token on the Solana blockchain.`}
              </p>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {normalizedToken.social?.telegram && (
                  <Button variant="outline" size="sm" className="h-8 gap-1" asChild>
                    <a href={normalizedToken.social.telegram} target="_blank" rel="noopener noreferrer">
                      Telegram
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
                
                {normalizedToken.social?.twitter && (
                  <Button variant="outline" size="sm" className="h-8 gap-1" asChild>
                    <a href={normalizedToken.social.twitter} target="_blank" rel="noopener noreferrer">
                      Twitter
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
                
                {normalizedToken.social?.website && (
                  <Button variant="outline" size="sm" className="h-8 gap-1" asChild>
                    <a href={normalizedToken.social.website} target="_blank" rel="noopener noreferrer">
                      Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-6">
            {normalizedToken.tradeActivity && normalizedToken.tradeActivity.length > 0 ? (
              <div className="space-y-4">
                {normalizedToken.tradeActivity.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <div className="font-medium">{activity.type}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(activity.time)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {activity.amount.toLocaleString()} {normalizedToken.tokenSymbol}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs">
                        Tx: {activity.txId.substring(0, 8)}...{activity.txId.substring(activity.txId.length - 8)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-muted/30 p-3 mb-4">
                  <Share2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Trading Activity</h3>
                <p className="text-muted-foreground max-w-sm">
                  There hasn't been any trading activity for this token yet. 
                  Be the first to buy this token!
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="info" className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between py-2 border-b">
                  <div className="text-muted-foreground">Token Name</div>
                  <div className="font-medium">{normalizedToken.tokenName}</div>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <div className="text-muted-foreground">Symbol</div>
                  <div className="font-medium">{normalizedToken.tokenSymbol}</div>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <div className="text-muted-foreground">Blockchain</div>
                  <div className="font-medium">Solana</div>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <div className="text-muted-foreground">Launch Date</div>
                  <div className="font-medium">{new Date(normalizedToken.launchDate).toLocaleDateString()}</div>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <div className="text-muted-foreground">Token Address</div>
                  <div className="font-mono text-xs truncate max-w-[220px]">{normalizedToken.tokenAddress}</div>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <div className="text-muted-foreground">Initial Price</div>
                  <div className="font-medium">${normalizedToken.initialPrice.toFixed(8)}</div>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <div className="text-muted-foreground">Current Price</div>
                  <div className="font-medium">${normalizedToken.currentPrice.toFixed(8)}</div>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <div className="text-muted-foreground">DNA Hash</div>
                  <div className="font-mono text-xs truncate max-w-[220px]">{normalizedToken.dnaHash}</div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a 
                    href={`https://solscan.io/token/${normalizedToken.tokenAddress}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View on Solscan
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
