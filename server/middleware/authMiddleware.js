// Backward-compatible name used by the existing admin routes.
// All admin-protected endpoints use the hardened admin middleware.
module.exports = require('./adminAuthMiddleware');
