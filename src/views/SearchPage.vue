<template>
  <ion-page>
    <!-- Header -->
    <ion-header class="dark-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home-auth" text="" color="warning"></ion-back-button>
        </ion-buttons>
        
        <ion-searchbar
          v-model="q"
          placeholder="Buscar canciones, artistas o playlists..."
          @keyup.enter="performSearch"
          @ionInput="onSearchInput"
          class="search-bar"
          search-icon="search-outline"
          clear-icon="close-outline"
        ></ion-searchbar>

        <ion-buttons slot="end">
          <ion-button color="warning" @click="performSearch" :disabled="!q.trim()">
            Buscar
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="search-content">
      <div class="container">

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <ion-spinner name="crescent" color="warning"></ion-spinner>
          <p>Buscando...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading && totalResults === 0 && q" class="empty-state">
          <ion-icon :icon="searchOutline" class="empty-icon"></ion-icon>
          <h2>No se encontraron resultados</h2>
          <p>Intenta con otros términos de búsqueda</p>
          <ion-button color="warning" @click="q = ''; playlists = []; songs = []; artists = [];">
            Limpiar búsqueda
          </ion-button>
        </div>

        <!-- Results -->
        <div v-else-if="totalResults > 0" class="results">
          <div class="results-header">
            <h1 class="page-title">
              Resultados para: <span class="query-text">{{ q }}</span>
            </h1>
            <ion-badge color="warning">{{ totalResults }} resultados</ion-badge>
          </div>

          <!-- Playlists Section -->
          <section v-if="playlists.length > 0" class="section">
            <div class="section-header">
              <ion-icon :icon="musicalNotesOutline" color="warning"></ion-icon>
              <h2 class="section-title">Playlists</h2>
              <ion-badge color="medium">{{ playlists.length }}</ion-badge>
            </div>

            <div class="playlist-grid">
              <ion-card 
                v-for="pl in playlists" 
                :key="pl.id"
                class="playlist-card"
                @click="goToPlaylist(pl.id)"
                button
              >
                <div class="playlist-card__image">
                  <img 
                    :src="pl.cover || 'https://picsum.photos/seed/' + pl.id + '/400'" 
                    :alt="pl.title"
                  />
                  <ion-button 
                    class="play-btn" 
                    fill="solid" 
                    color="warning"
                    shape="round"
                    @click.stop="playPlaylist(pl)"
                  >
                    <ion-icon :icon="playOutline"></ion-icon>
                  </ion-button>
                </div>
                <ion-card-header>
                  <ion-card-title>{{ pl.title }}</ion-card-title>
                  <ion-card-subtitle v-if="pl.expand?.owner">
                    {{ pl.expand.owner.name || pl.expand.owner.username }}
                  </ion-card-subtitle>
                  <ion-card-subtitle v-else>
                    {{ pl.tracks?.length || 0 }} canciones
                  </ion-card-subtitle>
                </ion-card-header>
              </ion-card>
            </div>
          </section>

          <!-- Songs Section -->
          <section v-if="songs.length > 0" class="section">
            <div class="section-header">
              <ion-icon :icon="musicalNoteOutline" color="warning"></ion-icon>
              <h2 class="section-title">Canciones</h2>
              <ion-badge color="medium">{{ songs.length }}</ion-badge>
            </div>

            <ion-list class="songs-list">
              <ion-item 
                v-for="(song, idx) in songs"
                :key="`${song.playlistId}-${idx}`"
                class="song-item"
                @click="playSong(song)"
                button
                detail="false"
              >
                <ion-thumbnail slot="start">
                  <img 
                    :src="song.thumb || 'https://picsum.photos/seed/' + song.youtubeId + '/300'" 
                    :alt="song.title"
                  />
                </ion-thumbnail>

                <ion-label>
                  <h3>{{ song.title }}</h3>
                  <p>{{ song.artist }}</p>
                  <ion-note color="warning">{{ song.playlistTitle }}</ion-note>
                </ion-label>

                <ion-note slot="end" class="duration">
                  {{ song.duration || '0:00' }}
                </ion-note>

                <ion-button 
                  slot="end" 
                  fill="clear" 
                  @click.stop="toggleFavorite(song)"
                >
                  <ion-icon 
                    :icon="isFavorite(song) ? heart : heartOutline"
                    :color="isFavorite(song) ? 'danger' : 'medium'"
                  ></ion-icon>
                </ion-button>
              </ion-item>
            </ion-list>
          </section>

          <!-- Artists Section -->
          <section v-if="artists.length > 0" class="section">
            <div class="section-header">
              <ion-icon :icon="peopleOutline" color="warning"></ion-icon>
              <h2 class="section-title">Artistas</h2>
              <ion-badge color="medium">{{ artists.length }}</ion-badge>
            </div>

            <div class="artists-grid">
              <div 
                v-for="artist in artists" 
                :key="artist.name"
                class="artist-card"
                @click="searchByArtist(artist.name)"
              >
                <ion-avatar class="artist-avatar">
                  <img 
                    :src="'https://picsum.photos/seed/' + artist.name + '/150'" 
                    :alt="artist.name"
                  />
                </ion-avatar>
                <span class="artist-name">{{ artist.name }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- Initial State -->
        <div v-else class="initial-state">
          <ion-icon :icon="searchOutline" class="initial-icon"></ion-icon>
          <h2>Busca tu música favorita</h2>
          <p>Escribe el nombre de una canción, artista o playlist</p>
          
          <div class="quick-searches">
            <h3>Búsquedas populares</h3>
            <div class="chips-container">
              <ion-chip color="warning" @click="quickSearch('Adele')">
                <ion-label>Adele</ion-label>
              </ion-chip>
              <ion-chip color="warning" @click="quickSearch('Queen')">
                <ion-label>Queen</ion-label>
              </ion-chip>
              <ion-chip color="warning" @click="quickSearch('Ed Sheeran')">
                <ion-label>Ed Sheeran</ion-label>
              </ion-chip>
              <ion-chip color="warning" @click="quickSearch('Rihanna')">
                <ion-label>Rihanna</ion-label>
              </ion-chip>
            </div>
          </div>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton,
  IonSearchbar, IonContent, IonSpinner, IonIcon, IonBadge, IonCard,
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonList, IonItem,
  IonThumbnail, IonLabel, IonNote, IonAvatar, IonChip, toastController,
} from '@ionic/vue';
import {
  searchOutline, musicalNotesOutline, musicalNoteOutline, peopleOutline,
  playOutline, heart, heartOutline,
} from 'ionicons/icons';
import pb from '@/services/pocketbase';
import { useMusicPlayerStore } from '@/stores/musicPlayerStore';
import { useFavoritesStore } from '@/stores/favoritesStore';

const router = useRouter();
const route = useRoute();
const playerStore = useMusicPlayerStore();
const favoritesStore = useFavoritesStore();

const q = ref(route.query.q as string || '');
const loading = ref(false);
const error = ref<string | null>(null);

// Resultados
const playlists = ref<any[]>([]);
const songs = ref<any[]>([]);
const artists = ref<any[]>([]);

const totalResults = computed(() =>
  playlists.value.length + songs.value.length + artists.value.length
);

// Función para escapar caracteres especiales en PocketBase filter
function escapeFilter(str: string) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

async function searchAll() {
  const term = q.value.trim();
  
  if (!term) {
    playlists.value = [];
    songs.value = [];
    artists.value = [];
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const escapedTerm = escapeFilter(term);
    
    // 1️⃣ Buscar playlists
    let pbPlaylists = [];
    try {
      pbPlaylists = await pb.collection('playlists').getFullList({
        filter: `title ~ "${escapedTerm}" || description ~ "${escapedTerm}"`,
        expand: 'owner',
        sort: '-created'
      });
    } catch (err) {
      console.error('Error buscando playlists:', err);
      try {
        pbPlaylists = await pb.collection('playlists').getFullList({
          filter: `title ~ "${escapedTerm}"`,
          expand: 'owner',
          sort: '-created'
        });
      } catch (err2) {
        console.error('Error en búsqueda simple:', err2);
      }
    }

    playlists.value = pbPlaylists.map((p: any) => ({
      ...p,
      cover: p.cover ? pb.getFileUrl(p, p.cover) : null,
    }));

    // 2️⃣ Buscar en tracks internos
    const foundSongs: any[] = [];
    const foundArtists = new Set<string>();
    const termLower = term.toLowerCase();

    pbPlaylists.forEach((p: any) => {
      if (!Array.isArray(p.tracks)) return;

      p.tracks.forEach((t: any, idx: number) => {
        const titleMatch = t.title?.toLowerCase().includes(termLower);
        const artistMatch = t.artist?.toLowerCase().includes(termLower);

        if (titleMatch || artistMatch) {
          foundSongs.push({
            playlistId: p.id,
            playlistTitle: p.title,
            ...t,
            _id: `${p.id}-${idx}`
          });

          if (t.artist) {
            foundArtists.add(t.artist);
          }
        }
      });
    });

    // 3️⃣ Buscar en canciones demo
    const demoSongs = [
      { id: 1, title: 'Rolling in the Deep', artist: 'Adele', duration: '3:48', youtubeId: 'rYEDA3JcQqw', thumb: 'https://img.youtube.com/vi/rYEDA3JcQqw/hqdefault.jpg' },
      { id: 2, title: 'Shape of You', artist: 'Ed Sheeran', duration: '3:53', youtubeId: 'JGwWNGJdvx8', thumb: 'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg' },
      { id: 3, title: 'Diamonds', artist: 'Rihanna', duration: '3:45', youtubeId: 'lWA2pjMjpBs', thumb: 'https://img.youtube.com/vi/lWA2pjMjpBs/hqdefault.jpg' },
      { id: 4, title: 'Bohemian Rhapsody', artist: 'Queen', duration: '5:55', youtubeId: 'fJ9rUzIMcZQ', thumb: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg' },
      { id: 5, title: 'Levitating', artist: 'Dua Lipa', duration: '3:23', youtubeId: 'TUVcZfQe-Kw', thumb: 'https://img.youtube.com/vi/TUVcZfQe-Kw/hqdefault.jpg' },
    ];

    demoSongs.forEach(song => {
      const titleMatch = song.title.toLowerCase().includes(termLower);
      const artistMatch = song.artist.toLowerCase().includes(termLower);

      if (titleMatch || artistMatch) {
        foundSongs.push({
          ...song,
          playlistId: 'demo',
          playlistTitle: 'Canciones Demo',
          _id: `demo-${song.id}`
        });

        foundArtists.add(song.artist);
      }
    });

    songs.value = foundSongs;
    artists.value = [...foundArtists].map(a => ({ name: a }));

  } catch (err) {
    console.error('Error en búsqueda:', err);
    error.value = 'Error al realizar la búsqueda';
    showToast('Error al realizar la búsqueda', 'danger');
  } finally {
    loading.value = false;
  }
}

function onSearchInput(event: any) {
  q.value = event.target.value;
}

function performSearch() {
  const term = q.value.trim();
  if (!term) return;

  router.push({
    path: '/search',
    query: { q: term }
  });
}

function quickSearch(term: string) {
  q.value = term;
  performSearch();
}

function goToPlaylist(id: string) {
  router.push(`/playlist/${id}`);
}

function playSong(song: any) {
  playerStore.playSong(song);
  showToast(`Reproduciendo: ${song.title}`, 'success');
}

function playPlaylist(pl: any) {
  if (pl.tracks && pl.tracks.length > 0) {
    playerStore.playQueue(pl.tracks, 0);
    showToast(`Reproduciendo playlist: ${pl.title}`, 'success');
  }
}

function searchByArtist(artistName: string) {
  q.value = artistName;
  performSearch();
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

async function showToast(message: string, color: string = 'dark') {
  const toast = await toastController.create({
    message,
    duration: 2000,
    position: 'bottom',
    color,
  });
  await toast.present();
}

// Watch para cambios en query
watch(() => route.query.q, (newVal) => {
  q.value = (newVal as string) || '';
  if (newVal) {
    searchAll();
  }
});

onMounted(() => {
  if (q.value) {
    searchAll();
  }
});
</script>

<style scoped>
.dark-header ion-toolbar {
  --background: #1a1a1d;
  --border-color: rgba(241, 196, 15, 0.2);
  --padding-top: 0;
  --padding-bottom: 0;
  --min-height: 60px;
}

.search-bar {
  --background: rgba(26, 26, 29, 0.8);
  --border-radius: 20px;
  --box-shadow: none;
  --color: #f5f5f7;
  --placeholder-color: #92949c;
  --icon-color: #f1c40f;
  padding: 0;
}

.search-content {
  --background: linear-gradient(135deg, #1e1b4b 0%, #701a75 100%);
}

.search-content::part(scroll) {
  background: url('/bg.jpg') no-repeat center center fixed;
  background-size: cover;
  position: relative;
}

.search-content::part(scroll)::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(30, 27, 75, 0.85) 0%, rgba(112, 26, 117, 0.85) 100%);
  z-index: -1;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.loading-state p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
}

/* Empty State */
.empty-state, .initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1.5rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.empty-icon, .initial-icon {
  font-size: 5rem;
  color: rgba(241, 196, 15, 0.5);
}

.initial-state h2, .empty-state h2 {
  color: #f5f5f7;
  margin: 0;
  font-size: 1.75rem;
}

.initial-state p, .empty-state p {
  font-size: 1.1rem;
  max-width: 400px;
  margin: 0;
}

.quick-searches {
  margin-top: 2rem;
}

.quick-searches h3 {
  color: #f1c40f;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

/* Results */
.results {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.results-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.75rem;
  margin: 0;
  color: #f5f5f7;
  flex: 1;
}

.query-text {
  color: #f1c40f;
}

/* Section */
.section {
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  margin: 0;
  color: #f1c40f;
  flex: 1;
}

/* Playlists Grid */
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
}

.playlist-card {
  --background: rgba(27, 27, 31, 0.8);
  margin: 0;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(241, 196, 15, 0.2);
}

.playlist-card:hover {
  transform: translateY(-4px);
  border-color: #f1c40f;
  box-shadow: 0 8px 24px rgba(241, 196, 15, 0.3);
}

.playlist-card__image {
  position: relative;
  aspect-ratio: 1;
}

.playlist-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-btn {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.playlist-card:hover .play-btn {
  opacity: 1;
}

/* Songs List */
.songs-list {
  background: transparent;
}

.song-item {
  --background: rgba(27, 27, 31, 0.6);
  --border-color: rgba(241, 196, 15, 0.1);
  margin-bottom: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.song-item:hover {
  --background: rgba(27, 27, 31, 0.9);
  transform: translateX(4px);
}

.duration {
  margin-right: 0.5rem;
}

/* Artists Grid */
.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1.5rem;
}

.artist-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.3s;
  background: rgba(27, 27, 31, 0.6);
  border: 1px solid rgba(241, 196, 15, 0.2);
}

.artist-card:hover {
  background: rgba(27, 27, 31, 0.9);
  transform: scale(1.05);
  border-color: #f1c40f;
}

.artist-avatar {
  width: 100px;
  height: 100px;
  border: 3px solid #f1c40f;
}

.artist-name {
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  color: #f5f5f7;
}

@media (max-width: 768px) {
  .playlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .page-title {
    font-size: 1.25rem;
  }
}
</style>
