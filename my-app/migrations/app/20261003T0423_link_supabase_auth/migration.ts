#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/b1292893185c47769cf9f78657f38f2f9c0bcc7084f99c084a0ab31704caf1e7/contract';
import startContract from '../../snapshots/b1292893185c47769cf9f78657f38f2f9c0bcc7084f99c084a0ab31704caf1e7/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/d55f76b5f9da3301a10691ec67cc3289d3e6e7dbac282e5fcd7896bd9570df8c/contract';
import endContract from '../../snapshots/d55f76b5f9da3301a10691ec67cc3289d3e6e7dbac282e5fcd7896bd9570df8c/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropColumn({ schema: 'public', table: 'User', column: 'passwordHash' }),
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('supabaseAuthId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_supabaseAuthId_key',
        columns: ['supabaseAuthId'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
