import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { GetSystemAccountDto } from '../../dtos/input/get-system-account.dto';
import { LedgerBaseUseCase } from '../base/base-ledger.use-case';

const SYSTEM_ACCOUNT_CODE = 'HOUSE_CASH';

@Injectable()
export class GetSystemAccountUseCase extends LedgerBaseUseCase<GetSystemAccountDto, string> {
  async execute ({ currency }: GetSystemAccountDto): Promise<string> {
    const code = `${SYSTEM_ACCOUNT_CODE}_${currency}`;
    const account = await this.ledgerAccountRepository.findOne({ where: { code } });

    if (!account) throw new InternalServerErrorException(`System ledger account ${code} does not exist`);
    return account.id;
  }
}
