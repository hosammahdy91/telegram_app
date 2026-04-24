import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";

export const adapter = createViemAdapterFromPrivateKey({
  privateKey: process.env.PRIVATE_KEY as string,
});

export const kit = new AppKit();