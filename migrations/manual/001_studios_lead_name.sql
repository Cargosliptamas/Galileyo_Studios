-- Non-destructive and reversible: undo with `ALTER TABLE studios_lead DROP COLUMN name;`.
-- Targeted ALTER only (no db:push) so it sidesteps the api_key -> user FK drift
-- that aborts a full schema reconcile. Matches dev exactly: nullable, AFTER email.

ALTER TABLE studios_lead ADD COLUMN name VARCHAR(200) NULL AFTER email;

SHOW COLUMNS FROM studios_lead LIKE 'name';
