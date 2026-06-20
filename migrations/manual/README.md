# Manual migrations

Hand-run SQL for schema changes that the drizzle `db:push` workflow cannot
apply right now. A full `db:push` aborts because of a pre-existing
`api_key -> user` foreign-key drift, so these targeted scripts work around it.

Run each script **on its own**, reviewing the output before moving on. Confirm
the target database is correct (`Galileyo_Prod` for production) before running.

## `001_studios_lead_name.sql` — REQUIRED for launch

Adds the nullable `name` column to `studios_lead`, matching dev exactly
(nullable, positioned `AFTER email`). The live email gate writes `name`; on a
database without this column the insert-with-name path fails.

Note: the resilient-insert fix (commit `bd8129b`) already retries an email-only
insert, so **a lead is never lost even if this script has not run yet** — but
run it so that names are actually captured. Non-destructive and reversible:
`ALTER TABLE studios_lead DROP COLUMN name;`.

## `003_studios_tables_create.sql` (REQUIRED for launch, the table-creation step)

Creates the six Studios tables (`studios_lead`, `studios_sponsor_inquiry`,
`studios_episode`, `studios_setting`, `studios_entitlement`,
`studios_producer_credit`) with targeted `CREATE TABLE IF NOT EXISTS`
statements, so launch does not depend on a full `db:push`. None of the six have
foreign keys, so they sidestep the `api_key -> user` drift entirely.
Idempotent and non-destructive (no DROP, ALTER, or data writes).

Important: this script creates `studios_lead` with the `name` column already
included, so if you run 003 you do NOT also run 001 (its ALTER would fail with a
duplicate-column error). Run 001 only in the alternate case where `studios_lead`
already exists without `name`. Verify with `SHOW TABLES LIKE 'studios\_%';`.

## `002_api_key_fk_drift.sql` — OPTIONAL, do later

**Not needed for launch.** It only matters so a full `drizzle-kit db:push` can
reconcile the whole schema again. Inspection-first by design: it runs
`SHOW CREATE TABLE` for `api_key` and `user` and includes a `mysqldump` backup
command; the actual repair DDL is left as clearly-marked TODO placeholders to be
filled in only after the real prod types are reviewed. MySQL DDL auto-commits
and cannot be rolled back, so the backup is the only undo.
