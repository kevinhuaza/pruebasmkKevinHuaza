<template>
  <div class="page-center">
    <div class="card">
      <div class="card-brand"><app-logo size="lg" /></div>
      <h1>Iniciar Sesion</h1>

      <alert-message type="error" :message="errorMessage" />

      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label for="nombre">Usuario</label>
          <input id="nombre" v-model.trim="form.nombre" type="text" autocomplete="username" required />
        </div>

        <div class="field">
          <label for="password">Contrasena</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>

        <button class="btn" type="submit" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>

      <p class="helper-text">
        No tienes cuenta?
        <router-link class="link" to="/register">Registrate</router-link>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAuthStore } from '../store/auth';
import AlertMessage from '../components/AlertMessage.vue';
import AppLogo from '../components/AppLogo.vue';
import { getErrorMessage } from '../utils/errors';

export default defineComponent({
  name: 'LoginView',
  components: { AlertMessage, AppLogo },
  data() {
    return {
      form: { nombre: '', password: '' },
      loading: false,
      errorMessage: '',
    };
  },
  methods: {
    async handleSubmit(): Promise<void> {
      this.errorMessage = '';
      this.loading = true;
      try {
        const authStore = useAuthStore();
        await authStore.login(this.form);
        this.$router.push('/dashboard');
      } catch (error) {
        this.errorMessage = getErrorMessage(error, 'No se pudo iniciar sesion');
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>
