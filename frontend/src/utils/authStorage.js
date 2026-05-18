const ACCESS_TOKEN_KEY = "accessToken";
const AUTH_USER_KEY = "authUser";
const AUTH_CHANGED_EVENT = "auth-changed";

function removeBearerPrefix(token) {
  if (!token || typeof token !== "string") return "";

  if (token.startsWith("Bearer ")) {
    return token.slice(7);
  }

  return token;
}

function getTokenFromResponse(response) {
  return (
    response?.accessToken ||
    response?.token ||
    response?.jwt ||
    response?.data?.accessToken ||
    response?.data?.token ||
    response?.data?.jwt ||
    ""
  );
}

function getUserFromResponse(response, fallbackUser = {}) {
  return (
    response?.user ||
    response?.data?.user ||
    response?.account ||
    response?.data?.account ||
    fallbackUser ||
    {}
  );
}

export function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function saveAuthData(response, fallbackUser = {}) {
  const rawToken = getTokenFromResponse(response);
  const accessToken = removeBearerPrefix(rawToken);

  const user = getUserFromResponse(response, fallbackUser);

  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

  notifyAuthChanged();

  return {
    accessToken,
    user,
  };
}

export function clearAuthData() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  notifyAuthChanged();
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getAuthUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function onAuthChanged(callback) {
  window.addEventListener(AUTH_CHANGED_EVENT, callback);

  return () => {
    window.removeEventListener(AUTH_CHANGED_EVENT, callback);
  };
}