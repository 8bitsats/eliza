import { useState, useEffect } from "react";
import { useOrdinalsContext } from "./OrdinalsContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ChatView } from "./ChatView";
import { InscriptionsView } from "./InscriptionsView";
import { RareSatoshisView } from "./RareSatoshisView";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

export function OrdinalsInterface() {
  const {
    connectionStatus,
    connectToOrdinals,
    disconnectFromOrdinals,
    loading
  } = useOrdinalsContext();

  const [activeTab, setActiveTab] = useState("chat");

  // Auto-connect to Ordinals when component mounts
  useEffect(() => {
    // Uncomment the line below if you want to auto-connect
    // if (connectionStatus === 'disconnected') connectToOrdinals();
  }, [connectionStatus]);

  return (
    <div className="w-full h-full flex flex-col rounded-lg border border-border bg-card shadow-md overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-xl font-semibold">Ord GPT</h2>
        <div>
          {connectionStatus === "connected" ? (
            <Button variant="outline" onClick={disconnectFromOrdinals}>
              Disconnect
            </Button>
          ) : (
            <Button
              onClick={() => connectToOrdinals()}
              disabled={loading || connectionStatus === "connecting"}
            >
              {loading || connectionStatus === "connecting" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect to Ord GPT"
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="inscriptions">Inscriptions</TabsTrigger>
              <TabsTrigger value="rare-satoshis">Rare Satoshis</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-hidden p-4">
          {activeTab === "chat" && <ChatView />}
          {activeTab === "inscriptions" && <InscriptionsView />}
          {activeTab === "rare-satoshis" && <RareSatoshisView />}
        </div>
      </div>

      <div className="p-2 text-xs text-muted-foreground bg-muted border-t border-border">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connectionStatus === "connected" ? "bg-green-500" : connectionStatus === "connecting" ? "bg-yellow-500" : "bg-red-500"}`}></div>
          <span>
            {connectionStatus === "connected"
              ? "Connected to Ord GPT"
              : connectionStatus === "connecting"
              ? "Connecting..."
              : connectionStatus === "error"
              ? "Connection Error"
              : "Disconnected"}
          </span>
        </div>
      </div>
    </div>
  );
}
