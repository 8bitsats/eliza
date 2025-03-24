import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { TradingStrategiesService } from "@/api/trading-strategies-service";
import { PublicKey } from "@solana/web3.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tradingStrategySchema = z.object({
  tokenAddress: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Must be a valid Solana address"),
  marketAddress: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Must be a valid Solana address"),
  stopLossPrice: z.string().regex(/^\d*\.?\d*$/, "Must be a valid number"),
  takeProfitPrice: z.string().regex(/^\d*\.?\d*$/, "Must be a valid number"),
  copyTraderAddress: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Must be a valid Solana address"),
});

type TradingStrategyFormValues = z.infer<typeof tradingStrategySchema>;

interface TokenTradingStrategiesProps {
  tokenAddress?: string;
  marketAddress?: string;
}

export function TokenTradingStrategies({ tokenAddress, marketAddress }: TokenTradingStrategiesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  const tradingService = new TradingStrategiesService(process.env.VITE_SOLANA_RPC_URL || "");

  const form = useForm<TradingStrategyFormValues>({
    resolver: zodResolver(tradingStrategySchema),
    defaultValues: {
      tokenAddress: tokenAddress || "",
      marketAddress: marketAddress || "",
      stopLossPrice: "",
      takeProfitPrice: "",
      copyTraderAddress: "",
    },
  });

  useEffect(() => {
    const fetchPrice = async () => {
      if (marketAddress) {
        try {
          const price = await tradingService.getMarketPrice(new PublicKey(marketAddress));
          setCurrentPrice(price);
        } catch (err) {
          console.error("Error fetching market price:", err);
        }
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 10000); // Update price every 10 seconds

    return () => clearInterval(interval);
  }, [marketAddress]);

  const onSubmit = async (data: TradingStrategyFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const config = {
        tokenAddress: new PublicKey(data.tokenAddress),
        marketAddress: new PublicKey(data.marketAddress),
        stopLossPrice: data.stopLossPrice ? parseFloat(data.stopLossPrice) : undefined,
        takeProfitPrice: data.takeProfitPrice ? parseFloat(data.takeProfitPrice) : undefined,
        copyTraderAddress: data.copyTraderAddress ? new PublicKey(data.copyTraderAddress) : undefined,
      };

      // Create transaction instructions based on active tab
      const activeTab = form.watch("activeTab");
      let instruction;

      switch (activeTab) {
        case "stop-loss":
          instruction = await tradingService.setStopLoss(config);
          break;
        case "take-profit":
          instruction = await tradingService.setTakeProfit(config);
          break;
        case "copy-trading":
          instruction = await tradingService.startCopyTrading(config);
          break;
        default:
          throw new Error("Invalid strategy type");
      }

      // Send transaction
      const transaction = new Transaction().add(instruction);
      const signature = await window.solana.sendTransaction(transaction);

      setSuccess(`Successfully set ${activeTab} strategy. Transaction: ${signature}`);
    } catch (err: any) {
      setError(err.message || "Failed to set trading strategy");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Strategies</CardTitle>
        <CardDescription>
          Configure automated trading strategies for your token
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentPrice && (
          <div className="mb-4">
            <p className="text-sm font-medium">Current Market Price</p>
            <p className="text-2xl font-bold">${currentPrice.toFixed(6)}</p>
          </div>
        )}

        <Tabs defaultValue="stop-loss">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stop-loss">Stop Loss</TabsTrigger>
            <TabsTrigger value="take-profit">Take Profit</TabsTrigger>
            <TabsTrigger value="copy-trading">Copy Trading</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="tokenAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <TabsContent value="stop-loss">
                <FormField
                  control={form.control}
                  name="stopLossPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stop Loss Price ($)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormDescription>
                        Set the price at which to automatically sell
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="take-profit">
                <FormField
                  control={form.control}
                  name="takeProfitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Take Profit Price ($)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormDescription>
                        Set the price at which to automatically take profits
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="copy-trading">
                <FormField
                  control={form.control}
                  name="copyTraderAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trader Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        The address of the trader whose trades you want to copy
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting Strategy...
                  </>
                ) : (
                  "Set Strategy"
                )}
              </Button>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
