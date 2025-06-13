import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Beaker } from 'lucide-react';
import { IS_DEVELOPMENT } from '@/lib/config';

export function TestDevelopmentBadge() {
  if (!IS_DEVELOPMENT) return null;
  
  return (
    <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200 flex items-center gap-1.5">
      <Beaker className="h-3 w-3" />
      <span className="text-xs font-medium">Development Mode</span>
    </Badge>
  );
}

export function SimulatedSuccessBadge() {
  return (
    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
      <span className="text-xs font-medium">Simulated Success</span>
    </Badge>
  );
} 
