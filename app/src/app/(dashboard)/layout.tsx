"use client";

import { Suspense, useState } from "react";
import { DEMO_MODE } from "@/lib/demo/config";
import { DemoWorkspace } from "@/components/demo/DemoWorkspace";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu, Sparkles } from "lucide-react";
import { AiGenerateDialog } from "@/components/ai/AiGenerateDialog";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/workflows": "Workflows",
  "/history": "Execution History",
  "/integrations": "Integrations",
  "/settings": "Settings",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const pathname = usePathname();

  const pageTitle =
    Object.entries(pageTitles).find(([path]) =>
      pathname.startsWith(path)
    )?.[1] || "FlowForge";

  if (DEMO_MODE) return <Suspense fallback={<div className="p-8 text-sm">Preparing demo…</div>}><DemoWorkspace /></Suspense>;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between h-14 px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              {pageTitle}
            </h1>
          </div>

          <Button size="sm" className="gap-2" onClick={() => setAiDialogOpen(true)}>
            <Sparkles className="w-4 h-4" />
            AI Generate
          </Button>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>

      <AiGenerateDialog open={aiDialogOpen} onOpenChange={setAiDialogOpen} />
    </div>
  );
}
