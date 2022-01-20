exports.verifyAdmin = async (req, res, next) =>
  req.user.role === 'admin'
    ? next()
    : res.status(403).json({ message: 'Not an Admin' });
