"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Globe,
  Lightbulb,
  UsersRound,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  LogIn,
  Menu,
  CreditCard,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: <Home className="h-5 w-5" /> },
  { label: "People", href: "/people", icon: <Users className="h-5 w-5" /> },
  { label: "Countries", href: "/countries", icon: <Globe className="h-5 w-5" /> },
  { label: "Ideas", href: "/ideas", icon: <Lightbulb className="h-5 w-5" /> },
  { label: "Groups", href: "/groups", icon: <UsersRound className="h-5 w-5" /> },
  { label: "Scores", href: "/scores", icon: <BarChart3 className="h-5 w-5" /> },
];

const generalItems: NavItem[] = [
  { label: "Pricing", href: "/pricing", icon: <CreditCard className="h-5 w-5" /> },
  { label: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
  { label: "Help", href: "/help", icon: <HelpCircle className="h-5 w-5" /> },
];

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      {children}
    </h3>
  );
}

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <span className={cn(isActive && "text-primary")}>{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleNavClick = () => {
    onNavigate?.();
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Logo */}
      <div className="p-4 pb-3">
        <Link href="/" className="flex items-center gap-3" onClick={handleNavClick}>
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">A</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight">AOT</span>
            <span className="text-xs text-muted-foreground">Score Platform</span>
          </div>
        </Link>
      </div>

      {/* Menu Section */}
      <div className="px-3 mb-4">
        <SectionHeader>Menu</SectionHeader>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              onClick={handleNavClick}
            />
          ))}
        </nav>
      </div>

      {/* General Section */}
      <div className="px-3 flex-1">
        <SectionHeader>General</SectionHeader>
        <nav className="space-y-1">
          {generalItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              onClick={handleNavClick}
            />
          ))}
        </nav>
      </div>

      {/* User Section */}
      <div className="p-4 mt-auto border-t border-border">
        {session?.user ? (
          <div className="space-y-3">
            <Link
              href="/profile"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
              onClick={handleNavClick}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {session.user.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user.aotId || session.user.email}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/login" onClick={handleNavClick}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/register" onClick={handleNavClick}>
                <Sparkles className="h-4 w-4 mr-2" />
                Get Started
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-60 flex-col bg-card h-screen sticky top-0 border-r border-border">
      <SidebarContent />
    </aside>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function MobileHeader() {
  const { data: session } = useSession();

  return (
    <header className="lg:hidden sticky top-0 z-50 bg-card border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-bold">AOT</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <Link href="/profile">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {session.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
