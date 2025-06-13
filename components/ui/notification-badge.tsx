import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationBadgeProps {
  status: "success" | "error" | "warning" | "info"
  className?: string
}

export function NotificationBadge({ status, className }: NotificationBadgeProps) {
  const iconMap = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {iconMap[status]}
    </div>
  )
} 
