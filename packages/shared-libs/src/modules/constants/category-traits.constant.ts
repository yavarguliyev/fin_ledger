import { ProviderErrorCategory } from '../enums/common/provider-error-category.enum';
import { CategoryTraits } from '../interfaces/category-traits.interface';

export const CATEGORY_TRAITS: Record<ProviderErrorCategory, CategoryTraits> = {
  [ProviderErrorCategory.DECLINED]: { retryable: false, indeterminate: false },
  [ProviderErrorCategory.INVALID_REQUEST]: { retryable: false, indeterminate: false },
  [ProviderErrorCategory.AUTHENTICATION]: { retryable: false, indeterminate: false },
  [ProviderErrorCategory.RATE_LIMIT]: { retryable: true, indeterminate: false },
  [ProviderErrorCategory.CIRCUIT_OPEN]: { retryable: true, indeterminate: false },
  [ProviderErrorCategory.NETWORK]: { retryable: true, indeterminate: true },
  [ProviderErrorCategory.PROVIDER_DOWN]: { retryable: true, indeterminate: true },
  [ProviderErrorCategory.UNKNOWN]: { retryable: false, indeterminate: true }
};
