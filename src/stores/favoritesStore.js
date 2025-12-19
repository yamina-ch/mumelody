// src/stores/favoritesStore.js

import { defineStore } from 'pinia';
import pb from '@/services/pocketbase'; // ⚠️ CAMBIO: Importación correcta

/*
  Store encargado de manejar:
    - Lista de canciones favoritas del usuario
    - Agregar y quitar favoritos
    - Consultar si una canción está marcada como favorita
*/

export const useFavoritesStore = defineStore('favorites', {
    state: () => ({
        favorites: [],   // Lista completa de registros en la colección "favorites"
        loading: false   // Indica si la operación de carga está en curso
    }),

    getters: {
        // Devuelve solo los IDs de canciones guardadas como favoritas
        favoriteIds: (state) => state.favorites.map(f => f.songId),

        // Cantidad total de canciones favoritas
        count: (state) => state.favorites.length
    },

    actions: {

        /*
          Carga todos los favoritos del usuario actual desde PocketBase.
          Solo funciona si hay un usuario autenticado.
        */
        async loadFavorites() {
            // ⚠️ CAMBIO: Obtener usuario directamente de pb.authStore
            const user = pb.authStore.model;
            if (!user || !pb.authStore.isValid) {
                console.log('❌ No hay usuario autenticado');
                return;
            }

            try {
                this.loading = true;
                console.log('🔄 Cargando favoritos para usuario:', user.id);

                const records = await pb.collection('favorites').getFullList({
                    filter: `userId = "${user.id}"`,
                    sort: '-created'
                });

                this.favorites = records;
                console.log('✅ Favoritos cargados:', records.length);

            } catch (error) {
                console.error('❌ Error loading favorites:', error);
            } finally {
                this.loading = false;
            }
        },

        /*
          Marca o desmarca como favorito una canción.
          Si la canción ya está en favoritos: la elimina.
          Si no está: la agrega.
        */
        async toggleFavorite(song) {
            const user = pb.authStore.model;
            if (!user || !pb.authStore.isValid) {
                throw new Error('Usuario no autenticado');
            }

            try {
                console.log('🔄 Toggle favorite para canción:', song.id);

                // Verifica si ya existe un favorito con ese songId
                const existing = this.favorites.find(f => f.songId === song.id);

                if (existing) {
                    // Si existe, se elimina el registro
                    await pb.collection('favorites').delete(existing.id);
                    this.favorites = this.favorites.filter(f => f.id !== existing.id);
                    console.log('❌ Favorito eliminado:', song.title);
                    return false; // Indica que se removió
                }

                // Si no existe, crea un nuevo favorito
                const newFav = await pb.collection('favorites').create({
                    userId: user.id,
                    songId: song.id,
                    songData: {
                        title: song.title,
                        artist: song.artist,
                        youtubeId: song.youtubeId,
                        thumb: song.thumb,
                        duration: song.duration
                    }
                });

                this.favorites.push(newFav);
                console.log('✅ Favorito agregado:', song.title);
                return true; // Indica que se agregó

            } catch (error) {
                console.error('❌ Error toggling favorite:', error);
                throw error;
            }
        },

        /*
          Verifica rápidamente si un songId está marcado como favorito.
          Útil para cambiar iconos o estados en la interfaz.
        */
        isFavorite(songId) {
            return this.favorites.some(f => f.songId === songId);
        },

        /*
          Devuelve una lista de canciones con formato listo para usar en componentes.
        */
        getFavoriteSongs() {
            return this.favorites.map(fav => ({
                id: fav.songId,
                ...fav.songData,
                favoriteId: fav.id
            }));
        }
    }
});
