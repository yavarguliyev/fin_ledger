import { ColumnMapping } from '../../interfaces/column-mapping.interface';
import { ColumnDto } from '../../dtos/builder/column.dto';
import { ColumnMappingsDto } from '../../dtos/builder/column-mappings.dto';

export abstract class BaseBuilder {
  protected readonly columnMappings: ColumnMapping;

  constructor ({ columnMappings }: ColumnMappingsDto) {
    this.columnMappings = columnMappings;
  }

  protected mapColumn ({ column }: ColumnDto): string {
    const [table, field] = column.split('.');
    if (!field) return this.columnMappings[column] ?? column;
    return `${table}.${this.columnMappings[field] ?? field}`;
  }
}
