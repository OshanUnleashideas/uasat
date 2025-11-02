"use client"

import type React from "react"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="border-b border-border bg-card print:hidden">
            <div className="flex h-14 items-center gap-4 px-6">
              <SidebarTrigger />
            </div>
          </div>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
