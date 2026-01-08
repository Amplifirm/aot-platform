"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import confetti from "canvas-confetti";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Trigger confetti celebration
    if (typeof window !== "undefined") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#3b82f6", "#8b5cf6"],
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="text-center">
          <CardContent className="pt-8 pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-accomplishment/20 flex items-center justify-center"
            >
              <CheckCircle className="h-10 w-10 text-accomplishment" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-bold mb-2">
                Subscription Activated!
              </h1>
              <p className="text-muted-foreground mb-6">
                Thank you for upgrading your AOT experience. Your new features
                are now available.
              </p>

              <div className="flex items-center justify-center gap-2 text-sm text-accomplishment mb-6">
                <Sparkles className="h-4 w-4" />
                <span>Your account has been upgraded</span>
              </div>

              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/profile">
                    Go to Profile
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/people">Start Scoring</Link>
                </Button>
              </div>
            </motion.div>

            {sessionId && (
              <p className="text-xs text-muted-foreground mt-4">
                Session: {sessionId.slice(0, 8)}...
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function SuccessFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-6">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <SuccessContent />
    </Suspense>
  );
}
