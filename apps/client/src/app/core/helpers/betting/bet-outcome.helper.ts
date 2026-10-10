import { AnnounceBetDto } from '../../interfaces/betting/announce-bet.interface';
import { CurrencyHelper } from '../wallet/currency.helper';

export class BetOutcomeHelper {
  static announce ({ bet, toast }: AnnounceBetDto): void {
    if (bet.status === 'WON') {
      return toast.success(`Bet won! You collected ${CurrencyHelper.formatCurrency({ amountMinor: bet.payoutMinor ?? 0, currency: bet.currency })}.`);
    }

    if (bet.status === 'LOST') return toast.info('Bet placed — no luck this time.');
    return toast.success('Bet placed!');
  }
}
