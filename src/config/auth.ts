/**
 * Authentication enforcement switch.
 *
 * The route guards are implemented, but there is no backend authentication yet.
 * While `enforceAuthentication` is false, ProtectedRoute and PermissionRoute
 * render their children without checks so the shell can be developed and tested.
 * Flip it to true when the real auth API is wired in.
 *
 * This is a UX switch only. The backend rejects unauthenticated and unauthorized
 * requests regardless of this value.
 */
export const authConfig = {
  enforceAuthentication: false,
};
