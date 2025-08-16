import * as faceapi from 'face-api.js'

export async function loadAllModels(modelsBasePath = '/models') {
  // Load tiny face detector + 68 landmarks + expressions
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(modelsBasePath),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelsBasePath),
    faceapi.nets.faceExpressionNet.loadFromUri(modelsBasePath),
  ])
}
