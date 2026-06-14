function normalizeBaseUrl(value) {
  return String(value || '').replace(/\/$/, '');
}

function resolveOrigin() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.origin;
}

function resolveDevApiBaseUrl() {
  if (typeof window === 'undefined') {
    return '';
  }

  return `${window.location.protocol}//${window.location.hostname}:54321/api/kraak`;
}

function resolveProdApiBaseUrl() {
  const origin = resolveOrigin();
  return origin ? `${origin}/laurierboom/api/api/kraak` : '';
}

function readConfiguredUrl(key) {
  const value = import.meta.env[key];
  return value ? normalizeBaseUrl(value) : '';
}

function warnMissingEnv(key, fallback) {
  if (!import.meta.env.PROD || typeof console === 'undefined') {
    return;
  }

  console.warn(
    `[kraakscore] ${key} ontbreekt in productie; fallback naar ${fallback}`,
  );
}

export function resolveApiBaseUrl() {
  const configuredUrl = readConfiguredUrl('VITE_BASE_URL_API');
  if (configuredUrl) {
    return configuredUrl;
  }

  if (import.meta.env.PROD) {
    const fallback = resolveProdApiBaseUrl();
    warnMissingEnv('VITE_BASE_URL_API', fallback);
    return fallback;
  }

  return resolveDevApiBaseUrl();
}

export function resolveUploadsBaseUrl() {
  const configuredUrl = readConfiguredUrl('VITE_UPLOADS_URL');
  if (configuredUrl) {
    return configuredUrl;
  }

  if (import.meta.env.PROD) {
    const fallback = resolveProdApiBaseUrl();
    warnMissingEnv('VITE_UPLOADS_URL', fallback);
    return fallback;
  }

  return resolveDevApiBaseUrl();
}

export function getApiConfig() {
  const apiBaseUrl = resolveApiBaseUrl();
  const uploadsBaseUrl = resolveUploadsBaseUrl();

  return {
    apiBaseUrl,
    uploadsBaseUrl,
    hasExplicitApiBaseUrl: Boolean(readConfiguredUrl('VITE_BASE_URL_API')),
    hasExplicitUploadsBaseUrl: Boolean(readConfiguredUrl('VITE_UPLOADS_URL')),
  };
}