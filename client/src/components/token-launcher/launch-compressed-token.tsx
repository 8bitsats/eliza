import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { ZkCompressionService } from "@/api/zk-compression-service";

const compressedTokenSchema = z.object({
  name: z.string().min(1, "Name is required"),
  symbol: z.string().min(1, "Symbol is required").max(10, "Symbol must be 10 characters or less"),
  decimals: z.number().min(0).max(9),
  maxSupply: z.string().regex(/^\d+$/, "Must be a valid number"),
  initialSupply: z.string().regex(/^\d+$/, "Must be a valid number"),
  merkleTree: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Must be a valid Solana address"),
});

type CompressedTokenFormValues = z.infer<typeof compressedTokenSchema>;

export function LaunchCompressedToken() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<CompressedTokenFormValues>({
    resolver: zodResolver(compressedTokenSchema),
    defaultValues: {
      name: "",
      symbol: "",
      decimals: 9,
      maxSupply: "",
      initialSupply: "",
      merkleTree: "",
    },
  });

  const onSubmit = async (data: CompressedTokenFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const zkService = new ZkCompressionService(process.env.VITE_SOLANA_RPC_URL || "");
      
      // Convert string values to BigInt
      const maxSupply = BigInt(data.maxSupply);
      const initialSupply = BigInt(data.initialSupply);

      if (initialSupply > maxSupply) {
        throw new Error("Initial supply cannot be greater than max supply");
      }

      // Create the token
      const result = await zkService.createCompressedToken({
        ...data,
        maxSupply,
        initialSupply,
        merkleTree: new PublicKey(data.merkleTree),
        owner: window.solana // Assuming wallet is connected
      });

      setSuccess(`Successfully created compressed token: ${result.address.toString()}`);
    } catch (err: any) {
      setError(err.message || "Failed to create compressed token");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Launch ZK Compressed Token</CardTitle>
        <CardDescription>
          Create a new compressed token with minimal storage footprint
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Compressed Token" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="CTKN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="decimals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Decimals</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0} 
                      max={9} 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of decimal places (0-9)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxSupply"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Supply</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="1000000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="initialSupply"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Supply</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="1000000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="merkleTree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merkle Tree Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    The address of the merkle tree for compression
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  Creating Token...
                </>
              ) : (
                "Create Compressed Token"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
