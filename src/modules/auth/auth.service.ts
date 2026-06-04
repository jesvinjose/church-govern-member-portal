import bcrypt from "bcrypt";
import prisma from "../../config/prisma";
import { v4 as uuidv4 } from "uuid";
import { sendMail } from "../../utils/mail";
import { generateOtp } from "../../utils/generateOtp";
import { OTPPurpose } from "@prisma/client";

export const registerUserService = async (
    payload: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
        phone?: string;
        tenant_id: string;
    }
) => {

    const existingUser = await prisma.user.findUnique({
        where: {
            email: payload.email,
        },
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const user = await prisma.user.create({
        data: {
            first_name: payload.first_name,
            last_name: payload.last_name,
            email: payload.email,
            password_hash: hashedPassword,
            tenant_id: payload.tenant_id,
            phone: payload.phone
        },
    });

    const { password_hash, ...safeUser } = user;

    return safeUser;
};

export const loginUserService = async (
    email: string,
    password: string
) => {

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
        include: {
            roles: {
                include: {
                    role: true
                }
            }
        }
    });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    if (user.is_deleted) {
        throw new Error("Invalid email or password");
    }

    // Check account status
    if (!user.is_active) {
        throw new Error("Account is inactive");
    }

    const isPasswordMatched = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isPasswordMatched) {
        throw new Error("Invalid email or password");
    }

    const { password_hash: _, ...safeUser } = user;

    return safeUser;
};

export const getCurrentUserService = async (
    id: string
) => {

    const user = await prisma.user.findUnique({
        where: {
            id,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const { password_hash: _, ...safeUser } = user;

    return safeUser;
};

export const forgotPasswordService = async (
    email: string
) => {

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    // Prevent email enumeration
    if (!user || !user.is_active) {
        return;
    }

    // Invalidate previous unused tokens
    await prisma.passwordResetToken.updateMany({
        where: {
            user_id: user.id,
            used: false,
        },
        data: {
            used: true,
        },
    });

    const resetToken = uuidv4();

    const expiresAt = new Date(
        Date.now() + 1000 * 60 * 15
    );

    await prisma.passwordResetToken.create({
        data: {
            user_id: user.id,
            token: resetToken,
            expiresAt,
        },
    });

    const resetLink =
        `http://localhost:3000/reset-password?token=${resetToken}`;

    await sendMail(
        email,
        "Reset Your Password",
        `
    <h2>Password Reset</h2>

    <p>
      Click the link below to reset your password:
    </p>

    <a href="${resetLink}">
      Reset Password
    </a>

    <p>
      This link expires in 15 minutes.
    </p>
  `
    );

    return;

};

export const resetPasswordService = async (
    token: string,
    password: string
) => {

    const resetRecord =
        await prisma.passwordResetToken.findUnique({
            where: {
                token,
            },
        });

    if (!resetRecord) {
        throw new Error("Invalid reset token");
    }

    if (resetRecord.used) {
        throw new Error("Reset token already used");
    }

    if (
        new Date() > resetRecord.expiresAt
    ) {
        throw new Error("Reset token expired");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: resetRecord.user_id,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.is_active) {
        throw new Error("Account is inactive");
    }

    const hashedPassword =
        await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: {
            id: resetRecord.user_id,
        },
        data: {
            password_hash: hashedPassword,
        },
    });

    await prisma.passwordResetToken.update({
        where: {
            id: resetRecord.id,
        },
        data: {
            used: true,
        },
    });

};

export const sendOtpService = async (
    payload: {
        email?: string;
        phone?: string;
        purpose: OTPPurpose;
    }
) => {

    let user = null;

    if (payload.email) {

        user = await prisma.user.findUnique({
            where: {
                email: payload.email,
            },
        });

    }

    if (payload.phone) {

        user = await prisma.user.findFirst({
            where: {
                phone: payload.phone,
            },
        });

    }

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.is_active) {
        throw new Error("Account is inactive");
    }

    // Invalidate old OTPs
    await prisma.oTP.updateMany({
        where: {
            user_id: user.id,
            purpose: payload.purpose,
            verified: false,
        },
        data: {
            verified: true,
        },
    });

    const otpCode = generateOtp();

    const expiresAt = new Date(
        Date.now() + 1000 * 60 * 5
    );

    await prisma.oTP.create({
        data: {
            code: otpCode,
            purpose: payload.purpose,
            expires_at: expiresAt,
            user_id: user.id,
        },
    });

    if (payload.email) {

        await sendMail(
            payload.email,
            "Your OTP Code",
            `
        <h2>Your OTP Code</h2>

        <h1>${otpCode}</h1>

        <p>
          OTP expires in 5 minutes.
        </p>
      `
        );

    }

    return;

};

export const loginWithOtpService = async (
    email: string,
    otp: string
) => {

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
        include: {
            roles: {
                include: {
                    role: true
                }
            }
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.is_active) {
        throw new Error("Account is inactive");
    }

    const otpRecord =
        await prisma.oTP.findFirst({
            where: {
                user_id: user.id,
                code: otp,
                purpose: "LOGIN",
                verified: false,
            },
            orderBy: {
                expires_at: "desc",
            },
        });

    if (!otpRecord) {
        throw new Error("Invalid OTP");
    }

    if (
        new Date() > otpRecord.expires_at
    ) {
        throw new Error("OTP expired");
    }

    await prisma.oTP.update({
        where: {
            id: otpRecord.id,
        },
        data: {
            verified: true,
        },
    });

    return user;

};