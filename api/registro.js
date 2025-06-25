// api/registro.js
const admin = require('firebase-admin')


// DEBUG: imprime si llegan las ENV vars
console.log('> ENV PROJECT_ID:', process.env.FIREBASE_PROJECT_ID?.slice(0,10),'…');
console.log('> ENV CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('> ENV PRIVATE_KEY startsWith -----BEGIN:', process.env.FIREBASE_PRIVATE_KEY?.startsWith('-----BEGIN'));

const serviceAccount = {
  projectId:   process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
}


// Reconstruye tus creds desde ENV
const serviceAccount = {
  projectId:   process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

const db = admin.firestore()

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Usa POST con JSON' })
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
