const jwt = require("jsonwebtoken");

require("dotenv").config();

const authenticate = (req, res, next) => {
    try {
        const header = req.header("Authorization");

        if (!header) {
            return res.status(401).json({
                message: "Authorization header missing"
            });
        }

        const token = header.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Token missing"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("Token is valid! User payload:", decoded);

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = authenticate;