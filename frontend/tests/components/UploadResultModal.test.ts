import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import UploadResultModal from '../../src/components/UploadResultModal.vue';

describe('UploadResultModal.vue', () => {
  it('no renderiza el modal cuando visible es false', () => {
    const wrapper = mount(UploadResultModal, { props: { visible: false } });
    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });

  it('muestra el mensaje de exito y no muestra boton de descarga', () => {
    const wrapper = mount(UploadResultModal, {
      props: { visible: true, status: 'success', message: 'Carga exitosa', canDownload: false },
    });
    expect(wrapper.text()).toContain('Carga completada');
    expect(wrapper.text()).toContain('Carga exitosa');
    expect(wrapper.find('button.btn-secondary').exists()).toBe(false);
  });

  it('muestra los errores fila por fila y el boton de descarga cuando falla', () => {
    const wrapper = mount(UploadResultModal, {
      props: {
        visible: true,
        status: 'error',
        message: 'Se encontraron errores',
        canDownload: true,
        details: [{ row: 2, errors: [{ field: 'correo', message: 'invalido' }] }],
      },
    });
    expect(wrapper.text()).toContain('La carga fallo');
    expect(wrapper.text()).toContain('Fila 2');
    expect(wrapper.find('button.btn-secondary').exists()).toBe(true);
  });

  it('emite "download" y "close" al hacer clic en los botones', async () => {
    const wrapper = mount(UploadResultModal, {
      props: { visible: true, status: 'error', message: 'Error', canDownload: true, details: [] },
    });

    await wrapper.find('button.btn-secondary').trigger('click');
    expect(wrapper.emitted('download')).toBeTruthy();

    await wrapper.find('button.btn:not(.btn-secondary)').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});
