"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/supabase/client";
import {
  CheckCircle2,
  ChevronRight,
  Users,
  Building2,
  Briefcase,
  FileSpreadsheet,
  Settings,
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  completed: boolean;
}

export default function UserOnboarding() {
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: "profile",
      title: "Complete Your Profile",
      description: "Add your personal information and company details",
      icon: <Settings className="h-5 w-5" />,
      path: "/dashboard/profile",
      completed: false,
    },
    {
      id: "leads",
      title: "Add Your First Lead",
      description: "Create a lead or import leads from a CSV file",
      icon: <Users className="h-5 w-5" />,
      path: "/dashboard/leads/add",
      completed: false,
    },
    {
      id: "companies",
      title: "Add Companies",
      description: "Create company profiles for your business contacts",
      icon: <Building2 className="h-5 w-5" />,
      path: "/dashboard/companies/add",
      completed: false,
    },
    {
      id: "deals",
      title: "Create Your First Deal",
      description: "Start tracking opportunities in your sales pipeline",
      icon: <Briefcase className="h-5 w-5" />,
      path: "/dashboard/deals/add",
      completed: false,
    },
    {
      id: "import",
      title: "Import Your Data",
      description: "Import contacts, leads, or deals from CSV files",
      icon: <FileSpreadsheet className="h-5 w-5" />,
      path: "/dashboard/leads/import",
      completed: false,
    },
  ]);
  const [progress, setProgress] = useState(0);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const supabase = createClient();

        // Check if user has completed onboarding
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData?.user) {
          console.error("Error getting user:", userError);
          return;
        }

        // Check user settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", userData.user.id)
          .single();

        if (settingsError && settingsError.code !== "PGRST116") {
          // PGRST116 is "no rows returned"
          console.error("Error getting user settings:", settingsError);
          return;
        }

        // If no settings exist, this is likely a first login
        if (!settingsData) {
          setIsFirstLogin(true);
          setOpen(true);
          return;
        }

        // Check if onboarding_completed flag exists and is false
        if (settingsData.onboarding_completed === false) {
          setIsFirstLogin(true);
          setOpen(true);
        }

        // Check completion status of each step
        const [profileComplete, leadsExist, companiesExist, dealsExist] =
          await Promise.all([
            // Profile completion check
            supabase
              .from("users")
              .select("full_name, email, phone")
              .eq("id", userData.user.id)
              .single()
              .then(({ data }) => {
                return data && data.full_name && data.email;
              }),

            // Leads check
            supabase
              .from("leads")
              .select("count")
              .eq("user_id", userData.user.id)
              .single()
              .then(({ data }) => {
                return data && data.count > 0;
              }),

            // Companies check
            supabase
              .from("companies")
              .select("count")
              .eq("user_id", userData.user.id)
              .single()
              .then(({ data }) => {
                return data && data.count > 0;
              }),

            // Deals check
            supabase
              .from("deals")
              .select("count")
              .eq("user_id", userData.user.id)
              .single()
              .then(({ data }) => {
                return data && data.count > 0;
              }),
          ]);

        // Update steps completion status
        setSteps((prev) =>
          prev.map((step) => {
            if (step.id === "profile")
              return { ...step, completed: !!profileComplete };
            if (step.id === "leads")
              return { ...step, completed: !!leadsExist };
            if (step.id === "companies")
              return { ...step, completed: !!companiesExist };
            if (step.id === "deals")
              return { ...step, completed: !!dealsExist };
            if (step.id === "import")
              return { ...step, completed: !!leadsExist }; // Consider import done if leads exist
            return step;
          }),
        );
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    // Calculate progress percentage
    const completedSteps = steps.filter((step) => step.completed).length;
    const progressPercentage = (completedSteps / steps.length) * 100;
    setProgress(progressPercentage);
  }, [steps]);

  const handleStepClick = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const handleSkip = async () => {
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user) {
        // Update user settings to mark onboarding as completed
        await supabase.from("user_settings").upsert(
          {
            user_id: userData.user.id,
            onboarding_completed: true,
          },
          { onConflict: "user_id" },
        );
      }

      setOpen(false);
    } catch (error) {
      console.error("Error skipping onboarding:", error);
    }
  };

  const handleFinish = async () => {
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user) {
        // Update user settings to mark onboarding as completed
        await supabase.from("user_settings").upsert(
          {
            user_id: userData.user.id,
            onboarding_completed: true,
          },
          { onConflict: "user_id" },
        );
      }

      setOpen(false);
    } catch (error) {
      console.error("Error finishing onboarding:", error);
    }
  };

  // If all steps are completed, don't show the onboarding
  const allStepsCompleted = steps.every((step) => step.completed);
  if (allStepsCompleted && isFirstLogin) {
    handleFinish();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to LeadFlow CRM!</DialogTitle>
          <DialogDescription>
            Let's get you set up with a few quick steps to make the most of your
            CRM.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Setup Progress</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />

          <div className="mt-6 space-y-4">
            {steps.map((step) => (
              <Card
                key={step.id}
                className={cn(
                  "cursor-pointer transition-all",
                  step.completed
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "",
                )}
                onClick={() => handleStepClick(step.path)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        step.completed
                          ? "bg-green-100 dark:bg-green-800"
                          : "bg-gray-100 dark:bg-gray-800",
                      )}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleSkip}>
            Skip for now
          </Button>
          <Button onClick={handleFinish} disabled={progress < 60}>
            {progress < 60 ? "Complete more steps" : "Finish setup"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
