<template>
  <div class="brand" :class="{ 'brand-lg': size === 'lg' }">
    <span class="brand-mark">&gt;_</span>
    <span class="brand-text">CSV<span class="brand-accent">/SMK</span></span>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

export default defineComponent({
  name: 'AppLogo',
  props: {
    size: {
      type: String as PropType<'sm' | 'lg'>,
      default: 'sm',
    },
  },
});
</script>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border-radius: 4px;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}

.brand-text {
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 15px;
  color: var(--color-text);
  white-space: nowrap;
}

.brand-accent {
  color: var(--color-text-muted);
  font-weight: 600;
}

.brand-lg .brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  font-size: 18px;
}

.brand-lg .brand-text {
  font-size: 22px;
}
</style>
