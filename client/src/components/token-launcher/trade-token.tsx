import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { tokenService } from "@/api/token-service";
import { TokenMetadata, TrendingToken } from "@/types/token";
import { useTestMode } from "@/contexts/test-mode-context";

interface TradeTokenProps {
  initialToken?: TrendingToken | TokenMetadata;
  onTokenUpdate?: () => void;
}

export function TradeToken({ initialToken, onTokenUpdate }: TradeTokenProps) {
  const [tokens, setTokens] = useState<TokenMetadata[]>([]);
  const [currentToken, setCurrentToken] = useState<TokenMetadata | null>(initialToken as TokenMetadata || null);
  const [loading, setLoading] = useState(true);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("buy");
  const [buyAmount, setBuyAmount] = useState<number>(0.1);
  const [sellPercentage, setSellPercentage] = useState<number>(50);
  const { testMode } = useTestMode();

  useEffect(() => {
    if (initialToken) {
      setCurrentToken(initialToken as TokenMetadata);
    }
  }, [initialToken]);
  
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        const response = await tokenService.listTokens(testMode);
        
        if (response.success) {
          // Validate token data before setting state
          const validatedTokens = (response.tokens || []).filter((token: TokenMetadata) => {
            // Check for required properties
            if (!token.address || !token.name || !token.symbol || 
                typeof token.balance !== 'number' || 
                typeof token.price !== 'number' || 
                typeof token.value !== 'number') {
              console.warn('Invalid token data received:', token);
              return false;
            }
            return true;
          });
          
          setTokens(validatedTokens);
          
          // If there's a selected token, find it in the fetched tokens to get the most up-to-date data
          if (currentToken) {
            const updatedToken = validatedTokens.find((t: TokenMetadata) => t.address === currentToken.address);
            if (updatedToken) {
              setCurrentToken(updatedToken);
            }
          } else if (validatedTokens.length > 0) {
            // Select the first token if none is selected
            setCurrentToken(validatedTokens[0]);
          }
        } else {
          setError(response.message || 'Failed to load tokens');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not connect to the token service');
        console.error('Error fetching tokens:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [testMode]);

  const handleTokenChange = (address: string) => {
    const selectedToken = tokens.find(token => token.address === address);
    if (selectedToken) {
      setCurrentToken(selectedToken);
    }
  };

  const handleBuyToken = async () => {
    if (!currentToken || buyAmount <= 0) return;
    
    try {
      setTokenLoading(true);
      setError(null);
      
      const response = await tokenService.buyToken(currentToken.address, buyAmount, testMode);
      
      if (response.success) {
        // Refresh the token list to get updated balances
        const updatedTokens = await tokenService.listTokens(testMode);
        if (updatedTokens.success && updatedTokens.tokens) {
          setTokens(updatedTokens.tokens);
          
          // Update the current token
          const updatedToken = updatedTokens.tokens.find((t: TokenMetadata) => t.address === currentToken.address);
          if (updatedToken) {
            setCurrentToken(updatedToken);
          }
          
          // Call the external update handler if provided
          if (onTokenUpdate) {
            onTokenUpdate();
          }
        }
        
        // Reset the buy amount
        setBuyAmount(0.1);
      } else {
        setError(response.message || 'Failed to buy token');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
      console.error('Error buying token:', err);
    } finally {
      setTokenLoading(false);
    }
  };

  const handleSellToken = async () => {
    if (!currentToken || sellPercentage <= 0 || sellPercentage > 100) return;
    
    try {
      setTokenLoading(true);
      setError(null);
      
      const response = await tokenService.sellToken(currentToken.address, sellPercentage, testMode);
      
      if (response.success) {
        // Refresh the token list to get updated balances
        const updatedTokens = await tokenService.listTokens(testMode);
        if (updatedTokens.success && updatedTokens.tokens) {
          setTokens(updatedTokens.tokens);
          
          // Update the current token
          const updatedToken = updatedTokens.tokens.find((t: TokenMetadata) => t.address === currentToken.address);
          if (updatedToken) {
            setCurrentToken(updatedToken);
          }
          
          // Call the external update handler if provided
          if (onTokenUpdate) {
            onTokenUpdate();
          }
        }
        
        // Reset the sell percentage
        setSellPercentage(50);
      } else {
        setError(response.message || 'Failed to sell token');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
      console.error('Error selling token:', err);
    } finally {
      setTokenLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade Token</CardTitle>
        <CardDescription>
          Buy or sell tokens using SOL
          {testMode.enabled && (
            <span className="ml-2 text-xs text-amber-600">
              (Test Mode {testMode.mode})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center p-6">
            <p>No tokens available for trading.</p>
            <p className="text-muted-foreground text-sm mt-2">
              Launch a token first or check your wallet connection.
            </p>
          </div>
        ) : null}
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {tokens.length > 0 && !loading && (
          <>
            <div className="mb-4">
              <Label htmlFor="select-token">Select Token</Label>
              <Select value={currentToken?.address} onValueChange={handleTokenChange}>
                <SelectTrigger id="select-token" className="w-full">
                  <SelectValue placeholder="Select a token to trade" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map(token => (
                    <SelectItem key={token.address} value={token.address}>
                      {token.name} ({token.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {currentToken && (
              <div className="mb-6">
                <div className="p-4 bg-secondary/30 rounded-lg mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="text-xl font-medium">{currentToken.balance.toFixed(4)} {currentToken.symbol}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Value</p>
                      <p className="text-xl font-medium">${currentToken.value.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-lg">${currentToken.price.toFixed(8)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Token Address</p>
                      <p className="text-xs font-mono truncate">{currentToken.address}</p>
                    </div>
                  </div>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy">Buy Token</TabsTrigger>
                    <TabsTrigger value="sell">Sell Token</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="buy" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="buy-amount">Amount (SOL)</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="buy-amount"
                          type="number"
                          value={buyAmount}
                          onChange={(e) => setBuyAmount(parseFloat(e.target.value) || 0)}
                          step={0.01}
                          min={0.01}
                          max={10}
                        />
                        <Button 
                          onClick={handleBuyToken} 
                          disabled={tokenLoading || buyAmount <= 0} 
                          className="whitespace-nowrap"
                        >
                          {tokenLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Buying...
                            </>
                          ) : 'Buy Token'}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Estimated to receive: ~{(buyAmount / currentToken.price).toFixed(2)} {currentToken.symbol}
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sell" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="sell-percentage">Percentage to Sell</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="sell-percentage"
                          type="number"
                          value={sellPercentage}
                          onChange={(e) => setSellPercentage(parseFloat(e.target.value) || 0)}
                          step={5}
                          min={1}
                          max={100}
                        />
                        <span className="text-sm">%</span>
                        <Button 
                          onClick={handleSellToken} 
                          disabled={tokenLoading || sellPercentage <= 0 || sellPercentage > 100}
                          className="whitespace-nowrap"
                        >
                          {tokenLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Selling...
                            </>
                          ) : 'Sell Token'}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Selling {sellPercentage}% of your {currentToken.symbol} tokens
                        (~{((currentToken.balance * sellPercentage) / 100).toFixed(4)} {currentToken.symbol})
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Estimated to receive: ~${((currentToken.value * sellPercentage) / 100).toFixed(2)} worth of SOL
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
