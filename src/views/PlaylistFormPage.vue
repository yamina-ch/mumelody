<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="dark">
        <ion-buttons slot="start">
          <ion-back-button default-href="/playlists" text="" color="warning"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ isEdit ? 'Editar playlist' : 'Crear playlist' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="form-content">
      <div class="container">
        
        <h1 class="page-title">{{ isEdit ? 'Editar playlist' : 'Crear playlist' }}</h1>

        <form @submit.prevent="savePlaylist">
          <ion-list>
            <!-- Título -->
            <ion-item>
              <ion-label position="stacked">Nombre *</ion-label>
              <ion-input 
                v-model="title" 
                placeholder="Mi playlist 🔥" 
                required
              ></ion-input>
            </ion-item>

            <!-- Descripción/Duración -->
            <ion-item>
              <ion-label position="stacked">Descripción / Duración</ion-label>
              <ion-input 
                v-model="duration" 
                placeholder="p. ej., 2h 30m · chill, lofi"
              ></ion-input>
            </ion-item>

            <!-- Número de canciones -->
            <ion-item>
              <ion-label position="stacked">Número de canciones</ion-label>
              <ion-input 
                v-model.number="tracksCount" 
                type="number" 
                :min="0"
              ></ion-input>
            </ion-item>

            <!-- Portada -->
            <ion-item>
              <ion-label position="stacked">Portada</ion-label>
              <input 
                type="file" 
                accept="image/*" 
                @change="onCoverSelected"
                class="file-input"
              />
              <ion-note>JPG/PNG cuadrados (512×512 aprox.)</ion-note>
            </ion-item>
          </ion-list>

          <!-- Sección de canciones -->
          <div class="tracks-section">
            <div class="tracks-header">
              <h2 class="section-title">Canciones</h2>
              <ion-button size="small" fill="outline" @click="addTrack" type="button">
                <ion-icon :icon="addOutline" slot="start"></ion-icon>
                Añadir canción
              </ion-button>
            </div>

            <div v-for="(t, index) in tracks" :key="index" class="track-form">
              <div class="track-number">{{ index + 1 }}</div>
              
              <div class="track-inputs">
                <ion-input 
                  v-model="t.title" 
                  placeholder="Título *" 
                  required
                  class="track-input"
                ></ion-input>
                
                <ion-input 
                  v-model="t.artist" 
                  placeholder="Artista"
                  class="track-input"
                ></ion-input>
                
                <ion-input 
                  v-model="t.duration" 
                  placeholder="Duración"
                  class="track-input"
                ></ion-input>
                
                <ion-input 
                  v-model="t.youtubeId" 
                  placeholder="YouTube ID o URL"
                  class="track-input"
                ></ion-input>
              </div>

              <ion-button 
                fill="clear" 
                color="danger" 
                @click="removeTrack(index)"
                type="button"
              >
                <ion-icon :icon="trashOutline"></ion-icon>
              </ion-button>
            </div>

            <div v-if="tracks.length === 0" class="no-tracks">
              <p>No hay canciones aún. Haz clic en "Añadir canción" para empezar.</p>
            </div>
          </div>

          <!-- Acciones del formulario -->
          <div class="form-actions">
            <ion-button fill="outline" @click="router.push('/playlists')" type="button">
              Cancelar
            </ion-button>
            <ion-button color="warning" type="submit" :disabled="isSaving">
              <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
              <span v-else>Guardar</span>
            </ion-button>
          </div>
        </form>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonList, IonItem, IonLabel, IonInput, IonNote, IonButton,
  IonIcon, IonSpinner, toastController,
} from '@ionic/vue';
import { addOutline, trashOutline } from 'ionicons/icons';
import pb from '@/services/pocketbase';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string | undefined;

const isEdit = computed(() => Boolean(id));

const me = pb.authStore.model;
if (!me || !pb.authStore.isValid) {
  router.push('/login');
}

const title = ref('');
const duration = ref('');
const tracksCount = ref(0);
const coverFile = ref<File | null>(null);
const tracks = ref<any[]>([]);
const isSaving = ref(false);

function addTrack() {
  tracks.value.push({
    title: '',
    artist: '',
    duration: '',
    youtubeId: '',
  });
}

function removeTrack(index: number) {
  tracks.value.splice(index, 1);
}

function onCoverSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  coverFile.value = target.files?.[0] || null;
}

function toYoutubeId(v: string = '') {
  v = v.trim();
  if (!v) return '';

  if (v.includes('youtu')) {
    try {
      const url = new URL(v);
      if (url.hostname.includes('youtu.be')) return url.pathname.slice(1);
      return url.searchParams.get('v') || '';
    } catch {
      return '';
    }
  }

  return v;
}

onMounted(async () => {
  if (!id) return;

  try {
    const pl = await pb.collection('playlists').getOne(id);

    title.value = pl.title || '';
    duration.value = pl.duration || '';
    tracksCount.value = pl.tracksCount ?? 0;

    if (Array.isArray(pl.tracks)) {
      tracks.value = pl.tracks.map((t: any) => ({
        title: t.title || '',
        artist: t.artist || '',
        duration: t.duration || '',
        youtubeId: t.youtubeId || '',
      }));
    }
  } catch (err) {
    console.error(err);
    showToast('Error al cargar playlist', 'danger');
  }
});

async function savePlaylist() {
  isSaving.value = true;

  try {
    const cleanTracks = tracks.value.map(t => ({
      title: t.title.trim(),
      artist: t.artist.trim(),
      duration: t.duration.trim(),
      youtubeId: toYoutubeId(t.youtubeId),
    }));

    const data = {
      title: title.value.trim(),
      duration: duration.value.trim(),
      tracksCount: tracksCount.value,
      tracks: cleanTracks,
      owner: me.id,
    };

    if (isEdit.value) {
      if (coverFile.value) {
        const fd = new FormData();
        fd.append('title', data.title);
        fd.append('duration', data.duration);
        fd.append('tracksCount', String(data.tracksCount));
        fd.append('tracks', JSON.stringify(data.tracks));
        fd.append('cover', coverFile.value);
        await pb.collection('playlists').update(id!, fd);
      } else {
        await pb.collection('playlists').update(id!, data);
      }
      showToast('Playlist actualizada', 'success');
    } else {
      if (coverFile.value) {
        const fd = new FormData();
        fd.append('title', data.title);
        fd.append('duration', data.duration);
        fd.append('tracksCount', String(data.tracksCount));
        fd.append('tracks', JSON.stringify(data.tracks));
        fd.append('owner', data.owner);
        fd.append('cover', coverFile.value);
        await pb.collection('playlists').create(fd);
      } else {
        await pb.collection('playlists').create(data);
      }
      showToast('Playlist creada', 'success');
    }

    router.push('/playlists');
  } catch (err) {
    console.error(err);
    showToast('Error al guardar playlist', 'danger');
  } finally {
    isSaving.value = false;
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
</script>

<style scoped>
.form-content {
  --background: linear-gradient(135deg, #1e1b4b 0%, #701a75 100%);
}

.form-content::part(scroll) {
  background: url('/bg.jpg') no-repeat center center fixed;
  background-size: cover;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #f1c40f;
  margin: 0 0 2rem 0;
  text-align: center;
}

ion-list {
  background: rgba(30, 27, 75, 0.9);
  border: 1px solid rgba(241, 196, 15, 0.2);
  border-radius: 16px;
  padding: 1rem;
}

ion-item {
  --background: rgba(26, 26, 29, 0.6);
  --border-color: rgba(241, 196, 15, 0.2);
  --color: #ffffff;
  margin-bottom: 1rem;
  border-radius: 8px;
}

ion-label {
  --color: #f5f5f7 !important;
  color: #f5f5f7 !important;
}

ion-input {
  --color: #ffffff !important;
  --placeholder-color: rgba(255, 255, 255, 0.5) !important;
  color: #ffffff !important;
}

ion-input::part(native),
ion-input input {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

.file-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(26, 26, 29, 0.6);
  border: 1px solid rgba(241, 196, 15, 0.2);
  border-radius: 8px;
  color: #ffffff;
  margin-top: 0.5rem;
}

.tracks-section {
  margin-top: 2rem;
  background: rgba(30, 27, 75, 0.9);
  border: 1px solid rgba(241, 196, 15, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
}

.tracks-header {
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

.track-form {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(26, 26, 29, 0.6);
  border: 1px solid rgba(241, 196, 15, 0.1);
  border-radius: 8px;
}

.track-number {
  width: 32px;
  height: 32px;
  background: #f1c40f;
  color: #1a1a1d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.track-inputs {
  flex: 1;
  display: grid;
  gap: 0.75rem;
}

.track-input {
  --background: rgba(26, 26, 29, 0.8);
  --border-color: rgba(241, 196, 15, 0.2);
  --color: #ffffff;
  --padding-start: 0.75rem;
  --padding-end: 0.75rem;
  border: 1px solid rgba(241, 196, 15, 0.2);
  border-radius: 8px;
}

.no-tracks {
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .track-form {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions ion-button {
    width: 100%;
  }
}
</style>
