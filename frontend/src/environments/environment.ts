/**
 * Development: empty apiBaseUrl → browser calls `/api/...` and `/uploads/...` on the ng serve origin.
 * proxy.conf.json forwards `/api` and `/uploads` → OnlineBookingSystem.Api wwwroot (default port 5211).
 */
export const environment = {
  production: false,
  apiBaseUrl: '',
};
