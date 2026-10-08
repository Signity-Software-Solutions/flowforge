"use client";

import { useState } from "react";
import {
  Settings2,
  Users,
  Key,
  Link2,
  Brain,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
  Crown,
  Pencil,
  Eye,
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Mock data
const mockTeamMembers = [
  { id: "1", name: "Amit Dua", email: "amit@example.com", role: "OWNER", initials: "AD" },
  { id: "2", name: "Sarah Chen", email: "sarah@example.com", role: "ADMIN", initials: "SC" },
  { id: "3", name: "Dev Patel", email: "dev@example.com", role: "EDITOR", initials: "DP" },
  { id: "4", name: "Maya Johnson", email: "maya@example.com", role: "VIEWER", initials: "MJ" },
];

const mockApiKeys = [
  {
    id: "1",
    name: "Production Key",
    keyPrefix: "ff_prod_",
    scopes: ["read", "write", "execute"],
    createdAt: "2024-09-15T10:00:00Z",
    lastUsedAt: "2024-10-07T14:30:00Z",
  },
  {
    id: "2",
    name: "Development Key",
    keyPrefix: "ff_dev_",
    scopes: ["read", "write"],
    createdAt: "2024-10-01T08:00:00Z",
    lastUsedAt: null,
  },
];

const roleIcon: Record<string, typeof Crown> = {
  OWNER: Crown,
  ADMIN: Shield,
  EDITOR: Pencil,
  VIEWER: Eye,
};

const roleColor: Record<string, string> = {
  OWNER: "text-amber-600 bg-amber-50",
  ADMIN: "text-blue-600 bg-blue-50",
  EDITOR: "text-violet-600 bg-violet-50",
  VIEWER: "text-slate-600 bg-slate-50",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general" className="gap-2">
            <Settings2 className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="apikeys" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="n8n" className="gap-2">
            <Link2 className="h-4 w-4" />
            n8n Connection
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Brain className="h-4 w-4" />
            AI Model
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>
        <TabsContent value="team">
          <TeamSettings />
        </TabsContent>
        <TabsContent value="apikeys">
          <ApiKeySettings />
        </TabsContent>
        <TabsContent value="n8n">
          <N8nSettings />
        </TabsContent>
        <TabsContent value="ai">
          <AiModelSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- General Settings ---
function GeneralSettings() {
  const [name, setName] = useState("FlowForge Workspace");
  const [description, setDescription] = useState(
    "AI-powered workflow automation platform for our team."
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace Settings</CardTitle>
        <CardDescription>
          Manage your workspace name and details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Workspace Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Workspace"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your workspace..."
            rows={3}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          {saved && (
            <span className="text-sm text-emerald-600">
              Settings updated successfully
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Team Settings ---
function TeamSettings() {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("EDITOR");

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {mockTeamMembers.length} members in your workspace
            </CardDescription>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setShowInvite(true)}>
            <Plus className="h-4 w-4" />
            Invite Member
          </Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {mockTeamMembers.map((member) => {
              const RoleIcon = roleIcon[member.role] || Eye;
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "gap-1 text-xs",
                      roleColor[member.role]
                    )}
                    variant="outline"
                  >
                    <RoleIcon className="h-3 w-3" />
                    {member.role}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                type="email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <option value="ADMIN">Admin</option>
                <option value="EDITOR">Editor</option>
                <option value="VIEWER">Viewer</option>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowInvite(false);
                setInviteEmail("");
              }}
              disabled={!inviteEmail.trim()}
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- API Key Settings ---
function ApiKeySettings() {
  const [keys, setKeys] = useState(mockApiKeys);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = () => {
    const key = `ff_live_${Math.random().toString(36).slice(2, 18)}`;
    setGeneratedKey(key);
    setKeys([
      ...keys,
      {
        id: String(keys.length + 1),
        name: newKeyName || "Untitled Key",
        keyPrefix: key.slice(0, 8) + "_",
        scopes: ["read", "write", "execute"],
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
      },
    ]);
    setNewKeyName("");
  };

  const handleDelete = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Manage API keys for external integrations.
            </CardDescription>
          </div>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => {
              setShowCreate(true);
              setGeneratedKey(null);
            }}
          >
            <Plus className="h-4 w-4" />
            Create Key
          </Button>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No API keys yet. Create one to get started.
            </div>
          ) : (
            <div className="divide-y">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <Key className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{key.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="text-xs text-muted-foreground font-mono">
                          {key.keyPrefix}••••••••
                        </code>
                        <span className="text-xs text-muted-foreground">
                          {key.lastUsedAt
                            ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                            : "Never used"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {key.scopes.map((scope) => (
                        <Badge
                          key={scope}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {scope}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(key.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={showCreate}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreate(false);
            setGeneratedKey(null);
            setNewKeyName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {generatedKey ? "API Key Created" : "Create API Key"}
            </DialogTitle>
            <DialogDescription>
              {generatedKey
                ? "Copy your key now. It will not be shown again."
                : "Create a new API key for external integrations."}
            </DialogDescription>
          </DialogHeader>
          {generatedKey ? (
            <div className="space-y-3 py-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md font-mono text-sm break-all">
                {generatedKey}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => handleCopy(generatedKey)}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-amber-600">
                Store this key securely. You will not be able to view it again.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Key Name</label>
                <Input
                  placeholder="e.g. Production, CI/CD, Development"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {generatedKey ? (
              <Button onClick={() => setShowCreate(false)}>Done</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!newKeyName.trim()}
                >
                  Generate Key
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- n8n Connection Settings ---
function N8nSettings() {
  const [n8nUrl, setN8nUrl] = useState("http://localhost:5678");
  const [n8nApiKey, setN8nApiKey] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");

  const handleTestConnection = async () => {
    setConnectionStatus("testing");
    // Simulate test
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setConnectionStatus(n8nUrl.includes("localhost") ? "success" : "error");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>n8n Connection</CardTitle>
        <CardDescription>
          Connect to your n8n instance for workflow execution.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">n8n Instance URL</label>
          <Input
            value={n8nUrl}
            onChange={(e) => {
              setN8nUrl(e.target.value);
              setConnectionStatus("idle");
            }}
            placeholder="https://your-n8n-instance.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">API Key</label>
          <Input
            value={n8nApiKey}
            onChange={(e) => {
              setN8nApiKey(e.target.value);
              setConnectionStatus("idle");
            }}
            placeholder="Enter your n8n API key"
            type="password"
          />
        </div>

        <Separator />

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={connectionStatus === "testing" || !n8nUrl}
          >
            {connectionStatus === "testing" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>

          {connectionStatus === "success" && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Connection successful
            </div>
          )}
          {connectionStatus === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <XCircle className="h-4 w-4" />
              Connection failed
            </div>
          )}
        </div>

        <Button disabled={connectionStatus !== "success"}>
          Save Connection
        </Button>
      </CardContent>
    </Card>
  );
}

// --- AI Model Settings ---
function AiModelSettings() {
  const [selectedModel, setSelectedModel] = useState("sonnet");
  const [saved, setSaved] = useState(false);

  const models = [
    {
      value: "sonnet",
      label: "Claude Sonnet",
      description: "Best balance of speed and quality. Recommended for most workflows.",
      cost: "$3 / 1M input tokens",
    },
    {
      value: "haiku",
      label: "Claude Haiku",
      description: "Fastest and most affordable. Great for simple transformations.",
      cost: "$0.25 / 1M input tokens",
    },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Model Selection</CardTitle>
          <CardDescription>
            Choose the Claude model used for workflow generation and AI features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {models.map((model) => (
            <button
              key={model.value}
              type="button"
              onClick={() => setSelectedModel(model.value)}
              className={cn(
                "w-full flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-colors",
                selectedModel === model.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0",
                  selectedModel === model.value
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                )}
              >
                {selectedModel === model.value && (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{model.label}</p>
                  <span className="text-xs text-muted-foreground">
                    {model.cost}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {model.description}
                </p>
              </div>
            </button>
          ))}

          <Button onClick={handleSave}>
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </>
            ) : (
              "Save Model Selection"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>
            AI token usage for the current billing period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">145.2K</p>
              <p className="text-xs text-muted-foreground mt-1">
                Input Tokens
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">52.8K</p>
              <p className="text-xs text-muted-foreground mt-1">
                Output Tokens
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">$1.24</p>
              <p className="text-xs text-muted-foreground mt-1">
                Estimated Cost
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Token usage</span>
              <span>198K / 1M</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: "19.8%" }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
