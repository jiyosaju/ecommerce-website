const jwt = require("jsonwebtoken");

const checkAdminToken = (req, res, next) => {
  const token = req.cookies.token;

  console.log("Token in middleware:", token);

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }
  // const token = req.headers.authorization?.split(' ')[1];
  // if (!token) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.token = token;
    next();

    // req.user = decoded;
    // next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = checkAdminToken;
