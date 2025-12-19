import { defineStore } from "pinia";
import { pb } from "@/pb";
import { fileUrl } from "@/services/users.service";

/*
  📌 STORE DE ADMINISTRACIÓN
  Maneja:
    - Usuarios (colección AUTH REAL)
    - Playlists
  Este store centraliza toda comunicación con PocketBase.
*/

export const useAdminStore = defineStore("adminStore", {
  state: () => ({
    users: [],       // Lista de usuarios (auth)
    playlists: [],   // Lista de playlists
  }),

  actions: {

    /* ============================================================
       USUARIOS (colección AUTH REAL)
       ============================================================ */

    async loadUsers() {
      try {
        /*
          ⚠ IMPORTANTE:  
          Usamos "_pb_users_auth_" porque es la colección
          REAL de usuarios que trae:
            - email
            - username
            - verified
            - avatar
            - name
            - displayName
          etc.
        */
        const list = await pb.collection("_pb_users_auth_").getFullList({
          sort: "-created"
        });

        this.users = list;

      } catch (error) {
        console.error("Error loading users:", error);
        throw error;
      }
    },


    async createUser(data) {
      try {
        const fd = new FormData();

        // Si no hay username, se genera basado en el email
        const username = data.username || data.email.split("@")[0];

        /*
          📝 Campos obligatorios en la colección AUTH:
            - username
            - email
            - password
            - passwordConfirm
          Si falta alguno → PocketBase falla.
        */
        fd.append("username", username);
        fd.append("email", data.email);
        fd.append("password", data.password);
        fd.append("passwordConfirm", data.password);

        // Campos adicionales que creaste en tu schema
        fd.append("name", data.name);
        fd.append("displayName", data.name);
        fd.append("role", data.role || "user");

        // Avatar (solo si existe)
        if (data.avatarFile) {
          fd.append("avatar", data.avatarFile);
        }

        /*
          Crear usuario en colección AUTH REAL
        */
        const newUser = await pb.collection("_pb_users_auth_").create(fd);

        await this.loadUsers();
        return newUser;

      } catch (error) {
        console.error("Error creating user:", error);

        // PocketBase envía errores por campo, este bloque los formatea
        if (error.response?.data) {
          const errors = error.response.data;
          const errorMessages = Object.entries(errors)
            .map(([field, msg]) => `${field}: ${msg.message || msg}`)
            .join("\n");
          throw new Error(errorMessages);
        }

        throw error;
      }
    },


    async updateUser(id, fd) {
      try {
        /*
          ⚠ NO reconstruimos el FormData aquí.
          El componente ya envió un FormData completo.
        */
        const updatedUser = await pb.collection("_pb_users_auth_").update(id, fd);

        await this.loadUsers();
        return updatedUser;

      } catch (error) {
        console.error("Error updating user:", error);

        if (error.response?.data) {
          const errors = error.response.data;
          const errorMessages = Object.entries(errors)
            .map(([field, msg]) => `${field}: ${msg.message || msg}`)
            .join("\n");
          throw new Error(errorMessages);
        }

        throw error;
      }
    },


    async deleteUser(id) {
      try {
        /*
          ⚠ Al eliminar usuarios AUTH:
            - Todos sus tokens quedan inválidos
            - No se puede recuperar
        */
        await pb.collection("_pb_users_auth_").delete(id);
        await this.loadUsers();

      } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
      }
    },


    /* ============================================================
       🎵 PLAYLISTS
       ============================================================ */

    async loadPlaylists() {
      try {
        /*
          expand: "owner"  
          Esto trae la información del usuario dueño
        */
        const list = await pb.collection("playlists").getFullList({
          expand: "owner",
          sort: "-created"
        });

        this.playlists = list;

      } catch (error) {
        console.error("Error loading playlists:", error);
        throw error;
      }
    },


    async createPlaylist(data) {
      try {
        const fd = new FormData();

        fd.append("title", data.title);
        fd.append("owner", data.owner);      // ID de usuario AUTH
        fd.append("privacy", data.privacy || "public");

        if (data.coverFile) {
          fd.append("cover", data.coverFile);
        }

        const newPlaylist = await pb.collection("playlists").create(fd);

        await this.loadPlaylists();
        return newPlaylist;

      } catch (error) {
        console.error("Error creating playlist:", error);

        if (error.response?.data) {
          const errors = error.response.data;
          const errorMessages = Object.entries(errors)
            .map(([field, msg]) => `${field}: ${msg.message || msg}`)
            .join("\n");
          throw new Error(errorMessages);
        }

        throw error;
      }
    },


    async updatePlaylist(id, fd) {
      try {
        const updatedPlaylist = await pb.collection("playlists").update(id, fd);

        await this.loadPlaylists();
        return updatedPlaylist;

      } catch (error) {
        console.error("Error updating playlist:", error);

        if (error.response?.data) {
          const errors = error.response.data;
          const errorMessages = Object.entries(errors)
            .map(([field, msg]) => `${field}: ${msg.message || msg}`)
            .join("\n");
          throw new Error(errorMessages);
        }

        throw error;
      }
    },


    async deletePlaylist(id) {
      try {
        await pb.collection("playlists").delete(id);
        await this.loadPlaylists();

      } catch (error) {
        console.error("Error deleting playlist:", error);
        throw error;
      }
    },

  }
});

