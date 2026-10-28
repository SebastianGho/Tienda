// Función serverless para Vercel (gratis). Variable de entorno: WOMPI_INTEGRITY_SECRET
import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { reference, amountInCents } = req.body || {};
  if (!reference || !Number.isInteger(amountInCents) || amountInCents < 100000)
    return res.status(400).json({ error: "Datos inválidos" });
  const raw = `${reference}${amountInCents}COP${process.env.WOMPI_INTEGRITY_SECRET}`;
  res.status(200).json({ signature: crypto.createHash("sha256").update(raw).digest("hex") });
}
