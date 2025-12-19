import { defineStore } from "pinia";
import { ref } from "vue";

/*
  useContentStore
  Este store administra contenido general de la app:
    - Canciones
    - Playlists
    - Artistas
    - Álbumes

  Es un store "ligero", basado en Composition API,
  ideal cuando solo se necesita un pequeño contenedor de datos.
*/

export const useContentStore = defineStore("content", () => {
  
  /*
    🔹 ref() se usa porque el store está en formato "setup store".
    Esto permite valores reactivos simples (arrays en este caso).
    
    Estos datos pueden ser usados en cualquier componente.
  */
  const songs = ref([]);      // Lista de canciones
  const playlists = ref([]);  // Lista de playlists
  const artists = ref([]);    // Lista de artistas
  const albums = ref([]);     // Lista de álbumes


  /*
    loadContent(data)
    Función central para cargar contenido de golpe.

    - recibe un objeto con distintas listas
    - si alguna no viene, usa []

    Esto es útil cuando cargas datos desde una API y quieres
    rellenar todo el store de una vez.
  */
  function loadContent(data) {
    songs.value = data.songs || [];
    playlists.value = data.playlists || [];
    artists.value = data.artists || [];
    albums.value = data.albums || [];
  }


  /*
    Retornamos los valores y la función,
    haciendo que estén disponibles en toda la app.
  */
  return { songs, playlists, artists, albums, loadContent };
});

