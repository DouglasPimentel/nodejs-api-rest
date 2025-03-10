import argon2 from "argon2";
import logger from "#/logger";

export async function verifyPassword(
  password: string,
  inputPassword: string
): Promise<boolean | null> {
  try {
    const check: boolean = await argon2.verify(password, inputPassword);

    return check;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error("Error verify password: ", error.message);
    }

    return null;
  }
}
