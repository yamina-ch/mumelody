<!-- src/components/MusicPlayer.vue -->
<template>
  <ion-modal
    :is-open="showPlayer"
    @didDismiss="closePlayerModal"
    :backdrop-dismiss="true"
    :show-backdrop="true"
    class="music-player-modal"
  >
    <div class="player-container">
      <!-- Botón cerrar -->
      <ion-button
        fill="clear"
        class="close-button"
        @click="closePlayerModal"
      >
        <ion-icon :icon="close" slot="icon-only"></ion-icon>
      </ion-button>

      <!-- Imagen de la canción -->
      <div class="song-image" @click="forcePlay">
        <img
          v-if="currentSong?.thumb"
          :src="currentSong.thumb"
          :alt="currentSong.title"
        />
        <img
          v-else-if="currentSong?.youtubeId"
          :src="`https://img.youtube.com/vi/${currentSong.youtubeId}/hqdefault.jpg`"
          :alt="currentSong.title"
        />
        <div v-else class="placeholder-image">
          <ion-icon :icon="musicalNotes" size="large"></ion-icon>
        </div>
      </div>

      <!-- Información de la canción -->
      <div class="song-info">
        <h2 class="song-title">{{ currentSong?.title || 'Sin título' }}</h2>
        <p class="song-artist">{{ currentSong?.artist || 'Artista desconocido' }}</p>
      </div>

      <!-- Barra de progreso -->
      <div class="progress-section">
        <span class="time-label">{{ formatTime(localCurrentTime) }}</span>
        <input 
          type="range" 
          class="progress-bar"
          :value="localCurrentTime"
          :max="localDuration || 100"
          @input="seekToTime($event.target.value)"
          @mousedown="pauseForSeek"
          @mouseup="resumeAfterSeek"
          @touchstart="pauseForSeek"
          @touchend="resumeAfterSeek"
        />
        <span class="time-label">{{ formatTime(localDuration) }}</span>
      </div>

      <!-- Controles de reproducción -->
      <div class="controls">
        <ion-button
          fill="clear"
          @click="playPrevious"
          :disabled="!canGoPrev"
          class="control-button"
        >
          <ion-icon :icon="playSkipBack" slot="icon-only"></ion-icon>
        </ion-button>

        <ion-button
          fill="solid"
          @click="togglePlayPause"
          class="play-button"
          shape="round"
        >
          <ion-icon
            :icon="localIsPlaying ? pause : play"
            slot="icon-only"
            size="large"
          ></ion-icon>
        </ion-button>

        <ion-button
          fill="clear"
          @click="playNextSong"
          :disabled="!canGoNext"
          class="control-button"
        >
          <ion-icon :icon="playSkipForward" slot="icon-only"></ion-icon>
        </ion-button>
      </div>

      <!-- Reproductor de YouTube OCULTO pero en el DOM -->
      <div id="youtube-player-container" style="position: absolute; top: -9999px; left: -9999px;">
        <div :id="playerElementId"></div>
      </div>
    </div>
  </ion-modal>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { storeToRefs } from 'pinia';
import {
  IonModal,
  IonButton,
  IonIcon
} from '@ionic/vue';
import {
  close,
  play,
  pause,
  playSkipBack,
  playSkipForward,
  musicalNotes
} from 'ionicons/icons';
import { useMusicPlayerStore } from '@/stores/musicPlayerStore';

const playerStore = useMusicPlayerStore();

// Refs del store
const { 
  currentSong,
  showPlayer,
  canGoNext,
  canGoPrev
} = storeToRefs(playerStore);

const {
  playNext,
  playPrev,
  closePlayer: storeClosePlayer
} = playerStore;

// Estado local del player
const player = ref(null);
const playerElementId = ref(`youtube-player-${Date.now()}`);
const localIsPlaying = ref(false);
const localCurrentTime = ref(0);
const localDuration = ref(0);
const wasPlayingBeforeSeek = ref(false);
let progressInterval = null;
let apiLoadPromise = null;

// Cargar API de YouTube (singleton)
function loadYouTubeAPI() {
  if (apiLoadPromise) return apiLoadPromise;
  
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }
  
  apiLoadPromise = new Promise((resolve) => {
    // Si ya existe el script, esperar a que cargue
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const checkYT = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkYT);
          resolve();
        }
      }, 100);
      return;
    }

    // Crear script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    window.onYouTubeIframeAPIReady = () => {
      console.log('✅ YouTube API cargada');
      resolve();
    };
  });
  
  return apiLoadPromise;
}

// Destruir player completamente
function destroyPlayer() {
  console.log('🗑️ Destruyendo player...');
  
  stopProgressUpdate();
  
  if (player.value) {
    try {
      player.value.destroy();
    } catch (e) {
      console.warn('Error destroying player:', e);
    }
    player.value = null;
  }
  
  localIsPlaying.value = false;
  localCurrentTime.value = 0;
  localDuration.value = 0;
  
  // Limpiar el contenedor
  const container = document.getElementById('youtube-player-container');
  if (container) {
    container.innerHTML = `<div id="${playerElementId.value}"></div>`;
  }
}

// Crear player desde cero
async function createPlayer() {
  if (!currentSong.value?.youtubeId) {
    console.warn('⚠️ No hay canción');
    return;
  }

  // IMPORTANTE: Destruir player anterior completamente
  destroyPlayer();

  // Esperar un momento para que el DOM se limpie
  await new Promise(resolve => setTimeout(resolve, 100));

  await loadYouTubeAPI();
  
  console.log('🎵 Creando nuevo player para:', currentSong.value.youtubeId);
  
  try {
    player.value = new window.YT.Player(playerElementId.value, {
      height: '1',
      width: '1',
      videoId: currentSong.value.youtubeId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        fs: 0,
        cc_load_policy: 0,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    });
  } catch (error) {
    console.error('❌ Error creando player:', error);
  }
}

function onPlayerReady(event) {
  console.log('✅ Player ready');
  
  try {
    // Obtener duración inicial
    const dur = event.target.getDuration();
    if (dur && !isNaN(dur)) {
      localDuration.value = dur;
      console.log('⏱️ Duración:', dur);
    }
    
    // Iniciar actualización de progreso ANTES de reproducir
    startProgressUpdate();
    
    // Forzar play
    setTimeout(() => {
      if (player.value) {
        try {
          player.value.playVideo();
          localIsPlaying.value = true;
          console.log('▶️ Reproduciendo...');
        } catch (e) {
          console.error('Error al reproducir:', e);
        }
      }
    }, 300);
    
  } catch (error) {
    console.error('Error en onPlayerReady:', error);
  }
}

function onPlayerStateChange(event) {
  const states = {
    '-1': 'unstarted',
    0: 'ended',
    1: 'playing',
    2: 'paused',
    3: 'buffering',
    5: 'cued'
  };
  
  console.log('🔄 State:', states[event.data]);
  
  if (event.data === 0) {
    // Ended
    localIsPlaying.value = false;
    stopProgressUpdate();
    
    if (canGoNext.value) {
      console.log('⏭️ Auto-next...');
      setTimeout(() => {
        playNext();
      }, 500);
    }
  } else if (event.data === 1) {
    // Playing - REINICIAR progreso siempre
    localIsPlaying.value = true;
    
    // Obtener duración si no la tenemos
    if (player.value && (!localDuration.value || localDuration.value === 0)) {
      try {
        const dur = player.value.getDuration();
        if (dur && !isNaN(dur) && dur > 0) {
          localDuration.value = dur;
        }
      } catch (e) {
        console.warn('No se pudo obtener duración');
      }
    }
    
    // SIEMPRE reiniciar el progreso cuando empieza a reproducir
    startProgressUpdate();
  } else if (event.data === 2) {
    // Paused
    localIsPlaying.value = false;
    stopProgressUpdate();
  } else if (event.data === 3) {
    // Buffering - mantener progreso activo
    if (!progressInterval) {
      startProgressUpdate();
    }
  }
}

function onPlayerError(event) {
  console.error('❌ Player error:', event.data);
  
  // Si hay error, ir a siguiente
  if (canGoNext.value) {
    setTimeout(() => {
      playNext();
    }, 1500);
  }
}

// Actualizar progreso
function startProgressUpdate() {
  stopProgressUpdate();
  
  progressInterval = setInterval(() => {
    if (player.value && typeof player.value.getCurrentTime === 'function') {
      try {
        const currentTime = player.value.getCurrentTime();
        const duration = player.value.getDuration();
        
        // Actualizar valores
        if (!isNaN(currentTime)) {
          localCurrentTime.value = currentTime;
        }
        
        if (!isNaN(duration) && duration > 0) {
          localDuration.value = duration;
        }
      } catch (e) {
        console.warn('Error actualizando progreso:', e);
      }
    }
  }, 250); // Más frecuente = más suave
}

function stopProgressUpdate() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

// Controles
function forcePlay() {
  if (player.value) {
    player.value.playVideo();
    localIsPlaying.value = true;
  }
}

function togglePlayPause() {
  if (!player.value) return;

  try {
    if (localIsPlaying.value) {
      player.value.pauseVideo();
    } else {
      player.value.playVideo();
    }
  } catch (error) {
    console.error('Error toggle:', error);
  }
}

function playPrevious() {
  console.log('⏮️ Previous');
  playPrev();
}

function playNextSong() {
  console.log('⏭️ Next');
  playNext();
}

function seekToTime(time) {
  const numTime = parseFloat(time);
  localCurrentTime.value = numTime;
  
  if (player.value && player.value.seekTo) {
    try {
      player.value.seekTo(numTime, true);
    } catch (error) {
      console.error('Error seek:', error);
    }
  }
}

function pauseForSeek() {
  wasPlayingBeforeSeek.value = localIsPlaying.value;
  if (player.value && localIsPlaying.value) {
    player.value.pauseVideo();
  }
}

function resumeAfterSeek() {
  if (player.value && wasPlayingBeforeSeek.value) {
    player.value.playVideo();
  }
}

function closePlayerModal() {
  console.log('❌ Close');
  destroyPlayer();
  storeClosePlayer();
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Watchers
watch(() => currentSong.value?.youtubeId, async (newId, oldId) => {
  if (newId && newId !== oldId && showPlayer.value) {
    console.log('🔄 Cambio de canción:', newId);
    
    // CRÍTICO: Destruir y recrear completamente
    await createPlayer();
  }
});

watch(showPlayer, async (show) => {
  console.log('🔄 showPlayer:', show);
  
  if (show && currentSong.value) {
    await createPlayer();
  } else if (!show) {
    destroyPlayer();
  }
});

onMounted(async () => {
  console.log('🎬 MusicPlayer mounted');
  
  if (showPlayer.value && currentSong.value) {
    await createPlayer();
  }
});

onBeforeUnmount(() => {
  console.log('🔚 MusicPlayer unmounting');
  destroyPlayer();
});
</script>

<style scoped>
.music-player-modal {
  --width: 90%;
  --max-width: 400px;
  --height: auto;
  --border-radius: 20px;
}

.music-player-modal::part(backdrop) {
  background: rgba(0, 0, 0, 0.8);
}

.player-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 30px 25px;
  border-radius: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  --color: #fff;
  z-index: 10;
}

.song-image {
  width: 200px;
  height: 200px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.song-image:active {
  transform: scale(0.98);
}

.song-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.song-info {
  text-align: center;
  width: 100%;
  padding: 0 10px;
}

.song-title {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-section {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.time-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  min-width: 40px;
  text-align: center;
}

.progress-bar {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffd700;
  cursor: pointer;
  transition: all 0.2s;
}

.progress-bar::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.progress-bar::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffd700;
  cursor: pointer;
  border: none;
}

.controls {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 10px;
}

.control-button {
  --color: #fff;
  font-size: 28px;
}

.control-button:disabled {
  --color: rgba(255, 255, 255, 0.3);
}

.play-button {
  --background: #ffd700;
  --color: #1a1a2e;
  width: 70px;
  height: 70px;
  font-size: 32px;
  --box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

.play-button:hover {
  --background: #ffed4e;
}
</style>
