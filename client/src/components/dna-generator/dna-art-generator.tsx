import { useState, useRef } from "react";
import type { ReactElement } from "react";
import { DNAVisualizer } from "./dna-visualizer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { dnaService } from "@/api/dna-service";
import { Button } from "@/components/ui/button";

// Form schema
const formSchema = z.object({
  style: z.string(),
  model: z.string(),
  prompt: z.string().min(1, "Please enter a prompt"),
  width: z.number().min(512).max(1024),
  height: z.number().min(512).max(1024),
  steps: z.number().min(20).max(150),
  seed: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DNAArtGeneratorProps {
  onArtGenerated?: (dna: string, imageUrl: string) => void;
  initialDNA?: string;
}

interface DNAGenerationOptions {
  style: string;
  model: string;
  prompt: string;
}

export function DNAArtGenerator({ onArtGenerated, initialDNA }: DNAArtGeneratorProps): ReactElement {
  const [sequence, setSequence] = useState<string>(initialDNA || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const artDisplayRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      style: "abstract",
      model: "sdxl",
      prompt: "",
      width: 512,
      height: 512,
      steps: 50,
      seed: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await dnaService.generateDNA({
        style: data.style,
        model: data.model,
        prompt: data.prompt,
      });

      // Create a seed from the hash for consistent art generation
      const seed = Array.from(response.hash)
        .map((c: string) => c.charCodeAt(0))
        .reduce((acc, val) => acc + val, 0);

      form.setValue('seed', seed);
      setSequence(response.hash);

      // Call the callback if provided
      if (onArtGenerated) {
        onArtGenerated(response.hash, response.imageUrl || "");
      }

      // Scroll to the art display
      if (artDisplayRef.current) {
        artDisplayRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate DNA art");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>DNA Art Generator</CardTitle>
        <CardDescription>
          Generate unique art from DNA sequences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="style"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Art Style</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abstract">Abstract</SelectItem>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="cartoon">Cartoon</SelectItem>
                      <SelectItem value="pixel">Pixel Art</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the visual style for your DNA art
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Model</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast-sdxl">Fast SDXL</SelectItem>
                      <SelectItem value="sdxl">SDXL (High Quality)</SelectItem>
                      <SelectItem value="sd-1.5">Stable Diffusion 1.5</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the AI model for generation
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your art prompt..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe how you want your DNA art to look
                  </FormDescription>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width: {field.value}px</FormLabel>
                    <FormControl>
                      <Slider
                        min={512}
                        max={1024}
                        step={64}
                        value={[field.value ?? 512]}
                        onValueChange={(values) => field.onChange(values[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height: {field.value}px</FormLabel>
                    <FormControl>
                      <Slider
                        min={512}
                        max={1024}
                        step={64}
                        value={[field.value ?? 512]}
                        onValueChange={(values) => field.onChange(values[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="steps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inference Steps: {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={20}
                      max={150}
                      step={1}
                      value={[field.value ?? 50]}
                      onValueChange={(values) => field.onChange(values[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    More steps = higher quality but slower generation
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="seed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seed</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Seed for deterministic generation
                  </FormDescription>
                </FormItem>
              )}
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-4">
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Art"
                )}
              </Button>
            </div>
          </form>
        </Form>

        <div ref={artDisplayRef} className="mt-8">
          {sequence && <DNAVisualizer 
            sequence={sequence} 
            showControls={true} 
            visualizationStyle="matrix"
            width={1024}
            height={1024}
            colorScheme={{
              A: '#4CAF50',
              T: '#2196F3',
              G: '#FFC107',
              C: '#F44336',
              background: '#121212'
            }} 
          />}
        </div>
      </CardContent>
    </Card>
  );
}
