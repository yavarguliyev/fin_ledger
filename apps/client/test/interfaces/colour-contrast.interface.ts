export interface ColourTokenDto {
  token: string;
}

export interface ColourPairDto {
  fg: number[];
  bg: number[];
}

export interface ColourTintDto {
  colour: number[];
  alpha: number;
}

export interface ColourChannelsDto {
  channels: number[];
}

export interface TailwindBaseDto {
  addBase: (styles: Record<string, Record<string, string>>) => void;
}

export interface TailwindConfigShape {
  theme: { extend: { colors: Record<string, unknown> } };
  plugins: ((api: TailwindBaseDto) => void)[];
}
