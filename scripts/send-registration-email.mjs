#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import mysql from "mysql2/promise";
import { Resend } from "resend";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env");

const args = new Set(process.argv.slice(2));
const getArg = (name, fallback) => {
  const prefix = `${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
};

const table = getArg("--source", "register");
const csvPath = getArg("--csv", "");
const limit = Number.parseInt(getArg("--limit", "0"), 10);
const since = getArg("--since", "");
const dryRun = !args.has("--send");
const allowUnverifiedFrom = args.has("--allow-unverified-from");
const includeFinished = args.has("--include-finished");
const onlyFinished = args.has("--only-finished");

if (args.has("--help")) {
  console.log(`Usage:
  pnpm studios:registration-email -- --source=register --limit=100
  pnpm studios:registration-email -- --source=register --send

Options:
  --source=register|studios_lead   Recipient source. Default: register
  --csv=path/to/register_list.csv   Use a CSV export instead of DATABASE_URL
  --limit=N                        Limit selected rows. Default: no limit
  --since=YYYY-MM-DD               Select rows created on or after date
  --send                           Send email. Omit for dry-run
  --include-finished               Include newsletter/finished register rows too
  --only-finished                  Only send to non-unfinished register rows
  --allow-unverified-from          Bypass Resend domain verification guard
`);
  process.exit(0);
}

const env = readEnv(ENV_PATH);
const databaseUrl = env.DATABASE_URL;
const resendKey = env.RESEND_API_KEY;
const from = env.EMAIL_FROM || "no-reply@galileyo.com";
const registrationUrl =
  env.REGISTRATION_EMAIL_URL ||
  env.NEXT_PUBLIC_APP_URL ||
  "https://galileyo.com/studios";
const subject =
  env.REGISTRATION_EMAIL_SUBJECT ||
  "Finish your Galileyo Studios registration";

if (!csvPath && !databaseUrl) {
  fail("DATABASE_URL is missing.");
}

if (!dryRun && !resendKey) {
  fail("RESEND_API_KEY is required when using --send.");
}

if (!["register", "studios_lead"].includes(table)) {
  fail('--source must be "register" or "studios_lead".');
}

const recipients = csvPath
  ? fetchCsvRecipients(csvPath, { limit, since })
  : await fetchDbRecipients({
      table,
      limit,
      since,
      includeFinished,
      onlyFinished,
    });

const uniqueRecipients = dedupeRecipients(recipients);
const invalidCount = recipients.length - uniqueRecipients.length;

console.log(`source=${csvPath ? `csv:${csvPath}` : table}`);
console.log(`mode=${dryRun ? "dry-run" : "send"}`);
console.log(`rows_seen=${recipients.length}`);
console.log(`unique_recipients=${uniqueRecipients.length}`);
console.log(`duplicates_or_invalid_skipped=${invalidCount}`);
console.log(`from=${from}`);
console.log(`registration_url=${registrationUrl}`);

if (uniqueRecipients.length > 0) {
  console.log("sample_recipients_masked=");
  for (const item of uniqueRecipients.slice(0, 10)) {
    console.log(
      `- ${maskEmail(item.email)}; name=${item.name || "n/a"}; created_at=${
        item.createdAt || "n/a"
      }`,
    );
  }
}

if (dryRun) {
  console.log("dry_run=true; no email sent. Re-run with --send to deliver.");
  process.exit(0);
}

await assertSenderReady(resendKey, from, allowUnverifiedFrom);

const resend = new Resend(resendKey);
let sent = 0;
let failed = 0;

for (const recipient of uniqueRecipients) {
  try {
    const { error } = await resend.emails.send({
      from,
      to: recipient.email,
      subject,
      html: renderRegistrationEmail({
        name: recipient.name,
        registrationUrl,
      }),
    });

    if (error) {
      failed += 1;
      console.log(`failed=${maskEmail(recipient.email)}; error=${error.message}`);
      continue;
    }

    sent += 1;
    console.log(`sent=${maskEmail(recipient.email)}`);
  } catch (error) {
    failed += 1;
    console.log(
      `failed=${maskEmail(recipient.email)}; error=${
        error instanceof Error ? error.message : "unknown"
      }`,
    );
  }
}

console.log(`send_complete sent=${sent} failed=${failed}`);

function readEnv(file) {
  if (!fs.existsSync(file)) {
    return {};
  }

  const result = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    result[key] = rawValue.replace(/^(['"])(.*)\1$/, "$2");
  }

  return result;
}

async function fetchDbRecipients(options) {
  let conn;
  try {
    conn = await mysql.createConnection(databaseUrl);
  } catch (error) {
    fail(
      `Could not connect to DATABASE_URL. ${
        error instanceof Error ? error.code || error.message : "Unknown error"
      }`,
    );
  }

  try {
    return await fetchRecipients(conn, options.table, options);
  } finally {
    await conn.end();
  }
}

async function fetchRecipients(conn, source, options) {
  const params = [];
  let sql;

  if (source === "register") {
    const where = ["email IS NOT NULL", "email <> ''"];

    if (options.since) {
      where.push("created_at >= ?");
      params.push(options.since);
    }

    if (options.onlyFinished) {
      where.push("(is_unfinished_signup = 0 OR is_unfinished_signup IS NULL)");
    } else if (!options.includeFinished) {
      where.push("is_unfinished_signup = 1");
    }

    sql = `
      SELECT
        email,
        TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))) AS name,
        created_at AS createdAt
      FROM register
      WHERE ${where.join(" AND ")}
      ORDER BY created_at DESC
    `;
  } else {
    const where = ["email IS NOT NULL", "email <> ''"];

    if (options.since) {
      where.push("created_at >= ?");
      params.push(options.since);
    }

    sql = `
      SELECT email, name, created_at AS createdAt
      FROM studios_lead
      WHERE ${where.join(" AND ")}
      ORDER BY created_at DESC
    `;
  }

  if (options.limit > 0) {
    sql += " LIMIT ?";
    params.push(options.limit);
  }

  const [rows] = await conn.query(sql, params);
  return rows.map((row) => ({
    email: String(row.email || "").trim(),
    name: String(row.name || "").trim(),
    createdAt: row.createdAt ? String(row.createdAt) : "",
  }));
}

function fetchCsvRecipients(file, options) {
  const fullPath = path.resolve(ROOT, file);
  if (!fs.existsSync(fullPath)) {
    fail(`CSV file not found: ${file}`);
  }

  const lines = fs
    .readFileSync(fullPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const delimiter =
    lines[0].split(";").length > lines[0].split(",").length ? ";" : ",";
  const headers = lines[0].split(delimiter).map((item) => normalizeHeader(item));
  const emailIndex = headers.indexOf("email");
  const firstNameIndex = headers.indexOf("first_name");
  const lastNameIndex = headers.indexOf("last_name");
  const createdAtIndex = headers.indexOf("created_at");

  if (emailIndex === -1) {
    fail("CSV must contain an Email column.");
  }

  const rows = [];
  for (const line of lines.slice(1)) {
    const cols = line.split(delimiter);
    const createdAt = createdAtIndex === -1 ? "" : (cols[createdAtIndex] ?? "");

    if (options.since && createdAt && createdAt < options.since) {
      continue;
    }

    rows.push({
      email: cols[emailIndex] ?? "",
      name: `${cols[firstNameIndex] ?? ""} ${cols[lastNameIndex] ?? ""}`.trim(),
      createdAt,
    });

    if (options.limit > 0 && rows.length >= options.limit) {
      break;
    }
  }

  return rows;
}

function dedupeRecipients(rows) {
  const seen = new Set();
  const recipients = [];

  for (const row of rows) {
    const email = row.email.toLowerCase();
    if (!isEmail(email) || seen.has(email)) {
      continue;
    }

    seen.add(email);
    recipients.push({ ...row, email });
  }

  return recipients;
}

async function assertSenderReady(apiKey, fromEmail, allowUnverified) {
  if (allowUnverified) {
    return;
  }

  const domain = fromEmail.split("@").at(1);
  if (!domain) {
    fail(`EMAIL_FROM is not a valid sender email: ${fromEmail}`);
  }

  const response = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    fail(`Could not verify Resend sender domain. Status: ${response.status}`);
  }

  const body = await response.json();
  const domains = Array.isArray(body.data) ? body.data : [];
  const verified = domains.some(
    (item) => item.name === domain && item.status === "verified",
  );

  if (!verified) {
    fail(
      `Refusing to send: ${domain} is not verified in Resend. Add and verify it, or pass --allow-unverified-from for a deliberate test.`,
    );
  }
}

function renderRegistrationEmail({ name, registrationUrl }) {
  const safeName = escapeHtml(name || "there");
  const safeUrl = escapeHtml(registrationUrl);

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
    <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
      <div style="background:#ffffff;border-radius:8px;padding:36px 32px;">
        <p style="margin:0 0 24px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#6b7280;">Galileyo Studios</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#111827;">Finish your registration</h1>
        <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#374151;">Hi ${safeName},</p>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#374151;">You started a Galileyo registration. Use the button below to continue and get access to Galileyo Studios updates and releases.</p>
        <p style="margin:32px 0;text-align:center;">
          <a href="${safeUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;padding:14px 20px;font-size:15px;font-weight:600;">Continue registration</a>
        </p>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#6b7280;">If the button does not work, paste this link into your browser:</p>
        <p style="margin:0 0 28px;font-size:14px;line-height:1.6;color:#374151;word-break:break-all;">${safeUrl}</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">If you did not request this, you can ignore this email.</p>
      </div>
    </div>
  </body>
</html>`;
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function maskEmail(email) {
  const [local, domain] = email.split("@");
  if (!domain) {
    return "***";
  }

  const start = local.slice(0, 2);
  return `${start}${"*".repeat(Math.max(local.length - 2, 3))}@${domain}`;
}

function normalizeHeader(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replaceAll(" ", "_");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
