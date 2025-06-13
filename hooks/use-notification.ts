import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface NotificationOptions {
  heading: string
  message: string
  status: "success" | "error" | "warning" | "info"
  duration?: number
  progress?: boolean
}

interface TestProgress {
  supabaseInsert?: "pending" | "success" | "error"
  n8nWebhook?: "pending" | "success" | "error" 
  automationFlow?: "pending" | "success" | "error"
}

export function useNotification() {
  const { toast } = useToast()
  const [testProgress, setTestProgress] = useState<TestProgress>({})
  const activeTestToastId = useRef<string | null>(null)
  
  // Clear test progress when component unmounts
  useEffect(() => {
    return () => {
      setTestProgress({})
    }
  }, [])
  
  const getColorClass = (status: "success" | "error" | "warning" | "info") => {
    switch (status) {
      case "success": return "bg-green-500"
      case "error": return "bg-red-500"
      case "warning": return "bg-amber-500"
      case "info": return "bg-blue-500"
      default: return "bg-blue-500"
    }
  }
  
  const notify = ({
    heading,
    message,
    status,
    duration = 5000,
    progress = false
  }: NotificationOptions) => {
    const colorClass = getColorClass(status)
    
    return toast({
      title: (
        <div className="flex items-center gap-2">
          <span className={cn("inline-block w-2 h-2 rounded-full", colorClass)}></span>
          <span className="font-medium">{heading}</span>
        </div>
      ),
      description: (
        <div className="mt-1 text-sm text-gray-500">
          {message}
          {progress && (
            <div className="mt-1 w-full bg-gray-100 rounded-full h-1.5">
              <div className={cn("h-1.5 rounded-full w-1/2", colorClass)}></div>
            </div>
          )}
        </div>
      ),
      variant: status === "error" ? "destructive" : "default",
      duration: duration,
    })
  }
  
  // For testing Supabase insert, n8n webhook, etc.
  const notifyTestStart = () => {
    // Clear any existing test toast
    if (activeTestToastId.current) {
      toast.dismiss(activeTestToastId.current)
    }
    
    setTestProgress({
      supabaseInsert: "pending",
      n8nWebhook: "pending",
      automationFlow: "pending"
    })
    
    const { id } = notify({
      heading: "Testing flow",
      message: "Starting tests...",
      status: "info",
      duration: 30000, // Long duration as we track progress
    })
    
    activeTestToastId.current = id
    return id
  }
  
  const updateTestProgress = (
    step: keyof TestProgress, 
    status: "pending" | "success" | "error",
    message?: string
  ) => {
    setTestProgress(prev => ({ ...prev, [step]: status }))
    
    // Get overall status
    const stepInfo = {
      supabaseInsert: { name: "Database Insert", order: 1 },
      n8nWebhook: { name: "Webhook Trigger", order: 2 },
      automationFlow: { name: "Automation Flow", order: 3 }
    }
    
    const completedStep = stepInfo[step].name
    const overallStatus = Object.values(testProgress).includes("error") 
      ? "error" 
      : Object.values(testProgress).every(s => s === "success") 
        ? "success" 
        : "info"
    
    const statusMsg = status === "success" 
      ? `✓ ${completedStep} completed` 
      : status === "error" 
        ? `✗ ${completedStep} failed${message ? `: ${message}` : ""}` 
        : `⟳ ${completedStep} in progress`
    
    // Show current progress
    const allSteps = Object.entries(testProgress)
      .sort(([a], [b]) => stepInfo[a as keyof TestProgress].order - stepInfo[b as keyof TestProgress].order)
      .map(([key, value]) => {
        const stepName = stepInfo[key as keyof TestProgress].name
        const icon = value === "success" 
          ? "✓" 
          : value === "error" 
            ? "✗" 
            : "⟳"
        return `${icon} ${stepName}`
      })
      .join("\n")
    
    if (activeTestToastId.current) {
      toast.dismiss(activeTestToastId.current)
    }
    
    const { id } = notify({
      heading: `Test ${Object.values(testProgress).includes("error") ? "failed" : Object.values(testProgress).every(s => s === "success") ? "completed" : "in progress"}`,
      message: `${statusMsg}\n\n${allSteps}`,
      status: overallStatus,
      duration: 10000,
    })
    
    activeTestToastId.current = id
  }
  
  return {
    notify,
    notifyTestStart,
    updateTestProgress,
    testProgress
  }
} 
