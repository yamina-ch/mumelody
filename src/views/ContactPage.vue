<template>
  <ion-page>
    <!-- Header -->
    <ion-header class="dark-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home-auth" text="" color="warning"></ion-back-button>
        </ion-buttons>
        <ion-title>Contacto</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="contact-content">
      <div class="container">
        
        <!-- Hero Section -->
        <div class="hero-section">
          <ion-icon :icon="mailOutline" class="hero-icon"></ion-icon>
          <h1 class="title">¿Necesitas ayuda?</h1>
          <p class="subtitle">
            Si tienes dudas o problemas con <strong>Numelody</strong>, completa el siguiente 
            formulario y te responderemos lo antes posible.
          </p>
        </div>

        <!-- Contact Form -->
        <ion-card class="form-card">
          <ion-card-content>
            <form @submit.prevent="submitForm">
              
              <!-- Nombre -->
              <ion-item class="form-item">
                <ion-label position="stacked">
                  <ion-icon :icon="personOutline" class="label-icon"></ion-icon>
                  Nombre completo
                </ion-label>
                <ion-input
                  v-model="nombre"
                  type="text"
                  placeholder="Tu nombre"
                  required
                  clearInput
                ></ion-input>
              </ion-item>

              <!-- Email -->
              <ion-item class="form-item">
                <ion-label position="stacked">
                  <ion-icon :icon="mailOutline" class="label-icon"></ion-icon>
                  Correo electrónico
                </ion-label>
                <ion-input
                  v-model="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  clearInput
                ></ion-input>
              </ion-item>

              <!-- Asunto -->
              <ion-item class="form-item">
                <ion-label position="stacked">
                  <ion-icon :icon="documentTextOutline" class="label-icon"></ion-icon>
                  Asunto
                </ion-label>
                <ion-select
                  v-model="asunto"
                  placeholder="Selecciona un tema"
                  interface="action-sheet"
                >
                  <ion-select-option value="soporte">Soporte técnico</ion-select-option>
                  <ion-select-option value="sugerencia">Sugerencia</ion-select-option>
                  <ion-select-option value="problema">Reportar problema</ion-select-option>
                  <ion-select-option value="otro">Otro</ion-select-option>
                </ion-select>
              </ion-item>

              <!-- Mensaje -->
              <ion-item class="form-item textarea-item">
                <ion-label position="stacked">
                  <ion-icon :icon="chatbubbleEllipsesOutline" class="label-icon"></ion-icon>
                  Mensaje
                </ion-label>
                <ion-textarea
                  v-model="mensaje"
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  :auto-grow="true"
                  :rows="6"
                  required
                ></ion-textarea>
              </ion-item>

              <!-- Character count -->
              <div class="char-count">
                <ion-text color="medium">
                  {{ mensaje.length }} / 500 caracteres
                </ion-text>
              </div>

              <!-- Buttons -->
              <div class="form-actions">
                <ion-button
                  expand="block"
                  color="warning"
                  size="large"
                  type="submit"
                  :disabled="!isFormValid"
                >
                  <ion-icon :icon="sendOutline" slot="start"></ion-icon>
                  Enviar mensaje
                </ion-button>
                <ion-button
                  expand="block"
                  fill="outline"
                  color="medium"
                  size="large"
                  @click="resetForm"
                >
                  <ion-icon :icon="closeOutline" slot="start"></ion-icon>
                  Limpiar formulario
                </ion-button>
              </div>
            </form>
          </ion-card-content>
        </ion-card>

        <!-- Contact Info -->
        <div class="contact-info">
          <h2 class="info-title">Otras formas de contacto</h2>
          
          <div class="info-grid">
            <ion-card class="info-card">
              <ion-card-content>
                <ion-icon :icon="mailOutline" color="warning" class="info-icon"></ion-icon>
                <h3>Email</h3>
                <p>soporte@numelody.com</p>
              </ion-card-content>
            </ion-card>

            <ion-card class="info-card">
              <ion-card-content>
                <ion-icon :icon="logoTwitter" color="warning" class="info-icon"></ion-icon>
                <h3>Twitter</h3>
                <p>@numelody</p>
              </ion-card-content>
            </ion-card>

            <ion-card class="info-card">
              <ion-card-content>
                <ion-icon :icon="timeOutline" color="warning" class="info-icon"></ion-icon>
                <h3>Horario</h3>
                <p>Lun - Vie: 9:00 - 18:00</p>
              </ion-card-content>
            </ion-card>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <footer class="site-footer">
        <div class="footer-content">
          <div class="footer-brand">
            <ion-icon :icon="musicalNotesOutline" color="warning"></ion-icon>
            <span>© 2025 Numelody</span>
          </div>
          
          <div class="social-links">
            <ion-button fill="clear" size="small" aria-label="X">
              <ion-icon :icon="logoTwitter"></ion-icon>
            </ion-button>
            <ion-button fill="clear" size="small" aria-label="Instagram">
              <ion-icon :icon="logoInstagram"></ion-icon>
            </ion-button>
            <ion-button fill="clear" size="small" aria-label="YouTube">
              <ion-icon :icon="logoYoutube"></ion-icon>
            </ion-button>
            <ion-button fill="clear" size="small" aria-label="GitHub">
              <ion-icon :icon="logoGithub"></ion-icon>
            </ion-button>
          </div>
        </div>
      </footer>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonCard, IonCardContent, IonItem, IonLabel, IonInput,
  IonTextarea, IonButton, IonIcon, IonSelect, IonSelectOption, IonText,
  alertController, toastController,
} from '@ionic/vue';
import {
  mailOutline, personOutline, documentTextOutline, chatbubbleEllipsesOutline,
  sendOutline, closeOutline, musicalNotesOutline, logoTwitter, logoInstagram,
  logoYoutube, logoGithub, timeOutline,
} from 'ionicons/icons';

const router = useRouter();

const nombre = ref('');
const email = ref('');
const asunto = ref('');
const mensaje = ref('');

const isFormValid = computed(() => {
  return nombre.value.trim() !== '' && 
         email.value.trim() !== '' && 
         mensaje.value.trim() !== '' &&
         mensaje.value.length <= 500;
});

async function submitForm() {
  const alert = await alertController.create({
    header: '¡Mensaje enviado!',
    message: `Gracias ${nombre.value}, hemos recibido tu mensaje. Te responderemos pronto a ${email.value}`,
    buttons: [
      {
        text: 'Aceptar',
        role: 'confirm',
        handler: () => {
          resetForm();
          showToast('Mensaje enviado correctamente', 'success');
        },
      },
    ],
  });

  await alert.present();
}

function resetForm() {
  nombre.value = '';
  email.value = '';
  asunto.value = '';
  mensaje.value = '';
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
.dark-header ion-toolbar {
  --background: #1a1a1d;
  --border-color: rgba(241, 196, 15, 0.2);
  --padding-top: 0;
  --padding-bottom: 0;
  --min-height: 60px;
}

.contact-content {
  --background: linear-gradient(135deg, #1e1b4b 0%, #701a75 100%);
}

.contact-content::part(scroll) {
  background: url('/bg.jpg') no-repeat center center fixed;
  background-size: cover;
  position: relative;
}

.contact-content::part(scroll)::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(30, 27, 75, 0.85) 0%, rgba(112, 26, 117, 0.85) 100%);
  z-index: -1;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 2rem 0 3rem 0;
}

.hero-icon {
  font-size: 4rem;
  color: #f1c40f;
  margin-bottom: 1rem;
}

.title {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  color: #f5f5f7;
  font-weight: 700;
}

.subtitle {
  max-width: 600px;
  margin: 0 auto;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  line-height: 1.6;
}

.subtitle strong {
  color: #f1c40f;
}

/* Form Card */
.form-card {
  --background: rgba(27, 27, 31, 0.85);
  --color: #f5f5f7;
  margin: 0 0 3rem 0;
  border: 1px solid rgba(241, 196, 15, 0.2);
  backdrop-filter: blur(10px);
}

.form-item {
  --background: rgba(26, 26, 29, 0.6);
  --color: #f5f5f7;
  --border-color: rgba(241, 196, 15, 0.1);
  --placeholder-color: rgba(255, 255, 255, 0.4);
  --highlight-color-focused: #f1c40f;
  margin-bottom: 1.5rem;
  border-radius: 8px;
}

.textarea-item {
  --padding-top: 1rem;
  --padding-bottom: 1rem;
}

.label-icon {
  margin-right: 0.5rem;
  font-size: 1.1rem;
  vertical-align: middle;
}

ion-label {
  color: #f5f5f7 !important;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

ion-input,
ion-textarea,
ion-select {
  --color: #f5f5f7;
  --placeholder-color: rgba(255, 255, 255, 0.4);
}

.char-count {
  text-align: right;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

/* Contact Info */
.contact-info {
  margin-bottom: 3rem;
}

.info-title {
  font-size: 2rem;
  color: #f1c40f;
  text-align: center;
  margin: 0 0 2rem 0;
  font-weight: 700;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-card {
  --background: rgba(27, 27, 31, 0.6);
  --color: #f5f5f7;
  margin: 0;
  border: 1px solid rgba(241, 196, 15, 0.2);
  text-align: center;
}

.info-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.info-card h3 {
  color: #f5f5f7;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.info-card p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 0.95rem;
}

/* Footer */
.site-footer {
  background: rgba(21, 21, 23, 0.9);
  border-top: 1px solid rgba(241, 196, 15, 0.2);
  padding: 2rem 1.5rem;
  margin-top: 3rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.footer-brand ion-icon {
  font-size: 1.5rem;
}

.social-links {
  display: flex;
  gap: 0.5rem;
}

.social-links ion-button {
  --color: rgba(255, 255, 255, 0.7);
  --color-hover: #f1c40f;
}

@media (max-width: 768px) {
  .title {
    font-size: 1.75rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
