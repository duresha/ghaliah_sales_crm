import { Demo } from "@/components/ui/gradient-button-demo"

export const metadata = {
  title: "Gradient Button Demo",
  description: "Demo page for the gradient button component",
}

export default function GradientButtonDemoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-950">
      <h1 className="text-3xl font-bold text-white mb-8">Gradient Button Demo</h1>
      <div className="p-8 rounded-lg bg-slate-900">
        <Demo />
      </div>
      
      <div className="mt-12 max-w-2xl text-white">
        <h2 className="text-2xl font-bold mb-4">How to Use</h2>
        <div className="bg-slate-800 p-4 rounded-md mb-6">
          <pre className="text-sm overflow-x-auto">
            <code>{`import { GradientButton } from "@/components/ui/gradient-button"

// Default variant
<GradientButton>Get Started</GradientButton>

// Alternative variant
<GradientButton variant="variant">Get Started</GradientButton>`}</code>
          </pre>
        </div>
        
        <h3 className="text-xl font-bold mb-2">Props</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><code className="bg-slate-800 px-2 py-1 rounded">variant</code> - Optional variant ('default' or 'variant')</li>
          <li><code className="bg-slate-800 px-2 py-1 rounded">asChild</code> - Optional boolean to use the child as the root element</li>
          <li>All standard button props are supported</li>
        </ul>
      </div>
    </div>
  )
} 
