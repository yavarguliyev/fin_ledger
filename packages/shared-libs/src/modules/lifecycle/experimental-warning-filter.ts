import { EXPERIMENTAL_WARNINGS } from '../constants/lifecycle/experimental-warnings.constant';
import { NamedWarning } from '../interfaces/named-warning.interface';
import { WarningRef } from '../interfaces/warning-ref.interface';
import { BaseHelper } from '../helpers/base.helper';

export class ExperimentalWarningFilter {
  private static installed = false;

  static install (): void {
    if (ExperimentalWarningFilter.installed) return;
    ExperimentalWarningFilter.installed = true;

    const emit = process.emitWarning.bind(process) as (...args: unknown[]) => void;
    process.emitWarning = (warning: string | Error, ...rest: unknown[]): void => {
      if (ExperimentalWarningFilter.isSilenced({ warning, name: ExperimentalWarningFilter.nameOf({ warning, rest }) })) return;
      emit(warning, ...rest);
    };
  }

  private static isSilenced ({ warning, name }: NamedWarning): boolean {
    if (name === EXPERIMENTAL_WARNINGS.TIMEOUT_NEGATIVE_NAME) return ExperimentalWarningFilter.raisedByKafka();
    if (name !== EXPERIMENTAL_WARNINGS.NAME) return false;
    return EXPERIMENTAL_WARNINGS.SILENCED.some(fragment => BaseHelper.errorResponse({ error: warning }).message.includes(fragment));
  }

  private static raisedByKafka (): boolean {
    return (new Error().stack ?? '').includes(EXPERIMENTAL_WARNINGS.TIMEOUT_NEGATIVE_ORIGIN);
  }

  private static nameOf ({ warning, rest }: WarningRef): string {
    if (warning instanceof Error) return warning.name;
    const [type] = rest;
    if (typeof type === 'string') return type;
    return type && typeof type === 'object' && 'type' in type && typeof type.type === 'string' ? type.type : '';
  }
}
