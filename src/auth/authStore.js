let accessToken = localStorage.getItem("accessToken") || null;
let userId = '';
export const setAccessToken = (token, userid) => {
  accessToken = token;
  userId = userid;
  localStorage.setItem("accessToken", token);

};

export const getAccessToken = () => accessToken;
export const getUserId = () => userId;
export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem("accessToken");

};
