/**
 * Calculates a new relationship score by combining the existing score with a new score.
 * The new score is weighted more heavily than the existing score.
 * @param existingScore The existing relationship score
 * @param newScore The new score to combine with the existing score
 * @returns The combined score
 */
export function calculateScore(existingScore: number, newScore: number): number {
    // Weight new score more heavily
    const newScoreWeight = 0.7;
    const existingScoreWeight = 0.3;

    return (existingScore * existingScoreWeight) + (newScore * newScoreWeight);
}

/**
 * Gets a relationship score based on a memory's content.
 * @param content The memory content to analyze
 * @returns A score between -1 and 1
 */
export function getRelationshipScore(content: string): number {
    // Simple sentiment analysis - replace with more sophisticated logic
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'love', 'like'];
    const negativeWords = ['bad', 'poor', 'awful', 'sad', 'hate', 'dislike'];

    let score = 0;
    const words = content.toLowerCase().split(/\s+/);

    for (const word of words) {
        if (positiveWords.includes(word)) {
            score += 0.2;
        } else if (negativeWords.includes(word)) {
            score -= 0.2;
        }
    }

    // Clamp score between -1 and 1
    return Math.max(-1, Math.min(1, score));
}
