import { useState } from "react";
import { useOrdinalsContext } from "@/components/ordinals/OrdinalsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function RareSatoshisView() {
  const { findRareSatoshis, rareSatoshis, loading, connectionStatus } = useOrdinalsContext();
  const [selectedRarity, setSelectedRarity] = useState("uncommon,rare,epic,legendary,mythic");
  const [limit, setLimit] = useState(10);

  const handleSearch = async () => {
    if (connectionStatus === "connected") {
      try {
        await findRareSatoshis(selectedRarity.split(","), limit);
      } catch (error) {
        console.error("Error searching rare satoshis:", error);
      }
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "text-gray-400";
      case "uncommon":
        return "text-green-400";
      case "rare":
        return "text-blue-400";
      case "epic":
        return "text-purple-400";
      case "legendary":
        return "text-orange-400";
      case "mythic":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  if (connectionStatus !== "connected") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>Connect to Ord GPT to search for rare satoshis</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Rare Satoshi Hunter</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="rarity">Rarity Level</Label>
            <Select value={selectedRarity} onValueChange={setSelectedRarity}>
              <SelectTrigger id="rarity">
                <SelectValue placeholder="Select rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uncommon,rare,epic,legendary,mythic">All Rare Types</SelectItem>
                <SelectItem value="uncommon">Uncommon</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
                <SelectItem value="mythic">Mythic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="limit">Result Limit</Label>
            <Select value={limit.toString()} onValueChange={(value: string) => setLimit(parseInt(value))}>
              <SelectTrigger id="limit">
                <SelectValue placeholder="Number of results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 results</SelectItem>
                <SelectItem value="10">10 results</SelectItem>
                <SelectItem value="20">20 results</SelectItem>
                <SelectItem value="50">50 results</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Search for Rare Satoshis
        </Button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {rareSatoshis.length === 0 ? (
            <div className="text-center text-muted-foreground p-6">
              <p>No rare satoshis found. Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rareSatoshis.map((satoshi, index) => (
                <Card key={index}>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <span className={`font-medium ${getRarityColor(satoshi.rarity)}`}>
                        {satoshi.rarity.charAt(0).toUpperCase() + satoshi.rarity.slice(1)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-xs space-y-1">
                      <div>
                        <span className="text-muted-foreground">Ordinal:</span>{" "}
                        <span className="font-mono">{satoshi.ordinal}</span>
                      </div>
                      {satoshi.name && (
                        <div>
                          <span className="text-muted-foreground">Name:</span>{" "}
                          {satoshi.name}
                        </div>
                      )}
                      {satoshi.block_height && (
                        <div>
                          <span className="text-muted-foreground">Block Height:</span>{" "}
                          {satoshi.block_height.toLocaleString()}
                        </div>
                      )}
                      {satoshi.cycle && (
                        <div>
                          <span className="text-muted-foreground">Cycle:</span>{" "}
                          {satoshi.cycle}
                        </div>
                      )}
                      {satoshi.epoch && (
                        <div>
                          <span className="text-muted-foreground">Epoch:</span>{" "}
                          {satoshi.epoch}
                        </div>
                      )}
                      {satoshi.period && (
                        <div>
                          <span className="text-muted-foreground">Period:</span>{" "}
                          {satoshi.period}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
