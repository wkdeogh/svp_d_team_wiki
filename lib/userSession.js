import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getAdminSupabase } from "@/lib/supabaseAdmin";

export const USER_SESSION_COOKIE = "svp_user_session";
const USER_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash?.includes(":")) return false;
  const [salt, hash] = storedHash.split(":");
  const derivedHash = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derivedHash, "hex"));
}

export function getUserCookieOptions(maxAge = USER_SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function createUserSession(userId) {
  const supabase = getAdminSupabase();
  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.");
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + USER_SESSION_MAX_AGE * 1000).toISOString();

  const { error } = await supabase.from("user_sessions").insert([
    {
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    },
  ]);

  if (error) throw error;
  return rawToken;
}

export async function deleteUserSession(sessionToken) {
  if (!sessionToken) return;
  const supabase = getAdminSupabase();
  if (!supabase) return;
  await supabase.from("user_sessions").delete().eq("token_hash", hashToken(sessionToken));
}

export async function getUserSession(request) {
  const sessionToken = request.cookies.get(USER_SESSION_COOKIE)?.value;
  if (!sessionToken) return null;

  const supabase = getAdminSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_sessions")
    .select("id, expires_at, user_id")
    .eq("token_hash", hashToken(sessionToken))
    .maybeSingle();

  if (error || !data) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) {
    await supabase.from("user_sessions").delete().eq("id", data.id);
    return null;
  }

  const { data: user, error: userError } = await supabase
    .from("user_accounts")
    .select("id, nickname")
    .eq("id", data.user_id)
    .maybeSingle();

  if (userError || !user) return null;

  return {
    sessionId: data.id,
    user,
    token: sessionToken,
  };
}
