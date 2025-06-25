import admin from 'firebase-admin'

// Parseamos la ENV que guardaste en Vercel
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)

import admin from 'firebase-admin'

export default async function handler(req, res) {
  console.log('ℹ️ FIREBASE_SERVICE_ACCOUNT existe:', !!process.env.FIREBASE_SERVICE_ACCOUNT)
  try {
    const creds = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    console.log('ℹ️ Service Account email:', creds.client_email)
  } catch (e) {
    console.error('❌ JSON inválido:', e.message)
    return res.status(500).json({ error: 'Credenciales inválidas', detalle: e.message })
  }
  // …inicialización y resto…
}


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  })
}

const db = admin.firestore()

export default async function handler(req, res) {
  try {
    const { nombre, telefono, edad, curso, motivo } = req.body
    if (!nombre || !telefono || !edad || !curso || !motivo) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }
    const doc = await db
      .collection('registros')
      .add({ nombre, telefono, edad, curso, motivo, createdAt: admin.firestore.FieldValue.serverTimestamp() })
    res.status(201).json({ success: true, id: doc.id })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al registrar', detalle: e.message })
  }
}
