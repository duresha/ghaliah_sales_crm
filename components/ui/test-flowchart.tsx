import React from 'react';
import { TestStep } from '@/lib/test-utils';

interface TestFlowchartProps {
  steps: TestStep[];
  title?: string;
}

export function TestFlowchart({ steps, title = "Test Flow" }: TestFlowchartProps) {
  // Prepare flowchart data
  const flowchart = `flowchart TD
    title["${title}"]
    ${steps.map((step, index) => {
      const nextStep = steps[index + 1]?.id;
      const color = step.status === 'success' 
        ? 'fill:#d1fae5,stroke:#10b981' 
        : step.status === 'error' 
          ? 'fill:#fee2e2,stroke:#ef4444' 
          : step.status === 'pending' 
            ? 'fill:#fef3c7,stroke:#f59e0b' 
            : 'fill:#f3f4f6,stroke:#9ca3af';
      
      const stepDisplay = `${step.id}["${step.label}<br><i>${step.status}</i>"]:::${step.status}`;
      const connection = nextStep ? `${step.id} --> ${nextStep}` : '';
      
      return `${stepDisplay}\n${connection}`;
    }).join('\n    ')}
    
    classDef success fill:#d1fae5,stroke:#10b981,color:#065f46
    classDef error fill:#fee2e2,stroke:#ef4444,color:#b91c1c
    classDef pending fill:#fef3c7,stroke:#f59e0b,color:#92400e
    classDef idle fill:#f3f4f6,stroke:#9ca3af,color:#374151`;
  
  return (
    <div className="w-full p-4 bg-white rounded-lg border shadow-sm">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <pre className="text-xs overflow-auto bg-gray-50 p-3 rounded border">
        {flowchart}
      </pre>
      
      <p className="text-xs text-gray-500 mt-2">
        You can paste this flowchart into Mermaid Live Editor to visualize it.
      </p>
    </div>
  );
} 
