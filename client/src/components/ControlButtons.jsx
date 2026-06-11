export default function ControlButtons({
  recordingState,
  startRecording,
  stopRecording,
  sendToApi,
  resetRecording,
  isReadyToSubmit,
  evaluationMutation,
}) {
  return (
    <div className="flex flex-wrap gap-4 justify-center w-full">
      {recordingState === 'idle' && (
        <button
          onClick={startRecording}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors shadow-lg cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          Start Recording
        </button>
      )}

      {recordingState === 'recording' && (
        <button
          onClick={stopRecording}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors shadow-lg cursor-pointer animate-pulse"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
          Stop Recording
        </button>
      )}

      {recordingState === 'stopped' && (
        <>
          <button
            onClick={startRecording}
            disabled={evaluationMutation.isPending}
            className="flex items-center gap-2 px-5 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Record Again
          </button>

          <button
            onClick={sendToApi}
            disabled={!isReadyToSubmit || evaluationMutation.isPending}
            className={`flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-colors shadow-lg cursor-pointer ${
              isReadyToSubmit && !evaluationMutation.isPending
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
            }`}
          >
            {evaluationMutation.isPending ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Evaluating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
                Submit Speech
              </>
            )}
          </button>
        </>
      )}

      {recordingState !== 'idle' && (
        <button
          onClick={resetRecording}
          disabled={evaluationMutation.isPending}
          className="flex items-center gap-2 px-5 py-3 bg-transparent hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-medium rounded-lg transition-colors cursor-pointer border border-slate-700 disabled:opacity-50"
        >
          Reset
        </button>
      )}
    </div>
  )
}
