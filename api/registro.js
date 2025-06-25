// api/registro.js

import admin from "firebase-admin";
import serviceAccount from "../keys/firebase-service-account.json";

// Inicializa Firebase Admin si aún no está hecho
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req, res) {
  // Solo aceptamos POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { nombre, telefono, edad, curso, motivo } = req.body;

  // Validación básica
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
    return res
      .status(500)
      .json({ error: "Error al registrar", detalle: error.message });
  }
}
