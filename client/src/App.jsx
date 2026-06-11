import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { evaluateSpeech } from './api/speech'
import { generateExercise } from './api/exercise'

import Header from './components/Header'
import StartScreen from './components/StartScreen'
import ExerciseText from './components/ExerciseText'
import AudioVisualizer from './components/AudioVisualizer'
import AudioPlayback from './components/AudioPlayback'
import ControlButtons from './components/ControlButtons'
import EvaluationResult from './components/EvaluationResult'
import ErrorMessage from './components/ErrorMessage'

function App() {
  const [recordingState, setRecordingState] = useState('idle') // 'idle' | 'recording' | 'stopped'
  const [duration, setDuration] = useState(0) // in seconds
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])
  const [audioUrl, setAudioUrl] = useState(null)

  // Exercise states
  const [exercise, setExercise] = useState(null)
  const [testActive, setTestActive] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState(null)
  const [micError, setMicError] = useState(null)

  const timerRef = useRef(null)
  const evaluationRef = useRef(null)

  // Use TanStack Query Mutation for evaluation
  const evaluationMutation = useMutation({
    mutationFn: evaluateSpeech,
  })

  // Scroll to evaluation when success
  useEffect(() => {
    if (evaluationMutation.isSuccess && evaluationRef.current) {
      evaluationRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [evaluationMutation.isSuccess])

  // Start the speaking test: fetch paragraph
  const handleStartTest = async () => {
    setGenerating(true)
    setGenError(null)
    setExercise(null)
    try {
      const data = await generateExercise()
      setExercise(data.paragraph)
      setTestActive(true)
      resetRecording()
      evaluationMutation.reset()
    } catch (err) {
      console.error('Error generating exercise:', err)
      setGenError('Failed to generate exercise paragraph. Please check server connection and try again.')
    } finally {
      setGenerating(false)
    }
  }

  // Start recording
  const startRecording = async () => {
    try {
      setMicError(null)
      setAudioChunks([])
      setAudioUrl(null)

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
      setMicError('Microphone access denied. Please allow microphone permissions and try again.')
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
    evaluationMutation.mutate({ audioBlob, paragraph: exercise })
  }

  const isReadyToSubmit = audioChunks.length > 0

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <main className="max-w-2xl w-full bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8 flex flex-col items-center gap-8">
        
        {/* Title */}
        <Header />

        {!testActive ? (
          /* Start Test Splash Screen */
          <StartScreen
            onStart={handleStartTest}
            generating={generating}
            genError={genError}
          />
        ) : (
          /* Active Test Screen */
          <div className="w-full flex flex-col gap-6">
            
            {/* The Exercise Paragraph */}
            <ExerciseText text={exercise} />

            {/* Visualizer/Timer Area */}
            <AudioVisualizer
              recordingState={recordingState}
              duration={duration}
              formatTime={formatTime}
            />

            {/* Microphone Access Error */}
            {micError && <ErrorMessage message={micError} />}

            {/* Audio Playback */}
            <AudioPlayback audioUrl={audioUrl} />

            {/* Controls */}
            <ControlButtons
              recordingState={recordingState}
              startRecording={startRecording}
              stopRecording={stopRecording}
              sendToApi={sendToApi}
              resetRecording={resetRecording}
              isReadyToSubmit={isReadyToSubmit}
              evaluationMutation={evaluationMutation}
            />

            {/* API Response Display */}
            <EvaluationResult
              ref={evaluationRef}
              evaluationMutation={evaluationMutation}
            />

            {/* Error Message */}
            {evaluationMutation.isError && (
              <ErrorMessage
                message={
                  evaluationMutation.error?.response?.data?.error ||
                  evaluationMutation.error?.message ||
                  'Failed to submit speech for evaluation.'
                }
              />
            )}

            {/* Next Test Button */}
            <div className="flex justify-center border-t border-slate-700 pt-6 mt-4">
              <button
                onClick={handleStartTest}
                disabled={generating}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 animate-pulse hover:animate-none"
              >
                {generating ? 'Generating Next Paragraph...' : 'Try Another Paragraph'}
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  )
}

export default App
