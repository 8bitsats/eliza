// @ts-nocheck
/* Temporarily disable type checking for this file to address router component compatibility issues */

import { useParams } from "react-router-dom";
import Chat from "@/components/chat";
import type { UUID } from "@elizaos/core";

export default function AgentRoute() {
    const { agentId } = useParams<{ agentId: UUID }>();

    if (!agentId) return <div>No data.</div>;

    return <Chat agentId={agentId} />;
}
