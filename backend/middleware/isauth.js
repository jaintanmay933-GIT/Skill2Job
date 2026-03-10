import jwt from "jsonwebtoken";

/* =========================
   AUTHENTICATE USER MIDDLEWARE
========================= */
export const isAuth = async (req, res, next) => {
    try {
        // 1. Extract token from cookies (requires cookie-parser in index.js)
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        // 2. Verify the token using the secret key
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Check if decoding was successful and contains the payload
        if (!decode || !decode.userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        // 4. Attach the userId to the request object
        // This MUST match the key used in jwt.sign ({ userId: user._id })
        req.userId = decode.userId;

        // 5. Move to the next middleware or controller
        next();

    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        
        // Handle specific JWT errors like expiration
        const errorMessage = error.name === "TokenExpiredError" 
            ? "Session expired, please login again" 
            : "Unauthorized Access";

        return res.status(401).json({
            success: false,
            message: errorMessage
        });
    }
};