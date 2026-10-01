import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

import { BetRequest } from '../interfaces/betting/bet-request.interface';
import { Bet } from '../types/betting/bet.type';
import { PaginatedResponse } from '../interfaces/http/paginated-response.interface';
import { AppConfigService } from './app-config.service';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';
import { PageRequestDto } from '../dtos/common/page-request.dto';

@Injectable({ providedIn: 'root' })
export class BetService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);

  private get apiUrl (): string {
    return this.config.apiUrl;
  }

  getBets ({ page, limit }: PageRequestDto): Observable<PaginatedResponse<Bet>> {
    return this.http
      .get<PaginatedResponse<Bet>>(`${this.apiUrl}/bets`, { params: { page: page.toString(), limit: limit.toString() } })
      .pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }

  placeBet (req: BetRequest): Observable<Bet> {
    return this.http.post<Bet>(`${this.apiUrl}/bets`, req).pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }
}
