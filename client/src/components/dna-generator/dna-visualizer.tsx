import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CopyCheck } from "lucide-react";

// Nucleotide type and color mapping
export enum Nucleotide {
  A = "A",
  T = "T",
  G = "G",
  C = "C",
}

const nucleotideColors: Record<Nucleotide, string> = {
  [Nucleotide.A]: "#4CAF50", // Green
  [Nucleotide.T]: "#2196F3", // Blue
  [Nucleotide.G]: "#FFC107", // Yellow
  [Nucleotide.C]: "#F44336", // Red
};

// Interface for the DNAVisualizer component props
export interface DNAVisualizerProps {
  sequence: string;
  dnaHash?: string | null;
  showControls?: boolean;
}

/**
 * Component to visualize DNA sequences with color-coding
 */
export function DNAVisualizer({ sequence, dnaHash, showControls = true }: DNAVisualizerProps) {
  const [copied, setCopied] = useState(false);
  const [displayMode, setDisplayMode] = useState<"colorized" | "text">("colorized");
  
  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(sequence);
    setCopied(true);
  };
  
  // Get color for a nucleotide
  const getNucleotideColor = (nucleotide: string): string => {
    const upperNucleotide = nucleotide.toUpperCase() as Nucleotide;
    return nucleotideColors[upperNucleotide] || "#757575";
  };
  
  // Colorize nucleotides
  const colorizeNucleotides = () => {
    return sequence.split("").map((nucleotide, index) => (
      <span 
        key={index}
        style={{ color: getNucleotideColor(nucleotide) }}
        className="font-mono"
      >
        {nucleotide}
      </span>
    ));
  };
  
  // Format sequence with breaks
  const formatSequence = () => {
    const formatted = [];
    for (let i = 0; i < sequence.length; i += 80) {
      // Position counter
      formatted.push(
        <div key={`line-${i}`} className="flex">
          <div className="w-10 text-muted-foreground text-right pr-2 select-none font-mono text-xs">
            {i + 1}
          </div>
          <div className="flex-1 font-mono text-xs overflow-hidden">
            {displayMode === "colorized" 
              ? colorizeNucleotides().slice(i, i + 80)
              : sequence.slice(i, i + 80)
            }
          </div>
        </div>
      );
    }
    return formatted;
  };

  return (
    <Card className="relative">
      <CardContent className="p-4">
        {showControls && (
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Display Mode:</Label>
              <Button 
                variant={displayMode === "colorized" ? "default" : "outline"}
                size="sm"
                onClick={() => setDisplayMode("colorized")}
                className="h-7 px-2 text-xs"
              >
                Colorized
              </Button>
              <Button 
                variant={displayMode === "text" ? "default" : "outline"}
                size="sm"
                onClick={() => setDisplayMode("text")}
                className="h-7 px-2 text-xs"
              >
                Plain Text
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCopy} 
              className="h-7"
            >
              <CopyCheck size={16} className="mr-1" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        )}
        
        <div className="bg-muted/50 rounded-md p-2 overflow-x-auto max-h-[300px] overflow-y-auto">
          {formatSequence()}
        </div>
        
        {dnaHash && (
          <div className="mt-2 text-sm">
            <span className="font-medium">DNA Hash:</span>{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-xs">{dnaHash}</code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
