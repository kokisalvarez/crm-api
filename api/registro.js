import admin from 'firebase-admin'

// Parseamos la ENV que guardaste en Vercel
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)

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
