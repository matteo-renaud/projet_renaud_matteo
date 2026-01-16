import { Pipe, PipeTransform } from '@angular/core';
import { TypePollution } from '../models/type-pollution';

@Pipe({ name: 'typePollutionLabel' })
export class TypePollutionLabelPipe implements PipeTransform {
  transform(value: keyof typeof TypePollution | string): string {
    return TypePollution[value as keyof typeof TypePollution] || value;
  }
}
