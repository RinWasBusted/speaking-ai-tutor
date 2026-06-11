export default function ExerciseText({ text }) {
  return (
    <div className="w-full flex flex-col gap-2">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Read this paragraph aloud:
      </span>
      <div className="bg-slate-950 p-6 rounded-xl border border-purple-500/30 text-lg md:text-xl font-medium leading-relaxed text-slate-100 text-center select-none shadow-inner">
        {text}
      </div>
    </div>
  )
}
