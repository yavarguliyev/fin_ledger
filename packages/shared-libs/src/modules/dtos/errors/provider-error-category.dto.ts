import { z } from 'zod';

import { ProviderErrorCategory } from '../../enums/common/provider-error-category.enum';

export const ProviderErrorCategoryRefSchema = z.object({
  category: z.enum(ProviderErrorCategory, { message: 'Invalid provider error category' })
});

export type ProviderErrorCategoryRefDto = z.infer<typeof ProviderErrorCategoryRefSchema>;
