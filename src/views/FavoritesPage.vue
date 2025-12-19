<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="dark">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home-auth" text="" color="warning"></ion-back-button>
        </ion-buttons>
        <ion-title>Favoritos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="favorites-content">
      <div class="container">
        
        <!-- Header de Favoritos -->
        <div class="favorites-header">
          <div class="favorites-icon">
            <ion-icon :icon="heartOutline" class="heart-icon"></ion-icon>
          </div>
          
          <div class="favorites-info">
            <ion-badge color="danger">Playlist</ion-badge>
            <h1 class="favorites-title">Canciones Favoritas</h1>
            <p class="favorites-meta">
              {{ displayName }} • {{ favoriteSongs.length }} canciones
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <ion-spinner name="crescent" color="danger"></ion-spinner>
          <p>Cargando tus favoritos...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="favoriteSongs.length === 0" class="empty-state">
          <ion-icon :icon="heartOutline" class="empty-icon"></ion-icon>
          <h2>No tienes favoritos aún</h2>
          <p>Empieza a agregar canciones a tus favoritos haciendo clic en el ❤️</p>
          <ion-button color="warning" @click="router.push('/home-auth')">
            Explorar música
          </ion-button>
        </div>

        <!-- Lista de Favoritos -->
        <div v-else class="favorites-list">
          <div class="list-header">
            <ion-button color="warning" size="large" @click="playAll">
              <ion-icon :icon="playOutline" slot="start"></ion-icon>
              Reproducir todo
            </ion-button>
            <ion-button fill="outline" @click="clearAllFavorites">
              Limpiar favoritos
            </ion-button>
          </div>

          <ion-list>
            <ion-item 
              v-for="(song, index) in favoriteSongs" 
              :key="song.id"
              class="track-item"
              :class="{ 'track-item--playing': currentSong?.id === song.id }"
              @click="playSong(song, index)"
            >
              <div class="track-number" slot="start">
                <span class="number">{{ index + 1 }}</span>
                <ion-icon :icon="playOutline" class="play-icon"></ion-icon>
              </div>

              <ion-thumbnail slot="start">
                <img :src="song.thumb" :alt="song.title" />
              </ion-thumbnail>

              <ion-label>
                <h3>{{ song.title }}</h3>
                <p>{{ song.artist }}</p>
              </ion-label>

              <span class="track-duration" slot="end">{{ song.duration }}</span>

              <ion-button 
                fill="clear" 
                color="danger" 
                size="small"
                slot="end"
                @click.stop="removeFavorite(song)"
              >
                <ion-icon :icon="heart"></ion-icon>
              </ion-button>
            </ion-item>
          </ion-list>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonList, IonItem, IonLabel, IonThumbnail, IonButton,
  IonIcon, IonBadge, IonSpinner, alertController, toastController,
} from '@ionic/vue';
import {
  heartOutline, heart, playOutline,
} from 'ionicons/icons';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useMusicPlayerStore } from '@/stores/musicPlayerStore';
import pb from '@/services/pocketbase';

const router = useRouter();
const loading = ref(true);

// Verificar autenticación
const user = pb.authStore.model;
if (!user || !pb.authStore.isValid) {
  router.push('/login');
}

// Stores
const favoritesStore = useFavoritesStore();
const playerStore = useMusicPlayerStore();
const { currentSong } = storeToRefs(playerStore);
const { playSong: playStoreSong, playQueue } = playerStore;

// Usuario actual
const displayName = computed(() => {
  return user?.displayName || user?.name || user?.username || 'Usuario';
});

// Obtener canciones favoritas
const favoriteSongs = computed(() => {
  return favoritesStore.getFavoriteSongs();
});

// Cargar favoritos al montar
onMounted(async () => {
  try {
    loading.value = true;
    await favoritesStore.loadFavorites();
  } catch (error) {
    console.error('Error cargando favoritos:', error);
    showToast('Error al cargar favoritos', 'danger');
  } finally {
    loading.value = false;
  }
});

// Reproducir una canción
function playSong(song: any, index: number) {
  playStoreSong(song);
  showToast(`Reproduciendo: ${song.title}`, 'success');
}

// Reproducir todas las canciones
function playAll() {
  if (favoriteSongs.value.length === 0) {
    showToast('No hay canciones para reproducir', 'warning');
    return;
  }
  playQueue(favoriteSongs.value, 0);
  showToast('Reproduciendo todas las canciones', 'success');
}

// Quitar de favoritos
async function removeFavorite(song: any) {
  try {
    await favoritesStore.toggleFavorite(song);
    showToast('Eliminado de favoritos', 'success');
  } catch (error) {
    console.error('Error quitando de favoritos:', error);
    showToast('No se pudo quitar la canción', 'danger');
  }
}

// Limpiar todos los favoritos
async function clearAllFavorites() {
  const alert = await alertController.create({
    header: 'Limpiar favoritos',
    message: '¿Estás seguro de quitar todas las canciones de favoritos?',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Limpiar',
        role: 'destructive',
        handler: async () => {
          try {
            for (const song of favoriteSongs.value) {
              await favoritesStore.toggleFavorite(song);
            }
            showToast('Favoritos limpiados', 'success');
          } catch (error) {
            console.error('Error limpiando favoritos:', error);
            showToast('No se pudieron limpiar los favoritos', 'danger');
          }
        },
      },
    ],
  });
  await alert.present();
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
.favorites-content {
  --background: linear-gradient(135deg, #1e1b4b 0%, #701a75 100%);
}

.favorites-content::part(scroll) {
  background: url('/bg.jpg') no-repeat center center fixed;
  background-size: cover;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

/* Header de Favoritos */
.favorites-header {
  display: flex;
  gap: 2rem;
  align-items: flex-end;
  margin-bottom: 3rem;
  padding: 2rem 0;
  border-bottom: 1px solid rgba(241, 196, 15, 0.2);
}

.favorites-icon {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 40px rgba(255, 107, 107, 0.4);
  flex-shrink: 0;
}

.heart-icon {
  font-size: 5rem;
  color: white;
}

.favorites-info {
  flex: 1;
}

.favorites-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0.75rem 0 0.5rem 0;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.favorites-meta {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin: 0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-state p {
  color: rgba(255, 255, 255, 0.7);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 8rem;
  color: rgba(255, 107, 107, 0.3);
}

.empty-state h2 {
  font-size: 1.5rem;
  margin: 0;
  color: #f5f5f7;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  max-width: 400px;
  margin: 0;
}

/* Lista de Favoritos */
.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.list-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(241, 196, 15, 0.2);
  flex-wrap: wrap;
}

.track-item {
  --background: rgba(26, 26, 29, 0.6);
  --border-color: rgba(241, 196, 15, 0.1);
  margin-bottom: 0.25rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.track-item:hover {
  --background: rgba(26, 26, 29, 0.9);
}

.track-item--playing {
  --background: rgba(255, 107, 107, 0.15);
  border-left: 3px solid #ff6b6b;
}

.track-number {
  width: 40px;
  text-align: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.number {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

.play-icon {
  position: absolute;
  opacity: 0;
  transition: opacity 0.2s;
  color: #ff6b6b;
  font-size: 1.2rem;
}

.track-item:hover .number {
  opacity: 0;
}

.track-item:hover .play-icon {
  opacity: 1;
}

.track-duration {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-right: 1rem;
}

@media (max-width: 768px) {
  .favorites-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .favorites-icon {
    width: 150px;
    height: 150px;
  }

  .heart-icon {
    font-size: 4rem;
  }

  .favorites-title {
    font-size: 1.75rem;
  }

  .list-header {
    flex-direction: column;
    align-items: stretch;
  }

  .track-duration {
    display: none;
  }
}
</style>
