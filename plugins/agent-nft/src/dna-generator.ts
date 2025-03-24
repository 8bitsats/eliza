import axios from 'axios';
import { createHash } from 'crypto';
import { DNAGenerationConfig, AgentDNAMetadata } from './types';

export class DNAGenerator {
  private apiKey: string;
  private apiEndpoint: string;
  private config: DNAGenerationConfig;
  
  constructor(apiKey: string, apiEndpoint: string, config: Partial<DNAGenerationConfig> = {}) {
    this.apiKey = apiKey;
    this.apiEndpoint = apiEndpoint;
    this.config = {
      model: 'evo2-40b',
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1,
      frequencyPenalty: 0.5,
      presencePenalty: 0.5,
      stopSequences: ['###'],
      ...config
    };
  }

  /**
   * Generate DNA sequence using NVIDIA EVO model
   */
  async generateDNA(prompt: string, parentDNA?: string): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(parentDNA);
      const response = await axios.post(
        `${this.apiEndpoint}/v1/generate`,
        {
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          top_p: this.config.topP,
          frequency_penalty: this.config.frequencyPenalty,
          presence_penalty: this.config.presencePenalty,
          stop: this.config.stopSequences
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const dnaSequence = response.data.choices[0]?.text;
      if (!dnaSequence) {
        throw new Error('Failed to generate DNA sequence');
      }

      return this.processDNASequence(dnaSequence);
    } catch (error) {
      console.error('Error generating DNA:', error);
      throw new Error('DNA generation failed');
    }
  }

  /**
   * Extract agent attributes from DNA sequence
   */
  extractAttributes(dnaSequence: string): AgentDNAMetadata['attributes'] {
    // Analyze DNA sequence regions
    const regions = {
      core: dnaSequence.slice(0, 256),
      learning: dnaSequence.slice(256, 512),
      behavior: dnaSequence.slice(512, 768),
      evolution: dnaSequence.slice(768)
    };

    // Calculate trait scores based on nucleotide patterns
    const scores = {
      intelligence: this.calculateTraitScore(regions.core),
      adaptability: this.calculateTraitScore(regions.learning),
      creativity: this.calculateTraitScore(regions.behavior),
      resilience: this.calculateTraitScore(regions.evolution)
    };

    return {
      intelligence: scores.intelligence,
      adaptability: scores.adaptability,
      creativity: scores.creativity,
      resilience: scores.resilience,
      specialization: this.extractSpecializations(dnaSequence),
      traits: this.extractTraits(dnaSequence)
    };
  }

  /**
   * Create metadata for the DNA sequence
   */
  async createMetadata(
    dnaSequence: string,
    name: string,
    description: string,
    generation: number = 0,
    parentDNA?: string
  ): Promise<AgentDNAMetadata> {
    const attributes = this.extractAttributes(dnaSequence);
    
    return {
      name,
      description,
      symbol: 'ADNA',
      attributes,
      dnaSequence,
      generation,
      parentDNA,
      evolutionHistory: parentDNA ? [parentDNA] : []
    };
  }

  private buildSystemPrompt(parentDNA?: string): string {
    let prompt = `You are a DNA sequence generator for AI agents. Generate a unique DNA sequence that encodes behavioral traits and capabilities.
The DNA should be represented as a string of nucleotides (A, T, G, C) with specific patterns that can be interpreted as traits.

Requirements:
1. Sequence length: 1024 nucleotides
2. Must include clearly defined regions for:
   - Core capabilities (positions 0-255)
   - Learning parameters (positions 256-511)
   - Behavioral traits (positions 512-767)
   - Evolution potential (positions 768-1023)
3. Use repetitive patterns to encode trait intensity
4. Include checksum sequences every 256 nucleotides`;

    if (parentDNA) {
      prompt += `\n\nParent DNA sequence for reference (maintain 70% similarity):
${parentDNA}`;
    }

    return prompt;
  }

  private processDNASequence(sequence: string): string {
    // Clean and validate the sequence
    const cleanSequence = sequence
      .toUpperCase()
      .replace(/[^ATGC]/g, '')
      .slice(0, 1024);

    // Pad if necessary
    return cleanSequence.padEnd(1024, 'A');
  }

  private calculateTraitScore(region: string): number {
    const patterns = {
      high: ['ATCG', 'GCTA', 'TGCA'],
      medium: ['AATT', 'GGCC', 'TTAA'],
      low: ['AAAA', 'TTTT', 'CCCC']
    };

    let score = 50; // Base score

    // Analyze pattern frequencies
    patterns.high.forEach(pattern => {
      const count = (region.match(new RegExp(pattern, 'g')) || []).length;
      score += count * 2;
    });

    patterns.medium.forEach(pattern => {
      const count = (region.match(new RegExp(pattern, 'g')) || []).length;
      score += count;
    });

    patterns.low.forEach(pattern => {
      const count = (region.match(new RegExp(pattern, 'g')) || []).length;
      score -= count;
    });

    // Normalize score between 1 and 100
    return Math.max(1, Math.min(100, score));
  }

  private extractSpecializations(dna: string): string[] {
    // Extract specializations based on specific patterns in the DNA
    const specializations: string[] = [];
    const patterns = {
      'ATGC': 'Language Processing',
      'GCTA': 'Visual Processing',
      'CGAT': 'Logical Reasoning',
      'TACG': 'Creative Generation',
      'GCAT': 'Pattern Recognition',
      'ACGT': 'Memory Management',
      'TGAC': 'Emotional Intelligence',
      'CATG': 'Problem Solving'
    };

    Object.entries(patterns).forEach(([pattern, specialization]) => {
      if ((dna.match(new RegExp(pattern, 'g')) || []).length >= 3) {
        specializations.push(specialization);
      }
    });

    return [...new Set(specializations)];
  }

  private extractTraits(dna: string): string[] {
    const traits: string[] = [];
    const segments = dna.match(/.{256}/g) || [];
    
    segments.forEach(segment => {
      const frequencies = {
        A: (segment.match(/A/g) || []).length,
        T: (segment.match(/T/g) || []).length,
        G: (segment.match(/G/g) || []).length,
        C: (segment.match(/C/g) || []).length
      };

      // Analyze frequencies to determine traits
      if (frequencies.A > frequencies.T) traits.push('Extroverted');
      if (frequencies.G > frequencies.C) traits.push('Analytical');
      if (frequencies.A + frequencies.T > frequencies.G + frequencies.C) {
        traits.push('Creative');
      }
      if (frequencies.G > frequencies.A) traits.push('Systematic');
      if (frequencies.C > frequencies.T) traits.push('Persistent');
      if (Math.abs(frequencies.A - frequencies.T) < 10) traits.push('Balanced');
    });

    return [...new Set(traits)];
  }
}
