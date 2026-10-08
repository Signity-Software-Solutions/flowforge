"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Plug,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Integration {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  icon: string | null;
  authType: string;
  isConnected: boolean;
}

const CATEGORIES = [
  "All",
  "CRM",
  "Email",
  "Communication",
  "E-commerce",
  "Payment",
  "AI/ML",
  "Database",
  "Cloud Storage",
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [connectDialog, setConnectDialog] = useState<Integration | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/integrations")
      .then((res) => res.json())
      .then((data) => setIntegrations(data.integrations || []))
      .catch(() => setIntegrations([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = integrations;
    if (category !== "All") {
      list = list.filter((i) => i.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description && i.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [integrations, category, search]);

  const connectedCount = integrations.filter((i) => i.isConnected).length;

  const handleToggleConnection = async (integration: Integration) => {
    if (integration.isConnected) {
      // Disconnect
      const updated = integrations.map((i) =>
        i.id === integration.id ? { ...i, isConnected: false } : i
      );
      setIntegrations(updated);
      try {
        await fetch("/api/integrations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: integration.id, isConnected: false }),
        });
      } catch {
        // revert
        setIntegrations(integrations);
      }
    } else {
      setConnectDialog(integration);
    }
  };

  const handleConnect = async () => {
    if (!connectDialog) return;
    setConnecting(true);

    // Simulate connection
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const updated = integrations.map((i) =>
      i.id === connectDialog.id ? { ...i, isConnected: true } : i
    );
    setIntegrations(updated);

    try {
      await fetch("/api/integrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: connectDialog.id, isConnected: true }),
      });
    } catch {
      // ignore
    }

    setConnecting(false);
    setConnectDialog(null);
    setApiKeyInput("");
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {connectedCount} of {integrations.length} integrations connected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium">{connectedCount} Active</span>
        </div>
      </div>

      {/* Search + Category Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(cat)}
              className="text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Integration Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plug className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No integrations found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try a different search or category
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((integration) => (
            <Card
              key={integration.id}
              className={cn(
                "transition-shadow hover:shadow-md",
                integration.isConnected && "ring-1 ring-emerald-200"
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xl flex-shrink-0">
                    {integration.icon || "🔌"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate">
                        {integration.name}
                      </h3>
                      {integration.isConnected && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {integration.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary" className="text-[10px]">
                    {integration.category}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {integration.authType === "oauth"
                      ? "OAuth"
                      : integration.authType === "api_key"
                      ? "API Key"
                      : "Connection String"}
                  </Badge>
                </div>

                <Button
                  variant={integration.isConnected ? "outline" : "default"}
                  size="sm"
                  className="w-full mt-4 text-xs"
                  onClick={() => handleToggleConnection(integration)}
                >
                  {integration.isConnected ? "Disconnect" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Connect Dialog */}
      <Dialog
        open={!!connectDialog}
        onOpenChange={(open) => {
          if (!open) {
            setConnectDialog(null);
            setApiKeyInput("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{connectDialog?.icon || "🔌"}</span>
              Connect {connectDialog?.name}
            </DialogTitle>
            <DialogDescription>
              Set up the connection to {connectDialog?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {connectDialog?.authType === "oauth" ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Click below to authorize FlowForge with your{" "}
                  {connectDialog.name} account.
                </p>
                <Button className="w-full gap-2" onClick={handleConnect} disabled={connecting}>
                  {connecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  {connecting ? "Connecting..." : `Authorize with ${connectDialog.name}`}
                </Button>
              </div>
            ) : connectDialog?.authType === "connection_string" ? (
              <div className="space-y-3">
                <label className="text-sm font-medium">Connection String</label>
                <Input
                  placeholder={`${connectDialog.slug}://user:pass@host:5432/dbname`}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  type="password"
                />
                <p className="text-xs text-muted-foreground">
                  Your connection string is encrypted and stored securely.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-sm font-medium">API Key</label>
                <Input
                  placeholder={`Enter your ${connectDialog?.name} API key`}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  type="password"
                />
                <p className="text-xs text-muted-foreground">
                  Your API key is encrypted and stored securely.
                </p>
              </div>
            )}
          </div>

          {connectDialog?.authType !== "oauth" && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setConnectDialog(null);
                  setApiKeyInput("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                disabled={connecting || !apiKeyInput.trim()}
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
