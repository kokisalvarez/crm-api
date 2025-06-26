// api/registro.js

const admin = require("firebase-admin");

// DEBUG: Verifica que la var de entorno existe
console.log(
  ">> ENV VAR FIREBASE_SERVICE_ACCOUNT_BASE64 length:",
  process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.length
);

// Intenta parsear el JSON Base64
let serviceAccount;
try {
  const raw = Buffer
    .from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || "", "base64")
    .toString("utf8");

  // DEBUG: Muestra los primeros 100 caracteres del JSON decodificado
  console.log(
    ">> Decoded JSON starts with:",
    raw.substring(0, 100).replace(/\r?\n/g, "\\n")
  );

  serviceAccount = JSON.parse(raw);
} catch (e) {
  console.error(">> ERROR parsing Base64 JSON:", e);
}

// Inicializa Firebase Admin con las credenciales
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Sólo POST" });
  }

  const { nombre, telefono, edad, curso, motivo } = req.body || {};
  if (!nombre || !telefono || !edad || !curso || !motivo) {
    return res.status(400).json({ error: "Faltan campos" });
  }

  try {
    const docRef = await db.collection("registros").add({
      nombre,
      telefono,
      edad,
      curso,
      motivo,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return res.status(201).json({ success: true, id: docRef.id });
  } catch (e) {
    console.error("Firestore error:", e);
    return res
      .status(500)
      .json({ error: "Error al registrar", detalle: e.message });
  }
};
