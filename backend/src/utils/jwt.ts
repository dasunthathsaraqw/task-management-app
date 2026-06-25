import jwt from "jsonwebtoken";
import { IUser } from "../models/User";

export interface TokenPayload {
  id: string;
  email: string;
  username: string;
  role: string;
}

export const generateJWT = (
  payload: TokenPayload,
  expiresIn: string = "7d",
): string => {
  const secret = process.env.JWT_SECRET || "default_secret_key";
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET || "default_refresh_secret_key";
  return jwt.sign(payload, secret, { expiresIn: "30d" });
};

export const verifyJWT = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || "default_secret_key";
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const secret =
      process.env.JWT_REFRESH_SECRET || "default_refresh_secret_key";
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const createAuthTokens = (user: IUser) => {
  const payload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    role: user.role,
  };

  return {
    accessToken: generateJWT(payload),
    refreshToken: generateRefreshToken(payload),
  };
};
