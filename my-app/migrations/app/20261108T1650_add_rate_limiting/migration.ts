#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/4fe9b8548d073314a03ce7fbd18e2a9fd788764e5b5c0f2baf864764b6d1bfd6/contract';
import endContract from '../../snapshots/4fe9b8548d073314a03ce7fbd18e2a9fd788764e5b5c0f2baf864764b6d1bfd6/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/cf75a6bf3c2d15999f690895f69d894b43e15d3a56c998bb09f417120352b01f/contract';
import startContract from '../../snapshots/cf75a6bf3c2d15999f690895f69d894b43e15d3a56c998bb09f417120352b01f/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'RateLimit',
        columns: [
          col('attempts', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('expiresAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('keyHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('policy', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('rateLimitId', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('windowStart', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['rateLimitId'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'RateLimit',
        constraint: 'RateLimit_keyHash_policy_key',
        columns: ['keyHash', 'policy'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
