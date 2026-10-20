const crypto = require("crypto");

require("dotenv").config();

// Codes are short lived; verification attempts and resends are rate limited separately.
const VERIFICATION_CODE_TTL_MINUTES = Number(process.env.VERIFICATION_CODE_TTL_MINUTES || 10);
const VERIFICATION_TTL_MINUTES = Number(process.env.VERIFICATION_TTL_MINUTES || 60 * 24);
const RESEND_COOLDOWN_MINUTES = Number(process.env.VERIFICATION_RESEND_COOLDOWN_MINUTES || 2);

/**
 * Create a random six-digit code. Only its keyed digest is stored in the DB.
 */
function generateVerificationCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

function hashVerificationToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function hashVerificationCode(code) {
  return crypto.createHmac("sha256", process.env.JWT_SECRET).update(String(code)).digest("hex");
}

function buildVerificationUrl(token) {
  const base = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "");
  return `${base}/user/verify-email?token=${encodeURIComponent(token)}`;
}

function tokenExpiryDate(from = new Date()) {
  return new Date(from.getTime() + VERIFICATION_TTL_MINUTES * 60 * 1000);
}

function verificationCodeExpiryDate(from = new Date()) {
  return new Date(from.getTime() + VERIFICATION_CODE_TTL_MINUTES * 60 * 1000);
}

function isExpired(row, now = new Date()) {
  if (!row || !row.verification_token_expires_at) return true;
  return new Date(row.verification_token_expires_at).getTime() <= now.getTime();
}

/**
 * True when the member asked for a new code too recently to be allowed one.
 * Used to answer "why can't I resend yet" without leaking whether the email
 * is even registered.
 */
function isInResendCooldown(row, now = new Date()) {
  if (!row || !row.verification_sent_at) return false;
  return now.getTime() - new Date(row.verification_sent_at).getTime() < RESEND_COOLDOWN_MINUTES * 60 * 1000;
}

function resendCooldownSeconds(now = new Date()) {
  return RESEND_COOLDOWN_MINUTES * 60;
}

module.exports = {
  VERIFICATION_TTL_MINUTES,
  VERIFICATION_CODE_TTL_MINUTES,
  RESEND_COOLDOWN_MINUTES,
  generateVerificationCode,
  hashVerificationToken,
  hashVerificationCode,
  buildVerificationUrl,
  tokenExpiryDate,
  verificationCodeExpiryDate,
  isExpired,
  isInResendCooldown,
  resendCooldownSeconds,
};
