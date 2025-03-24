// @ts-ignore
import { ACTIONS, SolanaAgentKit, startMcpServer } from "solana-agent-kit";
// Load environment variables
// @ts-ignore
const env = process.env;
// Create agent with environment variables
const agent = new SolanaAgentKit(env.SOLANA_PRIVATE_KEY, env.RPC_URL, {
    OPENAI_API_KEY: env.OPENAI_API_KEY || "",
});
// Add your required actions here
const mcp_actions = {
    GET_ASSET: ACTIONS.GET_ASSET_ACTION,
    DEPLOY_TOKEN: ACTIONS.DEPLOY_TOKEN_ACTION,
};
startMcpServer(mcp_actions, agent, { name: "solana-agent", version: "0.0.1" });
