import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { FEATURE_ON_PUSH_TEST as T } from '../constants/feature-on-push.constant';

const featuresDir = join(__dirname, T.FEATURES_DIR);
const components = readdirSync(featuresDir, { recursive: true, encoding: T.ENCODING }).filter(file => file.endsWith(T.COMPONENT_SUFFIX));

describe('Feature pages render only when their inputs or signals change', () => {
  it('finds every feature component', () => {
    expect(components.length).toBeGreaterThanOrEqual(T.MIN_COMPONENTS);
  });

  it.each(components)('%s uses OnPush change detection', file => {
    expect(readFileSync(join(featuresDir, file), T.ENCODING)).toContain(T.ON_PUSH);
  });
});
