import { createRequire } from 'node:module';

import { COLOUR_CONTRAST_TEST as T } from '../constants/colour-contrast.constant';
import { ColourChannelsDto, ColourPairDto, ColourTintDto, ColourTokenDto, TailwindConfigShape } from '../interfaces/colour-contrast.interface';

const config = (): TailwindConfigShape => createRequire(__filename)(T.CONFIG) as TailwindConfigShape;

const lightPrimary = (): number[] => {
  const styles: Record<string, Record<string, string>> = {};
  config().plugins.forEach(plugin => plugin({ addBase: added => Object.assign(styles, added) }));
  return (styles[T.LIGHT_ROOT]?.[T.PRIMARY_VAR] ?? T.EMPTY).split(T.CHANNEL_SPACE).map(Number);
};

const hexChannels = ({ token }: ColourTokenDto): number[] => {
  const node = token.split(T.PATH_SEPARATOR).reduce<unknown>((at, key) => (at as Record<string, unknown>)[key], config().theme.extend.colors);
  const hex = (typeof node === 'string' ? node : ((node as Record<string, string>)[T.DEFAULT] ?? T.EMPTY)).replace(T.HEX_PREFIX, T.EMPTY);
  return [0, 2, 4].map(start => parseInt(hex.slice(start, start + 2), T.HEX_RADIX));
};

const channels = ({ token }: ColourTokenDto): number[] =>
  token === T.WHITE ? [...T.WHITE_RGB] : token === T.PRIMARY ? lightPrimary() : hexChannels({ token });

const tint = ({ colour, alpha }: ColourTintDto): number[] => colour.map((value, index) => value * alpha + (T.WHITE_RGB[index] ?? T.CHANNEL_MAX) * (1 - alpha));

const luminance = ({ channels: rgb }: ColourChannelsDto): number =>
  rgb
    .map(value => value / T.CHANNEL_MAX)
    .map(value => (value <= T.LINEAR_LIMIT ? value / T.LINEAR_DIVISOR : ((value + T.GAMMA_OFFSET) / T.GAMMA_SCALE) ** T.GAMMA))
    .reduce((sum, value, index) => sum + value * (T.LUMA[index] ?? 0), 0);

const ratio = ({ fg, bg }: ColourPairDto): number => {
  const [high = 0, low = 0] = [luminance({ channels: fg }), luminance({ channels: bg })].sort((a, b) => b - a);
  return (high + T.FLARE) / (low + T.FLARE);
};

describe('Theme colour contrast', () => {
  it.each(T.PAIRS)('$LABEL reaches WCAG AA for text', ({ FG, BG, TINTED }) => {
    const bg = channels({ token: BG });
    expect(ratio({ fg: channels({ token: FG }), bg: TINTED ? tint({ colour: bg, alpha: T.TINT }) : bg })).toBeGreaterThanOrEqual(T.MIN_RATIO);
  });
});
