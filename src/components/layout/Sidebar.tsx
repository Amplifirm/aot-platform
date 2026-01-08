"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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
import { GradientText } from "@/components/ui/animated-background";

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

const navItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  }),
};

function SectionHeader({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.h3
      className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      {children}
    </motion.h3>
  );
}

function NavLink({
  item,
  isActive,
  onClick,
  index,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={navItemVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {/* Active background with glow */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              layoutId="activeNav"
              className="absolute inset-0 bg-primary/10 dark:bg-primary/15 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </AnimatePresence>

        {/* Hover background */}
        {!isActive && (
          <motion.div
            className="absolute inset-0 bg-muted/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}

        {/* Icon with glow effect */}
        <motion.span
          className={cn(
            "relative z-10 transition-colors",
            isActive && "text-primary drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
          )}
          whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {item.icon}
        </motion.span>

        <span className="relative z-10">{item.label}</span>

        {/* Active indicator dot */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="ml-auto w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500 }}
            />
          )}
        </AnimatePresence>

        {/* Right border glow for active */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-500/50"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
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
    <div className="flex flex-col h-full bg-card/80 backdrop-blur-xl">
      {/* Logo */}
      <motion.div
        className="p-6 pb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/" className="flex items-center gap-3 group" onClick={handleNavClick}>
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="text-white font-bold text-lg">A</span>
          </motion.div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight">
              <GradientText>AOT</GradientText>
            </span>
            <span className="text-xs text-muted-foreground">Score Platform</span>
          </div>
        </Link>
      </motion.div>

      {/* Menu Section */}
      <div className="px-3 mb-4">
        <SectionHeader delay={0.1}>Menu</SectionHeader>
        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              onClick={handleNavClick}
              index={index}
            />
          ))}
        </nav>
      </div>

      {/* General Section */}
      <div className="px-3 flex-1">
        <SectionHeader delay={0.3}>General</SectionHeader>
        <nav className="space-y-1">
          {generalItems.map((item, index) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              onClick={handleNavClick}
              index={index + menuItems.length}
            />
          ))}
        </nav>
      </div>

      {/* User Section */}
      <motion.div
        className="p-4 mt-auto border-t border-border/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        {session?.user ? (
          <div className="space-y-3">
            <Link
              href="/profile"
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-all duration-200 group"
              onClick={handleNavClick}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Avatar className="h-10 w-10 ring-2 ring-primary/30 shadow-lg shadow-primary/20">
                  <AvatarImage src={session.user.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-semibold">
                    {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                  {session.user.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user.aotId || session.user.email}
                </p>
              </div>
              <motion.div
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.div>
            </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button asChild variant="glow" className="w-full rounded-xl h-10">
                <Link href="/login" onClick={handleNavClick}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button asChild variant="outline" className="w-full rounded-xl h-10">
                <Link href="/register" onClick={handleNavClick}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Started
                </Link>
              </Button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 flex-col glass-card h-screen sticky top-0 border-r border-border/30">
      <SidebarContent />
    </aside>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </motion.div>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72 glass-card border-r border-border/30">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function MobileHeader() {
  const { data: session } = useSession();

  return (
    <header className="lg:hidden sticky top-0 z-50 glass-card border-b border-border/30">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="text-white font-bold">A</span>
            </motion.div>
            <span className="font-bold">
              <GradientText>AOT</GradientText>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <Link href="/profile">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Avatar className="h-8 w-8 ring-2 ring-primary/30 shadow-lg shadow-primary/20">
                  <AvatarImage src={session.user.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-sm">
                    {session.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </Link>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild size="sm" variant="glow" className="rounded-lg">
                <Link href="/login">Sign In</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
