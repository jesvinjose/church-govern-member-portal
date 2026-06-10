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
        if (
            !payload.email &&
            !payload.phone
        ) {
            throw new Error(
                "Email or phone is required"
            );
        }

        const conditions = [];

        if (payload.email) {
            conditions.push({
                email: payload.email,
            });
        }

        if (payload.phone) {
            conditions.push({
                phone: payload.phone,
            });
        }

        const member =
            await prisma.member.findFirst({
                where: {
                    OR: conditions,
                    is_deleted: false,
                    is_active: true,
                },
            });

        if (!member) {
            throw new Error(
                "Member not found"
            );
        }

        const otpCode = generateOtp();

        const expiresAt =
            new Date(
                Date.now() +
                1000 * 60 * 2
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
            payload.email &&
            member.email
        ) {

            await sendMail(
                payload.email,
                "Your Login OTP",
                `
          <h2>Member Portal OTP</h2>

          <h1>${otpCode}</h1>

          <p>
            OTP expires in
            2 minutes.
          </p>
        `
            );

        }

        if (
            payload.phone &&
            member.phone
        ) {

            // TODO:
            // Send SMS OTP here

            console.log(
                `OTP ${otpCode} sent to ${member.phone}`
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