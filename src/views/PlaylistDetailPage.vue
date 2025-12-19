<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="dark">
        <ion-buttons slot="start">
          <ion-back-button default-href="/playlists" text="" color="warning"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="router.push(`/playlist-form/${id}`)">
            <ion-icon :icon="createOutline" color="warning"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="playlist-content">
      <div class="container">
        
        <!-- Header de playlist -->
        <div class="playlist-header">
          <img :src="coverUrl" :alt="title" class="playlist-cover" />
          
          <div class="playlist-info">
            <ion-badge color="warning">Playlist</ion-badge>
            <h1 class="playlist-title">{{ title }}</h1>
            <p class="playlist-meta">
              <ion-icon :icon="musicalNotesOutline"></ion-icon>
              {{ meta }}
            </p>

            <!-- Acciones -->
            <div class="playlist-actions">
              <ion-button color="warning" @click="playAll">
                <ion-icon :icon="playOutline" slot="start"></ion-icon>
                Reproducir todo
              </ion-button>
              <ion-button fill="outline" @click="playShuffle">
                <ion-icon :icon="shuffleOutline"></ion-icon>
              </ion-button>
              <ion-button fill="outline" @click="router.push(`/playlist-form/${id}`)">
                <ion-icon :icon="createOutline" slot="start"></ion-icon>
                Editar
              </ion-button>
              <ion-button fill="outline" color="danger" @click="deletePl">
                <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                Eliminar
              </ion-button>
            </div>
          </div>
        </div>

        <!-- Lista de canciones -->
        <div class="tracklist-section">
          <div class="tracklist-header">
            <h2 class="section-title">Canciones</h2>
            <ion-badge>{{ tracks.length }} canciones</ion-badge>
          </div>

          <ion-list v-if="tracks.length > 0">
            <ion-item 
              v-for="(track, index) in tracks" 
              :key="index"
              class="track-item"
              @click="playTrack(track, index)"
            >
              <div class="track-number" slot="start">
                <span>{{ index + 1 }}</span>
                <ion-icon :icon="playOutline" class="play-icon"></ion-icon>
              </div>

              <ion-thumbnail slot="start">
                <img :src="trackThumb(track)" :alt="track.title" />
              </ion-thumbnail>

              <ion-label>
                <h3>{{ track.title || "Sin título" }}</h3>
                <p>{{ track.artist || "Artista desconocido" }}</p>
              </ion-label>

              <span class="track-duration" slot="end">{{ track.duration || "-" }}</span>

              <ion-button 
                fill="clear" 
                size="small" 
                slot="end"
                @click.stop="showTrackMenu(track)"
              >
                <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
              </ion-button>
            </ion-item>
          </ion-list>

          <!-- Estado vacío -->
          <div v-else class="empty-state">
            <ion-icon :icon="musicalNotesOutline" class="empty-icon"></ion-icon>
            <p>Esta playlist no tiene canciones aún.</p>
            <ion-button color="warning" @click="router.push(`/playlist-form/${id}`)">
              Agregar canciones
            </ion-button>
          </div>
        </div>

        <!-- Acciones finales -->
        <div class="bottom-actions">
          <ion-button color="warning" @click="router.push('/playlist-form')">
            <ion-icon :icon="addOutline" slot="start"></ion-icon>
            Crear nueva playlist
          </ion-button>
          <ion-button fill="outline" @click="router.push('/playlists')">
            Ver todas mis playlists
          </ion-button>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonButton, IonContent, IonList, IonItem, IonLabel, IonThumbnail,
  IonBadge, IonIcon, alertController, toastController,
} from '@ionic/vue';
import {
  createOutline, musicalNotesOutline, playOutline, shuffleOutline,
  trashOutline, addOutline, ellipsisVerticalOutline,
} from 'ionicons/icons';
import pb from '@/services/pocketbase';
import { useMusicPlayerStore } from '@/stores/musicPlayerStore';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;
const musicStore = useMusicPlayerStore();

const me = pb.authStore.model;
if (!me || !pb.authStore.isValid) {
  router.push('/login');
}

const title = ref('Cargando...');
const meta = ref('—');
const coverUrl = ref('https://picsum.photos/seed/pldetail/400');
const tracks = ref<any[]>([]);

function trackThumb(t: any) {
  return t.youtubeId
    ? `https://img.youtube.com/vi/${t.youtubeId}/hqdefault.jpg`
    : 'https://picsum.photos/seed/song/80';
}

function playAll() {
  if (!tracks.value.length) {
    showToast('Esta playlist no tiene canciones', 'warning');
    return;
  }

  // Reproducir todas las canciones desde el inicio
  musicStore.playQueue(tracks.value, 0);
  showToast('Reproduciendo todas las canciones', 'success');
}

function playShuffle() {
  if (!tracks.value.length) {
    showToast('Esta playlist no tiene canciones', 'warning');
    return;
  }

  // Crear una copia mezclada de las canciones
  const shuffled = [...tracks.value].sort(() => Math.random() - 0.5);
  musicStore.playQueue(shuffled, 0);
  showToast('Reproducción aleatoria activada', 'success');
}

function playTrack(track: any, index: number) {
  if (!track.youtubeId) {
    showToast('Esta canción no tiene enlace de YouTube', 'warning');
    return;
  }

  // Reproducir desde la canción seleccionada
  musicStore.playQueue(tracks.value, index);
  showToast(`Reproduciendo: ${track.title}`, 'success');
}

function showTrackMenu(track: any) {
  console.log('Menú de:', track.title);
  showToast('Menú de opciones próximamente', 'dark');
}

async function deletePl() {
  const alert = await alertController.create({
    header: 'Eliminar playlist',
    message: '¿Estás seguro de eliminar esta playlist?',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: async () => {
          try {
            await pb.collection('playlists').delete(id);
            showToast('Playlist eliminada', 'success');
            router.push('/playlists');
          } catch (err) {
            showToast('Error al eliminar', 'danger');
          }
        },
      },
    ],
  });
  await alert.present();
}

onMounted(async () => {
  try {
    const pl = await pb.collection('playlists').getOne(id);

    title.value = pl.title || 'Sin título';
    meta.value = `${pl.tracksCount ?? 0} canciones • ${pl.duration || '-'}`;

    coverUrl.value = pl.cover
      ? pb.getFileUrl(pl, pl.cover, { thumb: '400x0' })
      : 'https://picsum.photos/seed/pldetail/400';

    tracks.value = Array.isArray(pl.tracks) ? pl.tracks : [];

    console.log('📀 Canciones cargadas:', tracks.value.length);
    console.log('🎵 Primera canción:', tracks.value[0]);
  } catch (err) {
    console.error(err);
    title.value = 'Playlist no encontrada';
    showToast('Error al cargar playlist', 'danger');
  }
});

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
.playlist-content {
  --background: linear-gradient(135deg, #1e1b4b 0%, #701a75 100%);
}

.playlist-content::part(scroll) {
  background: url('/bg.jpg') no-repeat center center fixed;
  background-size: cover;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.playlist-header {
  display: flex;
  gap: 2rem;
  align-items: flex-end;
  margin-bottom: 3rem;
  padding: 2rem 0;
  border-bottom: 1px solid rgba(241, 196, 15, 0.2);
}

.playlist-cover {
  width: 240px;
  height: 240px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid rgba(241, 196, 15, 0.3);
}

.playlist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.playlist-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #f5f5f7;
  margin: 0;
}

.playlist-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.playlist-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.tracklist-section {
  margin: 2rem 0;
}

.tracklist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #f1c40f;
  margin: 0;
}

.track-item {
  --background: rgba(26, 26, 29, 0.6);
  --border-color: rgba(241, 196, 15, 0.1);
  margin-bottom: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.track-item:hover {
  --background: rgba(26, 26, 29, 0.9);
}

.track-number {
  width: 40px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.track-number span {
  display: block;
}

.track-item:hover .track-number span {
  display: none;
}

.play-icon {
  display: none;
  color: #f1c40f;
}

.track-item:hover .play-icon {
  display: block;
}

.track-duration {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 4rem 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  color: rgba(241, 196, 15, 0.3);
}

.empty-state p {
  color: rgba(255, 255, 255, 0.7);
}

.bottom-actions {
  display: flex;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(241, 196, 15, 0.2);
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .playlist-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .playlist-cover {
    width: 180px;
    height: 180px;
  }

  .playlist-title {
    font-size: 1.75rem;
  }

  .playlist-actions {
    justify-content: center;
  }

  .bottom-actions {
    flex-direction: column;
  }
}
</style>
