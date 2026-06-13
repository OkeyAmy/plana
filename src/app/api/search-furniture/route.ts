import { NextRequest, NextResponse } from "next/server";

const PRODUCT_SCHEMA = JSON.stringify({
  type: "object",
  properties: {
    products: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name:        { type: "string", description: "Exact product name" },
          brand:       { type: "string", description: "Retailer or brand (e.g. IKEA, Wayfair)" },
          price:       { type: "string", description: "Price with currency symbol, e.g. £299 or $349" },
          url:         { type: "string", description: "Direct product page URL" },
          image_url:   { type: "string", description: "Product image URL" },
          style:       { type: "string", description: "Style descriptor, e.g. Scandinavian, mid-century" },
          material:    { type: "string", description: "Primary material, e.g. oak, velvet, leather" },
          dimensions:  { type: "string", description: "Dimensions if listed, e.g. W200 × D90 × H85 cm" },
          description: { type: "string", description: "One-sentence product description" },
        },
        required: ["name", "brand", "url"],
      },
    },
  },
});

async function handler(req: NextRequest) {
  const { furnitureType } = await req.json() as { furnitureType: string };

  if (!furnitureType) {
    return NextResponse.json({ products: [] }, { status: 400 });
  }

  const apiKey = process.env.LINKUP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ products: [], error: "LINKUP_API_KEY not set" }, { status: 200 });
  }

  const label = furnitureType.replace(/_/g, " ");
  const query = `${label} furniture product to buy with price, material, dimensions`;

  try {
    const res = await fetch("https://api.linkup.so/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        depth: "standard",
        outputType: "structured",
        structuredOutputSchema: PRODUCT_SCHEMA,
        includeSources: true,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[search-furniture] Linkup error", res.status, text.slice(0, 200));
      return NextResponse.json({ products: [], error: text });
    }

    const data = await res.json() as Record<string, unknown>;
    console.log("[search-furniture] keys:", Object.keys(data));
    console.log("[search-furniture] snippet:", JSON.stringify(data).slice(0, 500));

    // Linkup wraps structured output under "data"; falls back to top-level
    const inner = (data.data ?? data.output ?? data) as { products?: unknown[] };
    const products = Array.isArray(inner.products) ? inner.products : [];

    return NextResponse.json({ products });
  } catch (err) {
    console.error("[search-furniture] error:", err);
    return NextResponse.json({ products: [], error: String(err) });
  }
}

export { handler as POST };
