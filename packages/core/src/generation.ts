import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { bedrock } from "@ai-sdk/amazon-bedrock";
import { getModel, getModelSettings, getImageModelSettings, getEndpoint } from "./models.js";
import {
    generateObject as aiGenerateObject,
    generateText as aiGenerateText,
    type CoreTool,
    type GenerateObjectResult,
    type StepResult as AIStepResult,
} from "ai";
import { IImageDescriptionService, ModelClass, Service } from "./types.js";
import { Buffer } from "buffer";
import { createOllama } from "ollama-ai-provider";
import OpenAI from "openai";
import { encodingForModel, type TiktokenModel } from "js-tiktoken";
// import { AutoTokenizer } from "@huggingface/transformers";
import Together from "together-ai";
import type { ZodSchema } from "zod";
import { elizaLogger } from "./index.js";
import { models } from "./models.js";
import {
    parseBooleanFromText,
    parseJsonArrayFromText,
    parseJSONObjectFromText,
    parseShouldRespondFromText,
    parseActionResponseFromText,
} from "./parsing.js";
import settings from "./settings.js";
import {
    type Content,
    type IAgentRuntime,
    type IImageDescriptionService,
    type ITextGenerationService,
    ModelClass,
    ModelProviderName,
    ServiceType,
    type ActionResponse,
    // type IVerifiableInferenceAdapter,
    // type VerifiableInferenceOptions,
    // type VerifiableInferenceResult,
    //VerifiableInferenceProvider,
    type TelemetrySettings,
    TokenizerType,
} from "./types.js";
import { fal } from "@fal-ai/client";

import BigNumber from "bignumber.js";
import { createPublicClient, http } from "viem";
import fs from "fs";
import os from "os";
import path from "path";

type Tool = CoreTool<any, any>;
type StepResult = AIStepResult<any>;

// Simplify the types to avoid deep recursion
type GenerationResult = GenerateObjectResult<unknown>;

interface ProviderOptions {
    runtime: IAgentRuntime;
    provider: ModelProviderName;
    model: string;
    apiKey: string;
    schema?: ZodSchema;
    schemaName?: string;
    schemaDescription?: string;
    mode?: "auto" | "json" | "tool";
    modelOptions: ModelSettings;
    modelClass: ModelClass;
    context: string;
}

/**
 * Trims the provided text context to a specified token limit using a tokenizer model and type.
 *
 * The function dynamically determines the truncation method based on the tokenizer settings
 * provided by the runtime. If no tokenizer settings are defined, it defaults to using the
 * TikToken truncation method with the "gpt-4o" model.
 *
 * @async
 * @function trimTokens
 * @param {string} context - The text to be tokenized and trimmed.
 * @param {number} maxTokens - The maximum number of tokens allowed after truncation.
 * @param {IAgentRuntime} runtime - The runtime interface providing tokenizer settings.
 *
 * @returns {Promise<string>} A promise that resolves to the trimmed text.
 *
 * @throws {Error} Throws an error if the runtime settings are invalid or missing required fields.
 *
 * @example
 * const trimmedText = await trimTokens("This is an example text", 50, runtime);
 * console.log(trimmedText); // Output will be a truncated version of the input text.
 */
export async function trimTokens(
    context: string,
    maxTokens: number,
    runtime: IAgentRuntime
) {
    if (!context) return "";
    if (maxTokens <= 0) throw new Error("maxTokens must be positive");

    const tokenizerModel = runtime.getSetting("TOKENIZER_MODEL");
    const tokenizerType = runtime.getSetting("TOKENIZER_TYPE");

    if (!tokenizerModel || !tokenizerType) {
        // Default to TikToken truncation using the "gpt-4o" model if tokenizer settings are not defined
        return truncateTiktoken("gpt-4o", context, maxTokens);
    }

    // Choose the truncation method based on tokenizer type
    // if (tokenizerType === TokenizerType.Auto) {
    //     return truncateAuto(tokenizerModel, context, maxTokens);
    // }

    if (tokenizerType === TokenizerType.TikToken) {
        return truncateTiktoken(
            tokenizerModel as TiktokenModel,
            context,
            maxTokens
        );
    }

    elizaLogger.warn(`Unsupported tokenizer type: ${tokenizerType}`);
    return truncateTiktoken("gpt-4o", context, maxTokens);
}

// async function truncateAuto(
//     modelPath: string,
//     context: string,
//     maxTokens: number
// ) {
//     try {
//         const tokenizer = await AutoTokenizer.from_pretrained(modelPath);
//         const tokens = tokenizer.encode(context);

//         // If already within limits, return unchanged
//         if (tokens.length <= maxTokens) {
//             return context;
//         }

//         // Keep the most recent tokens by slicing from the end
//         const truncatedTokens = tokens.slice(-maxTokens);

//         // Decode back to text - js-tiktoken decode() returns a string directly
//         return tokenizer.decode(truncatedTokens);
//     } catch (error) {
//         elizaLogger.error("Error in trimTokens:", error);
//         // Return truncated string if tokenization fails
//         return context.slice(-maxTokens * 4); // Rough estimate of 4 chars per token
//     }
// }

async function truncateTiktoken(
    model: TiktokenModel,
    context: string,
    maxTokens: number
) {
    try {
        const encoding = encodingForModel(model);

        // Encode the text into tokens
        const tokens = encoding.encode(context);

        // If already within limits, return unchanged
        if (tokens.length <= maxTokens) {
            return context;
        }

        // Keep the most recent tokens by slicing from the end
        const truncatedTokens = tokens.slice(-maxTokens);

        // Decode back to text - js-tiktoken decode() returns a string directly
        return encoding.decode(truncatedTokens);
    } catch (error) {
        elizaLogger.error("Error in trimTokens:", error);
        // Return truncated string if tokenization fails
        return context.slice(-maxTokens * 4); // Rough estimate of 4 chars per token
    }
}

/**
 * Get OnChain EternalAI System Prompt
 * @returns System Prompt
 */
async function getOnChainEternalAISystemPrompt(
    runtime: IAgentRuntime
): Promise<string> | undefined {
    const agentId = runtime.getSetting("ETERNALAI_AGENT_ID");
    const providerUrl = runtime.getSetting("ETERNALAI_RPC_URL");
    const contractAddress = runtime.getSetting(
        "ETERNALAI_AGENT_CONTRACT_ADDRESS"
    );
    if (agentId && providerUrl && contractAddress) {
        // get on-chain system-prompt
        const contractABI = [
            {
                inputs: [
                    {
                        internalType: "uint256",
                        name: "_agentId",
                        type: "uint256",
                    },
                ],
                name: "getAgentSystemPrompt",
                outputs: [
                    { internalType: "bytes[]", name: "", type: "bytes[]" },
                ],
                stateMutability: "view",
                type: "function",
            },
        ];

        const publicClient = createPublicClient({
            transport: http(providerUrl),
        });

        try {
            const validAddress: `0x${string}` =
                contractAddress as `0x${string}`;
            const result = await publicClient.readContract({
                address: validAddress,
                abi: contractABI,
                functionName: "getAgentSystemPrompt",
                args: [new BigNumber(agentId)],
            });
            if (result) {
                elizaLogger.info("on-chain system-prompt response", result[0]);
                const value = result[0].toString().replace("0x", "");
                const content = Buffer.from(value, "hex").toString("utf-8");
                elizaLogger.info("on-chain system-prompt", content);
                return await fetchEternalAISystemPrompt(runtime, content);
            } else {
                return undefined;
            }
        } catch (error) {
            elizaLogger.error(error);
            elizaLogger.error("err", error);
        }
    }
    return undefined;
}

/**
 * Fetch EternalAI System Prompt
 * @returns System Prompt
 */
async function fetchEternalAISystemPrompt(
    runtime: IAgentRuntime,
    content: string
): Promise<string> | undefined {
    const IPFS = "ipfs://";
    const containsSubstring: boolean = content.includes(IPFS);
    if (containsSubstring) {
        const lightHouse = content.replace(
            IPFS,
            "https://gateway.lighthouse.storage/ipfs/"
        );
        elizaLogger.info("fetch lightHouse", lightHouse);
        const responseLH = await fetch(lightHouse, {
            method: "GET",
        });
        elizaLogger.info("fetch lightHouse resp", responseLH);
        if (responseLH.ok) {
            const data = await responseLH.text();
            return data;
        } else {
            const gcs = content.replace(
                IPFS,
                "https://cdn.eternalai.org/upload/"
            );
            elizaLogger.info("fetch gcs", gcs);
            const responseGCS = await fetch(gcs, {
                method: "GET",
            });
            elizaLogger.info("fetch lightHouse gcs", responseGCS);
            if (responseGCS.ok) {
                const data = await responseGCS.text();
                return data;
            } else {
                throw new Error("invalid on-chain system prompt");
            }
        }
    } else {
        return content;
    }
}

/**
 * Gets the Cloudflare Gateway base URL for a specific provider if enabled
 * @param runtime The runtime environment
 * @param provider The model provider name
 * @returns The Cloudflare Gateway base URL if enabled, undefined otherwise
 */
function getCloudflareGatewayBaseURL(
    runtime: IAgentRuntime,
    provider: string
): string | undefined {
    const isCloudflareEnabled =
        runtime.getSetting("CLOUDFLARE_GW_ENABLED") === "true";
    const cloudflareAccountId = runtime.getSetting("CLOUDFLARE_AI_ACCOUNT_ID");
    const cloudflareGatewayId = runtime.getSetting("CLOUDFLARE_AI_GATEWAY_ID");

    elizaLogger.debug("Cloudflare Gateway Configuration:", {
        isEnabled: isCloudflareEnabled,
        hasAccountId: !!cloudflareAccountId,
        hasGatewayId: !!cloudflareGatewayId,
        provider: provider,
    });

    if (!isCloudflareEnabled) {
        elizaLogger.debug("Cloudflare Gateway is not enabled");
        return undefined;
    }

    if (!cloudflareAccountId) {
        elizaLogger.warn(
            "Cloudflare Gateway is enabled but CLOUDFLARE_AI_ACCOUNT_ID is not set"
        );
        return undefined;
    }

    if (!cloudflareGatewayId) {
        elizaLogger.warn(
            "Cloudflare Gateway is enabled but CLOUDFLARE_AI_GATEWAY_ID is not set"
        );
        return undefined;
    }

    const baseURL = `https://gateway.ai.cloudflare.com/v1/${cloudflareAccountId}/${cloudflareGatewayId}/${provider.toLowerCase()}`;
    elizaLogger.info("Using Cloudflare Gateway:", {
        provider,
        baseURL,
        accountId: cloudflareAccountId,
        gatewayId: cloudflareGatewayId,
    });

    return baseURL;
}

/**
 * Send a message to the model for a text generateText - receive a string back and parse how you'd like
 * @param opts - The options for the generateText request.
 * @param opts.context The context of the message to be completed.
 * @param opts.stop A list of strings to stop the generateText at.
 * @param opts.model The model to use for generateText.
 * @param opts.frequency_penalty The frequency penalty to apply to the generateText.
 * @param opts.presence_penalty The presence penalty to apply to the generateText.
 * @param opts.temperature The temperature to apply to the generateText.
 * @param opts.max_context_length The maximum length of the context to apply to the generateText.
 * @returns The completed message.
 */

export async function generateText({
    runtime,
    context,
    modelClass,
    tools = {},
    onStepFinish,
    maxSteps = 1,
    stop,
    customSystemPrompt,
}: // verifiableInference = process.env.VERIFIABLE_INFERENCE_ENABLED === "true",
// verifiableInferenceOptions,
{
    runtime: IAgentRuntime;
    context: string;
    modelClass: ModelClass;
    tools?: Record<string, Tool>;
    onStepFinish?: (event: StepResult) => Promise<void> | void;
    maxSteps?: number;
    stop?: string[];
    customSystemPrompt?: string;
    // verifiableInference?: boolean;
    // verifiableInferenceAdapter?: IVerifiableInferenceAdapter;
    // verifiableInferenceOptions?: VerifiableInferenceOptions;
}): Promise<string> {
    if (!context) {
        console.error("generateText context is empty");
        return "";
    }

    elizaLogger.log("Generating text...");

    elizaLogger.info("Generating text with options:", {
        modelProvider: runtime.modelProvider,
        model: modelClass,
        // verifiableInference,
    });
    elizaLogger.log("Using provider:", runtime.modelProvider);
    // If verifiable inference is requested and adapter is provided, use it
    // if (verifiableInference && runtime.verifiableInferenceAdapter) {
    //     elizaLogger.log(
    //         "Using verifiable inference adapter:",
    //         runtime.verifiableInferenceAdapter
    //     );
    //     try {
    //         const result: VerifiableInferenceResult =
    //             await runtime.verifiableInferenceAdapter.generateText(
    //                 context,
    //                 modelClass,
    //                 verifiableInferenceOptions
    //             );
    //         elizaLogger.log("Verifiable inference result:", result);
    //         // Verify the proof
    //         const isValid =
    //             await runtime.verifiableInferenceAdapter.verifyProof(result);
    //         if (!isValid) {
    //             throw new Error("Failed to verify inference proof");
    //         }

    //         return result.text;
    //     } catch (error) {
    //         elizaLogger.error("Error in verifiable inference:", error);
    //         throw error;
    //     }
    // }

    const provider = runtime.modelProvider;
    elizaLogger.debug("Provider settings:", {
        provider,
        hasRuntime: !!runtime,
        runtimeSettings: {
            CLOUDFLARE_GW_ENABLED: runtime.getSetting("CLOUDFLARE_GW_ENABLED"),
            CLOUDFLARE_AI_ACCOUNT_ID: runtime.getSetting(
                "CLOUDFLARE_AI_ACCOUNT_ID"
            ),
            CLOUDFLARE_AI_GATEWAY_ID: runtime.getSetting(
                "CLOUDFLARE_AI_GATEWAY_ID"
            ),
        },
    });

    const endpoint =
        runtime.character.modelEndpointOverride || getEndpoint(provider);
    const modelSettings = getModelSettings(runtime.modelProvider, modelClass);
    let model = modelSettings.name;

    // allow character.json settings => secrets to override models
    // FIXME: add MODEL_MEDIUM support
    switch (provider) {
        // if runtime.getSetting("LLAMACLOUD_MODEL_LARGE") is true and modelProvider is LLAMACLOUD, then use the large model
        case ModelProviderName.LLAMACLOUD:
            {
                switch (modelClass) {
                    case ModelClass.LARGE:
                        {
                            model =
                                runtime.getSetting("LLAMACLOUD_MODEL_LARGE") ||
                                model;
                        }
                        break;
                    case ModelClass.SMALL:
                        {
                            model =
                                runtime.getSetting("LLAMACLOUD_MODEL_SMALL") ||
                                model;
                        }
                        break;
                }
            }
            break;
        case ModelProviderName.TOGETHER:
            {
                switch (modelClass) {
                    case ModelClass.LARGE:
                        {
                            model =
                                runtime.getSetting("TOGETHER_MODEL_LARGE") ||
                                model;
                        }
                        break;
                    case ModelClass.SMALL:
                        {
                            model =
                                runtime.getSetting("TOGETHER_MODEL_SMALL") ||
                                model;
                        }
                        break;
                }
            }
            break;
        case ModelProviderName.OPENROUTER:
            {
                switch (modelClass) {
                    case ModelClass.LARGE:
                        {
                            model =
                                runtime.getSetting("LARGE_OPENROUTER_MODEL") ||
                                model;
                        }
                        break;
                    case ModelClass.SMALL:
                        {
                            model =
                                runtime.getSetting("SMALL_OPENROUTER_MODEL") ||
                                model;
                        }
                        break;
                }
            }
            break;
    }

    elizaLogger.info("Selected model:", model);

    const modelConfiguration = runtime.character?.settings?.modelConfig;
    const temperature =
        modelConfiguration?.temperature || modelSettings.temperature;
    const frequency_penalty =
        modelConfiguration?.frequency_penalty ||
        modelSettings.frequency_penalty;
    const presence_penalty =
        modelConfiguration?.presence_penalty || modelSettings.presence_penalty;
    const max_context_length =
        modelConfiguration?.maxInputTokens || modelSettings.maxInputTokens;
    const max_response_length =
        modelConfiguration?.maxOutputTokens || modelSettings.maxOutputTokens;
    const experimental_telemetry =
        modelConfiguration?.experimental_telemetry ||
        modelSettings.experimental_telemetry;

    const apiKey = runtime.token;

    try {
        elizaLogger.debug(
            `Trimming context to max length of ${max_context_length} tokens.`
        );

        context = await trimTokens(context, max_context_length, runtime);

        let response: string;

        const _stop = stop || modelSettings.stop;
        elizaLogger.debug(
            `Using provider: ${provider}, model: ${model}, temperature: ${temperature}, max response length: ${max_response_length}`
        );

        switch (provider) {
            // OPENAI & LLAMACLOUD shared same structure.
            case ModelProviderName.OPENAI:
            case ModelProviderName.ALI_BAILIAN:
            case ModelProviderName.VOLENGINE:
            case ModelProviderName.LLAMACLOUD:
            case ModelProviderName.NANOGPT:
            case ModelProviderName.HYPERBOLIC:
            case ModelProviderName.TOGETHER:
            case ModelProviderName.NINETEEN_AI:
            case ModelProviderName.AKASH_CHAT_API:
            case ModelProviderName.LMSTUDIO:
            case ModelProviderName.NEARAI: {
                elizaLogger.debug(
                    "Initializing OpenAI model with Cloudflare check"
                );
                const baseURL =
                    getCloudflareGatewayBaseURL(runtime, "openai") || endpoint;

                //elizaLogger.debug("OpenAI baseURL result:", { baseURL });
                const openai = createOpenAI({
                    apiKey,
                    baseURL,
                    fetch: runtime.fetch,
                });

                const { text: openaiResponse } = await aiGenerateText({
                    model: openai.languageModel(model),
                    prompt: context,
                    system:
                        runtime.character.system ??
                        settings.SYSTEM_PROMPT ??
                        undefined,
                    tools: tools,
                    onStepFinish: onStepFinish,
                    maxSteps: maxSteps,
                    temperature: temperature,
                    maxTokens: max_response_length,
                    frequencyPenalty: frequency_penalty,
                    presencePenalty: presence_penalty,
                    experimental_telemetry: experimental_telemetry,
                });

                response = openaiResponse;
                console.log("Received response from OpenAI model.");
                break;
            }

            case ModelProviderName.ETERNALAI: {
                elizaLogger.debug("Initializing EternalAI model.");
                const openai = createOpenAI({
                    apiKey,
                    baseURL: endpoint,
                    fetch: async (
                        input: RequestInfo | URL,
                        init?: RequestInit
                    ): Promise<Response> => {
                        const url =
                            typeof input === "string"
                                ? input
                                : input.toString();
                        const chain_id =
                            runtime.getSetting("ETERNALAI_CHAIN_ID") || "45762";

                        const options: RequestInit = { ...init };
                        if (options?.body) {
                            const body = JSON.parse(options.body as string);
                            body.chain_id = chain_id;
                            options.body = JSON.stringify(body);
                        }

                        const fetching = await runtime.fetch(url, options);

                        if (
                            parseBooleanFromText(
                                runtime.getSetting("ETERNALAI_LOG")
                            )
                        ) {
                            elizaLogger.info(
                                "Request data: ",
                                JSON.stringify(options, null, 2)
                            );
                            const clonedResponse = fetching.clone();
                            try {
                                clonedResponse.json().then((data) => {
                                    elizaLogger.info(
                                        "Response data: ",
                                        JSON.stringify(data, null, 2)
                                    );
                                });
                            } catch (e) {
                                elizaLogger.debug(e);
                            }
                        }
                        return fetching;
                    },
                });

                let system_prompt =
                    runtime.character.system ??
                    settings.SYSTEM_PROMPT ??
                    undefined;
                try {
                    const on_chain_system_prompt =
                        await getOnChainEternalAISystemPrompt(runtime);
                    if (!on_chain_system_prompt) {
                        elizaLogger.error(
                            new Error("invalid on_chain_system_prompt")
                        );
                    } else {
                        system_prompt = on_chain_system_prompt;
                        elizaLogger.info(
                            "new on-chain system prompt",
                            system_prompt
                        );
                    }
                } catch (e) {
                    elizaLogger.error(e);
                }

                const { text: openaiResponse } = await aiGenerateText({
                    model: openai.languageModel(model),
                    prompt: context,
                    system: system_prompt,
                    temperature: temperature,
                    maxTokens: max_response_length,
                    frequencyPenalty: frequency_penalty,
                    presencePenalty: presence_penalty,
                });

                response = openaiResponse;
                elizaLogger.debug("Received response from EternalAI model.");
                break;
            }

            case ModelProviderName.GOOGLE: {
                const google = createGoogleGenerativeAI({
                    apiKey,
                    fetch: runtime.fetch,
                });

                const { text: googleResponse } = await aiGenerateText({
                    model: google(model),
                    prompt: context,
                    system:
                        runtime.character.system ??
                        settings.SYSTEM_PROMPT ??
                        undefined,
                    tools: tools,
                    onStepFinish: onStepFinish,
                    maxSteps: maxSteps,
                    temperature: temperature,
                    maxTokens: max_response_length,
                    frequencyPenalty: frequency_penalty,
                    presencePenalty: presence_penalty,
                    experimental_telemetry: experimental_telemetry,
                });

                response = googleResponse;
                elizaLogger.debug("Received response from Google model.");
                break;
            }

            case ModelProviderName.MISTRAL: {
                const mistral = createMistral();

                const { text: mistralResponse } = await aiGenerateText({
                    model: mistral(model),
                    prompt: context,
                    system:
                        runtime.character.system ??
                        settings.SYSTEM_PROMPT ??
                        undefined,
                    temperature: temperature,
                    maxTokens: max_response_length,
                    frequencyPenalty: frequency_penalty,
                    presencePenalty: presence_penalty,
                });

                response = mistralResponse;
                elizaLogger.debug("Received response from Mistral model.");
                break;
            }

            case ModelProviderName.ANTHROPIC: {
                elizaLogger.debug(
                    "Initializing Anthropic model with Cloudflare check"
                );
                const baseURL =
                    getCloudflareGatewayBaseURL(runtime, "anthropic") ||
                    "https://api.anthropic.com/v1";
                elizaLogger.debug("Anthropic baseURL result:", { baseURL });

                const anthropic = createAnthropic({
                    apiKey,
                    baseURL,
                    fetch: runtime.fetch,
                });
                const { text: anthropicResponse } = await aiGenerateText({
                    model: anthropic.languageModel(model),
                    prompt: context,
                    system:
                        runtime.character.system ??
                        settings.SYSTEM_PROMPT ??
                        undefined,
                    tools: tools,
                    onStepFinish: onStepFinish,
                    maxSteps: maxSteps,
                    temperature: temperature,
                    maxTokens: max_response_length,
                    frequencyPenalty: frequency_penalty,
                    presencePenalty: presence_penalty,
                    experimental_telemetry: experimental_telemetry,
                });

                response = anthropicResponse;
                elizaLogger.debug("Received response from Anthropic model.");
                break;
            }

            case ModelProviderName.CLAUDE_VERTEX: {
                elizaLogger.debug("Initializing Claude Vertex model.");

                const anthropic = createAnthropic({
                    apiKey,
                    fetch: runtime.fetch,
                });

                const { text: anthropicResponse } = await aiGenerateText({
                    model: anthropic.languageModel(model),
                    prompt: context,
                    system:
                        runtime.character.system ??
                        settings.SYSTEM_PROMPT ??
                        undefined,
                    tools: tools,
                    onStepFinish: onStepFinish,
                    maxSteps: maxSteps,
                    temperature: temperature,
                    maxTokens: max_response_length,
                    frequencyPenalty: frequency_penalty,
                    presencePenalty: presence_penalty,
                    experimental_telemetry: experimental_telemetry,
                });

                response = anthropicResponse;
                elizaLogger.debug(
                    "Received response from Claude Vertex model."
                );
                break;
            }

            case ModelProviderName.GROK: {
                elizaLogger.debug("Initializing Grok model.");
                const grok = createOpenAI({
                    apiKey,
                    baseURL: endpoint,
                    fetch: runtime.fetch,
                });

                const { text: grokResponse } = await aiGenerateText({
                    model: grok.languageModel(model, {
                        parallelToolCalls: false,
                    }),
                    prompt: context,
                    system:
                        runtime.character.system ??
                        settings.SYSTEM_PROMPT ??
                        undefined,
                    tools: tools,
                    onStepFinish: onStepFinish,
                    maxSteps: maxSteps,
                    temperature: temperature,
                    maxTokens: max_response_length,
                    frequencyPenalty: frequency_penalty,
                    presencePenalty: presence_penalty,
                    experimental_telemetry: experimental_telemetry,
                });

                response = grokResponse;
                elizaLogger.debug("Received response from Grok model.");
                break;
            }

            case ModelProviderName.GROQ: {
                elizaLogger.debug(
                    "Initializing Groq model with Cloudflare check"
                );
                const baseURL = getCloudflareGatewayBaseURL(runtime, "groq");
                elizaLogger.debug("Groq baseURL result:", { baseURL });
                const groq = createGroq({
                    apiKey,
                    fetch: runtime.fetch,
                    baseURL,
                });

                const { text: groqResponse } = await aiGenerateText({
                    model: groq.languageModel(model),
                    prompt: context,
                    temperature,
                    system:
                        runtime.character.system ??
                        settings.SYSTEM_PROMPT ??
                        undefined,
                    tools,
                    onStepFinish: onStepFinish,
                    maxSteps,
                    maxTokens: max_response_length,
                    frequencyPenalty: frequency_penalty,
                    presencePenalty: presence_penalty,
                    experimental_telemetry,
                });

                response = groqResponse;
                elizaLogger.debug("Received response from Groq model.");
                break;
            }

            case ModelProviderName.LLAMALOCAL: {
                elizaLogger.debug(
                    "Using local Llama model for text completion."
                );
                const textGenerationService =
                    runtime.getService<ITextGenerationService>(
                        ServiceType.TEXT_GENERATION
                    );

                if (!textGenerationService) {
                    throw new Error("Text generation service not found");
                }

                response = await textGenerationService.queueTextCompletion(
                    context,
                    temperature,
                    _stop,
                    frequency_penalty,
                    presence_penalty,
                    max_response_length
                );
                elizaLogger.debug("Received response from local Llama model.");
                break;
            }

            case ModelProviderName.REDPILL: {
                elizaLogger.debug("Initializing RedPill model.");
                const serverUrl = getEndpoint(provider);
                const openai = createOpenAI({
                    apiKey,
                    baseURL: serverUrl,
                    fetch: runtime.fetch,
                });

                const { text: openaiResponse } = await aiGenerateText({
                    model: openai.languageModel(model),
                    prompt: context,
                    system:
                        runtime.character.system ??
                        settings.SYSTEM_PROMPT ??
                        undefined,
                    tools: tools,
                    onStepFinish: onStepFinish,
                    maxSteps: maxSteps,
                    temperature: temperature,
                    maxTokens: max_response_length,
                    frequencyPenalty: frequency_penalty,
                    presencePenalty: presence_penalty,
                    experimental_telemetry: experimental_telemetry,
                });

                response = openaiResponse;
                elizaLogger.debug("Received response from RedPill model.");
                break;
            }

            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }

        return response;
    } catch (error) {
        elizaLogger.error("Error generating text:", error);
        throw error;
    }
}

export function splitChunks(text: string, maxTokens: number, runtime: IAgentRuntime): string[] {
    const chunks: string[] = [];
    let currentChunk = '';
    
    // Split text into sentences
    const sentences = text.split(/(?<=[.!?])\s+/);
    
    for (const sentence of sentences) {
        // Check if adding this sentence would exceed max tokens
        const testChunk = currentChunk + sentence;
        if (testChunk.length > maxTokens) {
            // If it would, add the current chunk and start a new one
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            // Otherwise, add the sentence to the current chunk
            currentChunk += sentence + ' ';
        }
    }
    
    // Add the last chunk if it's not empty
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks;
}
