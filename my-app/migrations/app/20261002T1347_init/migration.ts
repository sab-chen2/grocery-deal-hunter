#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/b1292893185c47769cf9f78657f38f2f9c0bcc7084f99c084a0ab31704caf1e7/contract';
import endContract from '../../snapshots/b1292893185c47769cf9f78657f38f2f9c0bcc7084f99c084a0ab31704caf1e7/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Deal',
        columns: [
          col('couponCode', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('couponRequired', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('dealId', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('dealType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('discountAmount', 'numeric', { codecRef: { codecId: 'pg/numeric@1' } }),
          col('discountPercent', 'numeric', { codecRef: { codecId: 'pg/numeric@1' } }),
          col('productId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('source', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('storeLocationId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('validFrom', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('validUntil', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
        ],
        constraints: [primaryKey(['dealId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'FavoriteList',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('listId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['userId', 'listId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'FollowedItem',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('productId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['userId', 'productId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'FollowedStore',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('storeId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['userId', 'storeId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'GroceryList',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('listId', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['listId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'GroceryListItem',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('listId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('listItemId', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('quantity', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('searchTerm', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['listItemId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Price',
        columns: [
          col('observedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('priceId', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('productId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('regularPrice', 'numeric', { codecRef: { codecId: 'pg/numeric@1' } }),
          col('salePrice', 'numeric', { codecRef: { codecId: 'pg/numeric@1' } }),
          col('source', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('storeLocationId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('unitPrice', 'numeric', { codecRef: { codecId: 'pg/numeric@1' } }),
          col('validFrom', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('validUntil', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
        ],
        constraints: [primaryKey(['priceId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Product',
        columns: [
          col('brand', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('category', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('productId', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('size', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('unit', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('upc', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['productId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'ProductMatch',
        columns: [
          col('listItemId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('matchConfidence', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('productId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['listItemId', 'productId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Session',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('expiresAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('locationId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('sessionId', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('userId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['sessionId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Store',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('storeId', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('websiteUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['storeId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'StoreLocation',
        columns: [
          col('addressLine1', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('addressLine2', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('city', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('country', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('latitude', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('longitude', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('state', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('storeId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('storeLocationId', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('zipCode', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['storeLocationId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('passwordHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['userId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'UserLocation',
        columns: [
          col('addressLine1', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('addressLine2', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('city', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('country', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('isDefault', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('latitude', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('locationId', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('longitude', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('state', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('zipCode', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['locationId'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Deal',
        index: 'Deal_productId_idx_5858600a',
        columns: ['productId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Deal',
        index: 'Deal_storeLocationId_idx_3c592ed1',
        columns: ['storeLocationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'FavoriteList',
        index: 'FavoriteList_listId_idx_0033d367',
        columns: ['listId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'FavoriteList',
        index: 'FavoriteList_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'FollowedItem',
        index: 'FollowedItem_productId_idx_5858600a',
        columns: ['productId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'FollowedItem',
        index: 'FollowedItem_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'FollowedStore',
        index: 'FollowedStore_storeId_idx_c545737d',
        columns: ['storeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'FollowedStore',
        index: 'FollowedStore_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'GroceryList',
        index: 'GroceryList_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'GroceryListItem',
        index: 'GroceryListItem_listId_idx_0033d367',
        columns: ['listId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Price',
        index: 'Price_productId_idx_5858600a',
        columns: ['productId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Price',
        index: 'Price_storeLocationId_idx_3c592ed1',
        columns: ['storeLocationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProductMatch',
        index: 'ProductMatch_listItemId_idx_b70b064a',
        columns: ['listItemId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProductMatch',
        index: 'ProductMatch_productId_idx_5858600a',
        columns: ['productId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Session',
        index: 'Session_locationId_idx_7aae3038',
        columns: ['locationId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Session',
        index: 'Session_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'StoreLocation',
        index: 'StoreLocation_storeId_idx_c545737d',
        columns: ['storeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'UserLocation',
        index: 'UserLocation_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Deal',
        foreignKey: {
          name: 'Deal_productId_fkey',
          columns: ['productId'],
          references: { schema: 'public', table: 'Product', columns: ['productId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Deal',
        foreignKey: {
          name: 'Deal_storeLocationId_fkey',
          columns: ['storeLocationId'],
          references: { schema: 'public', table: 'StoreLocation', columns: ['storeLocationId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'FavoriteList',
        foreignKey: {
          name: 'FavoriteList_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['userId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'FavoriteList',
        foreignKey: {
          name: 'FavoriteList_listId_fkey',
          columns: ['listId'],
          references: { schema: 'public', table: 'GroceryList', columns: ['listId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'FollowedItem',
        foreignKey: {
          name: 'FollowedItem_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['userId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'FollowedItem',
        foreignKey: {
          name: 'FollowedItem_productId_fkey',
          columns: ['productId'],
          references: { schema: 'public', table: 'Product', columns: ['productId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'FollowedStore',
        foreignKey: {
          name: 'FollowedStore_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['userId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'FollowedStore',
        foreignKey: {
          name: 'FollowedStore_storeId_fkey',
          columns: ['storeId'],
          references: { schema: 'public', table: 'Store', columns: ['storeId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'GroceryList',
        foreignKey: {
          name: 'GroceryList_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['userId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'GroceryListItem',
        foreignKey: {
          name: 'GroceryListItem_listId_fkey',
          columns: ['listId'],
          references: { schema: 'public', table: 'GroceryList', columns: ['listId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Price',
        foreignKey: {
          name: 'Price_productId_fkey',
          columns: ['productId'],
          references: { schema: 'public', table: 'Product', columns: ['productId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Price',
        foreignKey: {
          name: 'Price_storeLocationId_fkey',
          columns: ['storeLocationId'],
          references: { schema: 'public', table: 'StoreLocation', columns: ['storeLocationId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ProductMatch',
        foreignKey: {
          name: 'ProductMatch_listItemId_fkey',
          columns: ['listItemId'],
          references: { schema: 'public', table: 'GroceryListItem', columns: ['listItemId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ProductMatch',
        foreignKey: {
          name: 'ProductMatch_productId_fkey',
          columns: ['productId'],
          references: { schema: 'public', table: 'Product', columns: ['productId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Session',
        foreignKey: {
          name: 'Session_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['userId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Session',
        foreignKey: {
          name: 'Session_locationId_fkey',
          columns: ['locationId'],
          references: { schema: 'public', table: 'UserLocation', columns: ['locationId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'StoreLocation',
        foreignKey: {
          name: 'StoreLocation_storeId_fkey',
          columns: ['storeId'],
          references: { schema: 'public', table: 'Store', columns: ['storeId'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'UserLocation',
        foreignKey: {
          name: 'UserLocation_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['userId'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
