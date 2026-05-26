import {
  NextFunction,
  Request,
  Response,
} from "express";

import jwt from "jsonwebtoken";

import { sendResponse }
  from "../utils/response";

export interface MemberAuthRequest
  extends Request {

  member_id?: string;

  family_id?: string;

  tenant_id?: string;

}

export const memberAuthMiddleware = (
  req: MemberAuthRequest,
  res: Response,
  next: NextFunction
) => {

  const authHeader =
    req.headers.authorization;

  if (!authHeader) {

    return sendResponse(
      res,
      401,
      "Authorization token is required"
    );

  }

  const token =
    authHeader.split(" ")[1];

  if (!token) {

    return sendResponse(
      res,
      401,
      "Invalid authorization format"
    );

  }

  try {

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as {
        member_id: string;
        family_id: string;
        tenant_id?: string;
      };

    req.member_id =
      decoded.member_id;

    req.family_id =
      decoded.family_id;

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