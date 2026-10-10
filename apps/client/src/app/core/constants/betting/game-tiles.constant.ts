export const GAME_TILES = [
  { id: 'wheel', name: 'Wheel', description: 'Pick a colour, spin to win up to 50×', stat: '50×', statClass: 'text-win', glow: 'art-glow-wheel' },
  { id: 'dice', name: 'Dice', description: 'Set your own odds with one slider', stat: '1–99%', statClass: 'text-live', glow: 'art-glow-dice' },
  { id: 'penalty', name: 'Penalty', description: 'Pick a corner, beat the keeper five times', stat: '×2 a goal', statClass: 'text-pending', glow: 'art-glow-penalty' }
] as const;
