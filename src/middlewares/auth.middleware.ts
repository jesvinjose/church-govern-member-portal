import { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/response";

export interface AuthRequest extends Request {
    id?: string;

    email?: string;

    roles?: string[];

    tenant_id?: string | null;
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Authorization token is required",
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Invalid authorization format",
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as {
            id: string;
            email: string;
            roles: string[],
            tenant_id?: string | null;
        };      

        req.id = decoded.id;

        req.email = decoded.email;

        req.roles = decoded.roles;

        req.tenant_id =
            decoded.tenant_id;

        next();

    } catch (error) {

        return sendResponse(
            res,
            401,
            "Invalid or expired token"
        );

    }

};