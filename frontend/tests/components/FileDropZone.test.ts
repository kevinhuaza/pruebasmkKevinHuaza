import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FileDropZone from '../../src/components/FileDropZone.vue';

function makeFile(name: string, type = 'text/csv'): File {
  return new File(['contenido'], name, { type });
}

describe('FileDropZone.vue', () => {
  it('emite file-selected con el archivo cuando es un .csv valido', async () => {
    const wrapper = mount(FileDropZone);
    const input = wrapper.find('input[type="file"]');
    const file = makeFile('clientes.csv');

    Object.defineProperty(input.element, 'files', { value: [file] });
    await input.trigger('change');

    expect(wrapper.emitted('file-selected')).toBeTruthy();
    expect(wrapper.emitted('file-selected')?.[0][0]).toEqual({ file });
  });

  it('emite un error cuando el archivo no es .csv', async () => {
    const wrapper = mount(FileDropZone);
    const input = wrapper.find('input[type="file"]');
    const file = makeFile('documento.txt', 'text/plain');

    Object.defineProperty(input.element, 'files', { value: [file] });
    await input.trigger('change');

    const emitted = wrapper.emitted('file-selected')?.[0][0] as { error?: string };
    expect(emitted.error).toBe('Solo se permiten archivos .csv');
  });

  it('muestra el texto de "subiendo" cuando uploading es true', () => {
    const wrapper = mount(FileDropZone, { props: { uploading: true } });
    expect(wrapper.text()).toContain('Subiendo archivo...');
  });
});
