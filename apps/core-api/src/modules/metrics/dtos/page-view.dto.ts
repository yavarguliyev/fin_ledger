import { z } from 'zod';

import { PAGE_VIEW } from '../constants/page-view.constant';
import { TextBodyHelper } from '../helpers/text-body.helper';

const count = z.number({ message: 'Count must be a number' }).int().min(0).max(PAGE_VIEW.MAX_CALLS);

export const PageViewSchema = z.preprocess(
  value => TextBodyHelper.parse({ value }),
  z.object({
    route: z.string({ message: 'Route must be a string' }).regex(PAGE_VIEW.ROUTE_PATTERN, { message: 'Route must be a route template' }),
    initialCalls: count,
    laterCalls: count,
    duplicates: count
  })
);

export type PageViewDto = z.infer<typeof PageViewSchema>;
