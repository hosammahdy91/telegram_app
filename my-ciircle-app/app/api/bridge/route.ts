import { kit, adapter } from "@/lib/circle";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    const result = await kit.bridge({
      from: { adapter, chain: "Arc_Testnet" },
      to: { adapter, chain: "Ethereum_Sepolia" },
      amount,
    });

    // حل مشكلة BigInt
    const serialized = JSON.parse(
      JSON.stringify(result, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return Response.json(serialized);
  } catch (error: any) {
    console.error("Bridge error:", error);
    return Response.json(
      { error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}