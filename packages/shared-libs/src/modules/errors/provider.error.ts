import type { ProviderErrorInputDto } from '../dtos/errors/provider-error.dto';
import type { ProviderErrorCategoryRefDto } from '../dtos/errors/provider-error-category.dto';
import { ProviderErrorCategory } from '../enums/common/provider-error-category.enum';
import { CATEGORY_TRAITS } from '../constants/category-traits.constant';

export class ProviderError extends Error {
  readonly category: ProviderErrorCategory;
  readonly code: string;
  readonly retryable: boolean;
  readonly indeterminate: boolean;

  constructor ({ message, category, code }: ProviderErrorInputDto) {
    super(message);

    const traits = CATEGORY_TRAITS[category];

    this.name = 'ProviderError';
    this.category = category;
    this.code = code ?? category;
    this.retryable = traits.retryable;
    this.indeterminate = traits.indeterminate;
  }

  static isIndeterminate ({ category }: ProviderErrorCategoryRefDto): boolean {
    return CATEGORY_TRAITS[category].indeterminate;
  }
}
