import { pgTable, serial, text, integer, timestamp, jsonb, real } from 'drizzle-orm/pg-core';

export const builds = pgTable('builds', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  author: text('author').notNull(),
  discordId: text('discord_id'),
  image: text('image'),
  mainWeapon: text('main_weapon').notNull(),
  subWeapon: text('sub_weapon'),
  grade: text('grade'),
  tuning: jsonb('tuning'),
  modules: jsonb('modules'),
  infections: jsonb('infections'),
  doping: jsonb('doping'),
  armorSet: text('armor_set'),
  armorOptions: jsonb('armor_options'),
  suffixes: jsonb('suffixes'),
  leather: jsonb('leather'),
  notes: text('notes'),
  category: text('category'),
  weaponType: text('weapon_type'),
  tags: jsonb('tags'),
  likes: integer('likes').default(0),
  date: text('date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const members = pgTable('members', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  scenario: text('scenario'),
  joinDate: text('join_date'),
  note: text('note'),
});

export const blacklist = pgTable('blacklist', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  uuid: text('uuid'),
  alts: text('alts'),
  clan: text('clan'),
  incident: text('incident'),
  content: text('content'),
  date: text('date'),
  reporter: text('reporter'),
  discordId: text('discord_id'),
  image: text('image'),
});

export const mapPins = pgTable('map_pins', {
  id: serial('id').primaryKey(),
  x: real('x').notNull(),
  y: real('y').notNull(),
  label: text('label').notNull(),
  author: text('author'),
  discordId: text('discord_id'),
  note: text('note'),
  color: text('color').default('#44ff88'),
  scenario: text('scenario'),
  server: integer('server'),
});

export const botChannels = pgTable('bot_channels', {
  id: serial('id').primaryKey(),
  guildId: text('guild_id').notNull(),
  channelId: text('channel_id').notNull(),
  feature: text('feature').notNull().default('blacklist'),
  createdAt: timestamp('created_at').defaultNow(),
});
