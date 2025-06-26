// api/registro.js

const admin = require("firebase-admin");

// Decodifica JSON desde Base64
function getServiceAccount() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const json = Buffer.from(b64, "base64").toString("utf8");
  return JSON.parse(json);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(getServiceAccount()),
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  // ...resto de tu handler sin cambios...
};

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sólo POST' })
  }

  const { nombre, telefono, edad, curso, motivo } = req.body || {}
  if (!nombre||!telefono||!edad||!curso||!motivo) {
    return res.status(400).json({ error: 'Faltan campos' })
  }

  try {
    const docRef = await db.collection('registros').add({
      nombre, telefono, edad, curso, motivo,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })
    return res.status(201).json({ success: true, id: docRef.id })
  } catch (e) {
    console.error('Firestore error:', e)
    return res.status(500).json({ error: 'Error al registrar', detalle: e.message })
  }
}
