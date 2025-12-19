<template>
  <ion-app>
    <ion-router-outlet />
    
    <!-- Reproductor de música flotante -->
    <MusicPlayer />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import MusicPlayer from '@/components/MusicPlayer.vue';
</script>
