"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  CreditCard,
  Bell,
  Shield,
  ArrowLeft,
  Save,
  Loader2,
  Check,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getTierFeatures } from "@/lib/utils/permissions";

interface UserData {
  id: string;
  aotId: string;
  email: string | null;
  displayName: string | null;
  name: string | null;
  avatarUrl: string | null;
  image: string | null;
  bio: string | null;
  userType: "anonymous" | "registered" | "authenticated";
  subscriptionTier: "T1" | "T2" | "T3" | "T4" | "T5";
  karma: number;
  stripeCustomerId: string | null;
  subscriptionEndsAt: string | null;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch user data
  const { data, isLoading, error } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await fetch("/api/users/me");
      if (!res.ok) throw new Error("Failed to fetch user");
      const json = await res.json();
      return json.data as UserData;
    },
    enabled: !!session?.user?.id,
  });

  // Initialize form when data loads
  const initForm = () => {
    if (data && displayName === "" && bio === "") {
      setDisplayName(data.displayName || "");
      setBio(data.bio || "");
    }
  };
  if (data && displayName === "" && bio === "") {
    initForm();
  }

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (formData: { displayName: string; bio: string }) => {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ displayName, bio });
  };

  const handleInputChange = (field: "displayName" | "bio", value: string) => {
    if (field === "displayName") {
      setDisplayName(value);
    } else {
      setBio(value);
    }
    setHasChanges(true);
  };

  if (status === "loading" || isLoading) {
    return <SettingsSkeleton />;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Error loading settings</h2>
          <p className="text-muted-foreground mb-4">Please try again later.</p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const avatarSrc = data.avatarUrl || data.image;
  const currentTierFeatures = getTierFeatures(data.subscriptionTier);

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your account and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your display name and bio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={avatarSrc || undefined} />
                      <AvatarFallback className="text-xl">
                        {(displayName || data.aotId).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Avatar synced from your social login provider
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* AOT ID (read-only) */}
                  <div className="space-y-2">
                    <Label>AOT ID</Label>
                    <div className="flex items-center gap-2">
                      <Input value={data.aotId} disabled className="font-mono" />
                      <Badge variant="secondary">Read-only</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your unique identifier on AOT
                    </p>
                  </div>

                  {/* Email (read-only) */}
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={data.email || "Not set"} disabled />
                  </div>

                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => handleInputChange("displayName", e.target.value)}
                      placeholder="Enter your display name"
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground">
                      This is how you appear on AOT
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      {bio.length}/500 characters
                    </p>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSave}
                      disabled={!hasChanges || updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    Your subscription and billing details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          Tier {data.subscriptionTier.slice(1)}
                        </h3>
                        <Badge
                          variant={data.subscriptionTier === "T1" ? "secondary" : "default"}
                        >
                          {data.subscriptionTier === "T1" ? "Free" : "Paid"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {data.userType === "authenticated"
                          ? "Authenticated user benefits included"
                          : "Registered user plan"}
                      </p>
                    </div>
                    <Button asChild>
                      <Link href="/pricing">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Upgrade
                      </Link>
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Your Features</h4>
                    <ul className="space-y-2">
                      {currentTierFeatures.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-accomplishment" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {data.subscriptionEndsAt && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Subscription renews on{" "}
                        {new Date(data.subscriptionEndsAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose what notifications you receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Replies to your scores</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone replies to your scores
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Karma updates</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you receive karma
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Group activity</p>
                      <p className="text-sm text-muted-foreground">
                        Updates from groups you belong to
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing emails</p>
                      <p className="text-sm text-muted-foreground">
                        News and updates about AOT
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Connected Accounts</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#4285F4] flex items-center justify-center">
                            <span className="text-white font-bold">G</span>
                          </div>
                          <div>
                            <p className="font-medium">Google</p>
                            <p className="text-sm text-muted-foreground">
                              {data.userType === "authenticated"
                                ? "Connected"
                                : "Not connected"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            data.userType === "authenticated"
                              ? "default"
                              : "outline"
                          }
                        >
                          {data.userType === "authenticated"
                            ? "Active"
                            : "Connect"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Account Status</h4>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          data.userType === "authenticated"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {data.userType}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {data.userType === "authenticated"
                          ? "Your account is verified"
                          : "Connect a social account to verify"}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2 text-destructive">
                      Danger Zone
                    </h4>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      Delete Account
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      This action cannot be undone. All your data will be
                      permanently deleted.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="min-h-screen pb-16">
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-96 mb-6" />
        <Card>
          <CardContent className="py-8 space-y-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-24 w-full max-w-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
