// src/stores/userStore.js

// Importa Pinia para crear el store
import { defineStore } from "pinia";

// Importa funciones relacionadas con la autenticación de usuarios
// Estas funciones deben manejar el login, logout, obtener usuario actual
// y registro dentro del servicio users.service.js
import { login, logout, currentUser, register } from "@/services/users.service";

// Store encargado de manejar el estado de autenticación del usuario.
// Representa el usuario actual en sesión y provee acciones para login, logout y registro.
export const useUserStore = defineStore("userStore", {

  // Estado reactivo del store
  state: () => ({
    // user almacena el usuario actual.
    // currentUser() debe devolver el usuario autenticado si existe,
    // o null si no hay sesión activa.
    user: currentUser(),
  }),

  actions: {

    /*
      Inicia sesión con email y contraseña.

      login(email, pass):
        - realiza la autenticación en PocketBase o API
        - devuelve los datos del usuario si las credenciales son correctas

      La acción guarda ese usuario en el estado, lo que permite
      acceder a los datos desde toda la aplicación.
    */
    async loginUser(email, pass) {
      const u = await login(email, pass);
      this.user = u;
      return u;
    },

    /*
      Cierra la sesión del usuario.

      logout() debe encargarse de:
        - limpiar la sesión en PocketBase
        - borrar tokens persistidos
        - invalidar sesión del lado del servidor (si aplica)

      El estado user se establece en null para reflejar
      que ya no hay un usuario autenticado.
    */
    async logoutUser() {
      logout();
      this.user = null;
    },

    /*
      Registra un nuevo usuario en el sistema.

      register(data):
        - crea el usuario en la base de datos
        - inicia sesión automáticamente o devuelve los datos

      Se asigna el usuario al estado para mantener la sesión activa
      tras completar el registro.
    */
    async registerUser(data) {
      const u = await register(data);
      this.user = u;
      return u;
    }
  }
});

