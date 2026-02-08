const API_URL = `${import.meta.env.VITE_API_GATEWAY}/api/auth`;

export const authService = {
  async register(username, email, password, rol) {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password, rol }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error en el registro");
    }

    return response.json();
  },

  async login(username, password) {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Credenciales inválidas");
    }

    return response.json();
  },

  async validateToken(token, username) {
    const response = await fetch(`${API_URL}/validate?username=${username}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Token inválido");
    }

    return response.json();
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken() {
    return localStorage.getItem("token");
  },

  setUserSession(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },
};
