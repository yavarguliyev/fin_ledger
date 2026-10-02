import { ModalHelper } from '../../../src/app/core/helpers/ui/modal.helper';

describe('ModalHelper.closesOnEscape', () => {
  it('closes an open popup that can be closed', () => {
    expect(ModalHelper.closesOnEscape({ isOpen: true, closable: true })).toBe(true);
  });

  it('ignores Esc when the popup is closed or deliberately has no close button', () => {
    expect(ModalHelper.closesOnEscape({ isOpen: false, closable: true })).toBe(false);
    expect(ModalHelper.closesOnEscape({ isOpen: true, closable: false })).toBe(false);
  });
});
