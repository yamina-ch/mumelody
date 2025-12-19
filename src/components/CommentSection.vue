<template>
  <div class="comment-section">
    <!-- Header -->
    <div class="section-header">
      <ion-icon :icon="chatbubblesOutline" color="warning"></ion-icon>
      <h3 class="section-title">
        Comentarios 
        <ion-badge color="warning">{{ commentsStore.count }}</ion-badge>
      </h3>
    </div>

    <!-- Formulario para nuevo comentario -->
    <div v-if="currentUser" class="comment-form">
      <ion-avatar class="comment-avatar">
        <img :src="userAvatar" :alt="userName" />
      </ion-avatar>

      <div class="comment-form-content">
        <ion-textarea
          v-model="newCommentContent"
          placeholder="Escribe un comentario..."
          :maxlength="500"
          :auto-grow="true"
          :rows="3"
          class="comment-textarea"
        ></ion-textarea>

        <div class="comment-form-footer">
          <ion-text 
            :color="newCommentContent.length > 450 ? 'danger' : 'medium'"
            class="char-count"
          >
            {{ newCommentContent.length }}/500
          </ion-text>

          <ion-button 
            size="small"
            color="warning"
            @click="handleSubmit"
            :disabled="!newCommentContent.trim() || submitting"
          >
            <ion-icon 
              :icon="submitting ? hourglassOutline : sendOutline" 
              slot="start"
            ></ion-icon>
            {{ submitting ? 'Enviando...' : 'Comentar' }}
          </ion-button>
        </div>
      </div>
    </div>

    <!-- Login prompt -->
    <ion-card v-else class="login-prompt">
      <ion-card-content>
        <ion-icon :icon="lockClosedOutline" class="login-icon"></ion-icon>
        <p>Inicia sesión para comentar</p>
        <ion-button color="warning" @click="router.push('/login')">
          Iniciar sesión
        </ion-button>
      </ion-card-content>
    </ion-card>

    <!-- Loading State -->
    <div v-if="commentsStore.loading" class="loading-state">
      <ion-spinner name="crescent" color="warning"></ion-spinner>
      <p>Cargando comentarios...</p>
    </div>

    <!-- Lista de comentarios -->
    <div v-else-if="commentsStore.count > 0" class="comments-list">
      <ion-card 
        v-for="comment in commentsStore.sortedComments" 
        :key="comment.id"
        class="comment-card"
      >
        <ion-card-content>
          <div class="comment-header">
            <ion-avatar class="comment-avatar">
              <img 
                :src="getCommentAvatar(comment)" 
                :alt="getCommentUsername(comment)"
              />
            </ion-avatar>

            <div class="comment-info">
              <strong class="comment-author">{{ getCommentUsername(comment) }}</strong>
              <ion-text color="medium" class="comment-date">
                <ion-icon :icon="timeOutline"></ion-icon>
                {{ formatDate(comment.created) }}
              </ion-text>
            </div>
          </div>

          <!-- Modo edición -->
          <div v-if="editingCommentId === comment.id" class="comment-edit">
            <ion-textarea
              v-model="editContent"
              :maxlength="500"
              :auto-grow="true"
              :rows="3"
              class="comment-textarea"
            ></ion-textarea>

            <div class="edit-actions">
              <ion-button fill="outline" size="small" @click="cancelEdit">
                <ion-icon :icon="closeOutline" slot="start"></ion-icon>
                Cancelar
              </ion-button>

              <ion-button 
                size="small"
                color="warning"
                @click="saveEdit(comment.id)"
                :disabled="!editContent.trim()"
              >
                <ion-icon :icon="checkmarkOutline" slot="start"></ion-icon>
                Guardar
              </ion-button>
            </div>
          </div>

          <!-- Vista normal -->
          <p v-else class="comment-text">{{ comment.content }}</p>

          <!-- Acciones -->
          <div 
            v-if="editingCommentId !== comment.id && (commentsStore.canEdit(comment) || commentsStore.canDelete(comment))" 
            class="comment-actions"
          >
            <ion-button 
              v-if="commentsStore.canEdit(comment)"
              fill="clear"
              size="small"
              @click="startEdit(comment)"
            >
              <ion-icon :icon="createOutline" slot="start"></ion-icon>
              Editar
            </ion-button>

            <ion-button 
              v-if="commentsStore.canDelete(comment)"
              fill="clear"
              size="small"
              color="danger"
              @click="handleDelete(comment.id)"
            >
              <ion-icon :icon="trashOutline" slot="start"></ion-icon>
              Eliminar
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>
    </div>

    <!-- Empty State -->
    <ion-card v-else class="empty-state">
      <ion-card-content>
        <ion-icon :icon="chatbubbleOutline" class="empty-icon"></ion-icon>
        <p>Sé el primero en comentar</p>
      </ion-card-content>
    </ion-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonAvatar, IonTextarea, IonButton, IonIcon, IonBadge, IonText,
  IonCard, IonCardContent, IonSpinner, alertController, toastController,
} from '@ionic/vue';
import {
  chatbubblesOutline, chatbubbleOutline, sendOutline, lockClosedOutline,
  timeOutline, createOutline, trashOutline, closeOutline, checkmarkOutline,
  hourglassOutline,
} from 'ionicons/icons';
import { useCommentsStore } from '@/stores/commentsStore';
import pb from '@/services/pocketbase';

const props = defineProps({
  playlistId: { type: String, required: true }
});

const emit = defineEmits(['comment-added', 'comment-updated', 'comment-deleted']);
const router = useRouter();
const commentsStore = useCommentsStore();

const newCommentContent = ref('');
const submitting = ref(false);
const editingCommentId = ref<string | null>(null);
const editContent = ref('');

const currentUser = computed(() => pb.authStore.model);

const userName = computed(() => {
  const user = pb.authStore.model;
  return user?.name || user?.username || 'Usuario';
});

const userAvatar = computed(() => {
  const user = pb.authStore.model;
  if (user?.avatar) {
    return pb.getFileUrl(user, user.avatar, { thumb: '80x80' });
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName.value)}&background=f1c40f&color=1a1a1d&size=80`;
});

/* Avatar de otros usuarios */
function getCommentAvatar(comment: any) {
  const user = comment.expand?.userId;
  if (!user) {
    return `https://ui-avatars.com/api/?name=User&background=random&size=80`;
  }

  if (user.avatar) {
    return pb.getFileUrl(user, user.avatar, { thumb: '80x80' });
  }

  const name = user.name || user.username || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=80`;
}

/* Nombre de otros usuarios */
function getCommentUsername(comment: any) {
  return comment.expand?.userId?.name ||
         comment.expand?.userId?.username ||
         'Usuario';
}

/* Formato fecha */
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  if (hrs < 24) return `Hace ${hrs} h`;
  if (days < 7) return `Hace ${days} d`;

  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

/* Crear comentario */
async function handleSubmit() {
  if (!newCommentContent.value.trim() || submitting.value) return;

  try {
    submitting.value = true;
    const comment = await commentsStore.createComment(
      props.playlistId,
      newCommentContent.value
    );

    newCommentContent.value = '';
    emit('comment-added', comment);
    
    showToast('Comentario publicado', 'success');
  } catch (err: any) {
    showToast('Error al publicar comentario', 'danger');
    console.error(err);
  } finally {
    submitting.value = false;
  }
}

/* Editar comentario */
function startEdit(comment: any) {
  editingCommentId.value = comment.id;
  editContent.value = comment.content;
}

function cancelEdit() {
  editingCommentId.value = null;
  editContent.value = '';
}

async function saveEdit(commentId: string) {
  if (!editContent.value.trim()) return;

  try {
    const updated = await commentsStore.updateComment(commentId, editContent.value);
    emit('comment-updated', updated);
    editingCommentId.value = null;
    editContent.value = '';
    showToast('Comentario actualizado', 'success');
  } catch (err) {
    showToast('Error al actualizar comentario', 'danger');
  }
}

/* Eliminar */
async function handleDelete(commentId: string) {
  const alert = await alertController.create({
    header: 'Eliminar comentario',
    message: '¿Estás seguro de eliminar este comentario?',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Eliminar',
        role: 'destructive',
        handler: async () => {
          try {
            await commentsStore.deleteComment(commentId);
            emit('comment-deleted', commentId);
            showToast('Comentario eliminado', 'success');
          } catch (err) {
            showToast('Error al eliminar comentario', 'danger');
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

/* CARGA DE COMENTARIOS */
onMounted(() => {
  commentsStore.loadComments(props.playlistId);
});

watch(() => props.playlistId, (newId) => {
  if (newId) commentsStore.loadComments(newId);
});
</script>

<style scoped>
.comment-section {
  padding: 1.5rem;
  background: rgba(21, 21, 23, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(241, 196, 15, 0.2);
}

/* Header */
.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-header ion-icon {
  font-size: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  margin: 0;
  color: #f5f5f7;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Formulario */
.comment-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(27, 27, 31, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(241, 196, 15, 0.1);
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border: 2px solid #f1c40f;
  flex-shrink: 0;
}

.comment-form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.comment-textarea {
  --background: rgba(26, 26, 29, 0.8);
  --color: #f5f5f7;
  --placeholder-color: rgba(255, 255, 255, 0.4);
  --padding-start: 0.75rem;
  --padding-end: 0.75rem;
  --padding-top: 0.75rem;
  --padding-bottom: 0.75rem;
  border: 1px solid rgba(241, 196, 15, 0.2);
  border-radius: 8px;
}

.comment-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 0.85rem;
}

/* Login prompt */
.login-prompt {
  --background: rgba(27, 27, 31, 0.6);
  margin: 0 0 2rem 0;
  border: 1px solid rgba(241, 196, 15, 0.2);
  text-align: center;
}

.login-icon {
  font-size: 3rem;
  color: #f1c40f;
  margin-bottom: 1rem;
}

.login-prompt p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1rem 0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Comments List */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-card {
  --background: rgba(27, 27, 31, 0.6);
  --color: #f5f5f7;
  margin: 0;
  border: 1px solid rgba(241, 196, 15, 0.1);
}

.comment-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.comment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.comment-author {
  font-size: 0.95rem;
  color: #f5f5f7;
}

.comment-date {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.comment-date ion-icon {
  font-size: 0.9rem;
}

.comment-text {
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Edit Mode */
.comment-edit {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.edit-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Comment Actions */
.comment-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(241, 196, 15, 0.1);
}

/* Empty State */
.empty-state {
  --background: rgba(27, 27, 31, 0.6);
  margin: 0;
  border: 1px solid rgba(241, 196, 15, 0.2);
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  color: rgba(241, 196, 15, 0.3);
  margin-bottom: 1rem;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

@media (max-width: 768px) {
  .comment-section {
    padding: 1rem;
  }

  .comment-form {
    flex-direction: column;
    align-items: flex-start;
  }

  .comment-avatar {
    width: 36px;
    height: 36px;
  }

  .comment-actions {
    flex-direction: column;
  }
}
</style>
