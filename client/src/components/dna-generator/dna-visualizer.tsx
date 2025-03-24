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

const defaultColorScheme = {
  A: "#4CAF50", // Green
  T: "#2196F3", // Blue
  G: "#FFC107", // Yellow
  C: "#F44336", // Red
  background: "#121212"
};

// Interface for the DNAVisualizer component props
export interface DNAVisualizerProps {
  sequence: string;
  dnaHash?: string | null;
  showControls?: boolean;
  visualizationStyle?: 'helix' | 'matrix' | 'radial' | 'barcode';
  width?: number;
  height?: number;
  colorScheme?: typeof defaultColorScheme;
}

/**
 * Component to visualize DNA sequences with color-coding
 */
export function DNAVisualizer({ 
  sequence, 
  dnaHash, 
  showControls = true,
  visualizationStyle = 'matrix',
  width = 1024,
  height = 1024,
  colorScheme = defaultColorScheme
}: DNAVisualizerProps) {
  const [copied, setCopied] = useState(false);
  const [displayMode, setDisplayMode] = useState<"colorized" | "text">("colorized");
  const [visualizationBuffer, setVisualizationBuffer] = useState<Buffer | null>(null);
  
  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Generate visualization when sequence changes
  useEffect(() => {
    const generateVisualization = async () => {
      try {
        const dnaVisualizer = new DNAVisualizer();
        const buffer = await dnaVisualizer.createVisualization({
          dnaSequence: sequence,
          style: visualizationStyle,
          width,
          height,
          colorScheme
        });
        setVisualizationBuffer(buffer);
      } catch (error) {
        console.error('Error generating DNA visualization:', error);
      }
    };

    if (sequence) {
      generateVisualization();
    }
  }, [sequence, visualizationStyle, width, height, colorScheme]);
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(sequence);
    setCopied(true);
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        {showControls && (
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDisplayMode(displayMode === "colorized" ? "text" : "colorized")}
              >
                {displayMode === "colorized" ? "Show Text" : "Show Colors"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <CopyCheck className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  "Copy Sequence"
                )}
              </Button>
            </div>
            {dnaHash && (
              <div className="text-sm text-muted-foreground">
                Hash: {dnaHash}
              </div>
            )}
          </div>
        )}

        <div className="relative">
          {visualizationBuffer ? (
            <img 
              src={`data:image/png;base64,${visualizationBuffer.toString('base64')}`}
              alt="DNA Visualization"
              className="w-full h-auto rounded-lg"
            />
          ) : (
            <div className="min-h-[200px] flex items-center justify-center text-muted-foreground">
              Loading visualization...
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <Label>Sequence ({sequence.length} bp)</Label>
          <div className={`mt-2 font-mono p-2 rounded bg-muted ${displayMode === "colorized" ? "flex flex-wrap" : ""}`}>
            {displayMode === "colorized" ? (
              sequence.split("").map((nucleotide, index) => (
                <span
                  key={index}
                  style={{
                    color: colorScheme[nucleotide as keyof typeof colorScheme] || "#ffffff"
                  }}
                >
                  {nucleotide}
                </span>
              ))
            ) : (
              sequence
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
