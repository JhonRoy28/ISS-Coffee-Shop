export function getLoginRedirect(user, location) {
  if (user) return null;
  return {
    to: '/login',
    replace: true,
    state: { from: location },
  };
}
