import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { TEST_CONFIG, FEATURES } from "@/lib/config";

export type TestStepStatus = "pending" | "success" | "error" | "idle";

export interface TestStep {
  id: string;
  label: string;
  status: TestStepStatus;
  message?: string;
}

export type TestOperation = "database" | "webhook" | "automation" | "email" | "custom";

// Creates a predefined set of steps for common operations
export const createTestSteps = (operation: TestOperation, customSteps?: string[]): TestStep[] => {
  switch (operation) {
    case "database":
      return [
        { id: "connect", label: "Database Connection", status: "idle", message: "Waiting..." },
        { id: "validate", label: "Data Validation", status: "idle", message: "Waiting..." },
        { id: "insert", label: "Data Insertion", status: "idle", message: "Waiting..." },
      ];
    case "webhook":
      return [
        { id: "prepare", label: "Prepare Payload", status: "idle", message: "Waiting..." },
        { id: "send", label: "Send Request", status: "idle", message: "Waiting..." },
        { id: "response", label: "Process Response", status: "idle", message: "Waiting..." },
      ];
    case "automation":
      return [
        { id: "trigger", label: "Trigger Automation", status: "idle", message: "Waiting..." },
        { id: "process", label: "Process Workflow", status: "idle", message: "Waiting..." },
        { id: "complete", label: "Complete Flow", status: "idle", message: "Waiting..." },
      ];
    case "email":
      return [
        { id: "template", label: "Email Template", status: "idle", message: "Waiting..." },
        { id: "send", label: "Send Email", status: "idle", message: "Waiting..." },
        { id: "delivery", label: "Delivery Check", status: "idle", message: "Waiting..." },
      ];
    case "custom":
      if (!customSteps || customSteps.length === 0) {
        throw new Error("Custom steps are required for custom operation type");
      }
      return customSteps.map((step, index) => ({
        id: `step-${index}`,
        label: step,
        status: "idle",
        message: "Waiting..."
      }));
    default:
      return [];
  }
};

// Hook for managing test flows with visual feedback
export function useTestMonitoring() {
  const [testSteps, setTestSteps] = useState<TestStep[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  
  // Auto-cleanup when component unmounts
  useEffect(() => {
    return () => {
      setTestSteps([]);
      setIsActive(false);
      setIsComplete(false);
    };
  }, []);
  
  const startTest = (steps: TestStep[]) => {
    if (!FEATURES.ENABLE_TESTING) return;
    
    setTestSteps(steps);
    setIsActive(true);
    setIsComplete(false);
    
    toast({
      title: "Test Started",
      description: "Monitoring operations...",
      duration: TEST_CONFIG.TOAST_DURATION,
    });
    
    return steps;
  };
  
  const updateStep = (stepId: string, status: TestStepStatus, message?: string) => {
    if (!FEATURES.ENABLE_TESTING) return;
    
    setTestSteps(current =>
      current.map(step =>
        step.id === stepId ? { ...step, status, message: message || step.message } : step
      )
    );
    
    // Check if all steps are completed
    if (status === "success" || status === "error") {
      const allComplete = testSteps.every(step => 
        step.id === stepId ? true : step.status === "success" || step.status === "error"
      );
      
      if (allComplete) {
        setIsComplete(true);
        
        // Show a toast for the final result
        const hasErrors = testSteps.some(s => s.status === "error");
        toast({
          title: hasErrors ? "Test Failed" : "Test Completed",
          description: hasErrors 
            ? "Some operations failed. Check the test panel for details." 
            : "All operations completed successfully.",
          variant: hasErrors ? "destructive" : "default",
          duration: TEST_CONFIG.TOAST_DURATION,
        });
      }
    }
    
    // Show toast for errors
    if (status === "error") {
      const step = testSteps.find(s => s.id === stepId);
      if (step) {
        toast({
          title: `${step.label} Failed`,
          description: message || "An error occurred during this step.",
          variant: "destructive",
          duration: TEST_CONFIG.TOAST_DURATION,
        });
      }
    }
  };
  
  const resetTest = () => {
    setTestSteps([]);
    setIsActive(false);
    setIsComplete(false);
  };
  
  return {
    testSteps,
    isActive,
    isComplete,
    startTest,
    updateStep,
    resetTest,
  };
} 
