import { kit, adapter } from "@/lib/circle";

export async function POST(req: Request) {
  try {
    const { to, amount, token } = await req.json();

    const result = await kit.send({
      from: { adapter, chain: "Arc_Testnet" },
      to,        // ← يأخذ العنوان من الطلب مباشرة
      amount,
      token,
    });

    return Response.json(result);
  } catch (error: any) {
    console.error("Send error:", error);
    return Response.json(
      { error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}