<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="dark">
        <ion-buttons slot="start">
          <ion-back-button default-href="/home-auth" text="" color="warning"></ion-back-button>
        </ion-buttons>
        <ion-title>👑 Panel de Administración</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="admin-content">
      
      <!-- SECCIÓN USUARIOS -->
      <ion-card class="admin-section">
        <ion-card-header>
          <div class="card-header-row">
            <ion-card-title>Usuarios ({{ users.length }})</ion-card-title>
            <div class="header-actions">
              <ion-button size="small" @click="loadUsers">
                <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
                Recargar
              </ion-button>
              <ion-button color="warning" size="small" @click="openUserModal()">
                <ion-icon :icon="addOutline" slot="start"></ion-icon>
                Nuevo
              </ion-button>
            </div>
          </div>
        </ion-card-header>

        <ion-card-content>
          <!-- Barra de búsqueda y exportación -->
          <div class="toolbar-row">
            <ion-searchbar
              v-model="userSearch"
              placeholder="Buscar usuarios..."
              class="search-bar"
            ></ion-searchbar>

            <div class="export-buttons">
              <ion-button size="small" color="danger" @click="exportUsers('pdf')">
                <ion-icon :icon="documentTextOutline" slot="start"></ion-icon>
                PDF
              </ion-button>
              <ion-button size="small" color="success" @click="exportUsers('excel')">
                <ion-icon :icon="statsChartOutline" slot="start"></ion-icon>
                Excel
              </ion-button>
              <ion-button size="small" color="medium" @click="exportUsers('csv')">
                <ion-icon :icon="documentOutline" slot="start"></ion-icon>
                CSV
              </ion-button>
            </div>
          </div>

          <!-- Lista de usuarios -->
          <div class="table-wrapper">
            <ion-list>
              <ion-item v-for="user in paginatedUsers" :key="user.id" class="user-item">
                <ion-avatar slot="start">
                  <img 
                    v-if="user.avatar"
                    :src="getAvatarUrl(user)" 
                    :alt="user.username"
                  />
                  <div v-else class="avatar-placeholder">
                    {{ user.name?.charAt(0) || user.username?.charAt(0) }}
                  </div>
                </ion-avatar>

                <ion-label>
                  <h2>{{ user.name || user.username }}</h2>
                  <p>{{ user.email }}</p>
                  <ion-badge :color="user.role === 'admin' ? 'danger' : 'primary'">
                    {{ user.role }}
                  </ion-badge>
                </ion-label>

                <div class="item-actions" slot="end">
                  <ion-button fill="clear" size="small" color="primary" @click="viewUserDetail(user)">
                    <ion-icon :icon="eyeOutline"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear" size="small" color="warning" @click="openUserModal(user)">
                    <ion-icon :icon="createOutline"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear" size="small" color="danger" @click="confirmDelete('user', user)">
                    <ion-icon :icon="trashOutline"></ion-icon>
                  </ion-button>
                </div>
              </ion-item>
            </ion-list>
          </div>

          <!-- Paginación -->
          <div class="pagination-controls">
            <ion-button 
              fill="outline" 
              size="small" 
              :disabled="userPage === 1"
              @click="userPage--"
            >
              Anterior
            </ion-button>
            <span class="page-info">Página {{ userPage }} de {{ totalUserPages }}</span>
            <ion-button 
              fill="outline" 
              size="small"
              :disabled="userPage === totalUserPages"
              @click="userPage++"
            >
              Siguiente
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- SECCIÓN PLAYLISTS -->
      <ion-card class="admin-section">
        <ion-card-header>
          <div class="card-header-row">
            <ion-card-title>Playlists ({{ playlists.length }})</ion-card-title>
            <div class="header-actions">
              <ion-button size="small" @click="loadPlaylists">
                <ion-icon :icon="refreshOutline" slot="start"></ion-icon>
                Recargar
              </ion-button>
              <ion-button color="warning" size="small" @click="openPlaylistModal()">
                <ion-icon :icon="addOutline" slot="start"></ion-icon>
                Nueva
              </ion-button>
            </div>
          </div>
        </ion-card-header>

        <ion-card-content>
          <!-- Barra de búsqueda y exportación -->
          <div class="toolbar-row">
            <ion-searchbar
              v-model="playlistSearch"
              placeholder="Buscar playlists..."
              class="search-bar"
            ></ion-searchbar>

            <div class="export-buttons">
              <ion-button size="small" color="danger" @click="exportPlaylists('pdf')">
                <ion-icon :icon="documentTextOutline" slot="start"></ion-icon>
                PDF
              </ion-button>
              <ion-button size="small" color="success" @click="exportPlaylists('excel')">
                <ion-icon :icon="statsChartOutline" slot="start"></ion-icon>
                Excel
              </ion-button>
              <ion-button size="small" color="medium" @click="exportPlaylists('csv')">
                <ion-icon :icon="documentOutline" slot="start"></ion-icon>
                CSV
              </ion-button>
            </div>
          </div>

          <!-- Lista de playlists -->
          <div class="table-wrapper">
            <ion-list>
              <ion-item v-for="playlist in paginatedPlaylists" :key="playlist.id" class="playlist-item">
                <ion-thumbnail slot="start">
                  <img 
                    v-if="playlist.cover"
                    :src="getCoverUrl(playlist)"
                    :alt="playlist.title"
                  />
                  <div v-else class="cover-placeholder">🎵</div>
                </ion-thumbnail>

                <ion-label>
                  <h2>{{ playlist.title }}</h2>
                  <p>{{ playlist.expand?.owner?.name || playlist.expand?.owner?.username }}</p>
                  <ion-badge :color="playlist.privacy === 'public' ? 'success' : 'warning'">
                    {{ playlist.privacy }}
                  </ion-badge>
                </ion-label>

                <div class="item-actions" slot="end">
                  <ion-button fill="clear" size="small" color="primary" @click="viewPlaylistDetail(playlist)">
                    <ion-icon :icon="eyeOutline"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear" size="small" color="warning" @click="openPlaylistModal(playlist)">
                    <ion-icon :icon="createOutline"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear" size="small" color="danger" @click="confirmDelete('playlist', playlist)">
                    <ion-icon :icon="trashOutline"></ion-icon>
                  </ion-button>
                </div>
              </ion-item>
            </ion-list>
          </div>

          <!-- Paginación -->
          <div class="pagination-controls">
            <ion-button 
              fill="outline" 
              size="small"
              :disabled="playlistPage === 1"
              @click="playlistPage--"
            >
              Anterior
            </ion-button>
            <span class="page-info">Página {{ playlistPage }} de {{ totalPlaylistPages }}</span>
            <ion-button 
              fill="outline" 
              size="small"
              :disabled="playlistPage === totalPlaylistPages"
              @click="playlistPage++"
            >
              Siguiente
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

    </ion-content>

    <!-- MODAL EDITAR/CREAR USUARIO -->
    <ion-modal :is-open="userModalOpen" @didDismiss="userModalOpen = false">
      <ion-header>
        <ion-toolbar color="dark">
          <ion-title>{{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="userModalOpen = false">Cerrar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="modal-content">
        <form @submit.prevent="saveUser">
          <ion-list>
            <ion-item>
              <ion-label position="stacked">Nombre *</ion-label>
              <ion-input v-model="modalUser.name" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Email *</ion-label>
              <ion-input v-model="modalUser.email" type="email" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Username</ion-label>
              <ion-input v-model="modalUser.username" placeholder="Se generará automáticamente"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Rol</ion-label>
              <ion-select v-model="modalUser.role">
                <ion-select-option value="user">User</ion-select-option>
                <ion-select-option value="admin">Admin</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">
                Contraseña {{ editingUser ? '(dejar vacío para no cambiar)' : '*' }}
              </ion-label>
              <ion-input 
                v-model="modalUser.password" 
                type="password"
                :required="!editingUser"
              ></ion-input>
            </ion-item>
          </ion-list>

          <div class="modal-actions">
            <ion-button type="button" fill="outline" @click="userModalOpen = false">
              Cancelar
            </ion-button>
            <ion-button type="submit" color="warning">
              Guardar
            </ion-button>
          </div>
        </form>
      </ion-content>
    </ion-modal>

    <!-- MODAL EDITAR/CREAR PLAYLIST -->
    <ion-modal :is-open="playlistModalOpen" @didDismiss="playlistModalOpen = false">
      <ion-header>
        <ion-toolbar color="dark">
          <ion-title>{{ editingPlaylist ? 'Editar Playlist' : 'Nueva Playlist' }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="playlistModalOpen = false">Cerrar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="modal-content">
        <form @submit.prevent="savePlaylist">
          <ion-list>
            <ion-item>
              <ion-label position="stacked">Título *</ion-label>
              <ion-input v-model="modalPlaylist.title" required></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Propietario *</ion-label>
              <ion-select v-model="modalPlaylist.owner" required>
                <ion-select-option value="">Seleccionar usuario...</ion-select-option>
                <ion-select-option v-for="u in users" :key="u.id" :value="u.id">
                  {{ u.name || u.username }}
                </ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Privacidad</ion-label>
              <ion-select v-model="modalPlaylist.privacy">
                <ion-select-option value="public">Pública</ion-select-option>
                <ion-select-option value="private">Privada</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>

          <div class="modal-actions">
            <ion-button type="button" fill="outline" @click="playlistModalOpen = false">
              Cancelar
            </ion-button>
            <ion-button type="submit" color="warning">
              Guardar
            </ion-button>
          </div>
        </form>
      </ion-content>
    </ion-modal>

    <!-- MODAL DETALLE USUARIO -->
    <ion-modal :is-open="detailUserModalOpen" @didDismiss="detailUserModalOpen = false">
      <ion-header>
        <ion-toolbar color="dark">
          <ion-title>Detalles del Usuario</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="detailUserModalOpen = false">Cerrar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="modal-content detail-modal" v-if="viewingUser">
        <div class="detail-header">
          <ion-avatar class="detail-avatar">
            <img 
              v-if="viewingUser.avatar"
              :src="getAvatarUrl(viewingUser)"
              :alt="viewingUser.name"
            />
            <div v-else class="avatar-placeholder-large">
              {{ viewingUser.name?.charAt(0) || viewingUser.username?.charAt(0) }}
            </div>
          </ion-avatar>
          <h2>{{ viewingUser.name || viewingUser.username }}</h2>
          <ion-badge :color="viewingUser.role === 'admin' ? 'danger' : 'primary'">
            {{ viewingUser.role }}
          </ion-badge>
        </div>

        <ion-list>
          <ion-item>
            <ion-label>
              <p class="detail-label">ID</p>
              <h3>{{ viewingUser.id }}</h3>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-label>
              <p class="detail-label">Nombre</p>
              <h3>{{ viewingUser.name || 'N/A' }}</h3>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-label>
              <p class="detail-label">Username</p>
              <h3>{{ viewingUser.username || 'N/A' }}</h3>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-label>
              <p class="detail-label">Email</p>
              <h3>{{ viewingUser.email }}</h3>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-label>
              <p class="detail-label">Creado</p>
              <h3>{{ formatDate(viewingUser.created) }}</h3>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-label>
              <p class="detail-label">Actualizado</p>
              <h3>{{ formatDate(viewingUser.updated) }}</h3>
            </ion-label>
          </ion-item>
        </ion-list>

        <div class="modal-actions">
          <ion-button fill="outline" @click="detailUserModalOpen = false">
            Cerrar
          </ion-button>
          <ion-button color="warning" @click="editFromDetail(viewingUser)">
            <ion-icon :icon="createOutline" slot="start"></ion-icon>
            Editar
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>

    <!-- MODAL DETALLE PLAYLIST -->
    <ion-modal :is-open="detailPlaylistModalOpen" @didDismiss="detailPlaylistModalOpen = false">
      <ion-header>
        <ion-toolbar color="dark">
          <ion-title>Detalles de la Playlist</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="detailPlaylistModalOpen = false">Cerrar</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="modal-content detail-modal" v-if="viewingPlaylist">
        <div class="detail-header">
          <ion-thumbnail class="detail-cover">
            <img 
              v-if="viewingPlaylist.cover"
              :src="getCoverUrl(viewingPlaylist)"
              :alt="viewingPlaylist.title"
            />
            <div v-else class="cover-placeholder-large">🎵</div>
          </ion-thumbnail>
          <h2>{{ viewingPlaylist.title }}</h2>
          <ion-badge :color="viewingPlaylist.privacy === 'public' ? 'success' : 'warning'">
            {{ viewingPlaylist.privacy }}
          </ion-badge>
        </div>

        <ion-list>
          <ion-item>
            <ion-label>
              <p class="detail-label">ID</p>
              <h3>{{ viewingPlaylist.id }}</h3>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-label>
              <p class="detail-label">Título</p>
              <h3>{{ viewingPlaylist.title }}</h3>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-label>
              <p class="detail-label">Propietario</p>
              <h3>{{ viewingPlaylist.expand?.owner?.name || viewingPlaylist.expand?.owner?.username || 'N/A' }}</h3>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-label>
              <p class="detail-label">Creado</p>
              <h3>{{ formatDate(viewingPlaylist.created) }}</h3>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-label>
              <p class="detail-label">Actualizado</p>
              <h3>{{ formatDate(viewingPlaylist.updated) }}</h3>
            </ion-label>
          </ion-item>
        </ion-list>

        <div class="modal-actions">
          <ion-button fill="outline" @click="detailPlaylistModalOpen = false">
            Cerrar
          </ion-button>
          <ion-button color="warning" @click="editFromDetailPlaylist(viewingPlaylist)">
            <ion-icon :icon="createOutline" slot="start"></ion-icon>
            Editar
          </ion-button>
        </div>
      </ion-content>
    </ion-modal>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonButton,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon,
  IonSearchbar, IonList, IonItem, IonLabel, IonAvatar, IonThumbnail, IonBadge,
  IonModal, IonInput, IonSelect, IonSelectOption, alertController, toastController,
} from '@ionic/vue';
import {
  addOutline, refreshOutline, eyeOutline, createOutline, trashOutline,
  documentTextOutline, statsChartOutline, documentOutline,
} from 'ionicons/icons';
import pb from '@/services/pocketbase';

const router = useRouter();

// Estados
const users = ref<any[]>([]);
const playlists = ref<any[]>([]);
const userSearch = ref('');
const playlistSearch = ref('');
const userPage = ref(1);
const playlistPage = ref(1);
const itemsPerPage = 10;

// Modales
const userModalOpen = ref(false);
const playlistModalOpen = ref(false);
const detailUserModalOpen = ref(false);
const detailPlaylistModalOpen = ref(false);
const editingUser = ref<any>(null);
const editingPlaylist = ref<any>(null);
const viewingUser = ref<any>(null);
const viewingPlaylist = ref<any>(null);

const modalUser = ref({
  name: '',
  email: '',
  username: '',
  role: 'user',
  password: '',
});

const modalPlaylist = ref({
  title: '',
  owner: '',
  privacy: 'public',
});

// Computed
const filteredUsers = computed(() => {
  if (!userSearch.value) return users.value;
  const search = userSearch.value.toLowerCase();
  return users.value.filter(u =>
    u.name?.toLowerCase().includes(search) ||
    u.username?.toLowerCase().includes(search) ||
    u.email?.toLowerCase().includes(search)
  );
});

const paginatedUsers = computed(() => {
  const start = (userPage.value - 1) * itemsPerPage;
  return filteredUsers.value.slice(start, start + itemsPerPage);
});

const totalUserPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage) || 1;
});

const filteredPlaylists = computed(() => {
  if (!playlistSearch.value) return playlists.value;
  const search = playlistSearch.value.toLowerCase();
  return playlists.value.filter(p =>
    p.title?.toLowerCase().includes(search)
  );
});

const paginatedPlaylists = computed(() => {
  const start = (playlistPage.value - 1) * itemsPerPage;
  return filteredPlaylists.value.slice(start, start + itemsPerPage);
});

const totalPlaylistPages = computed(() => {
  return Math.ceil(filteredPlaylists.value.length / itemsPerPage) || 1;
});

// Funciones
onMounted(async () => {
  if (!pb.authStore.isValid || pb.authStore.model?.role !== 'admin') {
    showToast('Acceso denegado', 'danger');
    router.push('/home-auth');
    return;
  }

  await loadUsers();
  await loadPlaylists();
});

async function loadUsers() {
  try {
    const result = await pb.collection('users').getList(1, 200, {
      sort: '-created',
    });
    users.value = result.items;
    console.log('✅ Usuarios cargados:', users.value.length);
  } catch (err) {
    console.error('❌ Error:', err);
    showToast('Error cargando usuarios', 'danger');
  }
}

async function loadPlaylists() {
  try {
    const result = await pb.collection('playlists').getList(1, 200, {
      expand: 'owner',
      sort: '-created',
    });
    playlists.value = result.items;
    console.log('✅ Playlists cargadas:', playlists.value.length);
  } catch (err) {
    console.error('❌ Error:', err);
    showToast('Error cargando playlists', 'danger');
  }
}

function openUserModal(user: any = null) {
  if (user) {
    editingUser.value = user;
    modalUser.value = {
      name: user.name || '',
      email: user.email || '',
      username: user.username || '',
      role: user.role || 'user',
      password: '',
    };
  } else {
    editingUser.value = null;
    modalUser.value = {
      name: '',
      email: '',
      username: '',
      role: 'user',
      password: '',
    };
  }
  userModalOpen.value = true;
}

function openPlaylistModal(playlist: any = null) {
  if (playlist) {
    editingPlaylist.value = playlist;
    modalPlaylist.value = {
      title: playlist.title || '',
      owner: playlist.owner || '',
      privacy: playlist.privacy || 'public',
    };
  } else {
    editingPlaylist.value = null;
    modalPlaylist.value = {
      title: '',
      owner: '',
      privacy: 'public',
    };
  }
  playlistModalOpen.value = true;
}

// ⭐ FUNCIONES DE VISTA DE DETALLE
function viewUserDetail(user: any) {
  viewingUser.value = user;
  detailUserModalOpen.value = true;
}

function viewPlaylistDetail(playlist: any) {
  viewingPlaylist.value = playlist;
  detailPlaylistModalOpen.value = true;
}

function editFromDetail(user: any) {
  detailUserModalOpen.value = false;
  openUserModal(user);
}

function editFromDetailPlaylist(playlist: any) {
  detailPlaylistModalOpen.value = false;
  openPlaylistModal(playlist);
}

async function saveUser() {
  try {
    const data: any = {
      name: modalUser.value.name,
      email: modalUser.value.email,
      username: modalUser.value.username || modalUser.value.email.split('@')[0],
      role: modalUser.value.role,
    };

    if (!editingUser.value) {
      data.password = modalUser.value.password;
      data.passwordConfirm = modalUser.value.password;
      await pb.collection('users').create(data);
      showToast('Usuario creado exitosamente', 'success');
    } else {
      if (modalUser.value.password) {
        data.password = modalUser.value.password;
        data.passwordConfirm = modalUser.value.password;
      }
      await pb.collection('users').update(editingUser.value.id, data);
      showToast('Usuario actualizado exitosamente', 'success');
    }

    userModalOpen.value = false;
    await loadUsers();
  } catch (err: any) {
    console.error('❌ Error:', err);
    showToast(err.message || 'Error al guardar usuario', 'danger');
  }
}

async function savePlaylist() {
  try {
    const data = {
      title: modalPlaylist.value.title,
      owner: modalPlaylist.value.owner,
      privacy: modalPlaylist.value.privacy,
    };

    if (!editingPlaylist.value) {
      await pb.collection('playlists').create(data);
      showToast('Playlist creada exitosamente', 'success');
    } else {
      await pb.collection('playlists').update(editingPlaylist.value.id, data);
      showToast('Playlist actualizada exitosamente', 'success');
    }

    playlistModalOpen.value = false;
    await loadPlaylists();
  } catch (err: any) {
    console.error('❌ Error:', err);
    showToast(err.message || 'Error al guardar playlist', 'danger');
  }
}

async function confirmDelete(type: string, item: any) {
  const alert = await alertController.create({
    header: `Eliminar ${type === 'user' ? 'Usuario' : 'Playlist'}`,
    message: `¿Estás seguro de eliminar "${item.name || item.title}"?`,
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: async () => {
          try {
            await pb.collection(type === 'user' ? 'users' : 'playlists').delete(item.id);
            showToast(`${type === 'user' ? 'Usuario' : 'Playlist'} eliminado`, 'success');
            if (type === 'user') await loadUsers();
            else await loadPlaylists();
          } catch (err) {
            showToast('Error al eliminar', 'danger');
          }
        },
      },
    ],
  });
  await alert.present();
}

function getAvatarUrl(user: any) {
  if (user.avatar) {
    return pb.getFileUrl(user, user.avatar, { thumb: '100x100' });
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=f1c40f&color=1a1a1d&size=100`;
}

function getCoverUrl(playlist: any) {
  if (playlist.cover) {
    return pb.getFileUrl(playlist, playlist.cover);
  }
  return '';
}

function formatDate(dateString: string) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ⭐ FUNCIONES DE EXPORTACIÓN
async function exportUsers(format: 'pdf' | 'excel' | 'csv') {
  const data = filteredUsers.value.map(u => ({
    ID: u.id,
    Nombre: u.name || '',
    Username: u.username || '',
    Email: u.email || '',
    Rol: u.role || '',
    Creado: formatDate(u.created),
  }));

  if (format === 'pdf') {
    await exportToPDF(data, 'Usuarios', ['ID', 'Nombre', 'Username', 'Email', 'Rol', 'Creado']);
  } else if (format === 'excel') {
    exportToExcel(data, 'Usuarios');
  } else if (format === 'csv') {
    exportToCSV(data, 'Usuarios');
  }
}

async function exportPlaylists(format: 'pdf' | 'excel' | 'csv') {
  const data = filteredPlaylists.value.map(p => ({
    ID: p.id,
    Título: p.title || '',
    Propietario: p.expand?.owner?.name || p.expand?.owner?.username || '',
    Privacidad: p.privacy || '',
    Creado: formatDate(p.created),
  }));

  if (format === 'pdf') {
    await exportToPDF(data, 'Playlists', ['ID', 'Título', 'Propietario', 'Privacidad', 'Creado']);
  } else if (format === 'excel') {
    exportToExcel(data, 'Playlists');
  } else if (format === 'csv') {
    exportToCSV(data, 'Playlists');
  }
}

// PDF Export (usando jsPDF)
async function exportToPDF(data: any[], title: string, columns: string[]) {
  try {
    // Importar jsPDF dinámicamente
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF() as any;

    // Título
    doc.setFontSize(18);
    doc.setTextColor(241, 196, 15);
    doc.text(title, 14, 20);

    // Fecha
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 28);

    // Tabla
    const tableData = data.map(row => columns.map(col => String(row[col] || '')));

    doc.autoTable({
      head: [columns],
      body: tableData,
      startY: 35,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    doc.save(`${title}_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('PDF descargado exitosamente', 'success');
  } catch (err) {
    console.error('Error exportando PDF:', err);
    showToast('Error: Instala jspdf con: npm install jspdf jspdf-autotable', 'danger');
  }
}

// Excel Export (usando xlsx)
function exportToExcel(data: any[], sheetName: string) {
  try {
    // Crear manualmente un CSV con formato de Excel
    const headers = Object.keys(data[0]);
    let csv = headers.join(',') + '\n';
    
    data.forEach(row => {
      const values = headers.map(h => {
        const val = String(row[h] || '');
        return val.includes(',') ? `"${val}"` : val;
      });
      csv += values.join(',') + '\n';
    });

    // Crear Blob y descargar
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${sheetName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Excel/CSV descargado exitosamente', 'success');
  } catch (err) {
    console.error('Error exportando Excel:', err);
    showToast('Error al exportar', 'danger');
  }
}

// CSV Export
function exportToCSV(data: any[], filename: string) {
  exportToExcel(data, filename); // Usa la misma función
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
.admin-content {
  --background: linear-gradient(135deg, #1e1b4b 0%, #701a75 100%);
}

.admin-content::part(scroll) {
  background: url('/bg.png') no-repeat center center fixed;
  background-size: cover;
}

.admin-section {
  margin: 1rem;
  background: rgba(30, 27, 75, 0.9);
  border: 1px solid rgba(241, 196, 15, 0.2);
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.toolbar-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-bar {
  flex: 1;
  min-width: 200px;
  --background: rgba(26, 26, 29, 0.6);
  --border-radius: 12px;
}

.export-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.table-wrapper {
  margin: 1rem 0;
}

.user-item,
.playlist-item {
  --background: rgba(26, 26, 29, 0.4);
  --border-color: rgba(241, 196, 15, 0.1);
  margin-bottom: 0.5rem;
  border-radius: 8px;
}

.avatar-placeholder,
.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
  color: #1a1a1d;
  font-weight: bold;
  font-size: 1.25rem;
}

.item-actions {
  display: flex;
  gap: 0.25rem;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.page-info {
  color: #f5f5f7;
  font-size: 0.9rem;
}

.modal-content {
  --background: rgba(30, 27, 75, 0.95);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  justify-content: flex-end;
}

/* DETALLE MODAL */
.detail-modal {
  --background: rgba(30, 27, 75, 0.98);
}

.detail-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  gap: 1rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
}

.detail-avatar,
.detail-cover {
  width: 120px;
  height: 120px;
  border: 4px solid rgba(241, 196, 15, 0.5);
  border-radius: 50%;
  overflow: hidden;
}

.detail-cover {
  border-radius: 12px;
}

.avatar-placeholder-large,
.cover-placeholder-large {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%);
  color: #1a1a1d;
  font-weight: bold;
  font-size: 3rem;
}

.detail-header h2 {
  margin: 0;
  color: #f5f5f7;
  font-size: 1.5rem;
  text-align: center;
}

.detail-label {
  font-size: 0.8rem;
  color: rgba(241, 196, 15, 0.8);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.detail-modal ion-item {
  --background: rgba(26, 26, 29, 0.4);
  --border-color: rgba(241, 196, 15, 0.1);
  margin-bottom: 0.5rem;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .toolbar-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-bar {
    width: 100%;
  }

  .export-buttons {
    justify-content: center;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }

  .item-actions {
    flex-direction: column;
  }
}
</style>
