import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

function safeDbInfo() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return { hasUrl: false };

  try {
    const u = new URL(raw);
    return {
      hasUrl: true,
      protocol: u.protocol,
      host: u.hostname,
      port: u.port || "(default)",
      db: u.pathname,
      hasSslmode: u.searchParams.has("sslmode"),
    };
  } catch {
    return { hasUrl: true, parseError: true };
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET() {
  const info = safeDbInfo();

  try {
    const result = await pool.query("SELECT NOW() as now");
    return NextResponse.json({ ok: true, info, now: result.rows[0].now });
  } catch (err: any) {
    const error = {
      name: err?.name ?? null,
      code: err?.code ?? null,
      message: err?.message ?? null,
      detail: err?.detail ?? null,
      hint: err?.hint ?? null,
    };
    return NextResponse.json({ ok: false, info, error }, { status: 500 });
  }
}
