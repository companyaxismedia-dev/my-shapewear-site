const API_BASE = "http://localhost:5000";

export const useGoogleAuth = () => {
  const googleAuth = () => {
    window.location.href = `${API_BASE}/api/users/login/google`;
  };

  return { googleAuth };
};
