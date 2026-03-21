"use client";

import { useAuth } from "@/components/auth-provider";
import {
  LayoutDashboard,
  Wrench,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function AppNav() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const navItems = [
    {
      name: "Dashboard",
      link: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      name: "Tools",
      link: "/dashboard#tools",
      icon: <Wrench className="h-4 w-4" />,
    },
    {
      name: "Recommendations",
      link: "/recommendations",
      icon: <Sparkles className="h-4 w-4" />,
    },
  ];

  return (
    <div className="fixed inset-x-0 top-4 z-50 mx-auto flex max-w-fit items-center gap-1 rounded-full border border-white/[0.08] bg-charcoal/80 px-2 py-2 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-1">
        <span className="px-3 font-display text-xs font-bold tracking-wider text-amber">
          R→R
        </span>
        <div className="h-4 w-px bg-white/10" />
      </div>
      {navItems.map((item) => (
        <a
          key={item.name}
          href={item.link}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted transition-colors hover:bg-white/[0.04] hover:text-cream"
        >
          {item.icon}
          <span>{item.name}</span>
        </a>
      ))}
      {user && (
        <>
          <div className="h-4 w-px bg-white/10" />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted transition-colors hover:bg-white/[0.04] hover:text-cream"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}
