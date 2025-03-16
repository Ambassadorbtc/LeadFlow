"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createClient } from "@/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function OnboardingSettings() {
  const [disableOnboarding, setDisableOnboarding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    const fetchSettings = async () => {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();

        if (!userData?.user) return;

        const { data } = await supabase
          .from("user_settings")
          .select("disable_onboarding")
          .eq("user_id", userData.user.id)
          .single();

        if (data) {
          setDisableOnboarding(data.disable_onboarding === true);
        }
      } catch (error) {
        console.error("Error fetching onboarding settings:", error);
      }
    };

    fetchSettings();
  }, [initialized]);

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          disable_onboarding: disableOnboarding,
        }),
      });

      if (response.ok) {
        toast({
          title: "Settings updated",
          description: "Your onboarding preferences have been saved.",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update settings");
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetOnboarding = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) throw new Error("User not authenticated");

      await supabase.from("user_settings").upsert(
        {
          user_id: userData.user.id,
          onboarding_completed: false,
          disable_onboarding: false,
        },
        { onConflict: "user_id" },
      );

      setDisableOnboarding(false);

      toast({
        title: "Onboarding reset",
        description:
          "You will see the onboarding guide on your next visit to the dashboard.",
      });
    } catch (error: any) {
      console.error("Error resetting onboarding:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to reset onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>Onboarding Settings</CardTitle>
        <CardDescription>
          Manage how the onboarding experience works for your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="disable-onboarding">Disable Onboarding Guide</Label>
            <p className="text-sm text-muted-foreground">
              Turn off the onboarding popup that appears when you log in
            </p>
          </div>
          <Switch
            id="disable-onboarding"
            checked={disableOnboarding}
            onCheckedChange={setDisableOnboarding}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={saveSettings} disabled={loading}>
            {loading ? "Saving..." : "Save preferences"}
          </Button>
          <Button
            variant="outline"
            onClick={resetOnboarding}
            disabled={loading}
          >
            Reset onboarding
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
