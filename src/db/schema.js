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
  type: text('type').default('individual'), // 'individual' | 'group'
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
  category: text('category').default('etc'), // 'boss' | 'resource' | 'dungeon' | 'teleport' | 'npc' | 'chest' | 'landmark' | 'etc'
  scenario: text('scenario'),
  server: integer('server'),
  visibility: text('visibility').default('public'), // 'public' | 'private'
});

export const trades = pgTable('trades', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(), // 'sell' | 'buy' | 'share'
  title: text('title').notNull(),
  item: text('item').notNull(),
  quantity: integer('quantity').default(1),
  price: text('price'), // null for 나눔
  description: text('description'),
  image: text('image'),
  status: text('status').notNull().default('open'), // 'open' | 'closed'
  author: text('author').notNull(),
  discordId: text('discord_id'),
  scenario: text('scenario'),
  server: text('server'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const guides = pgTable('guides', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(), // 'beginner' | 'weapon' | 'scenario' | 'boss' | 'cradle' | 'tips'
  content: text('content').notNull(), // markdown
  summary: text('summary'),
  image: text('image'),
  tags: jsonb('tags'), // string[]
  author: text('author').notNull(),
  discordId: text('discord_id'),
  views: integer('views').default(0),
  likes: integer('likes').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const mapRoutes = pgTable('map_routes', {
  id: serial('id').primaryKey(),
  label: text('label').notNull(),
  points: jsonb('points').notNull(), // [{x, y}, ...]
  color: text('color').default('#ffaa44'),
  author: text('author'),
  discordId: text('discord_id'),
  note: text('note'),
  scenario: text('scenario'),
  visibility: text('visibility').default('public'), // 'public' | 'private'
  createdAt: timestamp('created_at').defaultNow(),
});

export const pinFavorites = pgTable('pin_favorites', {
  id: serial('id').primaryKey(),
  discordId: text('discord_id').notNull(),
  pinId: integer('pin_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const buildLikes = pgTable('build_likes', {
  id: serial('id').primaryKey(),
  discordId: text('discord_id').notNull(),
  buildId: integer('build_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const onlineSessions = pgTable('online_sessions', {
  id: serial('id').primaryKey(),
  discordId: text('discord_id').notNull(),
  username: text('username').notNull(),
  avatar: text('avatar'),
  lastSeen: timestamp('last_seen').defaultNow().notNull(),
});

export const botChannels = pgTable('bot_channels', {
  id: serial('id').primaryKey(),
  guildId: text('guild_id').notNull(),
  channelId: text('channel_id').notNull(),
  feature: text('feature').notNull().default('blacklist'),
  createdAt: timestamp('created_at').defaultNow(),
});
