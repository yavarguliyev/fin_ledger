import { Component } from '@angular/core';

import { ComponentMetadataDto } from '../interfaces/component-metadata.interface';

export const componentMetadata = ({ component }: ComponentMetadataDto): Component | undefined =>
  (component as unknown as { __annotations__: Component[] }).__annotations__[0];
