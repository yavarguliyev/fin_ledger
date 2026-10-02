import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CONTENT_SECURITY_SPEC as C } from '../constants/content-security.constant';

interface ProductionSecurity {
  projects: Record<string, { architect: { build: { configurations: { production: { security?: { autoCsp?: boolean } } } } } }>;
}

describe('Content-Security-Policy for the web app', () => {
  it('lets Angular hash every inline script in production builds', () => {
    const config = JSON.parse(readFileSync(join(__dirname, C.ANGULAR_JSON), C.ENCODING)) as ProductionSecurity;

    expect(config.projects[C.PROJECT]?.architect.build.configurations.production.security?.autoCsp).toBe(true);
  });

  it('blocks plugins, base-tag hijacking and form posts to other sites', () => {
    expect(readFileSync(join(__dirname, C.INDEX_HTML), C.ENCODING)).toContain(C.BASE_POLICY);
  });
});
