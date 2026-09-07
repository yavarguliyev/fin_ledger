import { ColumnMapping } from '../../interfaces/database.interface';

export abstract class BaseBuilder {
  constructor (protected readonly columnMappings: ColumnMapping) {}

  protected mapColumn (column: string): string {
    const [table, field] = column.split('.');
    if (!field) return this.columnMappings[column] ?? column;
    return `${table}.${this.columnMappings[field] ?? field}`;
  }
}
