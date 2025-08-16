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

 // Funny IT company texts for each emotion (with Unicode emojis)
const funnyTexts = {
  happy: [
    'First successful compile! \u{1F680}',
    'The bug is gone! Like, really gone! \u{1F389}',
    'Just pushed to production without breaking anything. \u2728',
    'The client actually loves the design. \u{1F60A}',
    'Found free coffee in the break room. \u2615',
    'My code passed all the unit tests. \u2705',
    'The build finished in under 5 minutes. \u{1F4A8}',
    'Solved a bug that was three months old. \u{1F973}'
  ],
  sad: [
    'My code passed on my machine but not in production. \u{1F62D}',
    'The server is down. Again. \u{1F480}',
    'The deadline moved up. \u{1F629}',
    'Forgot to save the file. \u{1F926}\u200D\u2642\uFE0F',
    'Just got a "null pointer exception." \u{1F625}',
    'The ticket got reopened. \u{1F61E}',
    'The database is corrupt. \u{1F622}',
    'My keyboard just got a coffee bath. \u{1F635}'
  ],
  angry: [
    'Merge conflict on the main branch. \u{1F621}',
    'Someone pushed without testing. \u{1F92C}',
    'Waiting for the build to finish. \u{1F620}',
    'My IDE crashed again. \u{1F4A5}',
    'The Wi-Fi went out during a meeting. \u{1F624}',
    'Someone broke the build. \u{1F4A2}',
    'This legacy code is a complete mess. \u{1F479}',
    'The user said "It just doesn\'t work." \u{1F620}'
  ],
  surprised: [
    'My code worked on the first try! \u{1F632}',
    'The legacy code is actually well-documented. \u{1F92F}',
    'The meeting ended 15 minutes early. \u{1F62E}',
    'The server is actually up and running. \u{1F633}',
    'Got an unexpected compliment from the boss. \u{1F929}',
    'A "quick fix" actually took only five minutes. \u{1F631}',
    'Saw a bug fix that was actually a single line. \u{1F62E}'
  ],
  fearful: [
    'Pushing code to production on a Friday. \u{1F976}',
    'The server rack is making a new sound. \u{1F630}',
    'Live demo in front of the whole company. \u{1F62C}',
    'The ticket says "urgent." \u{1F631}',
    'The client wants to "hop on a quick call." \u{1F628}',
    'My monitor just went black. \u{1FAE3}',
    'I hear a fan spinning way too fast. \u{1F635}\u200D\u{1F4AB}',
    'The error log is a mile long. \u{1F628}'
  ],
  disgusted: [
    'Someone committed code with no comments. \u{1F922}',
    'Found a function with 500 lines of code. \u{1F92E}',
    'Reading someone else spaghetti code. \u{1F635}',
    'Finding an 8-year-old TODO in the codebase. \u{1F612}',
    'The client wants us to use Internet Explorer. \u{1F620}',
    'The code review comments are just one-word answers. \u{1F644}'
  ],
  neutral: [
    'Waiting for a response from the API. \u23F3',
    'Just staring at the terminal. \u{1F610}',
    'Loading. please wait. \u{1F504}',
    'Lost in a Stack Overflow rabbit hole. \u{1F9D0}',
    'The ultimate poker face during a meeting. \u{1F636}',
    'Just updated my status to "AFK." \u{1F9CD}',
    'The progress bar is stuck at 99%. \u{1F611}',
    'Debating whether to refactor or just leave it. \u{1F914}'
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
