import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/HomePage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterPage.vue')
  },
  {
    path: '/home-auth',
    name: 'HomeAuth',
    component: () => import('../views/HomeAuthPage.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfilePage.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminPage.vue')
  },
  {
    path: '/playlists',
    name: 'Playlists',
    component: () => import('../views/PlaylistsPage.vue')
  },
  {
    path: '/playlist/:id',
    name: 'PlaylistDetail',
    component: () => import('../views/PlaylistDetailPage.vue')
  },
  {
    path: '/playlist-form',
    name: 'PlaylistFormCreate',
    component: () => import('../views/PlaylistFormPage.vue')
  },
  {
    path: '/playlist-form/:id',
    name: 'PlaylistFormEdit',
    component: () => import('../views/PlaylistFormPage.vue')
  },
  {
  path: '/favorites',
  name: 'Favorites',
  component: () => import('../views/FavoritesPage.vue')
},
{
    path: '/search',
    name: 'Search',
    component: () => import('../views/SearchPage.vue')
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('../views/ServicesPage.vue')
  },

{
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/ContactPage.vue')
  },
 

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
