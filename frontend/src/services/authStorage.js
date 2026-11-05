export const AUTH_STORAGE_KEYS = {
  user: "voxliva_user",
  token: "voxliva_token",
  userName: "voxliva_user_name",
};

const LEGACY_KEYS = {
  user: "voxlivaUser",
  token: "voxlivaToken",
  userName: "voxlivaUserName",
};

export function migrateLegacyAuthStorage() {
  const legacyUser = localStorage.getItem(LEGACY_KEYS.user);
  const legacyToken = localStorage.getItem(LEGACY_KEYS.token);
  const legacyUserName = localStorage.getItem(LEGACY_KEYS.userName);

  if (!localStorage.getItem(AUTH_STORAGE_KEYS.token) && legacyToken) {
    localStorage.setItem(AUTH_STORAGE_KEYS.token, legacyToken);
  }

  if (!localStorage.getItem(AUTH_STORAGE_KEYS.user) && legacyUser) {
    localStorage.setItem(AUTH_STORAGE_KEYS.user, legacyUser);
  }

  if (!localStorage.getItem(AUTH_STORAGE_KEYS.userName) && legacyUserName) {
    localStorage.setItem(AUTH_STORAGE_KEYS.userName, legacyUserName);
  }

  Object.values(LEGACY_KEYS).forEach((key) => localStorage.removeItem(key));
}

export function getStoredAuth() {
  migrateLegacyAuthStorage();

  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token) || "";
  const savedUser = localStorage.getItem(AUTH_STORAGE_KEYS.user);

  if (!token || !savedUser) {
    clearStoredAuth();
    return { user: null, token: "" };
  }

  try {
    const user = JSON.parse(savedUser);
    return { user, token };
  } catch {
    clearStoredAuth();
    return { user: null, token: "" };
  }
}

export function storeAuth(user, token) {
  if (!user || !token) return false;

  localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
  localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
  localStorage.setItem(AUTH_STORAGE_KEYS.userName, user.name || "");
  return true;
}

export function clearStoredAuth() {
  Object.values(AUTH_STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  Object.values(LEGACY_KEYS).forEach((key) => localStorage.removeItem(key));
}
