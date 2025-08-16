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

// Expanded funny texts with Unicode emojis
const funnyTexts = {
  happy: [
    'First successful compile! \u{1F680}',
    'The bug is gone! Like, really gone! \u{1F389}',
    'Just pushed to production without breaking anything. \u2728',
    'The client actually loves the design. \u{1F60A}',
    'Found free coffee in the break room. \u2615',
    'My code passed all the unit tests. \u2705',
    'The build finished in under 5 minutes. \u{1F4A8}',
    'Solved a bug that was three months old. \u{1F973}',
    'The meeting ended 5 minutes early. \u{1F601}',
    'Someone complimented my presentation. \u{1F60D}',
    'The Wi-Fi is blazing fast today. \u{1F4F6}',
    'I got my favorite snack. \u{1F36A}',
    'The office printer worked on the first try. \u{1F4BE}',
    'Found a 5-dollar bill in my pocket. \u{1F4B5}',
    'Team lunch was amazing. \u{1F37D}',
    'My favorite song is playing. \u{1F3B5}',
    'My chair actually feels comfortable today. \u{1F6CB}',
    'Successfully refactored messy code. \u{1F4AA}',
    'My email inbox is empty. \u{2705}',
    'Got a free swag from the conference. \u{1F381}'
  ],
  sad: [
    'My code passed on my machine but not in production. \u{1F62D}',
    'The server is down. Again. \u{1F480}',
    'The deadline moved up. \u{1F629}',
    'Forgot to save the file. \u{1F926}\u200D\u2642\uFE0F',
    'Just got a "null pointer exception." \u{1F625}',
    'The ticket got reopened. \u{1F61E}',
    'The database is corrupt. \u{1F622}',
    'My keyboard just got a coffee bath. \u{1F635}',
    'Lost my pen for 10 minutes. \u{1F61F}',
    'Missed the team stand-up. \u{1F62D}',
    'Laptop battery died mid-presentation. \u{1F62B}',
    'Accidentally deleted the wrong branch. \u{1F635}',
    'The coffee machine is broken. \u{1F375}',
    'My favorite snack is gone. \u{1F36A}',
    'Forgot my lunch at home. \u{1F629}',
    'The Wi-Fi is acting up again. \u{1F4F6}',
    'Code review feedback is brutal. \u{1F622}',
    'I can’t find my glasses. \u{1F97D}',
    'Printer jam before deadline. \u{1F4A5}',
    'Lost my meeting link. \u{1F4BB}'
  ],
  angry: [
    'Merge conflict on the main branch. \u{1F621}',
    'Someone pushed without testing. \u{1F92C}',
    'Waiting for the build to finish. \u{1F620}',
    'My IDE crashed again. \u{1F4A5}',
    'The Wi-Fi went out during a meeting. \u{1F624}',
    'Someone broke the build. \u{1F4A2}',
    'This legacy code is a complete mess. \u{1F479}',
    'The user said "It just doesn\'t work." \u{1F620}',
    'Coffee spilled on the keyboard. \u2615',
    'Colleague removed my branch. \u{1F62C}',
    'Stack Overflow is down. \u{1F62D}',
    'The meeting is running way too long. \u{1F624}',
    'Forgot the password again. \u{1F615}',
    'Laptop overheated. \u{1F975}',
    'The monitor flickered. \u{1F626}',
    'Code reviewer rejected everything. \u{1F616}',
    'Keyboard keys are sticking. \u{1F622}',
    'Server crashed during demo. \u{1F635}',
    'Build logs are full of red errors. \u{1F621}',
    'The backup didn’t work. \u{1F4A2}'
  ],
  surprised: [
    'My code worked on the first try! \u{1F632}',
    'The legacy code is actually well-documented. \u{1F92F}',
    'The meeting ended 15 minutes early. \u{1F62E}',
    'The server is actually up and running. \u{1F633}',
    'Got an unexpected compliment from the boss. \u{1F929}',
    'A "quick fix" actually took only five minutes. \u{1F631}',
    'Saw a bug fix that was actually a single line. \u{1F62E}',
    'Found $20 on the floor. \u{1F4B5}',
    'Unexpected pizza delivery. \u{1F355}',
    'Colleague brought donuts. \u{1F369}',
    'The coffee machine is working again. \u2615',
    'Printer finally printed. \u{1F4BE}',
    'My package arrived early. \u{1F69A}',
    'Found a hidden Easter egg in code. \u{1F973}',
    'Someone sent me a meme. \u{1F923}',
    'Team celebrated a small win. \u{1F389}',
    'Email replied instantly. \u{1F4E7}',
    'I solved a problem no one could. \u{1F60E}',
    'The bug was simpler than expected. \u{1F92F}',
    'Found a forgotten $5 in my wallet. \u{1F4B5}'
  ],
  fearful: [
    'Pushing code to production on a Friday. \u{1F976}',
    'The server rack is making a new sound. \u{1F630}',
    'Live demo in front of the whole company. \u{1F62C}',
    'The ticket says "urgent." \u{1F631}',
    'The client wants to "hop on a quick call." \u{1F628}',
    'My monitor just went black. \u{1FAE3}',
    'I hear a fan spinning way too fast. \u{1F635}\u200D\u{1F4AB}',
    'The error log is a mile long. \u{1F628}',
    'Lightning outside during demo. \u26A1',
    'Forgot to backup files. \u{1F631}',
    'The power went out. \u{1F4A1}',
    'Received an unexpected system alert. \u{1F631}',
    'The Wi-Fi disconnected during upload. \u{1F4F6}',
    'Keyboard stopped responding. \u{1F635}',
    'Accidentally deleted important files. \u{1F62C}',
    'Hearing strange server beeps. \u{1F631}',
    'Forgot login password for the database. \u{1F62F}',
    'Laptop suddenly shut down. \u{1F635}',
    'Monitor showed blue screen. \u{1F62D}',
    'The meeting room projector failed. \u{1F632}'
  ],
  disgusted: [
    'Someone committed code with no comments. \u{1F922}',
    'Found a function with 500 lines of code. \u{1F92E}',
    'Reading someone else spaghetti code. \u{1F635}',
    'Finding an 8-year-old TODO in the codebase. \u{1F612}',
    'The client wants us to use Internet Explorer. \u{1F620}',
    'The code review comments are just one-word answers. \u{1F644}',
    'Office fridge smells bad. \u{1F92E}',
    'Stale coffee in the machine. \u2615',
    'Someone left dirty dishes. \u{1F92E}',
    'Colleague chews too loudly. \u{1F922}',
    'Printer jammed with paper. \u{1F622}',
    'Desk clutter is unbearable. \u{1F629}',
    'Team chat is full of gifs. \u{1F92F}',
    'Keyboard sticky with soda. \u{1F92E}',
    'Forgot to submit timesheet. \u{1F622}',
    'The build broke again. \u{1F621}',
    'Meeting went overtime. \u{1F612}',
    'Stuck in elevator with coworkers. \u{1F635}',
    'Found a bug in production. \u{1F622}',
    'Accidentally deleted history. \u{1F622}'
  ],
  neutral: [
    'Waiting for a response from the API. \u23F3',
    'Just staring at the terminal. \u{1F610}',
    'Lost in a Stack Overflow rabbit hole. \u{1F9D0}',
    'The ultimate poker face during a meeting. \u{1F636}',
    'Just updated my status to "AFK." \u{1F9CD}',
    'The progress bar is stuck at 99%. \u{1F611}',
    'Debating whether to refactor or just leave it. \u{1F914}',
    'Listening to the meeting in silence. \u{1F9D0}',
    'Sipping water slowly. \u{1F9C0}',
    'Typing slowly… \u{1F4DD}',
    'Looking at code, thinking… \u{1F914}',
    'Waiting for npm install. \u23F3',
    'The mouse is unresponsive. \u{1F610}',
    'Staring at the ceiling. \u{1F644}',
    'Reading emails silently. \u{1F9D0}',
    'Checking notifications. \u{1F50D}',
    'Organizing desktop files. \u{1F4C1}',
    'Reviewing old commits. \u{1F4DD}',
    'Watching tutorial videos. \u{1F3AC}',
    'Monitoring server logs. \u{1F4C8}'
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
