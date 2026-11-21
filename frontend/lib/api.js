
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "/api";

function nearbyQuery(options) {
  if (!options) return "";
  const params = new URLSearchParams({
    lat: String(options.lat),
    lng: String(options.lng),
    radiusKm: String(options.radiusKm),
  });
  return `?${params}`;
}

async function request(endpoint, options = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("lostFoundToken")
      : null;
  const isUnauthenticatedEndpoint =
    endpoint === "/auth/login" ||
    endpoint === "/auth/register" ||
    endpoint.startsWith("/password-reset/");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token && !isUnauthenticatedEndpoint) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (
      response.status === 401 &&
      token &&
      !isUnauthenticatedEndpoint &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem("lostFoundToken");
      localStorage.removeItem("lostFoundUser");
      window.dispatchEvent(new Event("lostFoundAuthExpired"));
    }

    const error = new Error(
      data.message || "Something went wrong. Please try again."
    );
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  // AUTHENTICATION

  register: (data) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () =>
    request("/auth/me"),

  updateProfileImage: (profileImage) =>
    request("/auth/profile-image", {
      method: "PATCH",
      body: JSON.stringify({ profileImage }),
    }),

  updateNotificationPreferences: (preferences) =>
    request("/auth/notification-preferences", {
      method: "PATCH",
      body: JSON.stringify(preferences),
    }),

  // FORGOT PASSWORD

  requestPasswordResetOtp: (email) =>
    request("/password-reset/request-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyPasswordResetOtp: (email, otp) =>
    request("/password-reset/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),

  resetPassword: (email, password) =>
    request("/password-reset/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // LOST ITEMS

  getLostItems: async (nearbyOptions) => {
    let lastError;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await request(`/lost-items${nearbyQuery(nearbyOptions)}`);
      } catch (error) {
        lastError = error;
        if (error.status && error.status < 500) throw error;
        if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
      }
    }
    throw lastError;
  },

  getMyLostItems: () =>
    request("/lost-items/mine"),

  getLostItem: (id) =>
    request(`/lost-items/${id}`),

  createLostItem: (data) =>
    request("/lost-items", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateLostItem: (id, data) =>
    request(`/lost-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteLostItem: (id) =>
    request(`/lost-items/${id}`, {
      method: "DELETE",
    }),

  closeLostItem: (id) =>
    request(`/lost-items/${id}/close`, { method: "POST" }),

  reopenLostItem: (id) =>
    request(`/lost-items/${id}/reopen`, { method: "POST" }),

  // FOUND ITEMS

  getFoundItems: async (nearbyOptions) => {
    let lastError;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await request(`/found-items${nearbyQuery(nearbyOptions)}`);
      } catch (error) {
        lastError = error;
        if (error.status && error.status < 500) throw error;
        if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
      }
    }
    throw lastError;
  },

  getMyFoundItems: () =>
    request("/found-items/mine"),

  getFoundItem: (id) =>
    request(`/found-items/${id}`),

  createFoundItem: (data) =>
    request("/found-items", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateFoundItem: (id, data) =>
    request(`/found-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteFoundItem: (id) =>
    request(`/found-items/${id}`, {
      method: "DELETE",
    }),

  closeFoundItem: (id) =>
    request(`/found-items/${id}/close`, { method: "POST" }),

  reopenFoundItem: (id) =>
    request(`/found-items/${id}/reopen`, { method: "POST" }),

  // QR RECOVERY

  getQrItem: (token) =>
    request(`/recovery/item/${encodeURIComponent(token)}`),

  getClaimableLostItems: () =>
    request("/recovery/lost-items"),

  getMyRecoveryClaims: () =>
    request("/recovery/claims"),

  getAdminOverview: () => request("/admin/overview"),
  getAdminUsers: () => request("/admin/users"),
  setAdminUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
  updateAdminItemStatus: (type, id, status) => request(`/admin/items/${type}/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteAdminItem: (type, id) => request(`/admin/items/${type}/${id}`, { method: "DELETE" }),

  getRecoveryClaims: (foundItemId) =>
    request(`/recovery/items/${foundItemId}/claims`),

  createRecoveryClaim: (foundItemId, lostItemId, proof) =>
    request(`/recovery/items/${foundItemId}/claims`, {
      method: "POST",
      body: JSON.stringify({ lostItemId, proof }),
    }),

  reviewRecoveryClaim: (claimId, decision, note) =>
    request(`/recovery/claims/${claimId}/review`, {
      method: "PATCH",
      body: JSON.stringify({ decision, note }),
    }),

  markRecoveryReturned: (claimId, note, qrToken) =>
    request(`/recovery/claims/${claimId}/return`, {
      method: "PATCH",
      body: JSON.stringify({ note, qrToken }),
    }),

  // NOTIFICATIONS

  getNotifications: async () => {
    let lastError;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await request("/notifications");
      } catch (error) {
        lastError = error;
        if (error.status && error.status < 500) throw error;
        if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
      }
    }
    throw lastError;
  },

  markNotificationRead: (id) =>
    request(`/notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllNotificationsRead: () =>
    request("/notifications/read-all", { method: "PATCH" }),

  markMatchNotificationsRead: () =>
    request("/notifications/read-matches", { method: "PATCH" }),

  deleteNotification: (id) =>
    request(`/notifications/${id}`, { method: "DELETE" }),

  // MATCHES

  getMatches: async () => {
    let lastError;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await request("/matches");
      } catch (error) {
        lastError = error;
        // A signed-out/forbidden response will not recover by retrying. Retry
        // only transient server or network failures, which can occur while
        // the database connection is waking up.
        if (error.status && error.status < 500) throw error;
        if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
      }
    }
    throw lastError;
  },

  getMatch: (id) =>
    request(`/matches/${id}`),

  updateMatchStatus: (id, status) =>
    request(`/matches/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // MESSAGES

  getMessages: (matchId) =>
    request(`/messages/${matchId}`),

  getConversations: () =>
    request("/messages"),

  sendMessage: (matchId, message) =>
    request(`/messages/${matchId}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
};
