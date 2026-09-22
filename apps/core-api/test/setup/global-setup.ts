import { INTEGRATION_STACK_KEY } from '../constants/integration-stack-key.constant';
import { IntegrationStackHelper } from '../helpers/integration-stack.helper';

export default async function globalSetup (): Promise<void> {
  (globalThis as Record<string, unknown>)[INTEGRATION_STACK_KEY] = await IntegrationStackHelper.start();
}
