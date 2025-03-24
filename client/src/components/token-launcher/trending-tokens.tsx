import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { tokenService } from "@/api/token-service";
import { TrendingToken } from "@/types/token";
import { useTestMode } from "@/contexts/test-mode-context";

// Create simple table components for this file
const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-auto">
    <table className={`w-full caption-bottom text-sm ${className || ''}`} {...props} />
  </div>
);

const TableHeader = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={`[&_tr]:border-b ${className || ''}`} {...props} />
);

const TableBody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={`[&_tr:last-child]:border-0 ${className || ''}`} {...props} />
);

const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className || ''}`} {...props} />
);

const TableHead = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ${className || ''}`} {...props} />
);

const TableCell = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ${className || ''}`} {...props} />
);

interface TrendingTokensProps {
  onTokenSelect?: (token: TrendingToken) => void;
  limit?: number;
  timeframe?: string;
}

export function TrendingTokens({ 
  onTokenSelect, 
  limit = 10, 
  timeframe = "24h" 
}: TrendingTokensProps) {
  const [tokens, setTokens] = useState<TrendingToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { testMode } = useTestMode();

  useEffect(() => {
    const fetchTrendingTokens = async () => {
      try {
        setLoading(true);
        const result = await tokenService.getTrendingTokens(limit, timeframe, testMode);
        
        if (result.success) {
          // Validate token data before setting state
          const validatedTokens = (result.tokens || []).filter((token: TrendingToken) => {
            // Check for required properties
            if (!token.address || !token.name || !token.symbol || 
                typeof token.price !== 'number') {
              console.warn('Invalid trending token data received:', token);
              return false;
            }
            return true;
          });
          
          setTokens(validatedTokens);
        } else {
          setError(result.message || 'Failed to load trending tokens');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not connect to the token service');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTokens();
  }, [limit, timeframe, testMode]);

  // Format price change as percentage with color
  const formatPriceChange = (value: number) => {
    const isPositive = value >= 0;
    const formattedValue = `${isPositive ? '+' : ''}${value.toFixed(2)}%`;
    return (
      <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
        {formattedValue}
      </span>
    );
  };

  // Format currency value
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-2 py-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-3 w-[80px]" />
                </div>
                <div className="ml-auto space-y-1 text-right">
                  <Skeleton className="h-4 w-[60px] ml-auto" />
                  <Skeleton className="h-3 w-[40px] ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {testMode.enabled && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-800 text-sm">
                Test mode is enabled. This error may be simulated for testing purposes.
                Try toggling test mode to see different behaviors.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Trending Tokens</span>
          {testMode.enabled && (
            <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-md">
              Test Mode
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tokens.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            No trending tokens available at this time.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>24h Change</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token: TrendingToken) => (
                <TableRow key={token.address}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {token.imageUrl ? (
                        <img 
                          src={token.imageUrl} 
                          alt={token.symbol} 
                          className="h-6 w-6 rounded-full"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-bold">{token.symbol.substring(0, 2)}</span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{token.name}</div>
                        <div className="text-xs text-muted-foreground">{token.symbol}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(token.price)}</TableCell>
                  <TableCell>{formatPriceChange(token.priceChange24h)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onTokenSelect?.(token)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
