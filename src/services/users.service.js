// src/services/users.service.js
import { pb } from "@/pb";

/**
 * Login
 */
export async function login(email, password) {
  const auth = await pb.collection("users").authWithPassword(email, password);
  return auth.record;
}

/**
 * Register
 * IMPORTANTE: PocketBase auth collections requieren campos específicos
 */
export async function register(data) {
  try {
    // Crear el registro del usuario
    const userData = {
      username: data.username,
      email: data.email,
      emailVisibility: true,
      password: data.password,
      passwordConfirm: data.password, // Debe ser idéntico a password
      name: data.name,
      displayName: data.displayName
    };

    console.log("📤 Enviando datos de registro:", {
      ...userData,
      password: "***",
      passwordConfirm: "***"
    });

    // Si hay avatar, usar FormData
    if (data.avatar) {
      const fd = new FormData();
      Object.keys(userData).forEach(key => {
        fd.append(key, userData[key]);
      });
      fd.append("avatar", data.avatar);
      
      const user = await pb.collection("users").create(fd);
      
      // Login automático después del registro
      await login(data.email, data.password);
      
      return user;
    }

    // Sin avatar, enviar como JSON
    const user = await pb.collection("users").create(userData);
    
    // Login automático después del registro
    await login(data.email, data.password);
    
    return user;

  } catch (error) {
    console.error("❌ Error completo en register:", error);
    console.error("❌ Response data:", error.response?.data);
    throw error;
  }
}

/**
 * Logout
 */
export function logout() {
  pb.authStore.clear();
}

/**
 * Current user
 */
export function currentUser() {
  return pb.authStore.model;
}

/**
 * Is admin
 */
export function isAdmin() {
  const user = currentUser();
  return user?.role === "admin";
}

/**
 * File URL helper
 */
export function fileUrl(record, filename, thumb = null) {
  if (!record || !filename) return "";
  return pb.files.getUrl(record, filename, { thumb });
}
