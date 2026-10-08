"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Workflow,
  History,
  Puzzle,
  Settings,
  LogOut,
  ChevronLeft,
  User,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/history", label: "Execution History", icon: History },
  { href: "/integrations", label: "Integrations", icon: Puzzle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside
      className={cn(
        "h-screen flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand header */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Workflow className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-white truncate">
              FlowForge
            </span>
          )}
        </Link>
        <button
          onClick={onToggle}
          className="flex-shrink-0 p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600/10 text-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-800 p-3">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed ? "justify-center" : ""
          )}
        >
          <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-slate-300" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name || "Admin"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {session?.user?.email}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
