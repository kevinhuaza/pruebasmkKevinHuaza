import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AlertMessage from '../../src/components/AlertMessage.vue';

describe('AlertMessage.vue', () => {
  it('no renderiza nada cuando no hay mensaje ni detalles', () => {
    const wrapper = mount(AlertMessage);
    expect(wrapper.find('.alert').exists()).toBe(false);
  });

  it('renderiza el mensaje con la clase segun el tipo', () => {
    const wrapper = mount(AlertMessage, {
      props: { type: 'success', message: 'Todo ok' },
    });
    expect(wrapper.find('.alert-success').exists()).toBe(true);
    expect(wrapper.text()).toContain('Todo ok');
  });

  it('formatea detalles de tipo fila/errores de CSV', () => {
    const wrapper = mount(AlertMessage, {
      props: {
        type: 'error',
        message: 'Errores de validacion',
        details: [{ row: 3, errors: [{ field: 'correo', message: 'invalido' }] }],
      },
    });
    expect(wrapper.text()).toContain('Fila 3');
    expect(wrapper.text()).toContain('correo - invalido');
  });
});
