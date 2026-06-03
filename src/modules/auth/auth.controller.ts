import { Request, Response } from "express";

import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  sendOtpSchema,
  loginWithOtpSchema
} from "./auth.validation";

import {
  registerUserService,
  loginUserService,
  getCurrentUserService,
  forgotPasswordService,
  resetPasswordService,
  sendOtpService,
  loginWithOtpService
} from "./auth.service";

import { AuthRequest } from "../../middlewares/auth.middleware";

import { generateToken } from "../../utils/jwt";
import { sendResponse } from "../../utils/response";
import { catchAsync } from "../../utils/catchAsync";

export const registerUser = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {

    const validatedData = registerSchema.parse(req.body);

    const user = await registerUserService(
      validatedData
    );

    return sendResponse(
      res,
      201,
      "User registered successfully",
      user
    );

  }
);

export const loginUser = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {

    const validatedData = loginSchema.parse(req.body);

    const user = await loginUserService(
      validatedData.email,
      validatedData.password
    );

    const token = generateToken({
      id: user.id,
      email: user.email,
      roles: user.roles.map((r) => r.role.name),
      tenant_id: user.tenant_id,
      token_type: "user",
    });

    return sendResponse(
      res,
      200,
      "Login successful",
      {
        token,
        user,
      }
    );

  }
);

export const getCurrentUser = catchAsync(
  async (
    req: AuthRequest,
    res: Response
  ) => {

    const user = await getCurrentUserService(
      req.id as string
    );

    return sendResponse(
      res,
      200,
      "User fetched successfully",
      user
    );

  }
);

export const forgotPassword = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {

    const validatedData =
      forgotPasswordSchema.parse(req.body);

    await forgotPasswordService(
      validatedData.email
    );

    return sendResponse(
      res,
      200,
      "If an account exists, a password reset link has been sent successfully"
    );

  }
);

export const resetPassword = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {

    const validatedData =
      resetPasswordSchema.parse(req.body);

    await resetPasswordService(
      validatedData.token,
      validatedData.password
    );

    return sendResponse(
      res,
      200,
      "Password reset successful"
    );

  }
);

export const sendOtp = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {

    const validatedData =
      sendOtpSchema.parse(req.body);

    await sendOtpService(
      validatedData
    );

    return sendResponse(
      res,
      200,
      "OTP sent successfully"
    );

  }
);

export const loginWithOtp = catchAsync(
  async (
    req: Request,
    res: Response
  ) => {

    const validatedData =
      loginWithOtpSchema.parse(req.body);

    const user =
      await loginWithOtpService(
        validatedData.email,
        validatedData.otp
      );

    const token = generateToken(
      {
        id: user.id,
        email: user.email,
        roles: user.roles.map((r) => r.role.name),
        tenant_id: user.tenant_id,
        token_type: "user",
      }
    );

    return sendResponse(
      res,
      200,
      "OTP login successful",
      {
        token,
        user,
      }
    );

  }
);