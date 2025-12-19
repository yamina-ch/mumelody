<template>
  <ion-page>
    <ion-content fullscreen class="register-bg">
      <div class="register-wrapper">
        <ion-card class="register-card">
          <ion-card-header>
            <ion-card-title class="title">Crear cuenta</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item lines="none" class="input-item">
              <ion-label position="stacked">Nombre</ion-label>
              <ion-input
                v-model="name"
                type="text"
                placeholder="Tu nombre"
              />
            </ion-item>

            <ion-item lines="none" class="input-item">
              <ion-label position="stacked">Username</ion-label>
              <ion-input
                v-model="username"
                type="text"
                placeholder="username123"
              />
            </ion-item>

            <ion-item lines="none" class="input-item">
              <ion-label position="stacked">Email</ion-label>
              <ion-input
                v-model="email"
                type="email"
                placeholder="tú@correo.com"
              />
            </ion-item>

            <ion-item lines="none" class="input-item">
              <ion-label position="stacked">Contraseña</ion-label>
              <ion-input
                v-model="password"
                type="password"
                placeholder="••••••••"
              />
              <ion-note>Mínimo 6 caracteres</ion-note>
            </ion-item>

            <ion-item lines="none" class="input-item">
              <ion-label position="stacked">Repite la contraseña</ion-label>
              <ion-input
                v-model="passwordConfirm"
                type="password"
                placeholder="••••••••"
              />
            </ion-item>

            <ion-text color="danger" v-if="error" class="error">
              {{ error }}
            </ion-text>
            
            <ion-text color="success" v-if="success" class="success">
              {{ success }}
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
                @click="register"
                :disabled="isLoading"
              >
                <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
                <span v-else>Crear cuenta</span>
              </ion-button>
            </div>

            <div class="login-link">
              <span>¿Ya tienes cuenta?</span>
              <ion-button
                fill="clear"
                color="warning"
                size="small"
                @click="router.push('/login')"
              >
                Inicia sesión
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
  IonNote,
  IonSpinner,
  toastController
} from '@ionic/vue';
import pb from '@/services/pocketbase';

const router = useRouter();
const name = ref('');
const username = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const error = ref('');
const success = ref('');
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

async function register() {
  error.value = '';
  success.value = '';

  // Validaciones
  if (!name.value || !username.value || !email.value || !password.value) {
    error.value = 'Todos los campos son obligatorios';
    return;
  }

  if (password.value !== passwordConfirm.value) {
    error.value = 'Las contraseñas no coinciden';
    return;
  }

  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres';
    return;
  }

  isLoading.value = true;

  try {
    console.log('🔵 Registrando usuario:', { name: name.value, username: username.value, email: email.value });

    // Crear usuario en PocketBase
    const user = await pb.collection('users').create({
      username: username.value,
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
      name: name.value,
      emailVisibility: true,
    });

    console.log('✅ Usuario creado:', user);

    success.value = '✅ Cuenta creada correctamente. Redirigiendo...';
    showToast('¡Bienvenido a Numelody!', 'success');

    // Auto-login después del registro
    await pb.collection('users').authWithPassword(username.value, password.value);

    setTimeout(() => {
      router.replace('/home-auth');
    }, 1500);

  } catch (e: any) {
    console.error('❌ Error al registrar:', e);

    // Manejar errores específicos de PocketBase
    if (e?.data?.data) {
      const errorData = e.data.data;
      
      if (errorData.username) {
        error.value = 'Este username ya está en uso';
      } else if (errorData.email) {
        error.value = 'Este email ya está registrado';
      } else {
        error.value = 'Datos inválidos. Verifica todos los campos.';
      }
    } else if (e?.status === 400) {
      error.value = 'Datos inválidos. Verifica todos los campos.';
    } else {
      error.value = 'Error al crear la cuenta. Inténtalo de nuevo.';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.register-bg {
  --background: linear-gradient(135deg, #1e1b4b 0%, #701a75 100%);
}

.register-bg::part(scroll) {
  background: url('/bg.png') no-repeat center center fixed;
  background-size: cover;
}

.register-wrapper {
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.register-card {
  width: 100%;
  max-width: 450px;
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

.input-item ion-note {
  color: #92949c;
  font-size: 0.85rem;
  margin-top: 0.25rem;
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

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #f5f5f7;
}

.login-link span {
  color: #92949c;
  margin-right: 0.5rem;
}

.error,
.success {
  display: block;
  text-align: center;
  margin-top: 1rem;
  font-weight: 500;
}
</style>
