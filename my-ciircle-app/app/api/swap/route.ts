import { kit, adapter } from "@/lib/circle";

export async function POST(req: Request) {
  try {
    const { amountIn, tokenIn, tokenOut } = await req.json();

    const result = await kit.swap({
      from: { adapter, chain: "Arc_Testnet" }, // ← Testnet جديد
      tokenIn,
      tokenOut,
      amountIn,
      config: {
        kitKey: process.env.KIT_KEY!,
      },
    });

    const serialized = JSON.parse(
      JSON.stringify(result, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return Response.json(serialized);
  } catch (error: any) {
    console.error("Swap error:", error);
    return Response.json(
      { error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}