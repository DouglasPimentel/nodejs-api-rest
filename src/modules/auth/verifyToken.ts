import { jwtVerify, type JWTPayload } from "jose";
import { secretKey } from "#/modules/auth/secretKey";
import logger from "#/logger";

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Verify Token: ", error.message);
    }

    return null;
  }
}
