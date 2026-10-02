import apiRequest from "./api";

async function signupUser({
  name,
  email,
  password,
}) {
  return apiRequest("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
}

async function loginUser({
  email,
  password,
}) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

async function getCurrentUser(token) {
  return apiRequest("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export {
  signupUser,
  loginUser,
  getCurrentUser,
};