import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { furnitureType } = await req.json() as { furnitureType: string };

  if (!furnitureType) {
    return NextResponse.json({ error: "furnitureType required" }, { status: 400 });
  }

  const apiKey = process.env.LINKUP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "LINKUP_API_KEY not configured" }, { status: 500 });
  }

  const label = furnitureType.replace(/_/g, " ");
  const query = `best ${label} furniture to buy online 2024 styles prices options`;

  const url = new URL("https://api.linkup.so/v1/search");
  url.searchParams.set("q", query);
  url.searchParams.set("depth", "standard");
  url.searchParams.set("outputType", "searchResults");
  url.searchParams.set("includeImages", "true");
  url.searchParams.set("maxResults", "14");

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }

    const data = await res.json() as { results?: unknown[] };
    const results = data.results ?? [];

    const texts = results.filter((r) => (r as { type: string }).type === "text");
    const images = results.filter((r) => (r as { type: string }).type === "image");

    return NextResponse.json({ texts, images });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
