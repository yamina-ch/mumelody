// src/pb.js
import PocketBase from "pocketbase";

export const pb = new PocketBase("http://127.0.0.1:8090");

// 🔥 PocketBase ya carga y guarda la sesión automáticamente en localStorage
// No necesitas llamar a .load() o .save() manualmente

// Opcional: Si quieres ver cuando cambia la autenticación
pb.authStore.onChange(() => {
  console.log("Auth changed:", pb.authStore.isValid);
});
