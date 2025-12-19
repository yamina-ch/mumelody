<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="dark">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home-auth" text="" color="warning"></ion-back-button>
        </ion-buttons>
        <ion-title>Mis Playlists</ion-title>
        <ion-buttons slot="end">
          <!-- Badge para mostrar que Realtime está activo -->
          <ion-badge v-if="realtimeActive" color="success" style="margin-right: 10px;">
            🔴 LIVE
          </ion-badge>
          <ion-button @click="router.push('/playlist-form')">
            <ion-icon :icon="addOutline" color="warning"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="playlists-content">
      <div class="container">
        
        <div class="page-header">
          <div>
            <h1 class="page-title">Mis Playlists</h1>
            <p class="page-subtitle">
              Colecciones creadas por ti y por la comunidad.
              <span v-if="realtimeActive" class="realtime-indicator">
                🔴 Sincronización en tiempo real activa
              </span>
            </p>
          </div>
          <ion-button color="warning" @click="router.push('/playlist-form')">
            <ion-icon :icon="addOutline" slot="start"></ion-icon>
            Nueva Playlist
          </ion-button>
        </div>

        <div class="playlists-grid" v-if="playlists.length > 0">
          <ion-card 
            v-for="pl in playlists" 
            :key="pl.id" 
            class="playlist-card"
          >
            <div class="card-image" @click="goToPlaylist(pl.id)">
              <img :src="cover(pl)" :alt="pl.title" />
              <ion-button 
                class="play-overlay" 
                fill="clear"
                @click.stop="playPlaylist(pl)"
              >
                <ion-icon :icon="playCircleOutline" size="large"></ion-icon>
              </ion-button>
            </div>

            <ion-card-content>
              <h2 class="card-title" @click="goToPlaylist(pl.id)">
                {{ pl.title || "Sin título" }}
              </h2>

              <p class="card-meta">
                <ion-icon :icon="musicalNotesOutline"></ion-icon>
                {{ pl.tracksCount ?? 0 }} canciones
                <span class="separator">•</span>
                {{ pl.duration || "-" }}
              </p>

              <div class="card-actions">
                <ion-button fill="clear" size="small" @click="playPlaylist(pl)">
                  <ion-icon :icon="playOutline"></ion-icon>
                </ion-button>
                <ion-button fill="clear" size="small" @click="router.push('/playlist-form/' + pl.id)">
                  <ion-icon :icon="createOutline"></ion-icon>
                </ion-button>
                <ion-button fill="clear" size="small" color="danger" @click="confirmDelete(pl)">
                  <ion-icon :icon="trashOutline"></ion-icon>
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <div v-else class="empty-state">
          <ion-icon :icon="musicalNotesOutline" class="empty-icon"></ion-icon>
          <p>No se encontraron playlists.</p>
          <ion-button color="warning" @click="router.push('/playlist-form')">
            Crear la primera
          </ion-button>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonButton, IonContent, IonCard, IonCardContent, IonIcon, IonBadge,
  alertController, toastController,
} from '@ionic/vue';
import {
  addOutline, playCircleOutline, musicalNotesOutline, playOutline,
  createOutline, trashOutline,
} from 'ionicons/icons';
import pb from '@/services/pocketbase';
import { useMusicPlayerStore } from '@/stores/musicPlayerStore';

const router = useRouter();
const me = pb.authStore.model;
const musicStore = useMusicPlayerStore();

if (!me || !pb.authStore.isValid) {
  router.push('/login');
}

const playlists = ref<any[]>([]);
const realtimeActive = ref(false);

function cover(pl: any) {
  return pl.cover
    ? pb.getFileUrl(pl, pl.cover, { thumb: '512x0' })
    : 'https://picsum.photos/seed/playlist/512';
}

async function fetchPlaylists() {
  try {
    const result = await pb.collection('playlists').getList(1, 100, {
      filter: `owner = "${me.id}"`,
      sort: '-created',
    });
    playlists.value = result.items;
    console.log('📋 Playlists cargadas:', playlists.value.length);
  } catch (err) {
    console.error(err);
    showToast('Error al cargar playlists', 'danger');
  }
}

// 🔴 NUEVO: Suscribirse a cambios en tiempo real
function subscribeToRealtime() {
  console.log('🔴 ACTIVANDO Realtime...');
  
  pb.collection('playlists').subscribe('*', (e) => {
    console.log('📡 Cambio detectado:', e.action, e.record);

    // Solo procesar si es una playlist del usuario actual
    if (e.record.owner === me.id) {
      
      if (e.action === 'create') {
        console.log('✅ Nueva playlist:', e.record.title);
        playlists.value.unshift(e.record);
        showToast(`Nueva playlist: ${e.record.title}`, 'success');
        
      } else if (e.action === 'update') {
        console.log('🔄 Playlist actualizada:', e.record.title);
        const index = playlists.value.findIndex(p => p.id === e.record.id);
        if (index !== -1) {
          playlists.value[index] = e.record;
          showToast(`Actualizada: ${e.record.title}`, 'warning');
        }
        
      } else if (e.action === 'delete') {
        console.log('❌ Playlist eliminada');
        playlists.value = playlists.value.filter(p => p.id !== e.record.id);
        showToast('Playlist eliminada', 'danger');
      }
    }
  });

  realtimeActive.value = true;
  console.log('✅ Realtime ACTIVADO');
}

// 🔴 NUEVO: Desuscribirse al salir
function unsubscribeFromRealtime() {
  console.log('🔴 DESACTIVANDO Realtime...');
  pb.collection('playlists').unsubscribe('*');
  realtimeActive.value = false;
  console.log('✅ Realtime DESACTIVADO');
}

function goToPlaylist(id: string) {
  router.push(`/playlist/${id}`);
}

async function playPlaylist(pl: any) {
  try {
    const full = await pb.collection('playlists').getOne(pl.id);
    
    if (full.tracks && full.tracks.length > 0) {
      musicStore.playQueue(full.tracks, 0);
      showToast(`Reproduciendo: ${pl.title}`, 'success');
    } else {
      showToast('Esta playlist está vacía', 'warning');
    }
  } catch (err) {
    console.error(err);
    showToast('Error al reproducir', 'danger');
  }
}

async function confirmDelete(pl: any) {
  const alert = await alertController.create({
    header: 'Eliminar playlist',
    message: `¿Eliminar la playlist "${pl.title}"?`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: async () => {
          try {
            await pb.collection('playlists').delete(pl.id);
            // No necesitamos fetchPlaylists() porque Realtime lo hará automáticamente
            showToast('Playlist eliminada', 'success');
          } catch (err) {
            showToast('Error al eliminar', 'danger');
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

// 🔴 Activar Realtime al montar el componente
onMounted(async () => {
  await fetchPlaylists();
  subscribeToRealtime(); // ← ESTO ES LO NUEVO
});

// 🔴 Desactivar Realtime al salir
onBeforeUnmount(() => {
  unsubscribeFromRealtime(); // ← ESTO ES LO NUEVO
});
</script>

<style scoped>
.playlists-content {
  --background: linear-gradient(135deg, #1e1b4b 0%, #701a75 100%);
}

.playlists-content::part(scroll) {
  background: url('/bg.jpg') no-repeat center center fixed;
  background-size: cover;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #f1c40f;
  margin: 0;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.7);
  margin: 0.5rem 0 0 0;
}

/* 🔴 NUEVO: Indicador de realtime */
.realtime-indicator {
  display: block;
  margin-top: 0.5rem;
  color: #4ade80;
  font-size: 0.9rem;
  font-weight: 500;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.playlist-card {
  background: rgba(27, 27, 31, 0.8);
  border: 1px solid rgba(241, 196, 15, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  margin: 0;
}

.playlist-card:hover {
  transform: translateY(-4px);
  border-color: #f1c40f;
  box-shadow: 0 8px 24px rgba(241, 196, 15, 0.15);
}

.card-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  cursor: pointer;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.playlist-card:hover .card-image img {
  transform: scale(1.05);
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  --background: #f1c40f;
  --color: #1a1a1d;
  font-size: 3rem;
  opacity: 0;
  transition: all 0.3s;
}

.playlist-card:hover .play-overlay {
  opacity: 1;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f5f5f7;
  margin: 0 0 0.5rem 0;
  cursor: pointer;
  transition: color 0.2s;
}

.card-title:hover {
  color: #f1c40f;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1rem 0;
}

.separator {
  opacity: 0.5;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(241, 196, 15, 0.1);
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
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 768px) {
  .playlists-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
