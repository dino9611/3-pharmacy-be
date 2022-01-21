exports.verifyUser = async (req, res, next) =>
  req.user.role === 'user'
    ? next()
    : res.status(403).json({ message: 'Not a User' });
