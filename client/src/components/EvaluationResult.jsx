import { forwardRef } from 'react'

const EvaluationResult = forwardRef(
  ({ evaluationMutation }, ref) => {
    if (!evaluationMutation.isSuccess || !evaluationMutation.data) return null

    return (
      <div
        ref={ref}
        className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl p-6 text-left flex flex-col gap-6 mt-4"
      >
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg border-b border-slate-800 pb-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Evaluation Completed Successfully</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Your Transcription
          </span>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
            {evaluationMutation.data.transcription || 'No transcription text returned.'}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Evaluation & Pronunciation Feedback
          </span>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
            {evaluationMutation.data.evaluation || 'No evaluation text returned.'}
          </div>
        </div>
      </div>
    )
  }
)

EvaluationResult.displayName = 'EvaluationResult'

export default EvaluationResult
