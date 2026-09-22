import { INTEGRATION_STACK_KEY } from '../constants/integration-stack-key.constant';
import { IntegrationStackHelper } from '../helpers/integration-stack.helper';
import { IntegrationStack } from '../interfaces/integration-stack.interface';

export default async function globalTeardown (): Promise<void> {
  const stack = (globalThis as Record<string, unknown>)[INTEGRATION_STACK_KEY] as IntegrationStack | undefined;
  if (stack) await IntegrationStackHelper.stop(stack);
}
