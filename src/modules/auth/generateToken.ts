import { SignJWT, type JWTPayload } from "jose";
import { secretKey } from "#/modules/auth/secretKey";

const JWT_ALG: string = process.env.JWT_ALG! || "HS256";

export async function generateToken(
  userId: string,
  expiresIn = "1h"
): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: JWT_ALG })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(secretKey);
}
