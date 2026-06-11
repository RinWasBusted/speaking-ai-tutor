import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { evaluateSpeech } from './api/speech'

function App() {
  const [recordingState, setRecordingState] = useState('idle') // 'idle' | 'recording' | 'paused' | 'stopped'
  const [duration, setDuration] = useState(0) // in seconds
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])
  const [audioUrl, setAudioUrl] = useState(null)

  const timerRef = useRef(null)

  // Use TanStack Query Mutation
  const mutation = useMutation({
    mutationFn: evaluateSpeech,
  })

  // Start recording
  const startRecording = async () => {
    try {
      setAudioChunks([])
      setAudioUrl(null)
      mutation.reset()

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)

      const chunks = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        setAudioChunks(chunks)
      }

      recorder.start()
      setMediaRecorder(recorder)
      setRecordingState('recording')
      setDuration(0)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setApiError('Microphone access denied. Please allow microphone permissions and try again.')
    }
  }

  // Timer effect
  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }

    return () => clearInterval(timerRef.current)
  }, [recordingState])

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      // Stop all tracks on the stream to release the mic
      mediaRecorder.stream.getTracks().forEach((track) => track.stop())
      setRecordingState('stopped')
    }
  }

  // Cancel/Reset recording
  const resetRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach((track) => track.stop())
    }
    setRecordingState('idle')
    setDuration(0)
    setAudioChunks([])
    setAudioUrl(null)
    mutation.reset()
  }

  // Format time (mm:ss)
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60)
    const seconds = secs % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Send to speech evaluation API using TanStack query mutation
  const sendToApi = async () => {
    if (audioChunks.length === 0) return
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
    mutation.mutate(audioBlob)
  }

  const isMinDurationMet = duration >= 60
  const isReadyToSubmit = audioChunks.length > 0

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <main className="max-w-xl w-full bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8 flex flex-col items-center gap-8">
        
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Voice Recorder</h1>
          <p className="text-slate-400 text-sm">
            Please record your voice. You must record for at least <strong className="text-purple-400">1 minute (60 seconds)</strong> before submitting.
          </p>
        </div>

        {/* Visualizer/Timer Area */}
        <div className="w-full flex flex-col items-center justify-center bg-slate-950 rounded-xl py-12 px-6 border border-slate-800 relative overflow-hidden">
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
              className={`h-full transition-all duration-300 ${isMinDurationMet ? 'bg-emerald-500' : 'bg-purple-500'}`}
              style={{ width: `${Math.min((duration / 60) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            {isMinDurationMet ? (
              <span className="text-emerald-400 font-medium">✓ Minimum requirement met (60s+)</span>
            ) : (
              <span>{60 - duration} seconds remaining to meet minimum requirement</span>
            )}
          </div>
        </div>

        {/* Audio Playback */}
        {audioUrl && (
          <div className="w-full flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Preview Recording</label>
            <audio src={audioUrl} controls className="w-full" />
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-4 justify-center w-full">
          {recordingState === 'idle' && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors shadow-lg cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
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
                className="flex items-center gap-2 px-5 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-colors cursor-pointer"
              >
                Record Again
              </button>
              
              <button
                onClick={sendToApi}
                disabled={!isReadyToSubmit || mutation.isPending}
                className={`flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-colors shadow-lg cursor-pointer ${
                  isReadyToSubmit && !mutation.isPending
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
                }`}
              >
                {mutation.isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending to API...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                    Send to API
                  </>
                )}
              </button>
            </>
          )}

          {recordingState !== 'idle' && (
            <button
              onClick={resetRecording}
              className="flex items-center gap-2 px-5 py-3 bg-transparent hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-medium rounded-lg transition-colors cursor-pointer border border-slate-700"
            >
              Reset
            </button>
          )}
        </div>

        {/* API Response Display */}
        {mutation.isSuccess && mutation.data && (
          <div className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl p-5 text-left flex flex-col gap-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{mutation.data.message}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
              <div><strong className="text-slate-300">Output Path:</strong> {mutation.data.outputPath}</div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {mutation.isError && (
          <div className="w-full bg-red-950/50 border border-red-500/30 rounded-xl p-4 text-left flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-sm text-red-300">{mutation.error?.response?.data?.error || mutation.error?.message || 'Failed to send audio to the server. Please try again.'}</div>
          </div>
        )}

      </main>
    </div>
  )
}

export default App
