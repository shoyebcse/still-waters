"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, BarChart2, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/history", label: "History", icon: Clock },
  { href: "/analysis", label: "Analysis", icon: BarChart2 },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          );
        })}
        <button
          onClick={async () => {
            await signOut({ redirect: false });
            window.location.href = "/login";
          }}
          className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut size={20} strokeWidth={1.8} />
          <span className="text-[11px] font-medium">Sign out</span>
        </button>
      </div>
    </nav>
  );
}
