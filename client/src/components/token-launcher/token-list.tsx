import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { tokenService } from "@/api/token-service";
import { TokenMetadata } from "@/types/token";
import { useTestMode } from "@/contexts/test-mode-context";

interface TokenListProps {
  onTokenSelect: (token: TokenMetadata) => void;
}

export function TokenList({ onTokenSelect }: TokenListProps) {
  const [tokens, setTokens] = useState<TokenMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { testMode } = useTestMode();

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        const response = await tokenService.listTokens(testMode);
        
        if (response.success) {
          // Validate token data before setting state
          const validatedTokens = (response.tokens || []).filter((token: TokenMetadata) => {
            // Check for required properties
            if (!token.address || !token.name || !token.symbol) {
              console.warn('Invalid token data received:', token);
              return false;
            }
            return true;
          });
          
          setTokens(validatedTokens);
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

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground">
              No tokens found. Launch a new token to get started.
            </p>
            {testMode.enabled && (
              <p className="text-xs text-amber-600 mt-2">
                Test mode is active. Use the "Launch Token" tab to create test tokens.
              </p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead className="hidden sm:table-cell">Address</TableHead>
                <TableHead className="hidden md:table-cell">Launch Date</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Value (SOL)</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token: TokenMetadata) => (
                <TableRow key={token.address}>
                  <TableCell>{token.name}</TableCell>
                  <TableCell>{token.symbol}</TableCell>
                  <TableCell className="hidden sm:table-cell font-mono text-xs">
                    {token.address.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(token.launchDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {token.balance.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell">
                    {token.value.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onTokenSelect(token)}
                    >
                      View
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
