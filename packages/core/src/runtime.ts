import { readFile } from "fs/promises";
import { join } from "path";
import { names, uniqueNamesGenerator } from "unique-names-generator";
import { v4 as uuidv4 } from "uuid";
import {
    composeActionExamples,
    formatActionNames,
    formatActions,
} from "./actions";
import { addHeader, composeContext } from "./context";
import { defaultCharacter } from "./defaultCharacter";
import {
    evaluationTemplate,
    formatEvaluatorExamples,
    formatEvaluatorNames,
    formatEvaluators,
} from "./evaluators";
import { generateText } from "./generation";
import { formatGoalsAsString, getGoals } from "./goals";
import { elizaLogger, embed, splitChunks } from "./index";
import { embeddingZeroVector, MemoryManager } from "./memory";
import { formatActors, formatMessages, getActorDetails } from "./messages";
import { parseJsonArrayFromText } from "./parsing";
import { formatPosts } from "./posts";
import { getProviders } from "./providers";
import settings from "./settings";
import {
    type Character,
    type Goal,
    type HandlerCallback,
    type IAgentRuntime,
    type ICacheManager,
    type IDatabaseAdapter,
    type IMemoryManager,
    type IRAGKnowledgeManager,
    // type IVerifiableInferenceAdapter,
    type KnowledgeItem,
    // RAGKnowledgeItem,
    //Media,
    ModelClass,
    ModelProviderName,
    type Plugin,
    type Provider,
    type Adapter,
    type Service,
    type ServiceType,
    type State,
    type UUID,
    type Action,
    type Actor,
    type Evaluator,
    type Memory,
    type DirectoryItem,
    type ClientInstance,
} from "./types";
import { stringToUuid } from "./uuid";
import { glob } from "glob";
import { existsSync } from "fs";

/**
 * Represents the runtime environment for an agent, handling message processing,
 * action registration, and interaction with external services like OpenAI and Supabase.
 */

function isDirectoryItem(item: any): item is DirectoryItem {
    return (
        typeof item === "object" &&
        item !== null &&
        "directory" in item &&
        typeof item.directory === "string"
    );
}

export class AgentRuntime implements IAgentRuntime {
    /**
     * Default count for recent messages to be kept in memory.
     * @private
     */
    readonly #conversationLength = 32 as number;
    /**
     * The ID of the agent
     */
    agentId: UUID;
    /**
     * The base URL of the server where the agent's requests are processed.
     */
    serverUrl = "http://localhost:7998";

    /**
     * The database adapter used for interacting with the database.
     */
    databaseAdapter: IDatabaseAdapter;

    /**
     * Authentication token used for securing requests.
     */
    token: string | null;

    /**
     * Custom actions that the agent can perform.
     */
    actions: Action[] = [];

    /**
     * Evaluators used to assess and guide the agent's responses.
     */
    evaluators: Evaluator[] = [];

    /**
     * Context providers used to provide context for message generation.
     */
    providers: Provider[] = [];

    /**
     * Database adapters used to interact with the database.
     */
    adapters: Adapter[] = [];

    plugins: Plugin[] = [];

    /**
     * The model to use for generateText.
     */
    modelProvider: ModelProviderName;

    /**
     * The model to use for generateImage.
     */
    imageModelProvider: ModelProviderName;

    /**
     * The model to use for describing images.
     */
    imageVisionModelProvider: ModelProviderName;

    /**
     * Fetch function to use
     * Some environments may not have access to the global fetch function and need a custom fetch override.
     */
    fetch = fetch;

    /**
     * The character to use for the agent
     */
    character: Character;

    /**
     * Store messages that are sent and received by the agent.
     */
    messageManager: IMemoryManager;

    /**
     * Store and recall descriptions of users based on conversations.
     */
    descriptionManager: IMemoryManager;

    /**
     * Manage the creation and recall of static information (documents, historical game lore, etc)
     */
    loreManager: IMemoryManager;

    /**
     * Hold large documents that can be referenced
     */
    documentsManager: IMemoryManager;

    /**
     * Searchable document fragments
     */
    knowledgeManager: IMemoryManager;

    ragKnowledgeManager: IRAGKnowledgeManager;

    private readonly knowledgeRoot: string;

    services: Map<ServiceType, Service> = new Map();
    memoryManagers: Map<string, IMemoryManager> = new Map();
    cacheManager: ICacheManager;
    clients: ClientInstance[] = [];

    // verifiableInferenceAdapter?: IVerifiableInferenceAdapter;

    registerMemoryManager(manager: IMemoryManager): void {
        if (!manager.tableName) {
            throw new Error("Memory manager must have a tableName");
        }

        if (this.memoryManagers.has(manager.tableName)) {
            elizaLogger.warn(
                `Memory manager ${manager.tableName} is already registered. Skipping registration.`,
            );
            return;
        }

        this.memoryManagers.set(manager.tableName, manager);
    }

    getMemoryManager(tableName: string): IMemoryManager | null {
        return this.memoryManagers.get(tableName) || null;
    }

    getService<T extends Service>(service: ServiceType): T | null {
        const serviceInstance = this.services.get(service);
        if (!serviceInstance) {
            elizaLogger.error(`Service ${service} not found`);
            return null;
        }
        return serviceInstance as T;
    }

    async registerService(service: Service): Promise<void> {
        const serviceType = service.serviceType;
        elizaLogger.log(`${this.character.name}(${this.agentId}) - Registering service:`, serviceType);

        if (this.services.has(serviceType)) {
            elizaLogger.warn(
                `${this.character.name}(${this.agentId}) - Service ${serviceType} is already registered. Skipping registration.`
            );
            return;
        }

        // Add the service to the services map
        this.services.set(serviceType, service);
        elizaLogger.success(`${this.character.name}(${this.agentId}) - Service ${serviceType} registered successfully`);
    }

    /**
     * Creates an instance of AgentRuntime.
     * @param opts - The options for configuring the AgentRuntime.
     * @param opts.conversationLength - The number of messages to hold in the recent message cache.
     * @param opts.token - The JWT token, can be a JWT token if outside worker, or an OpenAI token if inside worker.
     * @param opts.serverUrl - The URL of the worker.
     * @param opts.actions - Optional custom actions.
     * @param opts.evaluators - Optional custom evaluators.
     * @param opts.services - Optional custom services.
     * @param opts.memoryManagers - Optional custom memory managers.
     * @param opts.providers - Optional context providers.
     * @param opts.model - The model to use for generateText.
     * @param opts.embeddingModel - The model to use for embedding.
     * @param opts.agentId - Optional ID of the agent.
     * @param opts.databaseAdapter - The database adapter used for interacting with the database.
     * @param opts.fetch - Custom fetch function to use for making requests.
     */

    constructor(opts: {
        conversationLength?: number; // number of messages to hold in the recent message cache
        agentId?: UUID; // ID of the agent
        character?: Character; // The character to use for the agent
        token: string; // JWT token, can be a JWT token if outside worker, or an OpenAI token if inside worker
        serverUrl?: string; // The URL of the worker
        actions?: Action[]; // Optional custom actions
        evaluators?: Evaluator[]; // Optional custom evaluators
        plugins?: Plugin[];
        providers?: Provider[];
        modelProvider: ModelProviderName;

        services?: Service[]; // Map of service name to service instance
        managers?: IMemoryManager[]; // Map of table name to memory manager
        databaseAdapter?: IDatabaseAdapter; // The database adapter used for interacting with the database
        fetch?: typeof fetch | unknown;
        speechModelPath?: string;
        cacheManager?: ICacheManager;
        logging?: boolean;
        // verifiableInferenceAdapter?: IVerifiableInferenceAdapter;
    }) {
        // use the character id if it exists, otherwise use the agentId if it is passed in, otherwise use the character name
        this.agentId =
            opts.character?.id ??
            opts?.agentId ??
            stringToUuid(opts.character?.name ?? uuidv4());
        this.character = opts.character;

        if(!this.character) {
            throw new Error("Character input is required");
        }

        elizaLogger.info(`${this.character.name}(${this.agentId}) - Initializing AgentRuntime with options:`, {
            character: opts.character?.name,
            modelProvider: opts.modelProvider,
            characterModelProvider: opts.character?.modelProvider,
        });

        elizaLogger.debug(
            `[AgentRuntime] Process working directory: ${process.cwd()}`,
        );

        // Define the root path once
        this.knowledgeRoot = join(
            process.cwd(),
            "..",
            "characters",
            "knowledge",
        );

        elizaLogger.debug(
            `[AgentRuntime] Process knowledgeRoot: ${this.knowledgeRoot}`,
        );

        this.#conversationLength =
            opts.conversationLength ?? this.#conversationLength;

        this.databaseAdapter = opts.databaseAdapter;

        elizaLogger.success(`Agent ID: ${this.agentId}`);

        this.fetch = (opts.fetch as typeof fetch) ?? this.fetch;

        this.cacheManager = opts.cacheManager;

        this.messageManager = new MemoryManager({
            runtime: this,
            tableName: "messages",
        });

        this.descriptionManager = new MemoryManager({
            runtime: this,
            tableName: "descriptions",
        });

        this.loreManager = new MemoryManager({
            runtime: this,
            tableName: "lore",
        });

        this.documentsManager = new MemoryManager({
            runtime: this,
            tableName: "documents",
        });

        this.knowledgeManager = new MemoryManager({
            runtime: this,
            tableName: "fragments",
        });

        this.ragKnowledgeManager = new RAGKnowledgeManager({
            runtime: this,
            tableName: "knowledge",
            knowledgeRoot: this.knowledgeRoot,
        });

        (opts.managers ?? []).forEach((manager: IMemoryManager) => {
            this.registerMemoryManager(manager);
        });

        (opts.services ?? []).forEach((service: Service) => {
            this.registerService(service);
        });

        this.serverUrl = opts.serverUrl ?? this.serverUrl;

        elizaLogger.info(`${this.character.name}(${this.agentId}) - Setting Model Provider:`, {
            characterModelProvider: this.character.modelProvider,
            optsModelProvider: opts.modelProvider,
            currentModelProvider: this.modelProvider,
            finalSelection:
                this.character.modelProvider ??
                opts.modelProvider ??
                this.modelProvider,
        });

        this.modelProvider =
            this.character.modelProvider ??
            opts.modelProvider ??
            this.modelProvider;

        this.imageModelProvider =
            this.character.imageModelProvider ?? this.modelProvider;
        
        this.imageVisionModelProvider =
            this.character.imageVisionModelProvider ?? this.modelProvider;
            
        elizaLogger.info(
          `${this.character.name}(${this.agentId}) - Selected model provider:`,
          this.modelProvider
        );

        elizaLogger.info(
          `${this.character.name}(${this.agentId}) - Selected image model provider:`,
          this.imageModelProvider
        );

        elizaLogger.info(
            `${this.character.name}(${this.agentId}) - Selected image vision model provider:`,
            this.imageVisionModelProvider
        );

        // Validate model provider
        if (!Object.values(ModelProviderName).includes(this.modelProvider)) {
            elizaLogger.error("Invalid model provider:", this.modelProvider);
            elizaLogger.error(
                "Available providers:",
                Object.values(ModelProviderName),
            );
            throw new Error(`Invalid model provider: ${this.modelProvider}`);
        }

        if (!this.serverUrl) {
            elizaLogger.warn("No serverUrl provided, defaulting to localhost");
        }

        this.token = opts.token;

        this.plugins = [
            ...(opts.character?.plugins ?? []),
            ...(opts.plugins ?? []),
        ];

        this.plugins.forEach((plugin) => {
            plugin.actions?.forEach((action) => {
                this.registerAction(action);
            });

            plugin.evaluators?.forEach((evaluator) => {
                this.registerEvaluator(evaluator);
            });

            plugin.services?.forEach((service) => {
                this.registerService(service);
            });

            plugin.providers?.forEach((provider) => {
                this.registerContextProvider(provider);
            });

            plugin.adapters?.forEach((adapter) => {
                this.registerAdapter(adapter);
            });
        });

        (opts.actions ?? []).forEach((action) => {
            this.registerAction(action);
        });

        (opts.providers ?? []).forEach((provider) => {
            this.registerContextProvider(provider);
        });

        (opts.evaluators ?? []).forEach((evaluator: Evaluator) => {
            this.registerEvaluator(evaluator);
        });

        // this.verifiableInferenceAdapter = opts.verifiableInferenceAdapter;
    }

    private async initializeDatabase() {
        // By convention, we create a user and room using the agent id.
        // Memories related to it are considered global context for the agent.
        this.ensureRoomExists(this.agentId);
        this.ensureUserExists(
            this.agentId,
            this.character.username || this.character.name,
            this.character.name,
        ).then(() => {
            // postgres needs the user to exist before you can add a participant
            this.ensureParticipantExists(this.agentId, this.agentId);
        });
    }

    async initialize() {
        this.initializeDatabase();

        for (const [serviceType, service] of this.services.entries()) {
            try {
                await service.initialize(this);
                this.services.set(serviceType, service);
                elizaLogger.success(
                    `${this.character.name}(${this.agentId}) - Service ${serviceType} initialized successfully`
                );
            } catch (error) {
                elizaLogger.error(
                    `${this.character.name}(${this.agentId}) - Failed to initialize service ${serviceType}:`,
                    error
                );
                throw error;
            }
        }

        // should already be initiailized
        /*
        for (const plugin of this.plugins) {
            if (plugin.services)
                await Promise.all(
                    plugin.services?.map((service) => service.initialize(this)),
                );
        }
        */

        if (
            this.character &&
            this.character.knowledge &&
            this.character.knowledge.length > 0
        ) {
            elizaLogger.info(
                `[RAG Check] RAG Knowledge enabled: ${this.character.settings.ragKnowledge ? true : false}`,
            );
            elizaLogger.info(
                `[RAG Check] Knowledge items:`,
                this.character.knowledge,
            );

            if (this.character.settings.ragKnowledge) {
                // Type guards with logging for each knowledge type
                const [directoryKnowledge, pathKnowledge, stringKnowledge] =
                    this.character.knowledge.reduce(
                        (acc, item) => {
                            if (typeof item === "object") {
                                if (isDirectoryItem(item)) {
                                    elizaLogger.debug(
                                        `[RAG Filter] Found directory item: ${JSON.stringify(item)}`,
                                    );
                                    acc[0].push(item);
                                } else if ("path" in item) {
                                    elizaLogger.debug(
                                        `[RAG Filter] Found path item: ${JSON.stringify(item)}`,
                                    );
                                    acc[1].push(item);
                                }
                            } else if (typeof item === "string") {
                                elizaLogger.debug(
                                    `[RAG Filter] Found string item: ${item.slice(0, 100)}...`,
                                );
                                acc[2].push(item);
                            }
                            return acc;
                        },
                        [[], [], []] as [
                            Array<{ directory: string; shared?: boolean }>,
                            Array<{ path: string; shared?: boolean }>,
                            Array<string>,
                        ],
                    );

                elizaLogger.info(
                    `[RAG Summary] Found ${directoryKnowledge.length} directories, ${pathKnowledge.length} paths, and ${stringKnowledge.length} strings`,
                );

                // Process each type of knowledge
                if (directoryKnowledge.length > 0) {
                    elizaLogger.info(
                        `[RAG Process] Processing directory knowledge sources:`,
                    );
                    for (const dir of directoryKnowledge) {
                        elizaLogger.info(
                            `  - Directory: ${dir.directory} (shared: ${!!dir.shared})`,
                        );
                        await this.processCharacterRAGDirectory(dir);
                    }
                }

                if (pathKnowledge.length > 0) {
                    elizaLogger.info(
                        `[RAG Process] Processing individual file knowledge sources`,
                    );
                    await this.processCharacterRAGKnowledge(pathKnowledge);
                }

                if (stringKnowledge.length > 0) {
                    elizaLogger.info(
                        `[RAG Process] Processing direct string knowledge`,
                    );
                    await this.processCharacterRAGKnowledge(stringKnowledge);
                }
            } else {
                // Non-RAG mode: only process string knowledge
                const stringKnowledge = this.character.knowledge.filter(
                    (item): item is string => typeof item === "string",
                );
                await this.processCharacterKnowledge(stringKnowledge);
            }

            // After all new knowledge is processed, clean up any deleted files
            elizaLogger.info(
                `[RAG Cleanup] Starting cleanup of deleted knowledge files`,
            );
            await this.ragKnowledgeManager.cleanupDeletedKnowledgeFiles();
            elizaLogger.info(`[RAG Cleanup] Cleanup complete`);
        }
    }

    async stop() {
        elizaLogger.debug("runtime::stop - character", this.character.name);
        // stop services, they don't have a stop function
        // just initialize

        // plugins
        // have actions, providers, evaluators (no start/stop)
        // services (just initialized), clients

        // client have a start
        for (const c of this.clients) {
            elizaLogger.log(
                "runtime::stop - requesting",
                c,
                "client stop for",
                this.character.name,
            );
            c.stop(this);
        }
        // we don't need to unregister with directClient
        // don't need to worry about knowledge
    }

    /**
     * Processes character knowledge by creating document memories and fragment memories.
     * This function takes an array of knowledge items, creates a document memory for each item if it doesn't exist,
     * then chunks the content into fragments, embeds each fragment, and creates fragment memories.
     * @param knowledge An array of knowledge items containing id, path, and content.
     */
    private async processCharacterKnowledge(items: string[]) {
        for (const item of items) {
            const knowledgeId = stringToUuid(item);
            const existingDocument =
                await this.documentsManager.getMemoryById(knowledgeId);
            if (existingDocument) {
                continue;
            }

            elizaLogger.info(
                "Processing knowledge for ",
                this.character.name,
                " - ",
                item.slice(0, 100),
            );

            await knowledge.set(this, {
                id: knowledgeId,
                content: {
                    text: item,
                },
            });
        }
    }

    /**
     * Processes character knowledge by creating document memories and fragment memories.
     * This function takes an array of knowledge items, creates a document knowledge for each item if it doesn't exist,
     * then chunks the content into fragments, embeds each fragment, and creates fragment knowledge.
     * An array of knowledge items or objects containing id, path, and content.
     */
    private async processCharacterRAGKnowledge(
        items: (string | { path: string; shared?: boolean })[],
    ) {
        let hasError = false;

        for (const item of items) {
            if (!item) continue;

            try {
                // Check if item is marked as shared
                let isShared = false;
                let contentItem = item;

                // Only treat as shared if explicitly marked
                if (typeof item === "object" && "path" in item) {
                    isShared = item.shared === true;
                    contentItem = item.path;
                } else {
                    contentItem = item;
                }

                // const knowledgeId = stringToUuid(contentItem);
                const knowledgeId = this.ragKnowledgeManager.generateScopedId(
                    contentItem,
                    isShared,
                );
                const fileExtension = contentItem
                    .split(".")
                    .pop()
                    ?.toLowerCase();

                // Check if it's a file or direct knowledge
                if (
                    fileExtension &&
                    ["md", "txt", "pdf"].includes(fileExtension)
                ) {
                    try {
                        const filePath = join(this.knowledgeRoot, contentItem);
                        // Get existing knowledge first with more detailed logging
                        elizaLogger.debug("[RAG Query]", {
                            knowledgeId,
                            agentId: this.agentId,
                            relativePath: contentItem,
                            fullPath: filePath,
                            isShared,
                            knowledgeRoot: this.knowledgeRoot,
                        });

                        // Get existing knowledge first
                        const existingKnowledge =
                            await this.ragKnowledgeManager.getKnowledge({
                                id: knowledgeId,
                                agentId: this.agentId, // Keep agentId as it's used in OR query
                            });

                        elizaLogger.debug("[RAG Query Result]", {
                            relativePath: contentItem,
                            fullPath: filePath,
                            knowledgeId,
                            isShared,
                            exists: existingKnowledge.length > 0,
                            knowledgeCount: existingKnowledge.length,
                            firstResult: existingKnowledge[0]
                                ? {
                                      id: existingKnowledge[0].id,
                                      agentId: existingKnowledge[0].agentId,
                                      contentLength:
                                          existingKnowledge[0].content.text
                                              .length,
                                  }
                                : null,
                            results: existingKnowledge.map((k) => ({
                                id: k.id,
                                agentId: k.agentId,
                                isBaseKnowledge: !k.id.includes("chunk"),
                            })),
                        });

                        // Read file content
                        const content: string = await readFile(
                            filePath,
                            "utf8",
                        );
                        if (!content) {
                            hasError = true;
                            continue;
                        }

                        if (existingKnowledge.length > 0) {
                            const existingContent =
                                existingKnowledge[0].content.text;

                            elizaLogger.debug("[RAG Compare]", {
                                path: contentItem,
                                knowledgeId,
                                isShared,
                                existingContentLength: existingContent.length,
                                newContentLength: content.length,
                                contentSample: content.slice(0, 100),
                                existingContentSample: existingContent.slice(
                                    0,
                                    100,
                                ),
                                matches: existingContent === content,
                            });

                            if (existingContent === content) {
                                elizaLogger.info(
                                    `${isShared ? "Shared knowledge" : "Knowledge"} ${contentItem} unchanged, skipping`,
                                );
                                continue;
                            }

                            // Content changed, remove old knowledge before adding new
                            elizaLogger.info(
                                `${isShared ? "Shared knowledge" : "Knowledge"} ${contentItem} changed, updating...`,
                            );
                            await this.ragKnowledgeManager.removeKnowledge(
                                knowledgeId,
                            );
                            await this.ragKnowledgeManager.removeKnowledge(
                                `${knowledgeId}-chunk-*` as UUID,
                            );
                        }

                        elizaLogger.info(
                            `Processing ${fileExtension.toUpperCase()} file content for`,
                            this.character.name,
                            "-",
                            contentItem,
                        );

                        await this.ragKnowledgeManager.processFile({
                            path: contentItem,
                            content: content,
                            type: fileExtension as "pdf" | "md" | "txt",
                            isShared: isShared,
                        });
                    } catch (error: any) {
                        hasError = true;
                        elizaLogger.error(
                            `Failed to read knowledge file ${contentItem}. Error details:`,
                            error?.message || error || "Unknown error",
                        );
                        continue;
                    }
                } else {
                    // Handle direct knowledge string
                    elizaLogger.info(
                        "Processing direct knowledge for",
                        this.character.name,
                        "-",
                        contentItem.slice(0, 100),
                    );

                    const existingKnowledge =
                        await this.ragKnowledgeManager.getKnowledge({
                            id: knowledgeId,
                            agentId: this.agentId,
                        });

                    if (existingKnowledge.length > 0) {
                        elizaLogger.info(
                            `Direct knowledge ${knowledgeId} already exists, skipping`,
                        );
                        continue;
                    }

                    await this.ragKnowledgeManager.createKnowledge({
                        id: knowledgeId,
                        agentId: this.agentId,
                        content: {
                            text: contentItem,
                            metadata: {
                                type: "direct",
                            },
                        },
                    });
                }
            } catch (error: any) {
                hasError = true;
                elizaLogger.error(
                    `Error processing knowledge item ${item}:`,
                    error?.message || error || "Unknown error",
                );
                continue;
            }
        }

        if (hasError) {
            elizaLogger.warn(
                "Some knowledge items failed to process, but continuing with available knowledge",
            );
        }
    }

    /**
     * Processes directory-based RAG knowledge by recursively loading and processing files.
     * @param dirConfig The directory configuration containing path and shared flag
     */
    private async processCharacterRAGDirectory(dirConfig: {
        directory: string;
        shared?: boolean;
    }) {
        if (!dirConfig.directory) {
            elizaLogger.error("[RAG Directory] No directory specified");
            return;
        }

        // Sanitize directory path to prevent traversal attacks
        const sanitizedDir = dirConfig.directory.replace(/\.\./g, "");
        const dirPath = join(this.knowledgeRoot, sanitizedDir);

        try {
            // Check if directory exists
            const dirExists = existsSync(dirPath);
            if (!dirExists) {
                elizaLogger.error(
                    `[RAG Directory] Directory does not exist: ${sanitizedDir}`,
                );
                return;
            }

            elizaLogger.debug(`[RAG Directory] Searching in: ${dirPath}`);
            // Use glob to find all matching files in directory
            const files = await glob("**/*.{md,txt,pdf}", {
                cwd: dirPath,
                nodir: true,
                absolute: false,
            });

            if (files.length === 0) {
                elizaLogger.warn(
                    `No matching files found in directory: ${dirConfig.directory}`,
                );
                return;
            }

            elizaLogger.info(
                `[RAG Directory] Found ${files.length} files in ${dirConfig.directory}`,
            );

            // Process files in batches to avoid memory issues
            const BATCH_SIZE = 5;
            for (let i = 0; i < files.length; i += BATCH_SIZE) {
                const batch = files.slice(i, i + BATCH_SIZE);

                await Promise.all(
                    batch.map(async (file) => {
                        try {
                            const relativePath = join(sanitizedDir, file);

                            elizaLogger.debug(
                                `[RAG Directory] Processing file ${i + 1}/${files.length}:`,
                                {
                                    file,
                                    relativePath,
                                    shared: dirConfig.shared,
                                },
                            );

                            await this.processCharacterRAGKnowledge([
                                {
                                    path: relativePath,
                                    shared: dirConfig.shared,
                                },
                            ]);
                        } catch (error) {
                            elizaLogger.error(
                                `[RAG Directory] Failed to process file: ${file}`,
                                error instanceof Error
                                    ? {
                                          name: error.name,
                                          message: error.message,
                                          stack: error.stack,
                                      }
                                    : error,
                            );
                        }
                    }),
                );

                elizaLogger.debug(
                    `[RAG Directory] Completed batch ${Math.min(i + BATCH_SIZE, files.length)}/${files.length} files`,
                );
            }

            elizaLogger.success(
                `[RAG Directory] Successfully processed directory: ${sanitizedDir}`,
            );
        } catch (error) {
            elizaLogger.error(
                `[RAG Directory] Failed to process directory: ${sanitizedDir}`,
                error instanceof Error
                    ? {
                          name: error.name,
                          message: error.message,
                          stack: error.stack,
                      }
                    : error,
            );
            throw error; // Re-throw to let caller handle it
        }
    }

    getSetting(key: string) {
        // check if the key is in the character.settings.secrets object
        if (this.character.settings?.secrets?.[key]) {
            return this.character.settings.secrets[key];
        }
        // if not, check if it's in the settings object
        if (this.character.settings?
