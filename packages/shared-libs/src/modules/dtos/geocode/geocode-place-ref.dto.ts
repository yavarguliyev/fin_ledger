import { z } from 'zod';

import { GeocodePlaceSchema } from './geocode-place.dto';

export const GeocodePlaceRefSchema = z.object({ place: GeocodePlaceSchema });

export type GeocodePlaceRefDto = z.infer<typeof GeocodePlaceRefSchema>;
