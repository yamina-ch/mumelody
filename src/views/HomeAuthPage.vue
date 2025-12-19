<template>
  <ion-page>
    <ion-header class="dark-header">
      <ion-toolbar>
        <div class="header-content">
          <ion-button class="brand-button" fill="clear" @click="router.push('/home-auth')">
            <ion-icon :icon="musicalNotesOutline" slot="start"></ion-icon>
            <span class="brand-text">Numelody</span>
          </ion-button>

          <div class="search-wrapper">
            <ion-searchbar
              v-model="q"
              placeholder="Buscar canciones, artistas o álbumes…"
              @keyup.enter="goToSearch"
              class="main-searchbar"
            ></ion-searchbar>
            <ion-button color="warning" size="small" @click="goToSearch">Buscar</ion-button>
          </div>

          <div class="nav-links">
            <ion-button fill="clear" class="nav-button" @click="router.push('/services')">Servicios</ion-button>
            <ion-button fill="clear" class="nav-button" @click="router.push('/contact')">Contacto</ion-button>
            <ion-button fill="solid" color="warning" @click="router.push('/profile')">
              {{ displayName }}
            </ion-button>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="home-auth-content">
      <div class="three-column-layout">
        
        <aside class="left-sidebar">
          <div class="user-profile-card" @click="router.push('/profile')">
            <ion-avatar class="user-avatar-large">
              <img :src="avatarUrl" :alt="displayName" />
            </ion-avatar>
            <strong class="user-display-name">{{ displayName }}</strong>
            <span class="user-badge">Premium User</span>
          </div>

          <div class="sidebar-menu">
            <ion-button expand="block" fill="clear" class="menu-button active" @click="router.push('/home-auth')">
              <ion-icon :icon="homeOutline" slot="start"></ion-icon>
              <ion-label>Inicio</ion-label>
            </ion-button>

            <ion-button expand="block" fill="clear" class="menu-button" @click="router.push('/playlists')">
              <ion-icon :icon="musicalNotesOutline" slot="start"></ion-icon>
              <ion-label>Playlists</ion-label>
            </ion-button>

            <ion-button expand="block" fill="clear" class="menu-button" @click="router.push('/favorites')">
              <ion-icon :icon="heartOutline" slot="start"></ion-icon>
              <ion-label>Favoritos</ion-label>
              <ion-badge v-if="favoritesCount > 0" color="danger">{{ favoritesCount }}</ion-badge>
            </ion-button>

            <ion-button 
              v-if="isAdminUser" 
              expand="block" 
              fill="outline" 
              color="warning" 
              class="menu-button admin-button" 
              @click="router.push('/admin')"
            >
              <ion-icon :icon="settingsOutline" slot="start"></ion-icon>
              <ion-label>Admin</ion-label>
            </ion-button>
          </div>

          <div class="sidebar-menu-bottom">
            <ion-button expand="block" fill="clear" class="menu-button" @click="router.push('/profile')">
              <ion-icon :icon="personOutline" slot="start"></ion-icon>
              <ion-label>Perfil</ion-label>
            </ion-button>

            <ion-button expand="block" fill="clear" class="menu-button" @click="logoutUser">
              <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
              <ion-label>Cerrar sesión</ion-label>
            </ion-button>
          </div>
        </aside>

        <main class="center-feed">
          <section class="feed-section">
            <div class="section-header-row">
              <h2 class="section-title-yellow">Para Ti</h2>
              <span v-if="loadingPlaylists" class="section-meta">Cargando...</span>
              <span v-else class="section-meta">{{ allPlaylists.length }} playlists</span>
            </div>

            <div class="cards-grid">
              <article 
                v-for="pl in allPlaylists" 
                :key="pl.id" 
                class="playlist-card-item"
                @click="handlePlaylistClick(pl)"
              >
                <div class="card-image-wrapper">
                  <img :src="pl.image" :alt="pl.title" />
                  <button class="card-play-button" type="button" @click.stop="playPlaylist(pl)">
                    <ion-icon :icon="playCircleOutline"></ion-icon>
                  </button>
                </div>
                <div class="card-text-info">
                  <h3>{{ pl.title }}</h3>
                  <p v-if="pl.isFromDB">
                    {{ pl.tracks?.length || 0 }} canciones
                    <span v-if="pl.owner"> • {{ pl.owner }}</span>
                  </p>
                  <p v-else>Mix personalizado</p>
                </div>
              </article>
            </div>
          </section>

          <section class="feed-section">
            <h2 class="section-title-yellow">Artistas Favoritos</h2>
            <div class="artists-horizontal-scroll">
              <div class="artist-circle-card">
                <img src="https://picsum.photos/seed/kendrick/150" alt="Kendrick" />
                <span>Kendrick</span>
              </div>
              <div class="artist-circle-card">
                <img src="https://picsum.photos/seed/adele/150" alt="Adele" />
                <span>Adele</span>
              </div>
              <div class="artist-circle-card">
                <img src="https://picsum.photos/seed/ed/150" alt="Ed Sheeran" />
                <span>Ed Sheeran</span>
              </div>
              <div class="artist-circle-card">
                <img src="https://picsum.photos/seed/rih/150" alt="Rihanna" />
                <span>Rihanna</span>
              </div>
            </div>
          </section>

          <section class="feed-section">
            <h2 class="section-title-yellow">Nuevos Lanzamientos</h2>
            <div class="albums-grid">
              <article class="album-card-item" @click="playSong(demoSongs[0])">
                <img src="https://picsum.photos/seed/a1/300" alt="Golden Era" />
                <h3>Golden Era</h3>
                <p>Kendrick</p>
              </article>
              <article class="album-card-item" @click="playSong(demoSongs[1])">
                <img src="https://picsum.photos/seed/a2/300" alt="Skyfall" />
                <h3>Skyfall</h3>
                <p>Adele</p>
              </article>
              <article class="album-card-item" @click="playSong(demoSongs[2])">
                <img src="https://picsum.photos/seed/a3/300" alt="Divide" />
                <h3>Divide</h3>
                <p>Ed Sheeran</p>
              </article>
              <article class="album-card-item" @click="playSong(demoSongs[3])">
                <img src="https://picsum.photos/seed/a4/300" alt="Unapologetic" />
                <h3>Unapologetic</h3>
                <p>Rihanna</p>
              </article>
            </div>
          </section>
        </main>

        <aside class="right-sidebar">
          <h2 class="section-title-yellow">En Reproducción</h2>
          <div class="songs-list-container">
            <div 
              v-for="song in demoSongs"
              :key="song.id"
              class="song-row-item" 
              :class="{ 'song-active': currentPlayingSong?.id === song.id }"
              @click="playSong(song)"
            >
              <img :src="song.thumb" :alt="song.title" class="song-thumbnail" />
              <div class="song-text-info">
                <strong>{{ song.title }}</strong>
                <span>{{ song.artist }}</span>
              </div>
              <span class="song-duration">{{ song.duration }}</span>
              
              <ion-button fill="clear" size="small" @click.stop="toggleFavorite(song)" class="like-button">
                <ion-icon
                  :icon="isFavorite(song) ? heart : heartOutline"
                  :color="isFavorite(song) ? 'danger' : 'medium'"
                ></ion-icon>
              </ion-button>
            </div>
          </div>

          <div class="comments-section-box">
            <h2 class="section-title-yellow">Comentarios del Público</h2>
            <div class="comments-header-info">
              <span>Comentarios ({{ homeComments.length }})</span>
            </div>
            <div class="comment-input-area">
              <ion-avatar class="commenter-avatar">
                <img :src="avatarUrl" alt="User" />
              </ion-avatar>
              <ion-textarea
                placeholder="Escribe un comentario..."
                v-model="commentText"
                :maxlength="500"
                :auto-grow="true"
                class="comment-textarea-box"
              ></ion-textarea>
            </div>
            <div class="comment-actions-row">
              <span class="char-counter">{{ commentText.length }}/500</span>
              <ion-button 
                color="warning" 
                size="small" 
                :disabled="!commentText.trim()" 
                @click="addComment"
              >
                Comentar
              </ion-button>
            </div>

            <div v-if="homeComments.length > 0" class="comments-list-simple">
              <div 
                v-for="comment in homeComments" 
                :key="comment.id" 
                class="comment-item"
              >
                <ion-avatar class="commenter-avatar">
                  <img :src="avatarUrl" alt="User" />
                </ion-avatar>
                <div class="comment-content">
                  <strong>{{ displayName }}</strong>
                  <p>{{ comment.text }}</p>
                  <span class="comment-time">{{ formatCommentTime(comment.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonButton, IonIcon, IonAvatar, IonLabel,
  IonSearchbar, IonContent, IonBadge, IonTextarea, toastController,
} from '@ionic/vue';
import {
  musicalNotesOutline, homeOutline, heartOutline, heart, settingsOutline,
  personOutline, logOutOutline, playCircleOutline,
} from 'ionicons/icons';
import pb from '@/services/pocketbase';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useMusicPlayerStore } from '@/stores/musicPlayerStore';
import { storeToRefs } from 'pinia';

const router = useRouter();
const favoritesStore = useFavoritesStore();
const musicStore = useMusicPlayerStore();
const { currentSong: currentPlayingSong } = storeToRefs(musicStore);

const displayName = ref('Usuario');
const avatarUrl = ref('https://i.pravatar.cc/150?img=1');
const isAdminUser = ref(false);
const q = ref('');
const commentText = ref('');
const loadingPlaylists = ref(false);
const homeComments = ref<any[]>([]);

const favoritesCount = computed(() => favoritesStore.count);

const demoPlaylists = ref([
  { id: 'demo-1', title: 'Desert Waves', image: 'https://picsum.photos/seed/cactus/400', songs: [], isFromDB: false },
  { id: 'demo-2', title: 'Golden Hits', image: 'https://picsum.photos/seed/lake/400', songs: [], isFromDB: false },
  { id: 'demo-3', title: 'Dark Mode', image: 'https://picsum.photos/seed/mountain/400', songs: [], isFromDB: false },
  { id: 'demo-4', title: 'Chill Vibes', image: 'https://picsum.photos/seed/forest/400', songs: [], isFromDB: false },
  { id: 'demo-5', title: 'bien', image: 'https://picsum.photos/seed/bien/400', songs: [], isFromDB: false },
  { id: 'demo-6', title: 'best', image: 'https://picsum.photos/seed/best/400', songs: [], isFromDB: false },
  { id: 'demo-7', title: 'KAROL G', image: 'https://picsum.photos/seed/karolg/400', songs: [], isFromDB: false },
  { id: 'demo-8', title: 'miley cyrus', image: 'https://picsum.photos/seed/miley/400', songs: [], isFromDB: false },
  { id: 'demo-9', title: 'selena', image: 'https://picsum.photos/seed/selena/400', songs: [], isFromDB: false },
  { id: 'demo-10', title: 'fast car', image: 'https://picsum.photos/seed/fastcar/400', songs: [], isFromDB: false },
]);

const dbPlaylists = ref<any[]>([]);
const allPlaylists = computed(() => [...demoPlaylists.value, ...dbPlaylists.value]);

const demoSongs = ref([
  { id: 1, title: 'Rolling in the Deep', artist: 'Adele', duration: '3:48', youtubeId: 'rYEDA3JcQqw', thumb: 'https://img.youtube.com/vi/rYEDA3JcQqw/hqdefault.jpg' },
  { id: 2, title: 'Shape of You', artist: 'Ed Sheeran', duration: '3:53', youtubeId: 'JGwWNGJdvx8', thumb: 'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg' },
  { id: 3, title: 'Diamonds', artist: 'Rihanna', duration: '3:45', youtubeId: 'lWA2pjMjpBs', thumb: 'https://img.youtube.com/vi/lWA2pjMjpBs/hqdefault.jpg' },
  { id: 4, title: 'Bohemian Rhapsody', artist: 'Queen', duration: '5:55', youtubeId: 'fJ9rUzIMcZQ', thumb: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg' },
  { id: 5, title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', youtubeId: 'TUVcZfQe-Kw', thumb: 'https://img.youtube.com/vi/TUVcZfQe-Kw/hqdefault.jpg' },
]);

onMounted(async () => {
  if (!pb.authStore.isValid) {
    router.push('/login');
    return;
  }

  const user = pb.authStore.model;
  displayName.value = user?.name || user?.username || 'Usuario';
  
  if (user?.role === 'admin') {
    isAdminUser.value = true;
  }
  
  if (user?.avatar) {
    avatarUrl.value = pb.getFileUrl(user, user.avatar, { thumb: '100x100' });
  } else {
    avatarUrl.value = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName.value)}&background=f1c40f&color=1a1a1d&size=100`;
  }

  await favoritesStore.loadFavorites();
  await loadPlaylistsFromDB();
});

async function loadPlaylistsFromDB() {
  loadingPlaylists.value = true;
  try {
    const result = await pb.collection('playlists').getList(1, 50, {
      expand: 'owner',
      sort: '-created',
    });

    dbPlaylists.value = result.items.map((p: any) => ({
      ...p,
      image: p.cover ? pb.getFileUrl(p, p.cover) : `https://picsum.photos/seed/${p.id}/400`,
      owner: p.expand?.owner?.name || p.expand?.owner?.username || 'Desconocido',
      isFromDB: true,
    }));
  } catch (err) {
    console.error('Error cargando playlists:', err);
  } finally {
    loadingPlaylists.value = false;
  }
}

function goToSearch() {
  if (q.value.trim()) {
    router.push({ path: '/search', query: { q: q.value } });
  }
}

function logoutUser() {
  pb.authStore.clear();
  showToast('Sesión cerrada');
  router.push('/login');
}

function playSong(song: any) {
  musicStore.playSong(song);
  showToast(`Reproduciendo: ${song.title}`);
}

function handlePlaylistClick(pl: any) {
  if (pl.isFromDB) {
    router.push(`/playlist/${pl.id}`);
  } else {
    playPlaylist(pl);
  }
}

function playPlaylist(pl: any) {
  if (pl.isFromDB && pl.tracks && pl.tracks.length > 0) {
    // Playlist de base de datos con canciones
    musicStore.playQueue(pl.tracks, 0);
    showToast(`Reproduciendo playlist: ${pl.title}`);
  } else if (pl.songs && pl.songs.length > 0) {
    // Playlist demo con canciones
    musicStore.playQueue(pl.songs, 0);
    showToast(`Reproduciendo playlist: ${pl.title}`);
  } else {
    // Si no tiene canciones, reproducir las demo songs
    musicStore.playQueue(demoSongs.value, 0);
    showToast(`Reproduciendo: ${pl.title}`);
  }
}

function isFavorite(song: any) {
  return favoritesStore.isFavorite(song.id);
}

async function toggleFavorite(song: any) {
  try {
    const wasAdded = await favoritesStore.toggleFavorite(song);
    if (wasAdded) {
      showToast('Añadido a favoritos', 'success');
    } else {
      showToast('Eliminado de favoritos');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Error al actualizar favoritos', 'danger');
  }
}

function addComment() {
  if (commentText.value.trim()) {
    homeComments.value.unshift({
      id: Date.now(),
      text: commentText.value.trim(),
      user: displayName.value,
      timestamp: new Date()
    });
    showToast('Comentario añadido');
    commentText.value = '';
  }
}

function formatCommentTime(timestamp: Date) {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(diffMs / 3600000);
  
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  if (hrs < 24) return `Hace ${hrs} h`;
  
  return timestamp.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short'
  });
}

async function showToast(message: string, color: string = 'dark') {
  const toast = await toastController.create({
    message,
    duration: 2000,
    position: 'bottom',
    color,
  });
  await toast.present();
}
</script>

<style scoped>
.dark-header ion-toolbar {
  --background: #1a1a1d;
  --border-color: rgba(241, 196, 15, 0.2);
  --padding-top: 0;
  --padding-bottom: 0;
  --min-height: 60px;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  height: 60px;
}

.brand-button {
  --color: #f1c40f;
  font-size: 1.1rem;
  font-weight: bold;
  text-transform: none;
}

.search-wrapper {
  flex: 1;
  max-width: 500px;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.main-searchbar {
  --background: rgba(26, 26, 29, 0.8);
  --border-radius: 20px;
  --box-shadow: none;
  --color: #f5f5f7;
  --placeholder-color: #92949c;
  --icon-color: #f1c40f;
  padding: 0;
  flex: 1;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-button {
  --color: #f5f5f7;
  font-size: 0.95rem;
  text-transform: none;
}

.home-auth-content {
  --background: linear-gradient(135deg, #1e1b4b 0%, #701a75 100%);
}

.home-auth-content::part(scroll) {
  background: url('/bg.jpg') no-repeat center center fixed;
  background-size: cover;
  position: relative;
}

.home-auth-content::part(scroll)::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(30, 27, 75, 0.85) 0%, rgba(112, 26, 117, 0.85) 100%);
  z-index: -1;
}

.three-column-layout {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 200px 1fr 340px;
  gap: 1.5rem;
  align-items: start;
}

.left-sidebar {
  position: sticky;
  top: 1.5rem;
  background: rgba(21, 21, 23, 0.9);
  border: 1px solid rgba(241, 196, 15, 0.2);
  border-radius: 16px;
  padding: 1.25rem;
  backdrop-filter: blur(12px);
}

.user-profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 0.5rem;
  background: rgba(26, 26, 29, 0.6);
  border-radius: 12px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  border: 3px solid #f1c40f;
}

.user-display-name {
  font-size: 1rem;
  color: #f5f5f7;
  text-align: center;
}

.user-badge {
  font-size: 0.75rem;
  color: #f1c40f;
  padding: 0.25rem 0.6rem;
  background: rgba(241, 196, 15, 0.1);
  border-radius: 999px;
  border: 1px solid #f1c40f;
}

.sidebar-menu,
.sidebar-menu-bottom {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sidebar-menu-bottom {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(241, 196, 15, 0.2);
}

.menu-button {
  --color: #f5f5f7;
  --padding-start: 1rem;
  --padding-end: 1rem;
  text-transform: none;
  justify-content: flex-start;
  font-size: 0.9rem;
}

.menu-button.active {
  --background: rgba(241, 196, 15, 0.15);
  --color: #f1c40f;
}

.admin-button {
  --background: rgba(241, 196, 15, 0.05);
  margin-top: 0.5rem;
  border: 1px solid #f1c40f;
}

.center-feed {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding-bottom: 2rem;
}

.section-title-yellow {
  font-size: 1.5rem;
  margin: 0 0 1.5rem 0;
  color: #f1c40f;
  font-weight: bold;
}

.section-header-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-meta {
  font-size: 0.875rem;
  color: #92949c;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.25rem;
}

.playlist-card-item {
  background: rgba(27, 27, 31, 0.8);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(241, 196, 15, 0.2);
}

.playlist-card-item:hover {
  transform: translateY(-4px);
  border-color: #f1c40f;
  box-shadow: 0 8px 24px rgba(241, 196, 15, 0.3);
}

.card-image-wrapper {
  position: relative;
  aspect-ratio: 1;
}

.card-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-play-button {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f1c40f;
  border: none;
  color: #1a1a1d;
  display: grid;
  place-items: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s;
  font-size: 1.5rem;
}

.playlist-card-item:hover .card-play-button {
  opacity: 1;
}

.card-text-info {
  padding: 1rem;
}

.card-text-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  color: #f5f5f7;
}

.card-text-info p {
  margin: 0;
  font-size: 0.85rem;
  color: #92949c;
}

.artists-horizontal-scroll {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.artist-circle-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  flex-shrink: 0;
}

.artist-circle-card img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid #f1c40f;
  object-fit: cover;
}

.artist-circle-card span {
  font-size: 0.9rem;
  color: #f5f5f7;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.25rem;
}

.album-card-item {
  background: rgba(27, 27, 31, 0.8);
  border-radius: 12px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(241, 196, 15, 0.2);
}

.album-card-item:hover {
  transform: translateY(-4px);
  border-color: #f1c40f;
}

.album-card-item img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.album-card-item h3 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  color: #f5f5f7;
}

.album-card-item p {
  margin: 0;
  font-size: 0.85rem;
  color: #92949c;
}

.right-sidebar {
  position: sticky;
  top: 1.5rem;
  background: rgba(21, 21, 23, 0.9);
  border: 1px solid rgba(241, 196, 15, 0.2);
  border-radius: 16px;
  padding: 1.25rem;
  backdrop-filter: blur(12px);
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.songs-list-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0 2rem 0;
}

.song-row-item {
  display: grid;
  grid-template-columns: 56px 1fr auto auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.song-row-item:hover {
  background: rgba(26, 26, 29, 0.8);
}

.song-row-item.song-active {
  background: rgba(241, 196, 15, 0.15);
  border-left: 3px solid #f1c40f;
}

.song-thumbnail {
  width: 56px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}

.song-text-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.song-text-info strong {
  font-size: 0.9rem;
  color: #f5f5f7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-text-info span {
  font-size: 0.8rem;
  color: #92949c;
}

.song-duration {
  font-size: 0.85rem;
  color: #92949c;
}

.like-button {
  --padding-start: 0.5rem;
  --padding-end: 0.5rem;
}

.comments-section-box {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(241, 196, 15, 0.2);
}

.comments-header-info {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #92949c;
}

.comment-input-area {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.commenter-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: 2px solid #f1c40f;
}

.comment-textarea-box {
  --background: rgba(26, 26, 29, 0.6);
  --border-radius: 12px;
  --color: #f5f5f7;
  --placeholder-color: #92949c;
  --padding-start: 0.75rem;
  --padding-end: 0.75rem;
  --padding-top: 0.75rem;
  --padding-bottom: 0.75rem;
  border: 1px solid rgba(241, 196, 15, 0.2);
  border-radius: 12px;
}

.comment-actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-counter {
  font-size: 0.85rem;
  color: #92949c;
}

.comments-list-simple {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.comment-item {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(27, 27, 31, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(241, 196, 15, 0.1);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.comment-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.comment-content strong {
  color: #f5f5f7;
  font-size: 0.9rem;
}

.comment-content p {
  margin: 0.25rem 0;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  word-break: break-word;
}

.comment-time {
  font-size: 0.75rem;
  color: #92949c;
}

@media (max-width: 1200px) {
  .three-column-layout {
    grid-template-columns: 200px 1fr;
  }
  .right-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .three-column-layout {
    grid-template-columns: 1fr;
  }
  .left-sidebar {
    position: relative;
  }
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }
  .search-wrapper {
    max-width: 100%;
  }
  .nav-links {
    width: 100%;
    justify-content: space-around;
  }
}
</style>
