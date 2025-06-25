// api/registro.js

import admin from "firebase-admin";

// Inicialización usando variables de entorno
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { nombre, telefono, edad, curso, motivo } = req.body;

  if (!nombre || !telefono || !curso) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    const db = admin.firestore();
    const docRef = await db.collection("registros").add({
      nombre,
      telefono,
      edad,
      curso,
      motivo,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return res.status(200).json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Error en handler:", error);
    return res
      .status(500)
      .json({ error: "Error al registrar", detalle: error.message });
  }
}
