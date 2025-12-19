<template>
  <ion-page>
    <!-- Header -->
    <ion-header>
      <ion-toolbar color="dark">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home-auth" text="" color="warning"></ion-back-button>
        </ion-buttons>
        <ion-title>Perfil de usuario</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="profile-content">
      <div class="container">
        
        <!-- Título -->
        <h1 class="page-title">Perfil de usuario</h1>

        <!-- SECCIÓN PERFIL -->
        <div class="profile-grid">
          
          <!-- Avatar Section -->
          <div class="avatar-section">
            <div class="avatar-container">
              <img :src="avatarPreview" class="avatar-image" alt="Avatar" />
              
              <label for="avatar-input" class="avatar-edit-btn" title="Cambiar foto">
                <ion-icon :icon="cameraOutline"></ion-icon>
              </label>
              
              <input 
                id="avatar-input" 
                type="file" 
                accept="image/*"
                @change="onAvatarSelected"
                style="display: none"
              />
            </div>

            <div class="avatar-actions">
              <ion-button 
                v-if="newAvatar || hasAvatar" 
                size="small"
                fill="outline"
                color="danger"
                @click="removeAvatar"
              >
                <ion-icon :icon="trashOutline" slot="start"></ion-icon>
                Eliminar
              </ion-button>
              
              <ion-button 
                v-if="newAvatar" 
                size="small"
                color="warning"
                @click="saveAvatar"
                :disabled="isSavingAvatar"
              >
                <ion-spinner v-if="isSavingAvatar" name="crescent"></ion-spinner>
                <ion-icon v-else :icon="saveOutline" slot="start"></ion-icon>
                {{ isSavingAvatar ? 'Guardando...' : 'Guardar' }}
              </ion-button>
            </div>

            <ion-text v-if="avatarError" color="danger" class="avatar-error">
              <p>{{ avatarError }}</p>
            </ion-text>
          </div>

          <!-- Formulario de Perfil -->
          <form @submit.prevent="saveProfile" class="profile-form">
            <ion-list>
              <ion-item>
                <ion-label position="stacked">Nombre</ion-label>
                <ion-input v-model="displayName"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Plan</ion-label>
                <ion-select v-model="plan">
                  <ion-select-option value="Free">Free</ion-select-option>
                  <ion-select-option value="Premium">Premium</ion-select-option>
                  <ion-select-option value="Family">Family</ion-select-option>
                </ion-select>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">Bio</ion-label>
                <ion-textarea 
                  v-model="bio" 
                  :rows="4"
                  placeholder="Cuéntanos sobre ti..."
                ></ion-textarea>
              </ion-item>
            </ion-list>

            <div class="form-actions">
              <ion-button 
                type="submit" 
                color="warning" 
                expand="block"
                :disabled="isSavingProfile"
              >
                <ion-spinner v-if="isSavingProfile" name="crescent"></ion-spinner>
                <span v-else>{{ isSavingProfile ? 'Guardando...' : 'Guardar perfil' }}</span>
              </ion-button>
            </div>
          </form>
        </div>

        <!-- SECCIÓN PLAYLISTS -->
        <div class="playlist-section">
          <div class="section-header">
            <h2 class="section-title">Mis playlists</h2>
            <ion-button color="warning" @click="router.push('/playlist-form')">
              <ion-icon :icon="addOutline" slot="start"></ion-icon>
              Crear nueva
            </ion-button>
          </div>

          <!-- Toolbar búsqueda -->
          <div class="toolbar-row">
            <ion-searchbar
              v-model="playlistSearch"
              placeholder="Buscar en mis playlists..."
              class="search-bar"
            ></ion-searchbar>
            <ion-button fill="outline" @click="loadMyPlaylists">
              <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
              Recargar
            </ion-button>
          </div>

          <!-- Lista de playlists -->
          <ion-list v-if="filteredPlaylists.length > 0">
            <ion-item v-for="pl in paginatedPlaylists" :key="pl.id" class="playlist-item">
              <ion-thumbnail slot="start">
                <img 
                  v-if="pl.cover"
                  :src="fileUrl(pl, pl.cover)"
                  :alt="pl.title"
                />
                <div v-else class="cover-placeholder">🎵</div>
              </ion-thumbnail>

              <ion-label>
                <h2 @click="router.push(`/playlist/${pl.id}`)" class="playlist-title">
                  {{ pl.title || "Sin título" }}
                </h2>
                <p>{{ pl.tracksCount ?? 0 }} canciones • {{ pl.duration || "-" }}</p>
                <ion-badge :color="pl.privacy === 'public' ? 'success' : 'warning'">
                  {{ pl.privacy }}
                </ion-badge>
              </ion-label>

              <div class="item-actions" slot="end">
                <ion-button fill="clear" size="small" @click="openModal(pl)">
                  <ion-icon :icon="eyeOutline"></ion-icon>
                </ion-button>
                <ion-button fill="clear" size="small" @click="router.push(`/playlist-form/${pl.id}`)">
                  <ion-icon :icon="createOutline"></ion-icon>
                </ion-button>
                <ion-button fill="clear" size="small" color="danger" @click="remove(pl.id)">
                  <ion-icon :icon="trashOutline"></ion-icon>
                </ion-button>
              </div>
            </ion-item>
          </ion-list>

          <!-- Estado vacío -->
          <ion-card v-else class="empty-state">
            <ion-card-content>
              <ion-icon :icon="musicalNotesOutline" class="empty-icon"></ion-icon>
              <p>{{ playlistSearch ? 'No se encontraron playlists' : 'No tienes playlists todavía.' }}</p>
            </ion-card-content>
          </ion-card>

          <!-- Paginación -->
          <div class="pagination-controls" v-if="filteredPlaylists.length > 0">
            <ion-button 
              fill="outline" 
              size="small"
              :disabled="playlistPage === 1"
              @click="playlistPage--"
            >
              <ion-icon :icon="chevronBackOutline" slot="start"></ion-icon>
              Anterior
            </ion-button>

            <div class="pagination-info">
              <span>Página {{ playlistPage }} de {{ totalPlaylistPages }}</span>
              <span class="pagination-count">({{ filteredPlaylists.length }} playlists)</span>
            </div>

            <ion-button 
              fill="outline" 
              size="small"
              :disabled="playlistPage === totalPlaylistPages"
              @click="playlistPage++"
            >
              Siguiente
              <ion-icon :icon="chevronForwardOutline" slot="end"></ion-icon>
            </ion-button>
          </div>
        </div>

      </div>
    </ion-content>

    <!-- MODAL DE DETALLE -->
    <ion-modal :is-open="!!modal" @didDismiss="closeModal">
      <ion-header>
        <ion-toolbar color="dark">
          <ion-title>{{ modal?.title }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal">Cerrar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="modal-content" v-if="modal">
        <div class="modal-body">
          <img :src="modal.coverUrl" class="modal-cover" :alt="modal.title" />
          
          <p class="modal-subtitle">
            {{ modal.tracksCount ?? 0 }} canciones • {{ modal.duration || "-" }}
          </p>

          <h3 class="songs-title">Canciones</h3>

          <ion-list>
            <ion-item v-for="t in modal.tracks" :key="t.title" class="song-item">
              <ion-thumbnail slot="start">
                <img :src="t.thumb" :alt="t.title" />
              </ion-thumbnail>

              <ion-label>
                <h3>{{ t.title }}</h3>
                <p>{{ t.artist }} • {{ t.duration }}</p>
              </ion-label>

              <ion-button 
                v-if="t.youtubeId" 
                slot="end"
                fill="clear"
                :href="`https://youtu.be/${t.youtubeId}`"
                target="_blank"
              >
                <ion-icon :icon="logoYoutube" color="danger"></ion-icon>
              </ion-button>
            </ion-item>
          </ion-list>
        </div>
      </ion-content>
    </ion-modal>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton,
  IonContent, IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption,
  IonTextarea, IonThumbnail, IonBadge, IonSearchbar, IonCard, IonCardContent,
  IonModal, IonIcon, IonText, IonSpinner, alertController, toastController,
} from '@ionic/vue';
import {
  cameraOutline, trashOutline, saveOutline, addOutline, refreshOutline,
  eyeOutline, createOutline, musicalNotesOutline, chevronBackOutline,
  chevronForwardOutline, logoYoutube,
} from 'ionicons/icons';
import pb from '@/services/pocketbase';

const router = useRouter();

// Verificar autenticación
const me = pb.authStore.model;
if (!me || !pb.authStore.isValid) {
  router.push('/login');
}

// PERFIL
const displayName = ref(me?.displayName || me?.name || me?.username || '');
const plan = ref(me?.plan || 'Free');
const bio = ref(me?.bio || '');
const isSavingProfile = ref(false);

// AVATAR
const newAvatar = ref<File | null>(null);
const avatarError = ref('');
const isSavingAvatar = ref(false);

const hasAvatar = computed(() => {
  return me?.avatar && me.avatar !== '';
});

const avatarPreview = computed(() => {
  if (newAvatar.value) {
    return URL.createObjectURL(newAvatar.value);
  }
  if (me?.avatar) {
    return pb.getFileUrl(me, me.avatar, { thumb: '160x160' });
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(me?.username || 'User')}&background=f1c40f&color=1a1a1d&size=160`;
});

function fileUrl(record: any, filename: string, thumb?: string) {
  if (!filename) return '';
  return pb.getFileUrl(record, filename, thumb ? { thumb } : undefined);
}

async function saveProfile() {
  isSavingProfile.value = true;
  try {
    await pb.collection('users').update(me.id, {
      displayName: displayName.value,
      plan: plan.value,
      bio: bio.value,
    });

    await pb.collection('users').authRefresh();
    showToast('Perfil actualizado correctamente', 'success');
  } catch (err) {
    console.error(err);
    showToast('Error al guardar perfil', 'danger');
  } finally {
    isSavingProfile.value = false;
  }
}

function onAvatarSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  avatarError.value = '';

  if (!file) {
    newAvatar.value = null;
    return;
  }

  if (!file.type.startsWith('image/')) {
    avatarError.value = 'El archivo debe ser una imagen';
    newAvatar.value = null;
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    avatarError.value = 'La imagen no debe superar los 5MB';
    newAvatar.value = null;
    return;
  }

  newAvatar.value = file;
}

async function saveAvatar() {
  if (!newAvatar.value) return;

  isSavingAvatar.value = true;
  avatarError.value = '';

  try {
    const formData = new FormData();
    formData.append('avatar', newAvatar.value);

    await pb.collection('users').update(me.id, formData);
    await pb.collection('users').authRefresh();

    newAvatar.value = null;
    showToast('Foto de perfil actualizada correctamente', 'success');
    
    setTimeout(() => window.location.reload(), 500);
  } catch (err) {
    console.error(err);
    avatarError.value = 'Error al guardar la foto. Inténtalo de nuevo.';
  } finally {
    isSavingAvatar.value = false;
  }
}

async function removeAvatar() {
  const alert = await alertController.create({
    header: 'Eliminar foto',
    message: '¿Deseas eliminar tu foto de perfil?',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: async () => {
          isSavingAvatar.value = true;
          try {
            await pb.collection('users').update(me.id, { avatar: null });
            await pb.collection('users').authRefresh();
            newAvatar.value = null;
            showToast('Foto de perfil eliminada', 'success');
            setTimeout(() => window.location.reload(), 500);
          } catch (err) {
            avatarError.value = 'Error al eliminar la foto.';
          } finally {
            isSavingAvatar.value = false;
          }
        },
      },
    ],
  });
  await alert.present();
}

// PLAYLISTS
const myPlaylists = ref<any[]>([]);
const playlistSearch = ref('');
const playlistPage = ref(1);
const itemsPerPage = 10;

const filteredPlaylists = computed(() => {
  if (!playlistSearch.value) return myPlaylists.value;
  const search = playlistSearch.value.toLowerCase();
  return myPlaylists.value.filter(pl =>
    pl.title?.toLowerCase().includes(search) ||
    pl.privacy?.toLowerCase().includes(search)
  );
});

const paginatedPlaylists = computed(() => {
  const start = (playlistPage.value - 1) * itemsPerPage;
  return filteredPlaylists.value.slice(start, start + itemsPerPage);
});

const totalPlaylistPages = computed(() => {
  return Math.ceil(filteredPlaylists.value.length / itemsPerPage) || 1;
});

async function loadMyPlaylists() {
  try {
    const result = await pb.collection('playlists').getList(1, 100, {
      filter: `owner = "${me.id}"`,
      sort: '-created',
    });
    myPlaylists.value = result.items;
    playlistPage.value = 1;
  } catch (err) {
    console.error(err);
    showToast('Error al cargar playlists', 'danger');
  }
}

async function remove(id: string) {
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
            await loadMyPlaylists();
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

// MODAL
const modal = ref<any>(null);

function ytThumb(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function normalizeTracks(list: any[]) {
  return list.map(t => ({
    title: t.title || '',
    artist: t.artist || '',
    duration: t.duration || '',
    youtubeId: t.youtubeId || '',
    thumb: t.youtubeId ? ytThumb(t.youtubeId) : 'https://picsum.photos/seed/song/80',
  }));
}

async function openModal(pl: any) {
  try {
    const full = await pb.collection('playlists').getOne(pl.id);
    modal.value = {
      ...full,
      coverUrl: full.cover
        ? fileUrl(full, full.cover, '400x0')
        : 'https://picsum.photos/seed/pldetail/400',
      tracks: normalizeTracks(full.tracks || []),
    };
  } catch (err) {
    showToast('Error al cargar detalle', 'danger');
  }
}

function closeModal() {
  modal.value = null;
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

onMounted(loadMyPlaylists);
</script>

<style scoped>
.profile-content {
  --background: linear-gradient(135deg, #1e1b4b 0%, #701a75 100%);
}

.profile-content::part(scroll) {
  background: url('/bg.jpg') no-repeat center center fixed;
  background-size: cover;
}

.container {
  max-width: 1200px;
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

/* PERFIL GRID */
.profile-grid {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  align-items: start;
}

/* AVATAR */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar-container {
  position: relative;
  width: 160px;
  height: 160px;
}

.avatar-image {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 4px solid rgba(241, 196, 15, 0.5);
  object-fit: cover;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 44px;
  height: 44px;
  background: #f1c40f;
  border-radius: 50%;
  display: grid;
  place-items: center;
  cursor: pointer;
  border: 3px solid rgba(30, 27, 75, 0.9);
  font-size: 1.5rem;
  color: #1a1a1d;
  transition: all 0.2s;
}

.avatar-edit-btn:hover {
  transform: scale(1.1);
}

.avatar-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.avatar-error {
  text-align: center;
  font-size: 0.875rem;
}

/* FORMULARIO */
.profile-form {
  background: rgba(30, 27, 75, 0.9);
  border: 1px solid rgba(241, 196, 15, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
}

.profile-form ion-list {
  background: transparent;
}

.profile-form ion-item {
  --background: rgba(26, 26, 29, 0.6);
  --border-color: rgba(241, 196, 15, 0.2);
  --color: #ffffff;
  margin-bottom: 1rem;
  border-radius: 8px;
}

.profile-form ion-label {
  --color: #f5f5f7 !important;
  color: #f5f5f7 !important;
}

.profile-form ion-input,
.profile-form ion-textarea,
.profile-form ion-select {
  --color: #ffffff !important;
  --placeholder-color: rgba(255, 255, 255, 0.5) !important;
  color: #ffffff !important;
}

.form-actions {
  margin-top: 1.5rem;
}

/* PLAYLISTS */
.playlist-section {
  margin-top: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #f1c40f;
  margin: 0;
}

.toolbar-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-bar {
  flex: 1;
  min-width: 200px;
  --background: rgba(26, 26, 29, 0.6);
  --border-radius: 12px;
}

.playlist-item {
  --background: rgba(26, 26, 29, 0.6);
  --border-color: rgba(241, 196, 15, 0.1);
  margin-bottom: 0.5rem;
  border-radius: 8px;
}

.playlist-title {
  cursor: pointer;
  color: #f5f5f7;
  font-weight: 600;
  transition: color 0.2s;
}

.playlist-title:hover {
  color: #f1c40f;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
  font-size: 1.5rem;
}

.item-actions {
  display: flex;
  gap: 0.25rem;
}

.empty-state {
  background: rgba(30, 27, 75, 0.6);
  border: 1px solid rgba(241, 196, 15, 0.2);
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: rgba(241, 196, 15, 0.5);
  margin-bottom: 1rem;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.pagination-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: #f5f5f7;
}

.pagination-count {
  font-size: 0.875rem;
  opacity: 0.7;
}

/* MODAL */
.modal-content {
  --background: rgba(30, 27, 75, 0.98);
}

.modal-body {
  padding: 1.5rem;
}

.modal-cover {
  width: 180px;
  border-radius: 12px;
  margin: 0 auto 1rem auto;
  display: block;
  border: 2px solid rgba(241, 196, 15, 0.3);
}

.modal-subtitle {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
}

.songs-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #f1c40f;
  margin: 1.5rem 0 1rem 0;
}

.song-item {
  --background: rgba(26, 26, 29, 0.6);
  --border-color: rgba(241, 196, 15, 0.1);
  margin-bottom: 0.5rem;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-row {
    flex-direction: column;
  }

  .search-bar {
    width: 100%;
  }
}
</style>
