import React, { useState } from 'react'
import EmotionDetector from './components/EmotionDetector.jsx'

export default function App() {
  const [ready, setReady] = useState(false)

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>🎭 Real‑Time Emotion Detector - BOU 2025</h1>
          <div className="actions">
            {!ready && <span className="small">Models will auto‑load (~2–6MB)</span>}
          </div>
        </div>
        <div className="row">
          <EmotionDetector onModelsLoaded={() => setReady(true)} />
          <footer>face-api.js • tiny face detector + 68 landmarks + expressions</footer>
        </div>
      </div>
    </div>
  )
}
