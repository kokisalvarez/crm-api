// api/registro.js
import admin from 'firebase-admin'
import serviceAccount from '../keys/firebase-service-account.json'

// Inicializa Firebase Admin una sola vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  })
}

const db = admin.firestore()

// Funciones de validación simples
const validaString = (valor, nombreCampo, min = 1) => {
  if (!valor || typeof valor !== 'string' || valor.trim().length < min) {
    return `${nombreCampo} es requerido y debe tener al menos ${min} caracteres`
  }
  return null
}

export default async function handler(req, res) {
  // 1) CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // 2) Sólo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  // 3) Body JSON
  const { nombre, telefono, edad, curso, motivo } = req.body

  // 4) Validaciones
  const errores = {}
  const e1 = validaString(nombre, 'Nombre', 2)
  if (e1) errores.nombre = e1

  const e2 = validaString(telefono, 'Teléfono', 5)
  if (e2) errores.telefono = e2

  if (typeof edad !== 'number' || edad < 18 || edad > 80) {
    errores.edad = 'Edad debe ser número entre 18 y 80'
  }

  const e4 = validaString(curso, 'Curso', 3)
  if (e4) errores.curso = e4

  const e5 = validaString(motivo, 'Motivo', 10)
  if (e5) errores.motivo = e5

  if (Object.keys(errores).length) {
    return res.status(400).json({
      error: 'Errores de validación',
      detalles: errores
    })
  }

  try {
    // 5) Guarda en Firestore
    const docRef = await db.collection('registros').add({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      edad,
      curso: curso.trim(),
      motivo: motivo.trim(),
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    })

    // 6) Respuesta exitosa
    return res.status(201).json({
      success: true,
      id: docRef.id,
      message: 'Registro creado'
    })
  } catch (err) {
    console.error('Error al registrar:', err)
    return res.status(500).json({
      error: 'Error al registrar',
      detalle: err.message
    })
  }
}
