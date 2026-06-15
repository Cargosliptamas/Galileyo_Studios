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

## `002_api_key_fk_drift.sql` — OPTIONAL, do later

**Not needed for launch.** It only matters so a full `drizzle-kit db:push` can
reconcile the whole schema again. Inspection-first by design: it runs
`SHOW CREATE TABLE` for `api_key` and `user` and includes a `mysqldump` backup
command; the actual repair DDL is left as clearly-marked TODO placeholders to be
filled in only after the real prod types are reviewed. MySQL DDL auto-commits
and cannot be rolled back, so the backup is the only undo.
