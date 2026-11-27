/**
 * URL utility functions for seamless local and production deployments
 */

/**
 * Resolves the backend base origin URL (e.g., http://localhost:5000 or https://rajpatra.onrender.com)
 */
export const getBackendBaseUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL.replace(/\/+$/, '');
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  }
  // In single-service production, frontend and backend share window.location.origin
  return import.meta.env.PROD ? window.location.origin : 'http://localhost:5000';
};

/**
 * Resolves a full accessible URL for uploaded or generated PDF gazette documents.
 * Handles absolute URLs (e.g. Cloudinary HTTPS URLs) and relative local uploads (/uploads/...).
 */
export const getPdfFullUrl = (url) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const base = getBackendBaseUrl();
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${base}${cleanPath}`;
};
