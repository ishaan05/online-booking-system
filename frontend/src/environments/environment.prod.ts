/**
 * Local / same-machine API (Kestrel: see backend Properties/launchSettings.json, default http://localhost:5211).
 * With `ng serve`, proxy.conf.json also forwards `/api` to that URL — use '' if you prefer relative URLs.
 */
export const environment = {
  production: true,
  apiBaseUrl: '',
};
