export { shorthands } from './utils/shorthands.js';

export const up = pgm => {
  pgm.addColumns('bets', {
    draw_value: { type: 'bigint' },
    draw_threshold: { type: 'bigint' }
  });

  pgm.addConstraint('bets', 'chk_bets_draw_recorded_together', {
    check: '(draw_value IS NULL) = (draw_threshold IS NULL)'
  });

  pgm.addConstraint('bets', 'chk_bets_draw_nonneg', {
    check: 'draw_value IS NULL OR (draw_value >= 0 AND draw_threshold >= 0)'
  });
};

export const down = pgm => {
  pgm.dropConstraint('bets', 'chk_bets_draw_nonneg');
  pgm.dropConstraint('bets', 'chk_bets_draw_recorded_together');
  pgm.dropColumns('bets', ['draw_value', 'draw_threshold']);
};
