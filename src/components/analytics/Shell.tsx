import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <header className="h-16 border-b border-border bg-card/60 backdrop-blur sticky top-0 z-10 flex items-center px-6 lg:px-8">
          <div>
            <h1 className="text-base font-semibold text-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-xs text-muted-foreground hidden md:block">Last 30 days</div>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">A</div>
          </div>
        </header>
        <div className="p-6 lg:p-8 space-y-6">{children}</div>
      </main>
    </div>
  );
}
