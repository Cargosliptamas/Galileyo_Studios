-- 003_studios_tables_create.sql — REQUIRED for launch (Gate 4)
--
-- Creates the six Studios tables in production with targeted CREATE TABLE
-- statements, so launch does NOT depend on a full `drizzle-kit db:push`.
--
-- Why this script exists:
--   A full db:push reconciles the whole schema and currently ABORTS on the
--   pre-existing api_key -> user foreign-key drift (see 002_api_key_fk_drift.sql).
--   None of the six Studios tables below have any foreign keys (they store
--   email / user_id as plain VARCHARs, not FK references), so creating them
--   directly touches nothing related to that drift. This is the safe, minimal
--   path to stand up Studios in prod.
--
-- Safety:
--   - Every statement is CREATE TABLE IF NOT EXISTS, so re-running is a no-op
--     for tables that already exist (idempotent, non-destructive).
--   - No DROP, no ALTER on existing tables, no foreign keys, no data writes.
--   - Charset/collation are intentionally omitted so each table inherits the
--     database default, exactly as db:push would. This keeps cross-table email
--     comparisons collation-compatible with the existing schema. Do NOT pin a
--     different charset here.
--
-- Column shapes mirror packages/db/src/schema.ts exactly (names, lengths,
-- nullability, defaults). Verified against the Drizzle definitions.
--
-- Relationship to 001_studios_lead_name.sql:
--   studios_lead below is created WITH the `name` column already present, so if
--   you run THIS script to create the table fresh, you do NOT also need to run
--   001 (its ALTER would fail with "duplicate column name 'name'"). Run 001 ONLY
--   in the alternate case where studios_lead already exists without `name`.
--
-- Run against PRODUCTION only after confirming the target database
-- (`Galileyo_Prod`). Review each statement before executing.

-- 1. studios_lead (includes `name`; see note above re: 001)
CREATE TABLE IF NOT EXISTS `studios_lead` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(320) NOT NULL,
  `name` VARCHAR(200) NULL,
  `source` VARCHAR(40) NOT NULL,
  `episode_slug` VARCHAR(80) NULL,
  `promo_code` VARCHAR(40) NULL,
  `utm_source` VARCHAR(120) NULL,
  `utm_medium` VARCHAR(120) NULL,
  `utm_campaign` VARCHAR(120) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_studios_lead_email` (`email`),
  KEY `IDX_studios_lead_created_at` (`created_at`)
);

-- 2. studios_sponsor_inquiry
CREATE TABLE IF NOT EXISTS `studios_sponsor_inquiry` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `interest` VARCHAR(200) NOT NULL,
  `company` VARCHAR(200) NULL,
  `contact_name` VARCHAR(200) NOT NULL,
  `email` VARCHAR(320) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `budget_range` VARCHAR(50) NULL,
  `notes` TEXT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'new',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_studios_sponsor_inquiry_created_at` (`created_at`)
);

-- 3. studios_episode
CREATE TABLE IF NOT EXISTS `studios_episode` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(80) NOT NULL,
  `number` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `release_label` VARCHAR(80) NULL,
  `release_date` VARCHAR(20) NULL,
  `runtime` INT NULL,
  `synopsis` TEXT NULL,
  `hero_still` VARCHAR(255) NULL,
  `stream_uid` VARCHAR(64) NULL,
  `poster_image_id` VARCHAR(64) NULL,
  `hero_image_id` VARCHAR(64) NULL,
  `price_cents` INT NOT NULL DEFAULT 700,
  `is_free` TINYINT NOT NULL DEFAULT 0,
  `published` TINYINT NOT NULL DEFAULT 0,
  `ads_on_paid` TINYINT NOT NULL DEFAULT 0,
  `ad_cue_points` JSON NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_studios_episode_slug` (`slug`),
  KEY `IDX_studios_episode_sort_order` (`sort_order`)
);

-- 4. studios_setting (`key` is a reserved word, must stay backticked)
CREATE TABLE IF NOT EXISTS `studios_setting` (
  `key` VARCHAR(80) NOT NULL,
  `value` TEXT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
);

-- 5. studios_entitlement
CREATE TABLE IF NOT EXISTS `studios_entitlement` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(320) NOT NULL,
  `user_id` VARCHAR(64) NULL,
  `kind` VARCHAR(30) NOT NULL,
  `episode_slug` VARCHAR(80) NULL,
  `stripe_session_id` VARCHAR(120) NOT NULL,
  `amount_cents` INT NULL,
  `promo_code` VARCHAR(40) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_studios_entitlement_session` (`stripe_session_id`),
  KEY `IDX_studios_entitlement_email` (`email`)
);

-- 6. studios_producer_credit
CREATE TABLE IF NOT EXISTS `studios_producer_credit` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(320) NOT NULL,
  `display_name` VARCHAR(200) NULL,
  `tier` VARCHAR(30) NOT NULL,
  `amount_cents` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_studios_producer_credit_email` (`email`)
);

-- Verification (run after the creates; all six names must appear):
--   SHOW TABLES LIKE 'studios\_%';
-- And confirm the lead table has the name column:
--   SHOW COLUMNS FROM `studios_lead` LIKE 'name';
