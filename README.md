# 📱 PRÁCTICA EVALUABLE 4  
## Aplicaciones web en dispositivos móviles

## 🎼 Nombre de la aplicación  
Numelody

Asignatura: Aplicaciones Distribuidas en Internet  
Práctica: 4  

## 👩‍💻 Autoras
- Yamina Chibane — yc27@alu.ua.es   
- Rahma Chibane — rc75@alu.ua.es 

## 📌 Descripción General
Numelody es una aplicación web con apariencia de aplicación móvil desarrollada con Ionic + Vue 3 y TypeScript.  
Utiliza PocketBase como backend para autenticación y gestión de datos.  
La aplicación se despliega como Progressive Web App (PWA).

## 🧰 Tecnologías
Ionic, Vue 3, TypeScript, Pinia, Vue Router, PocketBase, Vite, vite-plugin-pwa, Netlify.

## 🚀 Creación del Proyecto Ionic
```bash
npm install -g @ionic/cli
ionic start practica4 blank --type=vue
cd practica4
npm install
ionic serve
```

## 📱 Pantallas
- Login
- Listado de playlists (CRUD)
- Favoritos
- Perfil
- Panel admin

## 🔐 Cuentas de Prueba
Admin PB: yc27@gcloud.ua.es / Amina1995@  
Admin App: yc27@gcloud.ua.es / mina123#  
Usuario: rc75@gcloud.ua.es / rahma123  

## ▶️ Ejecución Local
Backend:
```bash
cd pocketbase
./pocketbase serve
```
Frontend:
```bash
ionic serve
```

## 📲 PWA
```bash
npm install -D vite-plugin-pwa
ionic build
```

## 🌐 Netlify
Se desplegó la carpeta dist en Netlify.  
URL: https://numelody.netlify.app


