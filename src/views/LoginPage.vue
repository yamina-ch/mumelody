<template>
  <ion-page>
    <ion-content fullscreen class="login-bg">
      <div class="login-wrapper">
        <ion-card class="login-card">
          <ion-card-header>
            <ion-card-title class="title">Inicia sesión</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item lines="none" class="input-item">
              <ion-label position="stacked">Email o Username</ion-label>
              <ion-input
                v-model="identifier"
                type="text"
                placeholder="tú@correo.com o username"
              />
            </ion-item>
            <ion-item lines="none" class="input-item">
              <ion-label position="stacked">Contraseña</ion-label>
              <ion-input
                v-model="password"
                type="password"
                placeholder="••••••••"
              />
            </ion-item>
            <ion-text color="danger" v-if="error" class="error">
              {{ error }}
            </ion-text>
            <div class="actions">
              <ion-button
                fill="outline"
                color="medium"
                @click="router.push('/home')"
              >
                Cancelar
              </ion-button>
              <ion-button
                color="warning"
                @click="login"
                :disabled="isLoading"
              >
                <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
                <span v-else>Entrar</span>
              </ion-button>
            </div>
            <div class="register">
              <span>¿No tienes cuenta?</span>
              <ion-button
                fill="clear"
                color="warning"
                size="small"
                @click="router.push('/register')"
              >
                Regístrate aquí
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
  toastController
} from '@ionic/vue';
import pb from '@/services/pocketbase';

const router = useRouter();
const identifier = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

async function showToast(message: string, color: string = 'success') {
  const toast = await toastController.create({
    message,
    duration: 2000,
    position: 'bottom',
    color,
  });
  await toast.present();
}

async function login() {
  error.value = '';
  isLoading.value = true;

  try {
    console.log('🔵 Intentando login con:', identifier.value);
    
    // PocketBase acepta username o email
    await pb.collection('users').authWithPassword(
      identifier.value,
      password.value
    );

    const user = pb.authStore.model;
    console.log('✅ Login exitoso:', user);

    showToast(`¡Bienvenido ${user?.name || user?.username}!`, 'success');
    
    // Redirigir a home-auth
    router.replace('/home-auth');
    
  } catch (e: any) {
    console.error('❌ Error de login:', e);
    
    if (e?.status === 400) {
      error.value = 'Email/Username o contraseña incorrectos';
    } else if (e?.status === 404) {
      error.value = 'Usuario no encontrado';
    } else {
      error.value = 'Error al iniciar sesión. Inténtalo de nuevo.';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.login-bg {
  --background: linear-gradient(135deg, #1e1b4b 0%, #701a75 100%);
}

.login-bg::part(scroll) {
  background: url('/bg.png') no-repeat center center fixed;
  background-size: cover;
}

.login-wrapper {
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  background: rgba(30, 27, 75, 0.9);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(241, 196, 15, 0.2);
}

.title {
  text-align: center;
  color: #f1c40f;
  font-size: 2rem;
  font-weight: bold;
  margin: 1rem 0;
}

.input-item {
  --background: rgba(26, 26, 29, 0.6);
  --border-radius: 12px;
  --padding-start: 1rem;
  --padding-end: 1rem;
  margin-bottom: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(241, 196, 15, 0.2);
}

.input-item ion-label {
  color: #f5f5f7 !important;
  font-weight: 600;
}

.input-item ion-input {
  --color: #f5f5f7;
  --placeholder-color: #92949c;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.actions ion-button {
  flex: 1;
  height: 48px;
  text-transform: none;
  font-weight: 600;
}

.register {
  text-align: center;
  margin-top: 1.5rem;
  color: #f5f5f7;
}

.register span {
  color: #92949c;
  margin-right: 0.5rem;
}

.error {
  display: block;
  text-align: center;
  margin-top: 1rem;
  font-weight: 500;
}
</style>
