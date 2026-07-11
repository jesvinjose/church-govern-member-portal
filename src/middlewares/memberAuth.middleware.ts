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

interface MemberAccessTokenPayload {

  id: string;

  family_id: string;

  tenant_id?: string;

  token_type: "access";

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

  if (!authHeader.startsWith("Bearer ")) {

    return sendResponse(
      res,
      401,
      "Invalid authorization format"
    );

  }

  const token =
    authHeader.substring(7);

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
        process.env.MEMBER_ACCESS_TOKEN_SECRET as string
      ) as MemberAccessTokenPayload;

    if (decoded.token_type !== "access") {
      return sendResponse(
        res,
        401,
        "Invalid member token"
      );
    }

    req.member_id =
      decoded.id;

    req.family_id =
      decoded.family_id;

    req.tenant_id =
      decoded.tenant_id;

    return next();

  } catch (error) {

    if (error instanceof jwt.TokenExpiredError) {

      return sendResponse(
        res,
        401,
        "Access token expired"
      );

    }

    if (error instanceof jwt.JsonWebTokenError) {

      return sendResponse(
        res,
        401,
        "Invalid access token"
      );

    }

    return sendResponse(
      res,
      401,
      "Authentication failed"
    );


  }

};