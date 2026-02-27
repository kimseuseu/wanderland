CREATE TABLE "blacklist" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"uuid" text,
	"alts" text,
	"clan" text,
	"incident" text,
	"severity" text DEFAULT 'medium',
	"date" text,
	"reporter" text
);
--> statement-breakpoint
CREATE TABLE "builds" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"author" text NOT NULL,
	"image" text,
	"main_weapon" text NOT NULL,
	"sub_weapon" text,
	"grade" text,
	"tuning" jsonb,
	"modules" jsonb,
	"infections" jsonb,
	"doping" jsonb,
	"armor_set" text,
	"armor_options" jsonb,
	"suffixes" jsonb,
	"leather" jsonb,
	"notes" text,
	"category" text,
	"weapon_type" text,
	"tags" jsonb,
	"likes" integer DEFAULT 0,
	"date" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "map_pins" (
	"id" serial PRIMARY KEY NOT NULL,
	"x" real NOT NULL,
	"y" real NOT NULL,
	"label" text NOT NULL,
	"author" text,
	"note" text,
	"color" text DEFAULT '#44ff88',
	"scenario" text,
	"server" integer
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"scenario" text,
	"join_date" text,
	"note" text
);
