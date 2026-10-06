import { BUTTON } from '../../constants/ui/button.constant';

export type ButtonType = (typeof BUTTON.TYPES)[keyof typeof BUTTON.TYPES];
