import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.split(" ")[1]; 
    console.log(token);
    // const token = req.cookies.token;

    if (!token) {
        return res.status(401).json("Access denied");
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // (req as any).token = decoded;
        (req as any).userId = (decoded as any).userId;
        next();
    } catch (err) {
        return res.status(403).json("Invalid token");
    }
};
