import React from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Toast, ToastDescription, ToastTitle } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

// Simple notification component that just wraps the toast functionality
// with visual indicators and step tracking

type NotificationStatus = "success" | "error" | "warning" | "info";

interface StepStatus {
  label: string;
  status: "pending" | "success" | "error";
}

export function useNotifications() {
  const { toast } = useToast();
  
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };
  
  // Simple notification with icon
  const notify = (
    title: string, 
    description: string, 
    status: NotificationStatus, 
    duration: number = 5000
  ) => {
    return toast({
      title: (
        <div className="flex items-center gap-2">
          {icons[status]}
          {title}
        </div>
      ),
      description,
      variant: status === "error" ? "destructive" : "default",
      duration
    });
  };
  
  // Success notification
  const success = (title: string, description: string) => {
    return notify(title, description, "success");
  };
  
  // Error notification
  const error = (title: string, description: string) => {
    return notify(title, description, "error", 7000);
  };
  
  // Warning notification
  const warning = (title: string, description: string) => {
    return notify(title, description, "warning");
  };
  
  // Info notification
  const info = (title: string, description: string) => {
    return notify(title, description, "info");
  };
  
  // Process step notifications
  const notifyProcessSteps = (
    title: string,
    steps: StepStatus[]
  ) => {
    const stepsDisplay = steps.map(step => {
      const icon = step.status === "success" 
        ? "✅" 
        : step.status === "error" 
          ? "❌" 
          : "⏳";
      return `${icon} ${step.label}`;
    }).join("\n");
    
    const overallStatus = steps.some(s => s.status === "error") 
      ? "error" 
      : steps.every(s => s.status === "success") 
        ? "success" 
        : "info";
    
    return notify(
      title,
      stepsDisplay,
      overallStatus,
      steps.some(s => s.status === "pending") ? 30000 : 5000
    );
  };
  
  return {
    notify,
    success,
    error,
    warning,
    info,
    notifyProcessSteps
  };
} 
