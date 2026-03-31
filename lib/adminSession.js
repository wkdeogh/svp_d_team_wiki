import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "svp_admin_session";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function signExpiry(expiresAt) {
  return createHmac("sha256", getAdminPassword()).update(String(expiresAt)).digest("hex");
}

export function hasAdminPasswordConfigured() {
  return Boolean(getAdminPassword());
}

export function createAdminSessionValue() {
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE * 1000;
  return `${expiresAt}.${signExpiry(expiresAt)}`;
}

export function verifyAdminPassword(password) {
  return hasAdminPasswordConfigured() && password === getAdminPassword();
}

export function verifyAdminSessionValue(sessionValue) {
  if (!sessionValue || !hasAdminPasswordConfigured()) return false;

  const [expiresAt, signature] = sessionValue.split(".");
  if (!expiresAt || !signature) return false;

  if (Number(expiresAt) < Date.now()) return false;

  const expectedSignature = signExpiry(expiresAt);
  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (signatureBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(signatureBuffer, expectedBuffer);
}

export function getAdminCookieOptions(maxAge = ADMIN_SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
