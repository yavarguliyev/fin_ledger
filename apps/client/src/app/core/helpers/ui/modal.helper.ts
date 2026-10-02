import { ModalEscapeDto } from '../../interfaces/ui/modal-escape.interface';

export class ModalHelper {
  static closesOnEscape ({ isOpen, closable }: ModalEscapeDto): boolean {
    return isOpen && closable;
  }
}
