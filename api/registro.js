// api/registro.js

const admin = require('firebase-admin')

// Carga las credenciales desde la ENV var
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  })
}

const db = admin.firestore()

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ error: 'Method not allowed. Usa POST con JSON' })
  }

  const { nombre, telefono, edad, curso, motivo } = req.body || {}
  if (!nombre || !telefono || !edad || !curso || !motivo) {
    return res.status(400).json({ error: 'Faltan campos requeridos' })
  }

  try {
    const docRef = await db.collection('registros').add({
      nombre,
      telefono,
      edad,
      curso,
      motivo,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })
    return res.status(201).json({ success: true, id: docRef.id })
  } catch (e) {
    console.error('Firestore error:', e)
    return res.status(500).json({ error: 'Error al registrar', detalle: e.message })
  }
}
