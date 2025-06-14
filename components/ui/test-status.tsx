import React from "react";
import { CheckCircle, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TestDevelopmentBadge, SimulatedSuccessBadge } from "@/components/ui/test-development-badge";
import { IS_DEVELOPMENT } from "@/lib/config";

interface TestStepProps {
  label: string;
  status: "pending" | "success" | "error" | "idle";
  message?: string;
}

export function TestStatus({ steps }: { steps: TestStepProps[] }) {
  const getStatusColor = (status: TestStepProps["status"]) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800 border-green-300";
      case "error": return "bg-red-100 text-red-800 border-red-300";
      case "pending": return "bg-amber-100 text-amber-800 border-amber-300 animate-pulse";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: TestStepProps["status"]) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error": return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "pending": return <Clock className="h-4 w-4 text-amber-600 animate-spin" />;
      default: return <CheckCircle2 className="h-4 w-4 text-gray-400" />;
    }
  };

  // Check if any step has a simulated success message
  const hasSimulatedSuccess = steps.some(step => 
    step.message?.toLowerCase().includes("simulated") || 
    step.message?.toLowerCase().includes("development")
  );

  return (
    <div className="w-full space-y-1.5 rounded-lg border p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">Test Progress</h4>
        {IS_DEVELOPMENT && <TestDevelopmentBadge />}
      </div>
      
      <div className="space-y-2">
        {steps.map((step, index) => {
          // Check if this step has a simulated success message
          const isSimulated = step.message?.toLowerCase().includes("simulated") ||
                             step.message?.toLowerCase().includes("development");
          
          return (
            <div 
              key={index} 
              className={cn(
                "flex items-center space-x-2 text-sm p-1.5 rounded border", 
                getStatusColor(step.status)
              )}
            >
              {getStatusIcon(step.status)}
              <div className="flex-1">
                <p className="font-medium">{step.label}</p>
                {step.message && (
                  <p className="text-xs mt-0.5 opacity-80">{step.message}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {isSimulated && <SimulatedSuccessBadge />}
                <Badge 
                  variant="outline" 
                  className={cn(
                    step.status === "success" ? "border-green-500 text-green-700" :
                    step.status === "error" ? "border-red-500 text-red-700" :
                    step.status === "pending" ? "border-amber-500 text-amber-700" :
                    "border-gray-500 text-gray-700"
                  )}
                >
                  {step.status}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
      
      {hasSimulatedSuccess && (
        <div className="mt-2 text-xs text-amber-600 italic">
          Note: Some steps show simulated success because you're in development mode.
        </div>
      )}
    </div>
  );
} 
 