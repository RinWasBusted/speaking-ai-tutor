export default function AudioPlayback({ audioUrl }) {
  if (!audioUrl) return null

  return (
    <div className="w-full flex flex-col gap-2">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Preview Recording
      </label>
      <audio src={audioUrl} controls className="w-full" />
    </div>
  )
}
