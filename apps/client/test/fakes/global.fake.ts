import { GlobalStubDto } from '../interfaces/global-stub.interface';

export const stubGlobal = ({ name, value }: GlobalStubDto): void => {
  (globalThis as unknown as Record<GlobalStubDto['name'], unknown>)[name] = value;
};
