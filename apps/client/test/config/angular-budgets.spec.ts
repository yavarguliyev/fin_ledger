import { readFileSync } from 'node:fs';

import { ANGULAR_BUDGETS_TEST } from '../constants/angular-budgets.constant';

interface Budget {
  type: string;
  maximumWarning: string;
  maximumError: string;
}

interface AngularWorkspace {
  projects: Record<string, { architect: { build: { configurations: Record<string, { budgets?: Budget[] }> } } }>;
}

describe('Angular production budgets', () => {
  const workspace = JSON.parse(readFileSync(ANGULAR_BUDGETS_TEST.ANGULAR_JSON, ANGULAR_BUDGETS_TEST.ENCODING)) as AngularWorkspace;
  const [project] = Object.values(workspace.projects);
  const budgets = project?.architect.build.configurations[ANGULAR_BUDGETS_TEST.PRODUCTION]?.budgets ?? [];

  it('fails the production build when the initial bundle, any script or any component style grows too large', () => {
    expect(budgets).toEqual(ANGULAR_BUDGETS_TEST.EXPECTED);
  });
});
