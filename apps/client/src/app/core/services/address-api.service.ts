import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

import { ADDRESS } from '../constants/address/address.constant';
import { AddressPayload } from '../interfaces/address/address-payload.interface';
import { AddressQueryDto } from '../interfaces/address/address-query.interface';
import { AppConfigService } from './app-config.service';
import { GeocodedAddress } from '../interfaces/address/geocoded-address.interface';
import { HttpErrorHelper } from '../helpers/http/http-error.helper';
import { LatLngDto } from '../interfaces/address/lat-lng.interface';
import { SavedAddress } from '../interfaces/address/saved-address.interface';

@Injectable({ providedIn: 'root' })
export class AddressApiService {
  private readonly config = inject(AppConfigService);
  private readonly http = inject(HttpClient);

  private get url (): string {
    return `${this.config.apiUrl}${ADDRESS.PATH}`;
  }

  get (): Observable<SavedAddress | null> {
    return this.send(this.http.get<SavedAddress | null>(this.url));
  }

  save (payload: AddressPayload): Observable<SavedAddress> {
    return this.send(this.http.put<SavedAddress>(this.url, payload));
  }

  remove (): Observable<unknown> {
    return this.send(this.http.delete(this.url));
  }

  search ({ q }: AddressQueryDto): Observable<GeocodedAddress[]> {
    const query = new URLSearchParams({ [ADDRESS.QUERY_PARAM]: q });
    return this.send(this.http.get<GeocodedAddress[]>(`${this.url}${ADDRESS.SEARCH_PATH}?${query.toString()}`));
  }

  reverse ({ latitude, longitude }: LatLngDto): Observable<GeocodedAddress[]> {
    const query = new URLSearchParams({ [ADDRESS.LATITUDE_PARAM]: String(latitude), [ADDRESS.LONGITUDE_PARAM]: String(longitude) });
    return this.send(this.http.get<GeocodedAddress[]>(`${this.url}${ADDRESS.REVERSE_PATH}?${query.toString()}`));
  }

  private send<T> (request: Observable<T>): Observable<T> {
    return request.pipe(catchError((error: HttpErrorResponse) => HttpErrorHelper.handleHttpError(error)));
  }
}
