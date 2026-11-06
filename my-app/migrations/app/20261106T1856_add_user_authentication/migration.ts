#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/cf75a6bf3c2d15999f690895f69d894b43e15d3a56c998bb09f417120352b01f/contract';
import endContract from '../../snapshots/cf75a6bf3c2d15999f690895f69d894b43e15d3a56c998bb09f417120352b01f/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/d55f76b5f9da3301a10691ec67cc3289d3e6e7dbac282e5fcd7896bd9570df8c/contract';
import startContract from '../../snapshots/d55f76b5f9da3301a10691ec67cc3289d3e6e7dbac282e5fcd7896bd9570df8c/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Session',
        column: col('tokenHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('passwordHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'Session',
        constraint: 'Session_tokenHash_key',
        columns: ['tokenHash'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
