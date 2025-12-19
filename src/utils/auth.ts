import pb from '@/services/pocketbase';

export const authService = {
  async login(email: string, password: string) {
    try {
      const authData = await pb
        .collection('users')
        .authWithPassword(email, password);

      return authData.record;
    } catch {
      throw new Error('Credenciales incorrectas');
    }
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
  }) {
    try {
      const user = await pb.collection('users').create({
        username: data.email.split('@')[0],
        email: data.email,
        password: data.password,
        passwordConfirm: data.password,
        name: data.name,
      });

      return user;
    } catch (error: any) {
      if (error?.data?.data?.email) {
        throw new Error('El email ya está registrado');
      }
      throw new Error('Error al crear la cuenta');
    }
  },

  logout() {
    pb.authStore.clear();
  },

  isLoggedIn() {
    return pb.authStore.isValid;
  },

  getUser() {
    return pb.authStore.model;
  }
};

