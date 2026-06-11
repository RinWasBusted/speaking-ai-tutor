import ErrorMessage from './ErrorMessage'

export default function StartScreen({ onStart, generating, genError }) {
  return (
    <div className="w-full flex flex-col items-center gap-6 py-8 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>

      <div className="max-w-md">
        <h2 className="text-xl font-bold text-slate-200 mb-2">Are you ready?</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Clicking the button below will generate a TOEIC Speaking style reading paragraph. You will have up to 1 minute to record your voice reading it.
        </p>
      </div>

      {genError && <ErrorMessage message={genError} />}

      <button
        onClick={onStart}
        disabled={generating}
        className={`flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg text-lg cursor-pointer transform hover:scale-[1.02] ${
          generating ? 'opacity-75 cursor-not-allowed' : ''
        }`}
      >
        {generating ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Paragraph...
          </>
        ) : (
          <>Start Speaking Test</>
        )}
      </button>
    </div>
  )
}
