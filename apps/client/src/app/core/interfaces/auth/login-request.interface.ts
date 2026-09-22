import { Email } from '../base/email.interface';
import { Password } from '../base/password.interface';

export interface LoginRequest extends Email, Password {}
