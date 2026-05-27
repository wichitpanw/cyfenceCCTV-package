"use client";

import {
  Bell,
  Zap,
  Calendar,
  BarChart3,
  PieChart,
  Clock,
  FileText,
  HelpCircle,
  Keyboard,
  LayoutDashboard,
  FolderKanban,
  LogOut,
  MessageSquare,
  Palette,
  Settings,
  CheckSquare,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const workspaceItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: FolderKanban, label: "Projects" },
  { icon: CheckSquare, label: "Tasks" },
  { icon: Calendar, label: "Calendar" },
  { icon: Users, label: "Team members" },
  { icon: MessageSquare, label: "Messages" },
  { icon: FileText, label: "Documents" },
  { icon: Bell, label: "Notifications" },
  { icon: Clock, label: "Time tracking" },
  { icon: Target, label: "Goals" },
];

const analyticsItems = [
  { icon: BarChart3, label: "Overview" },
  { icon: TrendingUp, label: "Performance" },
  { icon: PieChart, label: "Reports" },
  { icon: Zap, label: "Insights" },
];

const settingsItems = [
  { icon: Settings, label: "Preferences" },
  { icon: Palette, label: "Appearance" },
  { icon: Keyboard, label: "Keyboard shortcuts" },
  { icon: HelpCircle, label: "Help & support" },
  { icon: LogOut, label: "Sign out" },
];

interface CommandMenu01Props {
  onSelectAction?: (action: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CommandMenu01({ onSelectAction, open, setOpen }: CommandMenu01Props) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  return (
    <CommandDialog onOpenChange={setOpen} open={open}>
      <CommandInput
        className="h-12"
        placeholder="พิมพ์คำสั่งหรือค้นหา..."
      />
      <CommandList className="h-[320px] max-h-[320px]">
        <CommandEmpty>ไม่พบผลลัพธ์</CommandEmpty>
        <CommandGroup heading="ระบบงาน (Workspace)">
          {workspaceItems.map((item) => (
            <CommandItem 
              key={item.label}
              onSelect={() => {
                onSelectAction?.(item.label);
                setOpen(false);
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="สถิติและการวิเคราะห์">
          {analyticsItems.map((item) => (
            <CommandItem 
              key={item.label}
              onSelect={() => {
                onSelectAction?.(item.label);
                setOpen(false);
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="การตั้งค่า">
          {settingsItems.map((item) => (
            <CommandItem 
              key={item.label}
              onSelect={() => {
                onSelectAction?.(item.label);
                setOpen(false);
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      <div className="flex h-12 items-center justify-end border-t px-3">
        <button
          className="flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground"
          onClick={() => setOpen(false)}
          type="button"
        >
          <span>ปิด</span>
          <kbd className="ml-1 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground opacity-100">
            Esc
          </kbd>
        </button>
      </div>
    </CommandDialog>
  );
}
