import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  email: null || localStorage.getItem("email"),
  access_token: null || localStorage.getItem("access_token"),
  refresh_token: null || localStorage.getItem("refresh_token"),
  isAuthenticated: !!localStorage.getItem("access_token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("access_token", action.payload.access_token);
      localStorage.setItem("refresh_token", action.payload.refresh_token);
      localStorage.setItem("email", JSON.stringify(action.payload.email));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.clear();
    },
    updateUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
});

export const { login, logout, updateUser, setToken } = authSlice.actions;

// Thunk for fetching current user
export const fetchCurrentUser = () => async (dispatch, getState) => {
  const { token } = getState().auth;
  if (!token) return;

  try {
    const response = await fetch(
      "https://bichance-production-a30f.up.railway.app/api/v1/users/me",
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const userData = await response.json();
      dispatch(updateUser(userData));
    } else {
      // Token might be invalid, logout
      dispatch(logout());
    }
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    // Don't logout on network errors, just log the error
  }
};

export default authSlice.reducer;
