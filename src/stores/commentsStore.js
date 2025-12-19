// src/stores/commentsStore.js
import { defineStore } from 'pinia';
import pb from '@/services/pocketbase'; // ⚠️ CAMBIO: Importación correcta

export const useCommentsStore = defineStore('comments', {
  state: () => ({
    comments: [],
    loading: false
  }),

  getters: {
    sortedComments: (state) => {
      return [...state.comments].sort((a, b) => 
        new Date(b.created) - new Date(a.created)
      );
    },
    count: (state) => state.comments.length
  },

  actions: {
    async loadComments(playlistId) {
      if (!playlistId) return;
      try {
        this.loading = true;
        
        const records = await pb.collection('comments').getFullList({
          filter: `playlistId = "${playlistId}"`,
          sort: '-created',
          expand: 'userId'
        });
        
        this.comments = [...records];
      } catch (error) {
        console.error('Error loading comments:', error);
        this.comments = [];
      } finally {
        this.loading = false;
      }
    },

    async createComment(playlistId, content) {
      const user = pb.authStore.model; // ⚠️ CAMBIO
      if (!user || !pb.authStore.isValid) throw new Error('Usuario no autenticado');
      if (!content?.trim()) throw new Error('El comentario no puede estar vacío');
      if (content.length > 500) throw new Error('El comentario es demasiado largo');

      try {
        const newComment = await pb.collection('comments').create({
          playlistId,
          userId: user.id,
          content: content.trim()
        }, {
          expand: 'userId'
        });
        
        this.comments.unshift(newComment);
        return newComment;
      } catch (error) {
        console.error('Error creating comment:', error);
        throw error;
      }
    },

    async updateComment(commentId, newContent) {
      if (!newContent?.trim()) throw new Error('El comentario no puede estar vacío');
      if (newContent.length > 500) throw new Error('El comentario es demasiado largo');

      try {
        const updated = await pb.collection('comments').update(commentId, {
          content: newContent.trim()
        }, {
          expand: 'userId'
        });

        const index = this.comments.findIndex(c => c.id === commentId);
        if (index !== -1) {
          this.comments[index] = updated;
        }
        return updated;
      } catch (error) {
        console.error('Error updating comment:', error);
        throw error;
      }
    },

    async deleteComment(commentId) {
      try {
        await pb.collection('comments').delete(commentId);
        this.comments = this.comments.filter(c => c.id !== commentId);
      } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
      }
    },

    canEdit(comment) {
      const user = pb.authStore.model; // ⚠️ CAMBIO
      if (!user || !pb.authStore.isValid) return false;
      const ownerId = comment.userId || comment.expand?.userId?.id;
      return ownerId === user.id || user.role === 'admin';
    },

    canDelete(comment) {
      const user = pb.authStore.model; // ⚠️ CAMBIO
      if (!user || !pb.authStore.isValid) return false;
      const ownerId = comment.userId || comment.expand?.userId?.id;
      return ownerId === user.id || user.role === 'admin';
    }
  }
});
