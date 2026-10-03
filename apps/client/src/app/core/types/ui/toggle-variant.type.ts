import { TOGGLE } from '../../constants/ui/toggle.constant';

export type ToggleVariant = (typeof TOGGLE)[keyof typeof TOGGLE];
