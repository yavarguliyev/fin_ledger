import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, effect, input, output, untracked, viewChild } from '@angular/core';
import type { LeafletMouseEvent, Map as LeafletMap, Marker } from 'leaflet';

import { ADDRESS } from '../../../core/constants/address/address.constant';
import { LatLngDto } from '../../../core/interfaces/address/lat-lng.interface';
import { PinRefDto } from '../../../core/interfaces/address/pin-ref.interface';

@Component({
  selector: 'app-address-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './templates/address-map.component.html'
})
export class AddressMapComponent implements AfterViewInit, OnDestroy {
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private map: LeafletMap | null = null;
  private marker: Marker | null = null;
  private leaflet: typeof import('leaflet') | null = null;

  readonly pin = input<LatLngDto | null>(null);
  readonly label = input('');
  readonly picked = output<LatLngDto>();

  constructor () {
    effect(() => {
      const pin = this.pin();
      untracked(() => this.place({ pin }));
    });
  }

  ngAfterViewInit (): void {
    this.init().catch(() => undefined);
  }

  private async init (): Promise<void> {
    AddressMapComponent.ensureStylesheet();
    this.leaflet = await import('leaflet');
    const [lat, lng] = ADDRESS.DEFAULT_CENTER;
    this.map = this.leaflet.map(this.host().nativeElement).setView([lat, lng], ADDRESS.DEFAULT_ZOOM);
    this.leaflet.tileLayer(ADDRESS.TILE_URL, { maxZoom: ADDRESS.MAX_ZOOM, attribution: ADDRESS.ATTRIBUTION }).addTo(this.map);
    this.map.on(ADDRESS.CLICK_EVENT, (event: LeafletMouseEvent) => this.picked.emit({ latitude: event.latlng.lat, longitude: event.latlng.lng }));
    this.place({ pin: this.pin() });
  }

  ngOnDestroy (): void {
    this.map?.remove();
    this.map = null;
  }

  private static ensureStylesheet (): void {
    if (document.getElementById(ADDRESS.STYLESHEET_ID)) return;
    const link = document.createElement(ADDRESS.LINK_TAG);
    link.id = ADDRESS.STYLESHEET_ID;
    link.rel = ADDRESS.STYLESHEET_REL;
    link.href = ADDRESS.STYLESHEET_HREF;
    document.head.appendChild(link);
  }

  private place ({ pin }: PinRefDto): void {
    if (!this.map || !this.leaflet || !pin) return;

    const position: [number, number] = [pin.latitude, pin.longitude];
    if (!this.marker) {
      const icon = this.leaflet.divIcon({ className: ADDRESS.PIN_CLASS, html: ADDRESS.PIN_HTML, iconSize: [ADDRESS.PIN_SIZE, ADDRESS.PIN_SIZE] });
      this.marker = this.leaflet.marker(position, { icon, draggable: true, keyboard: true }).addTo(this.map);
      this.marker.on(ADDRESS.DRAG_END_EVENT, () => {
        const point = this.marker?.getLatLng();
        if (point) this.picked.emit({ latitude: point.lat, longitude: point.lng });
      });
    }

    this.marker.setLatLng(position);
    this.map.setView(position, Math.max(this.map.getZoom(), ADDRESS.PICKED_ZOOM));
  }
}
