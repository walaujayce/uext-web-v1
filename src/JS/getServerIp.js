export const getServerIp = () => {
  return window.location.hostname === 'localhost'
    ? "192.9.120.70"
    : window.location.hostname;
};
 