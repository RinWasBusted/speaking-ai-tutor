export default function AudioVisualizer({ recordingState, duration, formatTime }) {
  const isMinDurationMet = duration >= 60

  return (
    <div className="w-full flex flex-col items-center justify-center bg-slate-950 rounded-xl py-10 px-6 border border-slate-800 relative overflow-hidden">
      {recordingState === 'recording' && (
        <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20 pointer-events-none">
          <span className="w-1.5 h-12 bg-purple-500 rounded-full animate-bounce delay-75"></span>
          <span className="w-1.5 h-16 bg-purple-500 rounded-full animate-bounce delay-150"></span>
          <span className="w-1.5 h-8 bg-purple-500 rounded-full animate-bounce delay-300"></span>
          <span className="w-1.5 h-14 bg-purple-500 rounded-full animate-bounce delay-75"></span>
          <span className="w-1.5 h-16 bg-purple-500 rounded-full animate-bounce delay-200"></span>
          <span className="w-1.5 h-10 bg-purple-500 rounded-full animate-bounce delay-500"></span>
          <span className="w-1.5 h-14 bg-purple-500 rounded-full animate-bounce delay-150"></span>
          <span className="w-1.5 h-8 bg-purple-500 rounded-full animate-bounce delay-75"></span>
        </div>
      )}

      <div className="text-5xl font-mono font-bold tracking-wider text-slate-100 z-10">
        {formatTime(duration)}
      </div>
      <div className="text-xs text-slate-500 mt-2 z-10 uppercase tracking-widest font-semibold">
        {recordingState === 'recording' ? (
          <span className="text-red-500 animate-pulse flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Recording
          </span>
        ) : recordingState === 'stopped' ? (
          'Recording Stopped'
        ) : (
          'Ready'
        )}
      </div>

      {/* Progress Bar for the 1-minute target */}
      <div className="w-full max-w-xs bg-slate-800 h-1.5 rounded-full mt-6 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isMinDurationMet ? 'bg-emerald-500' : 'bg-purple-500'
          }`}
          style={{ width: `${Math.min((duration / 60) * 100, 100)}%` }}
        ></div>
      </div>
      <div className="text-xs text-slate-400 mt-2">
        {isMinDurationMet ? (
          <span className="text-emerald-400 font-medium">✓ 1-minute target reached</span>
        ) : (
          <span>{60 - duration} seconds remaining to hit the 1-minute target</span>
        )}
      </div>
    </div>
  )
}
