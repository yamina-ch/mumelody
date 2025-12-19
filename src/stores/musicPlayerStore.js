// src/stores/musicPlayerStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMusicPlayerStore = defineStore('musicPlayer', () => {
  // Estado del reproductor
  const currentSong = ref(null);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const volume = ref(80);
  const queue = ref([]);
  const currentIndex = ref(0);
  const showPlayer = ref(false);
  const playerInstance = ref(null);

  // Computed
  const hasQueue = computed(() => queue.value.length > 0);
  const canGoNext = computed(() => currentIndex.value < queue.value.length - 1);
  const canGoPrev = computed(() => currentIndex.value > 0);

  // Reproducir una canción
  function playSong(song) {
    currentSong.value = song;
    isPlaying.value = true;
    showPlayer.value = true;
    currentTime.value = 0;
    
    // Si no está en la cola, agregarla
    if (!queue.value.find(s => s.id === song.id)) {
      queue.value.push(song);
      currentIndex.value = queue.value.length - 1;
    } else {
      currentIndex.value = queue.value.findIndex(s => s.id === song.id);
    }
  }

  // Reproducir lista de canciones
  function playQueue(songs, startIndex = 0) {
    if (!songs || songs.length === 0) return;
    
    queue.value = [...songs];
    currentIndex.value = startIndex;
    currentSong.value = queue.value[startIndex];
    isPlaying.value = true;
    showPlayer.value = true;
    currentTime.value = 0;
  }

  // Toggle play/pause
  function togglePlay() {
    isPlaying.value = !isPlaying.value;
  }

  // Siguiente canción
  function playNext() {
    if (canGoNext.value) {
      currentIndex.value++;
      currentSong.value = queue.value[currentIndex.value];
      isPlaying.value = true;
      currentTime.value = 0;
    }
  }

  // Canción anterior
  function playPrev() {
    if (canGoPrev.value) {
      currentIndex.value--;
      currentSong.value = queue.value[currentIndex.value];
      isPlaying.value = true;
      currentTime.value = 0;
    }
  }

  // Buscar en la canción
  function seekTo(time) {
    currentTime.value = time;
    if (playerInstance.value && playerInstance.value.seekTo) {
      playerInstance.value.seekTo(time, true);
    }
  }

  // Cambiar volumen
  function setVolume(vol) {
    volume.value = vol;
    if (playerInstance.value && playerInstance.value.setVolume) {
      playerInstance.value.setVolume(vol);
    }
  }

  // Actualizar tiempo actual
  function updateCurrentTime(time) {
    currentTime.value = time;
  }

  // Actualizar duración
  function updateDuration(dur) {
    duration.value = dur;
  }

  // Registrar instancia del reproductor
  function setPlayerInstance(instance) {
    playerInstance.value = instance;
  }

  // Cerrar reproductor
  function closePlayer() {
    showPlayer.value = false;
    isPlaying.value = false;
    currentSong.value = null;
    currentTime.value = 0;
  }

  // Limpiar cola
  function clearQueue() {
    queue.value = [];
    currentIndex.value = 0;
  }

  return {
    // Estado
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    queue,
    currentIndex,
    showPlayer,
    playerInstance,
    
    // Computed
    hasQueue,
    canGoNext,
    canGoPrev,
    
    // Acciones
    playSong,
    playQueue,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    setVolume,
    updateCurrentTime,
    updateDuration,
    setPlayerInstance,
    closePlayer,
    clearQueue
  };
});
