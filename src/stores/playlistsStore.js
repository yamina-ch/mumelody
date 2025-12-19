// Store para manejar playlists del usuario con REALTIME API
import { defineStore } from "pinia";
import {
  listMyPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  searchPlaylists,
  getPlaylist
} from "@/services/playlists.service";
import pb from "@/services/pocketbase";

export const usePlaylistsStore = defineStore("playlistsStore", {
  state: () => ({
    items: [],
    current: null,
    realtimeActive: false, // Indicador de si está activo el realtime
  }),

  actions: {
    async loadMine() {
      const res = await listMyPlaylists();
      this.items = res.items;
    },

    async loadOne(id) {
      const pl = await getPlaylist(id);
      this.current = pl;
      return pl;
    },

    async create(data) {
      await createPlaylist(data);
      await this.loadMine();
    },

    async update(id, data) {
      await updatePlaylist(id, data);
      await this.loadMine();
    },

    async remove(id) {
      await deletePlaylist(id);
      await this.loadMine();
    },

    async search(text) {
      const res = await searchPlaylists({ text });
      this.items = res.items;
    },

    // 🔴 NUEVO: Suscribirse a cambios en tiempo real
    subscribeToRealtime() {
      if (this.realtimeActive) {
        console.log('⚠️ Realtime ya está activo');
        return;
      }

      const user = pb.authStore.model;
      if (!user) {
        console.warn('⚠️ Usuario no autenticado, no se puede suscribir');
        return;
      }

      console.log('🔴 ACTIVANDO Realtime para playlists del usuario:', user.id);

      // Suscribirse a TODOS los cambios en la colección 'playlists'
      pb.collection('playlists').subscribe('*', (e) => {
        console.log('📡 Cambio detectado en playlists:', e.action, e.record);

        // Solo procesar si es una playlist del usuario actual
        if (e.record.owner === user.id) {
          
          if (e.action === 'create') {
            // ✅ Nueva playlist creada
            console.log('✅ Nueva playlist creada:', e.record.title);
            this.items.push(e.record);
            
          } else if (e.action === 'update') {
            // 🔄 Playlist actualizada
            console.log('🔄 Playlist actualizada:', e.record.title);
            const index = this.items.findIndex(p => p.id === e.record.id);
            if (index !== -1) {
              this.items[index] = e.record;
            }
            
            // Si es la playlist actual, actualizarla también
            if (this.current && this.current.id === e.record.id) {
              this.current = e.record;
            }
            
          } else if (e.action === 'delete') {
            // ❌ Playlist eliminada
            console.log('❌ Playlist eliminada:', e.record.id);
            this.items = this.items.filter(p => p.id !== e.record.id);
            
            // Si es la playlist actual, limpiarla
            if (this.current && this.current.id === e.record.id) {
              this.current = null;
            }
          }
        }
      });

      this.realtimeActive = true;
      console.log('✅ Realtime ACTIVADO');
    },

    // 🔴 NUEVO: Desuscribirse de cambios en tiempo real
    unsubscribeFromRealtime() {
      if (!this.realtimeActive) {
        console.log('⚠️ Realtime no estaba activo');
        return;
      }

      console.log('🔴 DESACTIVANDO Realtime');
      pb.collection('playlists').unsubscribe('*');
      this.realtimeActive = false;
      console.log('✅ Realtime DESACTIVADO');
    }
  }
});
