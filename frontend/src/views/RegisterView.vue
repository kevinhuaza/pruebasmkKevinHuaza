<template>
  <div class="page-center">
    <div class="card">
      <div class="card-brand"><app-logo size="lg" /></div>
      <h1>Crear Cuenta</h1>

      <alert-message type="error" :message="errorMessage" :details="errorDetails" />
      <alert-message type="success" :message="successMessage" />

      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label for="nombre">Nombre</label>
          <input id="nombre" v-model.trim="form.nombre" type="text" autocomplete="username" required />
        </div>

        <div class="field">
          <label for="password">Contrasena</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            required
          />
        </div>

        <div class="field">
          <label for="confirmar">Confirmar Contrasena</label>
          <input
            id="confirmar"
            v-model="form.confirmarContrasena"
            type="password"
            autocomplete="new-password"
            required
          />
          <p v-if="passwordMismatch" class="field-error">Las contrasenas no coinciden</p>
        </div>

        <div class="field">
          <label>Rol</label>
          <div class="radio-group">
            <label><input v-model="form.rol" type="radio" value="user" /> User</label>
            <label><input v-model="form.rol" type="radio" value="admin" /> Admin</label>
          </div>
        </div>

        <button class="btn" type="submit" :disabled="loading || passwordMismatch">
          {{ loading ? 'Creando...' : 'Registrarse' }}
        </button>
      </form>

      <p class="helper-text">
        Ya tienes cuenta?
        <router-link class="link" to="/login">Inicia sesion</router-link>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAuthStore } from '../store/auth';
import AlertMessage from '../components/AlertMessage.vue';
import AppLogo from '../components/AppLogo.vue';
import { getErrorMessage, getErrorDetails } from '../utils/errors';
import type { UserRole } from '../types';

export default defineComponent({
  name: 'RegisterView',
  components: { AlertMessage, AppLogo },
  data() {
    return {
      form: {
        nombre: '',
        password: '',
        confirmarContrasena: '',
        rol: 'user' as UserRole,
      },
      loading: false,
      errorMessage: '',
      errorDetails: [] as unknown[],
      successMessage: '',
    };
  },
  computed: {
    passwordMismatch(): boolean {
      return (
        this.form.confirmarContrasena.length > 0 && this.form.password !== this.form.confirmarContrasena
      );
    },
  },
  methods: {
    async handleSubmit(): Promise<void> {
      this.errorMessage = '';
      this.errorDetails = [];
      this.successMessage = '';

      if (this.passwordMismatch) {
        this.errorMessage = 'Las contrasenas no coinciden';
        return;
      }

      this.loading = true;
      try {
        const authStore = useAuthStore();
        await authStore.register(this.form);
        this.successMessage = 'Cuenta creada correctamente. Redirigiendo al login...';
        setTimeout(() => this.$router.push('/login'), 1200);
      } catch (error) {
        this.errorMessage = getErrorMessage(error, 'No se pudo completar el registro');
        this.errorDetails = getErrorDetails(error);
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>
