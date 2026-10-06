import { HttpAppDto } from '../../dtos/bootstrap/http-app.dto';

export type HttpSetup = (this: void, { app }: HttpAppDto) => Promise<void>;
