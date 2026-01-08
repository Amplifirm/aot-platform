"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge, ScoreInline } from "@/components/scoring/ScoreDisplay";
import { cn } from "@/lib/utils";
import type { TargetType } from "@/types";

interface TargetCardProps {
  id: string;
  slug: string;
  name: string;
  targetType: TargetType;
  shortDescription?: string | null;
  imageUrl?: string | null;
  avgTotal: number;
  masterTotal?: number | null;
  totalVotes: number;
  className?: string;
}

export function TargetCard({
  slug,
  name,
  targetType,
  shortDescription,
  imageUrl,
  avgTotal,
  masterTotal,
  totalVotes,
  className,
}: TargetCardProps) {
  const href = `/${targetType === "person" ? "people" : targetType === "country" ? "countries" : "ideas"}/${slug}`;

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={cn("card-elevated h-full hover:shadow-md transition-all cursor-pointer overflow-hidden", className)}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <Avatar className="h-16 w-16 rounded-lg">
                <AvatarImage src={imageUrl || undefined} alt={name} />
                <AvatarFallback className="rounded-lg text-lg">
                  {name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <ScoreBadge total={avgTotal} />
            </div>
            <CardTitle className="text-lg mt-3">{name}</CardTitle>
            {shortDescription && (
              <CardDescription className="line-clamp-2">
                {shortDescription}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{totalVotes} votes</span>
              {masterTotal !== null && masterTotal !== undefined && (
                <span className="text-xs">
                  Master: <ScoreInline accomplishments={0} offenses={0} total={masterTotal} />
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}

// Horizontal card variant for lists
interface TargetCardHorizontalProps extends TargetCardProps {
  rank?: number;
}

export function TargetCardHorizontal({
  slug,
  name,
  targetType,
  shortDescription,
  imageUrl,
  avgTotal,
  masterTotal,
  totalVotes,
  rank,
  className,
}: TargetCardHorizontalProps) {
  const href = `/${targetType === "person" ? "people" : targetType === "country" ? "countries" : "ideas"}/${slug}`;

  return (
    <Link href={href}>
      <Card className={cn("hover:shadow-md transition-shadow cursor-pointer", className)}>
        <CardContent className="flex items-center gap-4 p-4">
          {rank !== undefined && (
            <div className="text-2xl font-bold text-muted-foreground w-8">
              #{rank}
            </div>
          )}
          <Avatar className="h-12 w-12">
            <AvatarImage src={imageUrl || undefined} alt={name} />
            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{name}</h3>
            {shortDescription && (
              <p className="text-sm text-muted-foreground truncate">
                {shortDescription}
              </p>
            )}
          </div>
          <div className="text-right">
            <ScoreBadge total={avgTotal} size="sm" />
            <p className="text-xs text-muted-foreground mt-1">{totalVotes} votes</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Skeleton loader
export function TargetCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="h-16 w-16 rounded-lg bg-muted animate-pulse" />
          <div className="h-8 w-12 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="h-5 w-3/4 bg-muted animate-pulse rounded mt-3" />
        <div className="h-4 w-full bg-muted animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}
