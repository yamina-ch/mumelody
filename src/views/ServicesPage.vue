<template>
  <ion-page>
    <!-- Header -->
    <ion-header class="dark-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home-auth" text="" color="warning"></ion-back-button>
        </ion-buttons>
        <ion-title>Servicios</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="services-content">
      <div class="container">
        
        <!-- Hero Section -->
        <div class="hero-section">
          <ion-icon :icon="musicalNotesOutline" class="hero-icon"></ion-icon>
          <h1 class="title">Nuestros Servicios</h1>
          <p class="subtitle">
            En <strong>Numelody</strong> te ofrecemos una experiencia musical completa: playlists creadas
            para ti, comentarios, favoritos y un reproductor diseñado para disfrutar al máximo de tu música.
          </p>
        </div>

        <!-- Services Grid -->
        <div class="services-grid">
          <ion-card class="service-card">
            <ion-card-header>
              <div class="card-icon">
                <ion-icon :icon="headsetOutline" color="warning"></ion-icon>
              </div>
              <ion-card-title>Reproduce canciones</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              Disfruta de un reproductor integrado con control de tiempo, volumen y reproducción continua.
            </ion-card-content>
          </ion-card>

          <ion-card class="service-card">
            <ion-card-header>
              <div class="card-icon">
                <ion-icon :icon="albumsOutline" color="warning"></ion-icon>
              </div>
              <ion-card-title>Playlists personalizadas</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              Explora playlists populares, crea tus favoritas y consulta detalles sin cambiar de página.
            </ion-card-content>
          </ion-card>

          <ion-card class="service-card">
            <ion-card-header>
              <div class="card-icon">
                <ion-icon :icon="heartOutline" color="warning"></ion-icon>
              </div>
              <ion-card-title>Favoritos</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              Guarda tus canciones y playlists preferidas para un acceso rápido.
            </ion-card-content>
          </ion-card>

          <ion-card class="service-card">
            <ion-card-header>
              <div class="card-icon">
                <ion-icon :icon="chatbubblesOutline" color="warning"></ion-icon>
              </div>
              <ion-card-title>Comentarios</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              Comenta en playlists y comparte tu opinión con otros usuarios.
            </ion-card-content>
          </ion-card>

          <ion-card class="service-card">
            <ion-card-header>
              <div class="card-icon">
                <ion-icon :icon="searchOutline" color="warning"></ion-icon>
              </div>
              <ion-card-title>Búsqueda avanzada</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              Encuentra rápidamente canciones, artistas y playlists con nuestro buscador inteligente.
            </ion-card-content>
          </ion-card>

          <ion-card class="service-card">
            <ion-card-header>
              <div class="card-icon">
                <ion-icon :icon="personOutline" color="warning"></ion-icon>
              </div>
              <ion-card-title>Perfil personalizado</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              Gestiona tu cuenta, avatar, y configura tu experiencia musical a tu gusto.
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Features Section -->
        <div class="features-section">
          <h2 class="section-title">¿Por qué elegir Numelody?</h2>
          
          <ion-list class="features-list">
            <ion-item lines="none" class="feature-item">
              <ion-icon :icon="checkmarkCircleOutline" slot="start" color="success"></ion-icon>
              <ion-label>
                <h3>Interfaz intuitiva</h3>
                <p>Diseño moderno y fácil de usar</p>
              </ion-label>
            </ion-item>

            <ion-item lines="none" class="feature-item">
              <ion-icon :icon="checkmarkCircleOutline" slot="start" color="success"></ion-icon>
              <ion-label>
                <h3>Sincronización en tiempo real</h3>
                <p>Tus datos siempre actualizados</p>
              </ion-label>
            </ion-item>

            <ion-item lines="none" class="feature-item">
              <ion-icon :icon="checkmarkCircleOutline" slot="start" color="success"></ion-icon>
              <ion-label>
                <h3>Gratis para siempre</h3>
                <p>Sin cargos ocultos ni suscripciones</p>
              </ion-label>
            </ion-item>

            <ion-item lines="none" class="feature-item">
              <ion-icon :icon="checkmarkCircleOutline" slot="start" color="success"></ion-icon>
              <ion-label>
                <h3>Multiplataforma</h3>
                <p>Accede desde cualquier dispositivo</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </div>

        <!-- CTA Section -->
        <div class="cta-section">
          <h2>¿Listo para comenzar?</h2>
          <p>Únete a Numelody y descubre una nueva forma de disfrutar tu música</p>
          <div class="cta-buttons">
            <ion-button size="large" color="warning" @click="router.push('/home-auth')">
              <ion-icon :icon="playCircleOutline" slot="start"></ion-icon>
              Explorar música
            </ion-button>
            <ion-button size="large" fill="outline" color="warning" @click="router.push('/playlists')">
              <ion-icon :icon="albumsOutline" slot="start"></ion-icon>
              Ver playlists
            </ion-button>
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
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonIcon, IonList, IonItem, IonLabel, IonButton,
} from '@ionic/vue';
import {
  musicalNotesOutline, headsetOutline, albumsOutline, heartOutline,
  chatbubblesOutline, searchOutline, personOutline, checkmarkCircleOutline,
  playCircleOutline, logoTwitter, logoInstagram, logoYoutube, logoGithub,
} from 'ionicons/icons';

const router = useRouter();
</script>

<style scoped>
.dark-header ion-toolbar {
  --background: #1a1a1d;
  --border-color: rgba(241, 196, 15, 0.2);
  --padding-top: 0;
  --padding-bottom: 0;
  --min-height: 60px;
}

.services-content {
  --background: linear-gradient(135deg, #1e1b4b 0%, #701a75 100%);
}

.services-content::part(scroll) {
  background: url('/bg.jpg') no-repeat center center fixed;
  background-size: cover;
  position: relative;
}

.services-content::part(scroll)::before {
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
  max-width: 1200px;
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
  max-width: 700px;
  margin: 0 auto;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  line-height: 1.6;
}

.subtitle strong {
  color: #f1c40f;
}

/* Services Grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.service-card {
  --background: rgba(27, 27, 31, 0.85);
  --color: #f5f5f7;
  margin: 0;
  border: 1px solid rgba(241, 196, 15, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.service-card:hover {
  transform: translateY(-4px);
  border-color: #f1c40f;
  box-shadow: 0 8px 24px rgba(241, 196, 15, 0.3);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.service-card ion-card-title {
  color: #f5f5f7;
  font-size: 1.25rem;
  font-weight: 600;
}

.service-card ion-card-content {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

/* Features Section */
.features-section {
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2rem;
  color: #f1c40f;
  text-align: center;
  margin: 0 0 2rem 0;
  font-weight: 700;
}

.features-list {
  background: transparent;
  max-width: 600px;
  margin: 0 auto;
}

.feature-item {
  --background: rgba(27, 27, 31, 0.6);
  --border-color: rgba(241, 196, 15, 0.1);
  margin-bottom: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(241, 196, 15, 0.2);
}

.feature-item h3 {
  color: #f5f5f7;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.feature-item p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  margin: 0;
}

/* CTA Section */
.cta-section {
  text-align: center;
  padding: 3rem 1.5rem;
  background: rgba(27, 27, 31, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(241, 196, 15, 0.2);
  margin-bottom: 3rem;
}

.cta-section h2 {
  font-size: 2rem;
  color: #f5f5f7;
  margin: 0 0 0.75rem 0;
}

.cta-section p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin: 0 0 2rem 0;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
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

  .services-grid {
    grid-template-columns: 1fr;
  }

  .cta-section h2 {
    font-size: 1.5rem;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .cta-buttons ion-button {
    width: 100%;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>
