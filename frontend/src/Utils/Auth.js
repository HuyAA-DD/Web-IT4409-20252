const STORAGE_KEY = "user";

export const getStoredAuth = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
};

export const parseBearerToken = (token) => {
  if (!token) return null;

  if (typeof token === "string" && token.startsWith("Bearer ")) {
    return token.slice(7);
  }

  return token;
};

const normalizeToken = (token) => {
  if (!token) return null;
  return parseBearerToken(token);
};

export const saveAuthUser = (user) => {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  const authUser = {
    ...user,
    accessToken: normalizeToken(user.accessToken || user.token || user.jwt),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
};

export const updateAuthUser = (newUserData) => {
  const currentUser = getStoredAuth();

  if (!currentUser) {
    saveAuthUser(newUserData);
    return;
  }

  const updatedUser = {
    ...currentUser,
    ...newUserData,
    accessToken:
      currentUser.accessToken ||
      newUserData?.accessToken ||
      newUserData?.token ||
      newUserData?.jwt ||
      null,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
};

export const clearAuthUser = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const removeAuthData = clearAuthUser;

export const logout = () => {
  clearAuthUser();
};

export const getAccessToken = () => {
  const user = getStoredAuth();

  return normalizeToken(user?.accessToken || user?.token || user?.jwt) || null;
};

export const isAuthenticated = () => {
  return Boolean(getAccessToken());
};

export const getAuthUser = () => {
  return getStoredAuth();
};

export const getAuthUserId = () => {
  const user = getStoredAuth();

  return user?.id || user?.userId || user?.uuid || null;
};

export const getAuthUserRole = () => {
  const user = getStoredAuth();

  return user?.role || user?.roles?.[0] || "USER";
};

export const getAuthUserName = () => {
  const user = getStoredAuth();

  return (
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.email ||
    "Tài khoản"
  );
};

export const getAuthUserAvatar = () => {
  const user = getStoredAuth();

  return (
    user?.avatarUrl ||
    user?.avatar ||
    user?.imageUrl ||
    user?.profileImage ||
    null
  );
};