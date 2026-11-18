export function saveAuth(data) {
  if (typeof window === "undefined") return;

  localStorage.setItem("lostFoundToken", data.token);
  localStorage.setItem(
    "lostFoundUser",
    JSON.stringify(data.user)
  );
}

export function getToken() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("lostFoundToken");
}

export function getUser() {
  if (typeof window === "undefined") return null;

  const user = localStorage.getItem("lostFoundUser");

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function logout() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("lostFoundToken");
  localStorage.removeItem("lostFoundUser");
}

export function saveUser(user) {
  if (typeof window === "undefined") return;

  localStorage.setItem("lostFoundUser", JSON.stringify(user));
  window.dispatchEvent(new Event("lostFoundUserUpdated"));
}