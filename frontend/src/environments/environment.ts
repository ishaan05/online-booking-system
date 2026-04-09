/**
 * Local dev: empty apiBaseUrl → requests go to `/api/...` and `/uploads/...` on the dev server origin.
 * proxy.conf.json forwards those paths to the .NET API at http://localhost:5211 (see launchSettings.json).
 */
export const environment = {
  production: false,
  apiBaseUrl: '',
};
