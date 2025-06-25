// api/registro.js

// ①: Volcamos TODAS las env vars relevantes
console.log('>>> ENV FIREBASE_PROJECT_ID:',    JSON.stringify(process.env.FIREBASE_PROJECT_ID))
console.log('>>> ENV FIREBASE_CLIENT_EMAIL:',  JSON.stringify(process.env.FIREBASE_CLIENT_EMAIL))
console.log('>>> ENV FIREBASE_PRIVATE_KEY:',    process.env.FIREBASE_PRIVATE_KEY
                                                   ? `[string of length ${process.env.FIREBASE_PRIVATE_KEY.length}]`
                                                   : null)
console.log('>>> ENV FIREBASE_SERVICE_ACCOUNT:', process.env.FIREBASE_SERVICE_ACCOUNT
                                                   ? `[string of length ${process.env.FIREBASE_SERVICE_ACCOUNT.length}]`
                                                   : null)


const admin = require('firebase-admin')

// ─── DEPURACIÓN ──────────────────────────────────────────────────────────────
// Estas 3 líneas **deben** imprimirse en los logs al invocar tu función
console.log('> ENV PROJECT_ID:    ', process.env.FIREBASE_PROJECT_ID);
console.log('> ENV CLIENT_EMAIL:  ', process.env.FIREBASE_CLIENT_EMAIL);
console.log('> ENV PRIVATE_KEY ok:', typeof process.env.FIREBASE_PRIVATE_KEY==='string', ' length=', process.env.FIREBASE_PRIVATE_KEY?.length);
// ───────────────────────────────────────────────────────────────────────────────

const serviceAccount = {
  projectId:   process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  // CORS + preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sólo POST' });
  }

  const { nombre, telefono, edad, curso, motivo } = req.body || {};
  if (!nombre||!telefono||!edad||!curso||!motivo) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  try {
    const docRef = await db.collection('registros').add({
      nombre, telefono, edad, curso, motivo,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return res.status(201).json({ success: true, id: docRef.id });
  } catch (e) {
    console.error('Firestore error:', e);
    return res.status(500).json({ error: 'Error al registrar', detalle: e.message });
  }
};
