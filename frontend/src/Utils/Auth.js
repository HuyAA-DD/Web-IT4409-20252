const STORAGE_KEY = "user";
 
export const getStoredAuth = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
        return null;
    }
}
 
export const parseBearerToken = (token) => {
    if (!token) return null;
    return typeof token === "string" && token.startsWith("Bearer") ? token.slice(7).trim() : token;
}
 
const normalizeToken = (token) => {
    if (!token) return null;
    return parseBearerToken(token) || token;
}
 
const getTokenPayload = (token) => {
    try {
        const normalized = normalizeToken(token);
        if (!normalized) return null;

        const base64Url = normalized.split('.')[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((char) => '%'+('00'+char.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};
 
export const isTokenExpired = (token) => {
    const payload = getTokenPayload(token);
    if (!payload?.exp) return false;
    return Date.now() >= Number(payload.exp) * 1000;
};
 
export const saveAuthUser = (user) => {
    if (!user) {
        localStorage.removeItem(STORAGE_KEY);
        return;
    }
 
    const authUser = {
        ...user,
        accessToken: normalizeToken(user.accessToken || user.token)
    }
 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
}
 
export const clearAuthUser = () => {
    localStorage.removeItem(STORAGE_KEY);
}
 
export const getAccessToken = () => {
    const user = getStoredAuth();
    const token = normalizeToken(user?.accessToken || user?.token);

    if (!token) {
        return null;
    }

    if (isTokenExpired(token)) {
        clearAuthUser();
        window.dispatchEvent(new Event('auth-changed'));
        return null;
    }

    return token;
}
 
export const getRole = () => {
    return getStoredAuth()?.role || null;
}
 
export const getAuthUser = () => getStoredAuth();

export const getAuthUserName = () => {
    const user = getStoredAuth();
    return (
        user?.fullName ||
        user?.name ||
        user?.username ||
        user?.email ||
        null
    );
};

export const getAuthUserId = () => {
    const user = getStoredAuth();
    return user?.id || user?.userId || null;
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

export const updateAuthUser = (updatedUser) => {
    if (!updatedUser) return null;

    const authUser = getStoredAuth() || {};
    const mergedUser = {
        ...authUser,
        ...updatedUser,
        accessToken: normalizeToken(
            updatedUser?.accessToken || authUser?.accessToken || updatedUser?.token
        ),
    };

    saveAuthUser(mergedUser);
    return mergedUser;
};

// ---- CÁC HÀM XỬ LÝ QUYỀN TRUY CẬP ----
 
// 1. Chỉ kiểm tra xem đã đăng nhập chưa (có token không)
export const isAuthenticated = () => {
    return Boolean(getAccessToken());
}
 
// 2. Hàm MỚI: Kiểm tra xem user hiện tại có nằm trong danh sách role cho phép không
export const isAuthorized = (allowedRoles) => {
    const role = getRole();
    if (!role) return false;
   
    // allowedRoles là một mảng, ví dụ: ['admin', 'seller']
    return allowedRoles.includes(role);
}