// Simple downloader to fetch face-api.js model files into /public/models
// Run: node scripts/download-models.js

import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const outDir = path.resolve(__dirname, '../public/models')
fs.mkdirSync(outDir, { recursive: true })

// Using Vlad Mandic's hosted models (public GitHub pages)
const BASE = 'https://vladmandic.github.io/face-api/model'

const files = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1',
]

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.close()
        fs.unlink(dest, () => {})
        return reject(new Error(`Failed ${url} -> ${res.statusCode}`))
      }
      res.pipe(file)
      file.on('finish', () => file.close(resolve))
    }).on('error', (err) => {
      fs.unlink(dest, () => {})
      reject(err)
    })
  })
}

;(async () => {
  console.log('Downloading face-api.js models to', outDir)
  for (const f of files) {
    const url = `${BASE}/${f}`
    const dest = path.join(outDir, f)
    if (fs.existsSync(dest)) {
      console.log('✓ exists', f)
      continue
    }
    process.stdout.write('⇣ ' + f + ' ... ')
    try {
      await download(url, dest)
      console.log('done')
    } catch (e) {
      console.log('error')
      console.error(e.message)
      process.exitCode = 1
    }
  }
})()
