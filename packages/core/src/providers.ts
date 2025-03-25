import { type IAgentRuntime, type State, type Memory, type Provider } from "./types.js";

/**
 * Formats provider outputs into a string which can be injected into the context.
 * @param runtime The AgentRuntime object.
 * @param message The incoming message object.
 * @param state The current state object.
 * @returns A string that concatenates the outputs of each provider.
 */
export async function getProviders(
    runtime: IAgentRuntime,
    message: Memory,
    state?: State
): Promise<string> {
    const providerResults: (string | null | undefined)[] = (
        await Promise.all(
            runtime.providers.map(async (provider: Provider) => {
                const result = await provider.get(runtime, message, state);
                return result !== undefined && result !== null ? String(result) : null;
            })
        )
    );

    const filteredResults: string[] = providerResults.filter((result: string | null | undefined): result is string => result != null && result !== undefined && typeof result === 'string');

    return filteredResults.join("\n");
}
