export const USER_TOKEN_KEY = "avefit_user_token";
export const USER_REMEMBER_ME_KEY = "avefit_user_remember_me";
export const USER_REMEMBERED_EMAIL_KEY = "avefit_user_remember_email";

export function getUserAuthToken() {
  const sessionToken = sessionStorage.getItem(USER_TOKEN_KEY);
  if (sessionToken) return sessionToken;
  if (localStorage.getItem(USER_REMEMBER_ME_KEY) !== "true") return null;

  const rememberedToken = localStorage.getItem(USER_TOKEN_KEY);
  if (rememberedToken) sessionStorage.setItem(USER_TOKEN_KEY, rememberedToken);
  return rememberedToken;
}
