// Pega aquí tus datos (ver instrucciones). La clave pública de Wompi y la config de Firebase NO son secretas.
export const CONFIG = {
  firebase: {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    projectId: "TU_PROYECTO",
    appId: "TU_APP_ID"
  },
  wompiPublicKey: "pub_test_XXXXXXXX",   // cámbiala por pub_prod_... al salir a producción
  signatureEndpoint: "/api/wompi",       // función serverless que firma el pago
  whatsapp: "573204265056"
};
