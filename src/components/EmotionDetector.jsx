import React, { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'

// Load all models from GitHub Pages
async function loadAllModels(url) {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(url),
    faceapi.nets.faceLandmark68Net.loadFromUri(url),
    faceapi.nets.faceExpressionNet.loadFromUri(url)
  ])
}

export default function EmotionDetector({ onModelsLoaded }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('Loading models.')
  const [topText, setTopText] = useState(null)
  const lastChangeRef = useRef(Date.now())

  // Funny IT company texts for each emotion
  const funnyTexts = {
    happy: [
      'This face just won the lottery 🎉',
      'Smiling like free WiFi was found 😁',
      'Powered by chocolate 🍫',
      'Grinning like a meme template 😂',
      'Happy as a cat with a laser pointer 🐱'
    ],
    sad: [
      'Thinking about Monday mornings 😢',
      'Lost WiFi connection 📶🚫',
      'Missing the last slice of pizza 🍕',
      'Remembering old Facebook posts 📸',
      'Crying over chopped onions 🧅'
    ],
    angry: [
      'Someone ate their snacks 😡',
      'Laptop crashed without saving 💻🔥',
      'Standing in a long queue 🕐',
      'Auto-correct betrayed them 📱',
      'Traffic jam face 🚗🚗🚗'
    ],
    surprised: [
      'Saw their exam results 😲',
      'Someone brought donuts 🍩',
      'The code worked first try 🤯',
      'Unexpected plot twist 🎬',
      'Dog just started talking 🐶'
    ],
    fearful: [
      'Watching a horror movie alone 👻',
      'Heard a noise at 3 AM 🌙',
      'Checking electricity bill ⚡',
      'Trying roller coaster for first time 🎢',
      'Remembered embarrassing moment 😳'
    ],
    disgusted: [
      'Tasted pineapple on pizza 🍍🍕',
      'Smelled mystery fridge food 🥴',
      'Stepped on something squishy 👟',
      'Read internet comments 📝',
      'Saw socks with sandals 🧦👡'
    ],
    neutral: [
      'Loading… please wait ⏳',
      'Thinking about lunch 🍔',
      'Face of pure WiFi stability 📡',
      'Lost in deep thoughts 🧘',
      'The ultimate poker face 🎭'
    ]
  }

  useEffect(() => {
    let stream
    let raf = null
    let isMounted = true

    async function start() {
      try {
        setStatus('Loading models.')
        await loadAllModels(
          'https://jamsheer-thottathil.github.io/ai-emotion-detector/models'
        )
        onModelsLoaded?.()
        setStatus('Requesting camera.')
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        })
        if (!isMounted) return
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setStatus('Detecting.')
          detectLoop()
        }
      } catch (err) {
        console.error(err)
        setStatus('Error: ' + err.message)
      }
    }

    async function detectLoop() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return

      const { videoWidth, videoHeight } = video
      canvas.width = videoWidth
      canvas.height = videoHeight

      const displaySize = { width: videoWidth, height: videoHeight }
      const opts = new faceapi.TinyFaceDetectorOptions({
        inputSize: 224,
        scoreThreshold: 0.5
      })

      const detections = await faceapi
        .detectAllFaces(video, opts)
        .withFaceLandmarks()
        .withFaceExpressions()

      const resized = faceapi.resizeResults(detections, displaySize)
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      faceapi.draw.drawDetections(canvas, resized)
      faceapi.draw.drawFaceLandmarks(canvas, resized)

      if (resized.length > 0) {
        const exps = resized[0].expressions
        const [label] = Object.entries(exps).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )

        // Update text every 5 seconds
        if (Date.now() - lastChangeRef.current >= 5000) {
          const pool = funnyTexts[label] || funnyTexts['neutral']
          const randomText = pool[Math.floor(Math.random() * pool.length)]
          setTopText(randomText)
          lastChangeRef.current = Date.now()
        }
      }

      raf = requestAnimationFrame(detectLoop)
    }

    start()

    return () => {
      isMounted = false
      if (raf) cancelAnimationFrame(raf)
      if (videoRef.current) videoRef.current.pause()
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [onModelsLoaded])

  return (
    <div className="stage" style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        playsInline
        muted
        style={{ width: '100%', borderRadius: '12px' }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      <div
        className="badge"
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '12px',
          fontSize: '18px'
        }}
      >
        {topText || status}
      </div>
    </div>
  )
}
