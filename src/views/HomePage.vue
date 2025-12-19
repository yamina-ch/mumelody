<template>
  <ion-page>
    <!-- Header exacto como Numelody original -->
    <ion-header class="custom-header">
      <div class="header-container">
        <div class="brand">
          <span class="brand-icon">🎵</span>
          <span class="brand-text">Numelody</span>
        </div>

        <div class="search-container">
          <ion-searchbar
            v-model="searchQuery"
            placeholder="Buscar canciones, artistas o álbumes…"
            class="custom-searchbar"
          ></ion-searchbar>
        </div>

        <div class="nav-links">
          <a href="#" class="nav-link">Servicios</a>
          <a href="#" class="nav-link">Contacto</a>
          <ion-button class="login-btn" fill="solid" color="warning" @click="router.push('/login')">
            Login
          </ion-button>
        </div>
      </div>
    </ion-header>

    <ion-content class="custom-content">
      <!-- Layout: Sidebar + Feed + Rightbar MOBILE STYLE -->
      <div class="home-layout">
        
        <!-- SIDEBAR IZQUIERDO -->
        <aside class="sidebar">
          <div class="library-section">
            <div class="library-header">
              <h3>Tu biblioteca</h3>
              <button class="add-btn">+</button>
            </div>
            <div class="library-card">
              <strong>Crea tu primera lista</strong>
              <p>Es muy fácil, te echaremos una mano.</p>
              <ion-button expand="block" color="warning" @click="router.push('/login')">
                Iniciar sesión
              </ion-button>
            </div>
            <div class="library-links">
              <a href="#">Legal</a>
              <a href="#">Privacidad</a>
              <a href="#">Cookies</a>
            </div>
            <button class="lang-btn">🌐 Español</button>
          </div>
        </aside>

        <!-- FEED CENTRAL -->
        <main class="feed">
          
          <!-- Playlists Populares -->
          <section class="content-section">
            <h2 class="section-title">Playlists Populares</h2>
            <div class="playlist-grid">
              <div 
                v-for="playlist in playlists" 
                :key="playlist.id" 
                class="playlist-card"
                @click="playPlaylist(playlist)"
              >
                <div class="card-image">
                  <img :src="playlist.image" :alt="playlist.title" />
                  <button class="play-overlay">
                    <ion-icon :icon="playCircleOutline" class="play-icon"></ion-icon>
                  </button>
                </div>
                <div class="card-info">
                  <h3>{{ playlist.title }}</h3>
                  <p>{{ playlist.songs.length }} canciones</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Artistas Destacados -->
          <section class="content-section">
            <h2 class="section-title">Artistas Destacados</h2>
            <div class="artists-grid">
              <div v-for="artist in artists" :key="artist.name" class="artist-card">
                <img :src="artist.image" :alt="artist.name" />
                <span>{{ artist.name }}</span>
              </div>
            </div>
          </section>

          <!-- Álbumes Recomendados -->
          <section class="content-section">
            <h2 class="section-title">Álbumes Recomendados</h2>
            <div class="albums-grid">
              <div 
                v-for="album in albums" 
                :key="album.id" 
                class="album-card"
                @click="playAlbum(album)"
              >
                <img :src="album.cover" :alt="album.title" />
                <h3>{{ album.title }}</h3>
                <p>{{ album.artist }}</p>
              </div>
            </div>
          </section>

        </main>

        <!-- SIDEBAR DERECHO - ESTILO MÓVIL -->
        <aside class="rightbar-mobile">
          <!-- Cola de reproducción -->
          <div class="queue-section">
            <h2 class="queue-title">Cola de reproducción</h2>
            <div class="song-list-mobile">
              <div 
                v-for="song in songs" 
                :key="song.id" 
                class="song-item-mobile"
                :class="{ active: currentSong?.id === song.id }"
                @click="playSong(song)"
              >
                <img :src="song.thumb" :alt="song.title" class="song-thumb-mobile" />
                <div class="song-info-mobile">
                  <strong>{{ song.title }}</strong>
                  <span>{{ song.artist }}</span>
                </div>
                <span class="duration-mobile">{{ song.duration }}</span>
              </div>
            </div>
          </div>

          <!-- Sección de comentarios -->
          <div class="comments-section">
            <div class="comments-header">
              <h3>Comentarios</h3>
              <span class="comment-count">(0)</span>
            </div>
            
            <div class="comment-input-wrapper">
              <div class="user-avatar">
                <img src="https://i.pravatar.cc/150?img=5" alt="User" />
              </div>
              <textarea 
                class="comment-textarea"
                placeholder="Escribe un comentario..."
                v-model="commentText"
                maxlength="500"
              ></textarea>
            </div>

            <div class="comment-actions">
              <span class="char-count">{{ commentText.length }}/500</span>
              <ion-button 
                color="warning" 
                size="small"
                :disabled="!commentText.trim()"
                @click="addComment"
              >
                Comentar
              </ion-button>
            </div>
          </div>
        </aside>

      </div>

      <!-- REPRODUCTOR FLOTANTE -->
      <div v-if="currentSong" class="player-bar">
        <div class="player-wrapper">
          <div class="player-song-info">
            <img :src="currentSong.thumb" :alt="currentSong.title" />
            <div class="song-text">
              <strong>{{ currentSong.title }}</strong>
              <span>{{ currentSong.artist }}</span>
            </div>
          </div>

          <div class="player-controls">
            <button @click="prevSong" class="control-btn">⏮</button>
            <button @click="togglePlay" class="control-btn play-btn">
              {{ isPlaying ? '⏸' : '▶' }}
            </button>
            <button @click="nextSong" class="control-btn">⏭</button>
          </div>

          <div class="player-progress">
            <span class="time">{{ formatTime(progress) }}</span>
            <input 
              type="range" 
              class="progress-slider"
              v-model="progress"
              min="0"
              :max="duration"
            />
            <span class="time">{{ currentSong.duration }}</span>
          </div>
        </div>
      </div>

    </ion-content>

    <!-- Modal de Registro -->
    <ion-modal :is-open="showRegistrationModal" @didDismiss="closeRegistrationModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>🎵 ¡Momento, momento!</h2>
          <button @click="closeRegistrationModal" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <p>Has disfrutado <strong>1 minuto gratis</strong> de música increíble.</p>
          <p>Para seguir vibrando con <strong class="brand-highlight">Numelody</strong>:</p>
          <h1 class="modal-cta">¡Regístrate GRATIS ahora!</h1>
          <ion-button expand="block" color="warning" size="large" @click="goToRegister">
            🚀 ¡Quiero registrarme!
          </ion-button>
          <ion-button expand="block" fill="clear" @click="closeRegistrationModal">
            Tal vez luego
          </ion-button>
        </div>
      </div>
    </ion-modal>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonContent,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonModal,
  toastController,
} from '@ionic/vue';
import { playCircleOutline } from 'ionicons/icons';

const router = useRouter();

// Estado
const searchQuery = ref('');
const commentText = ref('');
const currentSong = ref<any>(null);
const isPlaying = ref(false);
const progress = ref(0);
const duration = ref(100);
const playbackTimer = ref<any>(null);
const hasShownAlert = ref(false);
const showRegistrationModal = ref(false);
const isAuthenticated = ref(false);

// Datos
const songs = ref([
  { id: 1, title: "Rolling in the Deep", artist: "Adele", duration: "3:48", youtubeId: "rYEDA3JcQqw", thumb: "https://img.youtube.com/vi/rYEDA3JcQqw/hqdefault.jpg" },
  { id: 2, title: "Shape of You", artist: "Ed Sheeran", duration: "3:53", youtubeId: "JGwWNGJdvx8", thumb: "https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg" },
  { id: 3, title: "Diamonds", artist: "Rihanna", duration: "3:45", youtubeId: "lWA2pjMjpBs", thumb: "https://img.youtube.com/vi/lWA2pjMjpBs/hqdefault.jpg" },
  { id: 4, title: "Bohemian Rhapsody", artist: "Queen", duration: "5:55", youtubeId: "fJ9rUzIMcZQ", thumb: "https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg" },
  { id: 5, title: "Levitating", artist: "Dua Lipa", duration: "3:23", youtubeId: "TUVcZfQe-Kw", thumb: "https://img.youtube.com/vi/TUVcZfQe-Kw/hqdefault.jpg" },
]);

const playlists = ref([
  { id: 1, title: "Desert Waves", image: "https://picsum.photos/seed/cactus/400", songs: [1, 2] },
  { id: 2, title: "Golden Hits", image: "https://picsum.photos/seed/lake/400", songs: [3, 4] },
  { id: 3, title: "Dark Mode", image: "https://picsum.photos/seed/mountain/400", songs: [5, 1] },
  { id: 4, title: "Chill Vibes", image: "https://picsum.photos/seed/forest/400", songs: [2, 3] },
]);

const artists = ref([
  { name: "Adele", image: "https://picsum.photos/seed/adele/150" },
  { name: "Ed Sheeran", image: "https://picsum.photos/seed/ed/150" },
  { name: "Rihanna", image: "https://picsum.photos/seed/rih/150" },
  { name: "Queen", image: "https://picsum.photos/seed/queen/150" },
  { name: "Dua Lipa", image: "https://picsum.photos/seed/dua/150" },
]);

const albums = ref([
  { id: 1, title: "21", artist: "Adele", cover: "https://picsum.photos/seed/a1/300" },
  { id: 2, title: "Divide", artist: "Ed Sheeran", cover: "https://picsum.photos/seed/a2/300" },
  { id: 3, title: "ANTI", artist: "Rihanna", cover: "https://picsum.photos/seed/a3/300" },
  { id: 4, title: "A Night at the Opera", artist: "Queen", cover: "https://picsum.photos/seed/a4/300" },
  { id: 5, title: "Future Nostalgia", artist: "Dua Lipa", cover: "https://picsum.photos/seed/a5/300" },
]);

// Funciones
async function showToast(message: string) {
  const toast = await toastController.create({
    message,
    duration: 2000,
    position: 'bottom',
    color: 'dark',
  });
  await toast.present();
}

function addComment() {
  if (commentText.value.trim()) {
    showToast('Comentario añadido');
    commentText.value = '';
  }
}

function playSong(song: any) {
  currentSong.value = song;
  isPlaying.value = true;
  progress.value = 0;
  
  if (!isAuthenticated.value && !hasShownAlert.value) {
    startPlaybackTimer();
  }
  
  showToast(`Reproduciendo: ${song.title}`);
}

function togglePlay() {
  isPlaying.value = !isPlaying.value;
  
  if (!isPlaying.value && playbackTimer.value) {
    clearTimeout(playbackTimer.value);
  } else if (isPlaying.value && !isAuthenticated.value && !hasShownAlert.value) {
    startPlaybackTimer();
  }
}

function startPlaybackTimer() {
  if (playbackTimer.value) {
    clearTimeout(playbackTimer.value);
  }
  
  playbackTimer.value = setTimeout(() => {
    if (!isAuthenticated.value) {
      showRegistrationAlert();
    }
  }, 60000);
}

function showRegistrationAlert() {
  hasShownAlert.value = true;
  isPlaying.value = false;
  showRegistrationModal.value = true;
}

function closeRegistrationModal() {
  showRegistrationModal.value = false;
  currentSong.value = null;
  showToast('Nos vemos pronto 😢');
}

function goToRegister() {
  showRegistrationModal.value = false;
  router.push('/login');
}

function nextSong() {
  const idx = songs.value.findIndex(s => s.id === currentSong.value?.id);
  if (idx < songs.value.length - 1) {
    playSong(songs.value[idx + 1]);
  }
}

function prevSong() {
  const idx = songs.value.findIndex(s => s.id === currentSong.value?.id);
  if (idx > 0) {
    playSong(songs.value[idx - 1]);
  }
}

function playPlaylist(playlist: any) {
  const firstSongId = playlist.songs[0];
  const song = songs.value.find(s => s.id === firstSongId);
  if (song) playSong(song);
}

function playAlbum(album: any) {
  playSong(songs.value[0]);
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

onUnmounted(() => {
  if (playbackTimer.value) {
    clearTimeout(playbackTimer.value);
  }
});
</script>

<style scoped>
/* FONDO CON GRADIENTE */
ion-content {
  --background: linear-gradient(135deg, #1e1b4b 0%, #701a75 100%);
  --padding-bottom: 90px;
}

.custom-content::part(scroll) {
  padding-bottom: 90px;
  background: url('/bg.png') no-repeat center center;
  background-size: cover;
  position: relative;
}

.custom-content::part(scroll)::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(30, 27, 75, 0.85) 0%, rgba(112, 26, 117, 0.85) 100%);
  z-index: -1;
}

/* HEADER */
ion-header {
  box-shadow: none !important;
}

.custom-header {
  background: rgba(26, 26, 29, 0.95);
  border-bottom: 1px solid rgba(241, 196, 15, 0.2);
  padding: 0.75rem 0;
  backdrop-filter: blur(10px);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  font-weight: bold;
  color: #f1c40f;
}

.brand-icon {
  font-size: 1.5rem;
}

.search-container {
  flex: 1;
  max-width: 500px;
}

.custom-searchbar {
  --background: rgba(26, 26, 29, 0.8);
  --border-radius: 24px;
  --box-shadow: none;
  --color: #f5f5f7;
  --placeholder-color: #92949c;
  --icon-color: #f1c40f;
  padding: 0;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: #f5f5f7;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #f1c40f;
}

.login-btn {
  --background: #f1c40f;
  --color: #1a1a1d;
  --border-radius: 20px;
  font-weight: 600;
  text-transform: none;
  height: 36px;
}

/* LAYOUT */
.home-layout {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: grid;
  grid-template-columns: 280px 1fr 400px;
  gap: 1.5rem;
  align-items: start;
}

/* SIDEBAR IZQUIERDO */
.sidebar {
  position: sticky;
  top: 1.5rem;
  background: rgba(30, 27, 75, 0.6);
  border: 1px solid rgba(241, 196, 15, 0.2);
  border-radius: 16px;
  padding: 1.25rem;
  backdrop-filter: blur(12px);
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.library-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #f5f5f7;
}

.add-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(241, 196, 15, 0.1);
  border: 1px solid #f1c40f;
  color: #f1c40f;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #f1c40f;
  color: #1a1a1d;
}

.library-card {
  background: rgba(26, 26, 29, 0.6);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.library-card strong {
  display: block;
  color: #f5f5f7;
  margin-bottom: 0.5rem;
}

.library-card p {
  color: #92949c;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
}

.library-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
}

.library-links a {
  color: #92949c;
  font-size: 0.85rem;
  text-decoration: none;
}

.library-links a:hover {
  color: #f5f5f7;
}

.lang-btn {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(241, 196, 15, 0.3);
  color: #f5f5f7;
  padding: 0.5rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
}

/* FEED CENTRAL */
.feed {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.content-section {
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  color: #f1c40f;
}

/* PLAYLISTS GRID */
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
}

.playlist-card {
  background: rgba(30, 27, 75, 0.6);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(241, 196, 15, 0.2);
}

.playlist-card:hover {
  transform: translateY(-4px);
  border-color: #f1c40f;
  box-shadow: 0 8px 24px rgba(241, 196, 15, 0.3);
}

.card-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.playlist-card:hover .card-image img {
  transform: scale(1.1);
}

.play-overlay {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f1c40f;
  border: none;
  color: #1a1a1d;
  display: grid;
  place-items: center;
  cursor: pointer;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s;
}

.playlist-card:hover .play-overlay {
  opacity: 1;
  transform: translateY(0);
}

.play-icon {
  font-size: 1.5rem;
}

.card-info {
  padding: 1rem;
}

.card-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: #f5f5f7;
}

.card-info p {
  margin: 0;
  color: #92949c;
  font-size: 0.85rem;
}

/* ARTISTAS GRID */
.artists-grid {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.artist-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.artist-card:hover {
  transform: scale(1.05);
}

.artist-card img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid #f1c40f;
  object-fit: cover;
}

.artist-card span {
  font-size: 0.9rem;
  color: #f5f5f7;
}

/* ÁLBUMES GRID */
.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.25rem;
}

.album-card {
  background: rgba(30, 27, 75, 0.6);
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(241, 196, 15, 0.2);
}

.album-card:hover {
  transform: translateY(-4px);
  border-color: rgba(241, 196, 15, 0.5);
}

.album-card img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 0.75rem;
}

.album-card h3 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  color: #f5f5f7;
}

.album-card p {
  margin: 0;
  color: #92949c;
  font-size: 0.85rem;
}

/* SIDEBAR DERECHO - ESTILO MÓVIL */
.rightbar-mobile {
  position: sticky;
  top: 1.5rem;
  background: rgba(30, 27, 75, 0.9);
  border: 1px solid rgba(241, 196, 15, 0.2);
  border-radius: 16px;
  padding: 0;
  backdrop-filter: blur(12px);
  overflow: hidden;
  max-height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
}

/* Cola de reproducción */
.queue-section {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(241, 196, 15, 0.1);
}

.queue-title {
  font-size: 1.3rem;
  margin: 0 0 1rem 0;
  color: #f1c40f;
  font-weight: bold;
}

.song-list-mobile {
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 400px;
  overflow-y: auto;
}

.song-item-mobile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 8px;
}

.song-item-mobile:hover {
  background: rgba(241, 196, 15, 0.05);
}

.song-item-mobile.active {
  background: rgba(241, 196, 15, 0.15);
}

.song-thumb-mobile {
  width: 56px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}

.song-info-mobile {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.song-info-mobile strong {
  font-size: 0.95rem;
  color: #f5f5f7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-info-mobile span {
  font-size: 0.85rem;
  color: #92949c;
}

.duration-mobile {
  font-size: 0.9rem;
  color: #92949c;
  margin-right: 0.5rem;
}

/* Sección de comentarios */
.comments-section {
  flex: 1;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}

.comments-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.comments-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #f5f5f7;
}

.comment-count {
  color: #92949c;
  font-size: 0.9rem;
}

.comment-input-wrapper {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.user-avatar {
  flex-shrink: 0;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #f1c40f;
}

.comment-textarea {
  flex: 1;
  background: rgba(26, 26, 29, 0.6);
  border: 1px solid rgba(241, 196, 15, 0.2);
  border-radius: 12px;
  padding: 0.75rem;
  color: #f5f5f7;
  font-family: inherit;
  font-size: 0.95rem;
  resize: none;
  min-height: 80px;
}

.comment-textarea::placeholder {
  color: #92949c;
}

.comment-textarea:focus {
  outline: none;
  border-color: #f1c40f;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
}

.char-count {
  font-size: 0.85rem;
  color: #92949c;
}

/* REPRODUCTOR FLOTANTE */
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(30, 27, 75, 0.98);
  border-top: 1px solid rgba(241, 196, 15, 0.3);
  backdrop-filter: blur(20px);
  z-index: 1000;
  padding: 1rem;
}

.player-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: center;
}

.player-song-info {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.player-song-info img {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
}

.song-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.song-text strong {
  font-size: 0.95rem;
  color: #f5f5f7;
}

.song-text span {
  font-size: 0.85rem;
  color: #92949c;
}

.player-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #f5f5f7;
  cursor: pointer;
  transition: all 0.2s;
  display: grid;
  place-items: center;
  font-size: 1rem;
}

.control-btn:hover {
  color: #f1c40f;
}

.play-btn {
  background: #f1c40f;
  color: #1a1a1d;
  width: 48px;
  height: 48px;
  font-size: 1.2rem;
}

.play-btn:hover {
  background: #d4ac0d;
  transform: scale(1.05);
}

.player-progress {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: flex-end;
}

.time {
  font-size: 0.85rem;
  color: #92949c;
  min-width: 40px;
  text-align: center;
}

.progress-slider {
  flex: 1;
  max-width: 300px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(146, 148, 156, 0.3);
  border-radius: 2px;
  outline: none;
}

.progress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #f1c40f;
  cursor: pointer;
}

.progress-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #f1c40f;
  cursor: pointer;
  border: none;
}

/* MODAL */
.modal-content {
  background: linear-gradient(135deg, #1e1b4b 0%, #701a75 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(241, 196, 15, 0.2);
}

.modal-header h2 {
  margin: 0;
  color: #f1c40f;
  font-size: 1.5rem;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid rgba(241, 196, 15, 0.3);
  color: #f5f5f7;
  cursor: pointer;
  font-size: 1.2rem;
}

.modal-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  gap: 1.5rem;
}

.modal-body p {
  color: #f5f5f7;
  font-size: 1.1rem;
  margin: 0;
}

.brand-highlight {
  color: #f1c40f;
}

.modal-cta {
  color: #f1c40f;
  font-size: 1.8rem;
  margin: 0;
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .home-layout {
    grid-template-columns: 240px 1fr;
  }
  .rightbar-mobile {
    display: none;
  }
}

@media (max-width: 768px) {
  .home-layout {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: relative;
  }
  .header-container {
    flex-direction: column;
    gap: 1rem;
  }
  .nav-links {
    width: 100%;
    justify-content: space-around;
  }
  .player-wrapper {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
