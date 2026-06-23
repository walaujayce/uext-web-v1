import axios from "axios";
import { getCurrentServerIp } from "./serverStore";

// ─────────────────────────────────────────────────────────
// Health-check configuration
//   SLOW_THRESHOLD_MS  — warn on console when a request takes longer
//   REQUEST_TIMEOUT_MS — abort & fail the request after this many ms
//   OK_LOG_SAMPLE_RATE — log "ok" lines every N successful responses
// ─────────────────────────────────────────────────────────
const SLOW_THRESHOLD_MS  = 500;
const REQUEST_TIMEOUT_MS = 2000;
const OK_LOG_SAMPLE_RATE = 10;

const api8031 = axios.create({
  withCredentials: true,            // refresh token cookie
  timeout: REQUEST_TIMEOUT_MS,      // default timeout for ALL calls on this client
});
const applyTargetHeader = (config) => {
  const ip = getCurrentServerIp();
  if (!ip || !config.url) return config; // 尚未選取 IP → 不帶 header，走 proxy 預設
  if (!/^\/api\/(8031)(\/|$)/.test(config.url)) return config; // 其他路徑不動

  config.headers = config.headers || {};
  config.headers["X-Target-IP"] = ip;
  return config;
};
// ─────────────────────────────────────────────────────────
// Auth header (unchanged behaviour)
// ─────────────────────────────────────────────────────────
api8031.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiQWRtaW4iLCJSb2xlIjoiQWRtaW4iLCJpc3MiOiJVTW9uaXRvclNlcnZlciIsImF1ZCI6IlVNb25pdG9yQ2xpZW50In0.JpQvxBC197LaFVrBFdjZnF-Lk_nDUd5lWL_OaybpYpc`;
  return applyTargetHeader(config);
});

// ─────────────────────────────────────────────────────────
// Health-check internals
// ─────────────────────────────────────────────────────────
const counters = { total: 0, slow: 0 };
const inFlight = new Map(); // key -> metadata

const buildKey = (config) =>
  `${(config.method || "get").toUpperCase()} ${config.url}`;

// Sentinel for "skipped because previous request still pending".
// Consumers can detect this with `isSkipped(err)` and silently ignore it.
const SKIPPED = Symbol("api8031:skipped");
export const isSkipped = (err) => !!(err && err[SKIPPED] === true);

// Helper: poll the in-flight map (useful for debugging / dashboards).
export const getInFlightKeys = () => Array.from(inFlight.keys());
export const getHealthCounters = () => ({ ...counters });

// ─────────────────────────────────────────────────────────
// Request interceptor — tag start time + optional pile-up guard
//
// Per-call opt-in:
//   api8031.get(url, { skipIfPending: true })
//     ↳ if the same METHOD+URL is still pending, this call is rejected
//       with a SKIPPED sentinel instead of stacking on top.
// ─────────────────────────────────────────────────────────
api8031.interceptors.request.use((config) => {
  const key = buildKey(config);

  if (config.skipIfPending && inFlight.has(key)) {
    const err = new Error(
      `[Health] ${key} skipped — previous request still pending`,
    );
    err[SKIPPED] = true;
    err.config = config;
    return Promise.reject(err);
  }

  config.metadata = { startedAt: performance.now(), key };
  inFlight.set(key, config.metadata);
  return applyTargetHeader(config);
});

// ─────────────────────────────────────────────────────────
// Response interceptor — latency log + error classification
// ─────────────────────────────────────────────────────────
api8031.interceptors.response.use(
  (response) => {
    const { startedAt, key } = response.config.metadata || {};
    if (key) inFlight.delete(key);

    if (typeof startedAt === "number") {
      const elapsed = performance.now() - startedAt;
      counters.total += 1;
      if (elapsed > SLOW_THRESHOLD_MS) {
        counters.slow += 1;
        console.warn(
          `[Health] ${key} SLOW ${elapsed.toFixed(0)}ms ` +
            `(slow ${counters.slow}/${counters.total})`,
        );
      } else if (counters.total % OK_LOG_SAMPLE_RATE === 0) {
        console.log(
          `[Health] ${key} ok   ${elapsed.toFixed(0)}ms ` +
            `(slow ${counters.slow}/${counters.total})`,
        );
      }
    }
    return response;
  },
  (error) => {
    // Our own "skipped" sentinel — log quietly and propagate so callers can ignore.
    if (isSkipped(error)) {
      console.warn(error.message);
      return Promise.reject(error);
    }

    const cfg = error?.config || {};
    const { startedAt, key } = cfg.metadata || {};
    if (key) inFlight.delete(key);

    const elapsedStr =
      typeof startedAt === "number"
        ? `${(performance.now() - startedAt).toFixed(0)}ms`
        : "?";
    const tag =
      key || `${(cfg.method || "?").toUpperCase()} ${cfg.url || "?"}`;

    if (axios.isCancel(error) || error?.code === "ERR_CANCELED") {
      console.warn(`[Health] ${tag} aborted after ${elapsedStr}`);
    } else if (
      error?.code === "ECONNABORTED" ||
      /timeout/i.test(error?.message || "")
    ) {
      console.error(
        `[Health] ${tag} TIMEOUT after ${elapsedStr} ` +
          `(threshold ${REQUEST_TIMEOUT_MS}ms)`,
      );
    } else {
      console.error(`[Health] ${tag} error after ${elapsedStr}:`, error);
    }
    return Promise.reject(error);
  },
);

export default api8031;
