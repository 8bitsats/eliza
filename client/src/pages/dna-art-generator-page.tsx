import React from "react";
import { DNAArtGenerator } from "@/components/dna-generator";

export default function DNAArtGeneratorPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">DNA Art Generator</h1>
      <p className="mb-8 text-gray-700 dark:text-gray-300">
        Create unique AI-generated artwork based on DNA sequences. This tool uses DNA sequences as seeds to 
        generate art with fal.ai stable diffusion models. Try generating a DNA sequence and creating 
        different styles of art based on the genetic pattern.
      </p>
      
      <DNAArtGenerator />
      
      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Generate a DNA sequence or input your own</li>
          <li>Choose an art style and adjust generation parameters</li>
          <li>Click "Generate DNA Art" to create a unique image</li>
          <li>Your generated images will appear in the gallery</li>
        </ol>
        
        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          <p>
            The DNA sequence influences the art generation in several ways:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>GC content affects color temperature (higher GC = cooler colors)</li>
            <li>A/T ratio impacts the mood and tone of the image</li>
            <li>Sequence patterns influence compositional elements</li>
            <li>Sequence length affects image complexity</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
