export const secretKey: Uint8Array<ArrayBufferLike> = new TextEncoder().encode(
  process.env.JWT_SECRET!
);
