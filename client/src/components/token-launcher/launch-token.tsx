import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { tokenService } from "@/api/token-service";
import { TokenVisualizerData } from "@/types/token";
import { useTestMode } from "@/contexts/test-mode-context";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Token name must be at least 2 characters.",
  }).max(30, {
    message: "Token name must not exceed 30 characters.",
  }),
  symbol: z.string().min(2, {
    message: "Token symbol must be at least 2 characters.",
  }).max(10, {
    message: "Token symbol must not exceed 10 characters.",
  }).regex(/^[A-Z0-9]+$/, {
    message: "Token symbol must only contain uppercase letters and numbers.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(300, {
    message: "Description must not exceed 300 characters.",
  }),
  initialBuyAmount: z.coerce.number().min(0.01, {
    message: "Initial buy amount must be at least 0.01 SOL.",
  }).max(100, {
    message: "Initial buy amount cannot exceed 100 SOL.",
  }),
  telegram: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
  twitter: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
  website: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
});

interface LaunchTokenProps {
  onTokenLaunch: (token: TokenVisualizerData) => void;
}

export function LaunchToken({ onTokenLaunch }: LaunchTokenProps) {
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { testMode } = useTestMode();
  
  const form = useForm<z.infer<typeof formSchema>>({ 
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      symbol: "",
      description: "",
      initialBuyAmount: 0.5,
      telegram: "",
      twitter: "",
      website: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!image && !testMode.enabled) {
      setError("Token image is required");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Add all form values to the FormData
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });
      
      // Add the image file if available
      if (image) {
        formData.append('image', image);
      }

      // Add test mode flag if enabled
      if (testMode.enabled) {
        formData.append('testMode', JSON.stringify(testMode));
      }
      
      // Send the request to the API
      const response = await tokenService.launchToken(formData, testMode);
      
      if (response.success && response.tokenData) {
        // Reset the form
        form.reset();
        setImage(null);
        
        // Notify parent component
        onTokenLaunch(response.tokenData);
      } else {
        setError(response.message || 'Failed to launch token');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect to the token service');
      console.error('Error launching token:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Launch New Token</CardTitle>
        <CardDescription>
          Create your own Solana token
          {testMode.enabled && (
            <span className="ml-2 text-xs text-amber-600">
              (Test Mode {testMode.mode})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Token" {...field} />
                    </FormControl>
                    <FormDescription>The full name of your token</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="AWESOME" {...field} />
                    </FormControl>
                    <FormDescription>2-10 uppercase letters/numbers</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your token and its purpose..." 
                      className="min-h-24" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>10-300 characters</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="initialBuyAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Buy Amount (SOL)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0.01"
                        max="100"
                        step="0.01"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>How much SOL to invest initially</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <Label htmlFor="image">Token Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload an image for your token (PNG or JPEG, max 5MB)
                </p>
                {!image && !testMode.enabled && (
                  <p className="text-xs text-red-500 mt-1">Required</p>
                )}
                {testMode.enabled && !image && (
                  <p className="text-xs text-amber-600 mt-1">Optional in test mode</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Social Links (Optional)</h3>
              
              <div className="grid gap-6 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="telegram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telegram</FormLabel>
                      <FormControl>
                        <Input placeholder="https://t.me/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter/X</FormLabel>
                      <FormControl>
                        <Input placeholder="https://twitter.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Launching...
                  </>
                ) : (
                  'Launch Token'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
