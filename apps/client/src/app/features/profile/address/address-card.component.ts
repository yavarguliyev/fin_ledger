import { ChangeDetectionStrategy, Component, OnInit, effect, inject, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ValidatorsHelper } from '../../../core/helpers/forms/validators.helper';
import { ADDRESS } from '../../../core/constants/address/address.constant';
import { ADDRESS_CARD } from './constants/address-card.constant';
import { AddressFormHelper } from './helpers/address-form.helper';
import { AddressMapComponent } from './address-map.component';
import { AddressStore } from '../../../core/services/address.store';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CountrySelectComponent } from '../../../shared/components/country-select/country-select.component';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';
import { GeocodedAddress } from '../../../core/interfaces/address/geocoded-address.interface';

@Component({
  selector: 'app-address-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AddressMapComponent, ButtonComponent, CountrySelectComponent, FieldErrorComponent],
  templateUrl: './templates/address-card.component.html'
})
export class AddressCardComponent implements OnInit {
  private source: string = ADDRESS.SOURCES.MANUAL;

  readonly store = inject(AddressStore);
  readonly labels = ADDRESS_CARD;
  readonly form = new FormGroup({
    line1: new FormControl('', { nonNullable: true, validators: [ValidatorsHelper.createRequiredValidator(), Validators.maxLength(ADDRESS.LINE_MAX)] }),
    line2: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(ADDRESS.LINE_MAX)] }),
    city: new FormControl('', { nonNullable: true, validators: [ValidatorsHelper.createRequiredValidator(), Validators.maxLength(ADDRESS.CITY_MAX)] }),
    region: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(ADDRESS.CITY_MAX)] }),
    postalCode: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(ADDRESS.POSTAL_MAX)] }),
    countryCode: new FormControl('', { nonNullable: true, validators: [ValidatorsHelper.createRequiredValidator()] })
  });

  constructor () {
    effect(() => {
      const located = this.store.located();
      if (!located) return;
      untracked(() => {
        this.source = located.source;
        this.form.patchValue(AddressFormHelper.fromGeocoded({ address: located.address }));
      });
    });

    effect(() => {
      const saved = this.store.saved();
      if (!saved) return;
      untracked(() => {
        this.source = saved.source;
        this.form.patchValue(AddressFormHelper.fromSaved({ address: saved }));
      });
    });
  }

  ngOnInit (): void {
    this.store.load();
  }

  onType (event: Event): void {
    this.source = ADDRESS.SOURCES.MANUAL;
    this.store.query((event.target as HTMLInputElement).value);
  }

  choose (address: GeocodedAddress): void {
    this.store.choose(address);
  }

  submit (): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.store.save(AddressFormHelper.payload({ value: this.form.getRawValue(), source: this.source, pin: this.store.pin() }));
  }
}
