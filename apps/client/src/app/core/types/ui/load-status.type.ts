import { LOAD_STATUS } from '../../constants/ui/load-status.constant';

export type LoadStatus = (typeof LOAD_STATUS)[keyof typeof LOAD_STATUS];
