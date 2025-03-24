import { DNAVisualizer } from '../dist';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  try {
    console.log('Creating DNAVisualizer...');
    const visualizer = new DNAVisualizer();

    // Create a test DNA sequence
    const dnaSequence = 'ATCGATCGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAG';

    // Create output directory
    const outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Test each visualization style
    const styles = ['helix', 'grid', 'circular', 'barcode'] as const;
    
    for (const style of styles) {
      console.log(`Creating ${style} visualization...`);
      const outputPath = path.join(outputDir, `dna_${style}_${Date.now()}.png`);
      
      const result = await visualizer.createVisualization(
        dnaSequence,
        outputPath,
        { style, width: 800, height: 800 }
      );
      
      console.log(`${style} visualization created at: ${result}`);
    }

    console.log('All visualizations created successfully!');
    console.log(`Results saved to: ${outputDir}`);
    
  } catch (error) {
    console.error('Error in DNA visualization test:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}

main();
