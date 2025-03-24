import { useState } from "react";
import type { ReactElement } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { DNAVisualizer, Nucleotide } from "./dna-visualizer";

interface DNAGeneratorProps {
  onDNAGenerate?: (sequence: string) => void;
  initialSequence?: string;
}

// Validation function for DNA sequence
const isValidDNA = (sequence: string): boolean => {
  if (!sequence) return false;
  const validNucleotides = new Set(Object.values(Nucleotide));
  return sequence.toUpperCase().split("").every(char => validNucleotides.has(char as Nucleotide));
};

export function DNAGenerator({ onDNAGenerate, initialSequence }: DNAGeneratorProps): ReactElement {
  const [sequence, setSequence] = useState<string>(initialSequence || "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (value: string) => {
    setSequence(value.toUpperCase());
    setError(null);
  };

  const handleValidate = () => {
    if (!sequence) {
      setError("Please enter a DNA sequence");
      return false;
    }
    
    if (!isValidDNA(sequence)) {
      setError("Invalid DNA sequence. Only A, T, G, C nucleotides are allowed.");
      return false;
    }

    setError(null);
    return true;
  };

  const handleGenerate = async () => {
    if (!handleValidate()) return;

    try {
      setIsLoading(true);
      setError(null);

      // Here you would typically call your DNA generation service
      // For now, we'll just use the manually entered sequence
      if (onDNAGenerate) {
        onDNAGenerate(sequence);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate DNA sequence");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>DNA Generator</CardTitle>
        <CardDescription>
          Enter a DNA sequence or generate a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="dna-sequence">DNA Sequence</Label>
            <Input
              id="dna-sequence"
              placeholder="Enter DNA sequence (A, T, G, C)"
              value={sequence}
              onChange={(e) => handleInputChange(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !sequence}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </Button>

          {sequence && isValidDNA(sequence) && (
            <DNAVisualizer sequence={sequence} showControls={true} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
