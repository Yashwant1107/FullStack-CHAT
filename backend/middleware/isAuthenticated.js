import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;
    const token = req.cookies.token || bearerToken;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        req.id = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

export { isAuthenticated };
export default isAuthenticated;
