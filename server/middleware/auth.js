const { auth, isUsingMock } = require('../config/firebase');

/**
 * Authentication Middleware: Protects endpoints requiring Firebase Admin authorization
 * Validates 'Authorization: Bearer <idToken>' via Firebase Admin SDK
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing or malformed Authorization header. Expected Bearer <token>'
      });
    }

    const token = authHeader.split('Bearer ')[1].trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Token is empty'
      });
    }

    // Verify token using Firebase Admin Auth
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('[AUTH-ERROR] Token verification failed:', error.message);
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Invalid or expired Firebase ID token',
      details: error.message
    });
  }
}

/**
 * Optional Auth Middleware: Allows both authenticated and preview access,
 * attaching user info if a token is present.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();
    try {
      const decoded = await auth.verifyIdToken(token);
      req.user = decoded;
    } catch (e) {
      // Ignored for optional
    }
  }
  next();
}

module.exports = {
  requireAuth,
  optionalAuth
};
