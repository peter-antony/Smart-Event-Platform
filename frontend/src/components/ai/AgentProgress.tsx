import React from 'react';
import { CheckCircle2, Loader2, AlertCircle, Circle, Sparkles } from 'lucide-react';
import { AgentStep } from '../../types/event';

export interface AgentProgressProps {
  steps: AgentStep[];
  currentStep?: string;
  isFailed?: boolean;
}

export const AgentProgress: React.FC<AgentProgressProps> = ({ steps, currentStep, isFailed }) => {
  if (!steps || steps.length === 0) return null;

  const formatStepName = (rawName: string) => {
    switch (rawName) {
      case 'UNDERSTANDING_REQUEST':
        return 'Understanding prompt request';
      case 'SEARCHING_EVENTS':
        return 'Searching event database';
      case 'FILTERING_EVENTS':
        return 'Filtering categories & budget';
      case 'CHECKING_AVAILABILITY':
        return 'Checking seat inventory';
      case 'WAITING_FOR_SELECTION':
        return 'Waiting for event selection';
      case 'WAITING_FOR_CONFIRMATION':
        return 'Paused for human confirmation';
      case 'CREATING_BOOKING':
        return 'Reserving seats & creating booking pass';
      case 'ADDING_TO_CALENDAR':
        return 'Generating calendar schedule invite';
      case 'SENDING_NOTIFICATION':
        return 'Dispatching e-ticket pass notification';
      case 'COMPLETED':
        return 'Execution completed';
      case 'FAILED':
        return 'Execution failed';
      default:
        return rawName.replace(/_/g, ' ').toLowerCase();
    }
  };

  return (
    <div className="glass-card rounded-2xl p-3.5 border border-purple-500/20 bg-gradient-to-r from-purple-950/30 via-gray-900 to-indigo-950/30 space-y-2 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="font-extrabold text-white text-[11px] uppercase tracking-wider">
            AI Agent Execution Progress {currentStep ? `• ${currentStep}` : ''}
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          isFailed
            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
        }`}>
          {isFailed ? 'FAILED' : 'ACTIVE PIPELINE'}
        </span>
      </div>

      {/* Steps Timeline */}
      <div className="space-y-2 pt-1">
        {steps.map((item, idx) => {
          const isCompleted = item.status === 'completed';
          const isActive = item.status === 'active' || item.status === 'in_progress';
          const isErr = item.status === 'failed' || isFailed;

          return (
            <div key={item.id || idx} className="flex items-center gap-2.5 transition-all">
              {/* Status Icon Indicator */}
              <div className="shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                ) : isErr ? (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-gray-600" />
                )}
              </div>

              {/* Step Label */}
              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                <span
                  className={`truncate font-medium text-[11px] capitalize ${
                    isCompleted
                      ? 'text-gray-300 line-through decoration-gray-600'
                      : isActive
                      ? 'text-purple-200 font-bold'
                      : isErr
                      ? 'text-red-300 font-bold'
                      : 'text-gray-500'
                  }`}
                >
                  {formatStepName(item.step)}
                </span>

                {isActive && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-600/30 text-purple-300 text-[9px] font-mono animate-pulse">
                    Processing...
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
