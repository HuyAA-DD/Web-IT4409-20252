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
    return normalizeToken(user?.accessToken || user?.token) || null;
}

export const getRole = () => {
    return getStoredAuth()?.role || null;
}

export const getAuthUser = () => getStoredAuth();

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