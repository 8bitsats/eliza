import { useEffect, useState } from "react";
import { useOrdinalsContext } from "./OrdinalsContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Loader2, ChevronLeft, ChevronRight, Image, FileText, FileCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export function InscriptionsView() {
  const {
    fetchInscriptions,
    inscriptions,
    pagination,
    loading,
    connectionStatus,
    fetchInscriptionContent
  } = useOrdinalsContext();

  const [selectedInscription, setSelectedInscription] = useState<any>(null);
  const [inscriptionContent, setInscriptionContent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (connectionStatus === "connected") {
      loadInscriptions();
    }
  }, [connectionStatus]);

  const loadInscriptions = async () => {
    if (connectionStatus === "connected") {
      try {
        await fetchInscriptions();
      } catch (error) {
        console.error("Error loading inscriptions:", error);
      }
    }
  };

  const handlePageChange = (direction: "prev" | "next") => {
    const newOffset =
      direction === "next"
        ? pagination.offset + pagination.limit
        : Math.max(0, pagination.offset - pagination.limit);

    fetchInscriptions({ offset: newOffset });
  };

  const handleInscriptionClick = async (inscription: any) => {
    setSelectedInscription(inscription);
    setInscriptionContent(null);
    setIsDialogOpen(true);

    try {
      const content = await fetchInscriptionContent(inscription.id);
      setInscriptionContent(content);
    } catch (error) {
      console.error("Error fetching inscription content:", error);
    }
  };

  const getContentPreview = () => {
    if (!inscriptionContent) return null;

    const { content, contentType } = inscriptionContent;

    if (contentType.includes('image')) {
      return <img src={content} alt="Inscription content" className="max-w-full max-h-[400px] object-contain" />;
    } else if (contentType.includes('text') || contentType.includes('json')) {
      return (
        <div className="bg-muted p-4 rounded-md overflow-auto max-h-[400px]">
          <pre className="text-xs">{content}</pre>
        </div>
      );
    } else {
      return <div className="text-center p-4">Content type not supported for preview</div>;
    }
  };

  const getInscriptionTypeIcon = (contentType: string) => {
    if (!contentType) return <FileText className="h-4 w-4" />;
    
    if (contentType.includes('image')) {
      return <Image className="h-4 w-4" />;
    } else if (contentType.includes('text/html') || contentType.includes('application/json')) {
      return <FileCode className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  if (connectionStatus !== "connected") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>Connect to Ord GPT to browse inscriptions</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Recent Inscriptions</h3>
        <Button onClick={loadInscriptions} variant="outline" size="sm" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {inscriptions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>No inscriptions found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto flex-1">
              {inscriptions.map((inscription) => (
                <Card 
                  key={inscription.id} 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleInscriptionClick(inscription)}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {getInscriptionTypeIcon(inscription.content_type)}
                      <span className="truncate">
                        {inscription.content_type || "Unknown"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>ID: <span className="font-mono">{inscription.id.substring(0, 16)}...</span></div>
                      <div>Number: {inscription.number.toLocaleString()}</div>
                      <div>Created: {new Date(inscription.timestamp * 1000).toLocaleDateString()}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing {pagination.offset + 1} to {Math.min(pagination.offset + inscriptions.length, pagination.total)} of {pagination.total.toLocaleString()}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange("prev")}
                disabled={pagination.offset === 0 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange("next")}
                disabled={pagination.offset + pagination.limit >= pagination.total || loading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inscription #{selectedInscription?.number}</DialogTitle>
          </DialogHeader>
          
          {selectedInscription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">ID:</span> <span className="font-mono break-all">{selectedInscription.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span> {selectedInscription.content_type || "Unknown"}
                </div>
                <div>
                  <span className="text-muted-foreground">Content Length:</span> {selectedInscription.content_length || "Unknown"}
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span> {new Date(selectedInscription.timestamp * 1000).toLocaleString()}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium mb-2">Content Preview</h4>
                {inscriptionContent ? (
                  getContentPreview()
                ) : (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
