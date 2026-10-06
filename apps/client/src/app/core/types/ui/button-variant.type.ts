import { BUTTON } from '../../constants/ui/button.constant';

export type ButtonVariant = (typeof BUTTON.VARIANTS)[keyof typeof BUTTON.VARIANTS];
