import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-debug-secret")
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url   = process.env.UPSTASH_REDIS_REST_URL   ?? ""
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? ""
  const results: any = {
    url_set:   url ? "YES" : "NO",
    token_set: token ? "YES" : "NO",
    tests: {}
  }

  if (!url || !token) {
    return NextResponse.json({ ...results, error: "Upstash not configured" })
  }

  // Test 1: Simple SET via pipeline
  try {
    const r1 = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([["SET", "axiom:test:simple", "hello123"]]),
      cache: "no-store",
    })
    const d1 = await r1.json()
    results.tests.set_simple = { status: r1.status, response: d1 }
  } catch (e: any) {
    results.tests.set_simple = { error: e.message }
  }

  // Test 2: GET the value we just set
  try {
    const r2 = await fetch(`${url}/get/${encodeURIComponent("axiom:test:simple")}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    const d2 = await r2.json()
    results.tests.get_simple = { status: r2.status, response: d2 }
  } catch (e: any) {
    results.tests.get_simple = { error: e.message }
  }

  // Test 3: SET JSON value via pipeline
  try {
    const jsonVal = JSON.stringify({ id: "test-uuid-123", email: "test@test.com" })
    const r3 = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([["SET", "axiom:test:json", jsonVal]]),
      cache: "no-store",
    })
    const d3 = await r3.json()
    results.tests.set_json = { status: r3.status, response: d3 }
  } catch (e: any) {
    results.tests.set_json = { error: e.message }
  }

  // Test 4: GET the JSON value
  try {
    const r4 = await fetch(`${url}/get/${encodeURIComponent("axiom:test:json")}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    const d4 = await r4.json()
    results.tests.get_json = { status: r4.status, response: d4 }
  } catch (e: any) {
    results.tests.get_json = { error: e.message }
  }

  // Test 5: Check if parsed correctly
  try {
    const raw = results.tests.get_json?.response?.result
    if (raw) {
      const parsed = JSON.parse(raw)
      results.tests.parse_json = { ok: true, parsed }
    } else {
      results.tests.parse_json = { ok: false, raw }
    }
  } catch (e: any) {
    results.tests.parse_json = { error: e.message }
  }

  return NextResponse.json(results, { status: 200 })
}
