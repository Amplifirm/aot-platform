"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
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
                delay: 0.1,
              }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center"
            >
              <XCircle className="h-10 w-10 text-muted-foreground" />
            </motion.div>

            <h1 className="text-2xl font-bold mb-2">Checkout Cancelled</h1>
            <p className="text-muted-foreground mb-6">
              No worries! Your checkout was cancelled and you haven't been
              charged. You can always upgrade later.
            </p>

            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full">
                <Link href="/pricing">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Pricing
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/">Continue Browsing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
