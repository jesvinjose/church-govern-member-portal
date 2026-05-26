import prisma from "../../config/prisma";
import { generateOtp } from "../../utils/generateOtp";
import { sendMail } from "../../utils/mail";
import { MemberOTPPurpose } from "@prisma/client";

export const sendMemberOtpService =
    async (
        payload: {
            email?: string;
            phone?: string;
        }
    ) => {

        let member = null;

        if (payload.email) {

            member =
                await prisma.member.findFirst({
                    where: {
                        email: payload.email,
                    },
                });

        }

        if (payload.phone) {

            member = await prisma.member.findFirst({
                where: {
                    phone: payload.phone,
                },
            });

        }

        if (!member) {
            throw new Error(
                "Member not found"
            );
        }

        const otpCode = generateOtp();

        const expiresAt =
            new Date(
                Date.now() +
                1000 * 60 * 5
            );

        await prisma.memberOTP.create({
            data: {
                code: otpCode,

                purpose:
                    MemberOTPPurpose.LOGIN,

                expires_at:
                    expiresAt,

                member_id:
                    member.id,
            },
        });

        if (
            payload.email
        ) {

            await sendMail(
                payload.email,
                "Your Login OTP",
                `
          <h2>Member Portal OTP</h2>

          <h1>${otpCode}</h1>

          <p>
            OTP expires in
            5 minutes.
          </p>
        `
            );

        }

        return;

    };

export const memberLoginService =
    async (
        payload: {
            email?: string;
            phone?: string;
            otp: string;
        }
    ) => {

        let member = null;

        if (payload.email) {

            member =
                await prisma.member.findFirst({
                    where: {
                        email:
                            payload.email,
                    },
                    include: {
                        family: true,
                    },
                });

        }

        if (payload.phone) {

            member =
                await prisma.member.findFirst({
                    where: {
                        phone:
                            payload.phone,
                    },
                    include: {
                        family: true,
                    },
                });

        }

        if (!member) {
            throw new Error(
                "Member not found"
            );
        }

        const otpRecord =
            await prisma.memberOTP.findFirst({
                where: {
                    member_id:
                        member.id,

                    code:
                        payload.otp,

                    purpose:
                        MemberOTPPurpose.LOGIN,

                    verified: false,
                },
                orderBy: {
                    expires_at:
                        "desc",
                },
            });

        if (!otpRecord) {
            throw new Error(
                "Invalid OTP"
            );
        }

        if (
            new Date() >
            otpRecord.expires_at
        ) {
            throw new Error(
                "OTP expired"
            );
        }

        await prisma.memberOTP.update({
            where: {
                id: otpRecord.id,
            },
            data: {
                verified: true,
            },
        });

        return member;
    };