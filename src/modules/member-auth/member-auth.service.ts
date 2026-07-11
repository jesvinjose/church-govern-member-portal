import prisma from "../../config/prisma";
import { generateOtp } from "../../utils/generateOtp";
import { sendMail } from "../../utils/mail";
import { MemberOTPPurpose } from "@prisma/client";
import { generateMemberAccessToken, generateMemberRefreshToken, verifyMemberRefreshToken } from "../../utils/memberJwt";
import { DeviceInfo } from "../../types/deviceInfo";
import { getMemberRefreshTokenExpiry } from "../../utils/tokenExpiry";

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
        },
        deviceInfo: DeviceInfo
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

        const accessToken = generateMemberAccessToken({
            id: member.id,
            family_id: member.family_id,
            tenant_id: member.tenant_id,
        });

        const refreshToken = generateMemberRefreshToken({
            id: member.id,
            family_id: member.family_id,
            tenant_id: member.tenant_id,
        });

        await prisma.memberRefreshToken.create({
            data: {
                member_id: member.id,
                refresh_token: refreshToken,
                expires_at: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                ),
                device_name: deviceInfo.device_name,
                device_type: deviceInfo.device_type,
                browser: deviceInfo.browser,
                user_agent: deviceInfo.user_agent,
                ip_address: deviceInfo.ip_address,
                last_used_at: new Date(),
            },
        });

        return {
            member,
            accessToken,
            refreshToken,
        };
    };

export const getRelationsDropdownService =
    async (tenant_id: string) => {

        return prisma.relation.findMany({
            where: {
                tenant_id,
            },
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                order: "asc",
            },
        });

    };

export const getDeathRegistrationMembersDropdownService =
    async (
        familyId: string,
        tenant_id: string,
        loggedInMemberId: string
    ) => {

        const members =
            await prisma.member.findMany({

                where: {
                    family_id: familyId,
                    tenant_id,
                    is_deceased: false,

                    id: {
                        not: loggedInMemberId,
                    },
                },

                select: {
                    id: true,
                    name: true,
                    gender: true,
                    is_deceased: true,

                    relation: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },

                    dob: true,
                },

                orderBy: {
                    name: "asc",
                },

            });

        const pendingDeathRequests =
            await prisma.request.findMany({

                where: {
                    tenant_id,
                    type: "DEATH_REGISTRATION",
                    status: "PENDING",
                },

                select: {
                    payload: true,
                },

            });

        const pendingMemberIds =
            pendingDeathRequests
                .map(
                    (request: any) =>
                        request.payload?.deceasedMemberId
                )
                .filter(Boolean);

        return members.filter(
            (member) =>
                !pendingMemberIds.includes(member.id)
        );

    };

export const getMemberSpouseService =
    async (
        memberId: string,
        tenant_id: string
    ) => {

        const member =
            await prisma.member.findUnique({
                where: {
                    id: memberId,
                },
                select: {
                    id: true,
                    family_id: true,
                    gender: true,
                    husband_id: true,
                    spouse_name: true
                },
            });

        if (!member) {
            throw new Error("Member not found");
        }

        let spouse = null;

        // --------------------------------------------------
        // Case 1: Old relational data using husband_id
        // --------------------------------------------------

        if (member.gender === "MALE") {

            spouse =
                await prisma.member.findFirst({
                    where: {
                        tenant_id,
                        family_id: member.family_id,
                        husband_id: member.id,
                        is_deleted: false,
                        is_deceased: false,
                    },
                    select: {
                        id: true,
                        name: true,
                    },
                });

        } else {

            if (member.husband_id) {

                spouse =
                    await prisma.member.findUnique({
                        where: {
                            id: member.husband_id,
                        },
                        select: {
                            id: true,
                            name: true,
                        },
                    });

            }
        }

        // --------------------------------------------------
        // Case 2: New data using spouse_name
        // --------------------------------------------------
        if (!spouse && member.spouse_name) {

            spouse = await prisma.member.findFirst({
                where: {
                    tenant_id,
                    family_id: member.family_id,
                    name: {
                        equals: member.spouse_name,
                        mode: "insensitive",
                    },
                    is_deleted: false,
                    is_deceased: false,
                },
                select: {
                    id: true,
                    name: true,
                },
            });

        }

        return spouse;
    };

export const refreshMemberTokenService = async (
    refreshToken: string,
    deviceInfo: DeviceInfo
) => {

    // Verify JWT signature
    const payload =
        verifyMemberRefreshToken(
            refreshToken
        ) as {
            id: string;
            family_id: string;
            tenant_id?: string | null;
            token_type: string;
        };

    if (payload.token_type !== "refresh") {
        throw new Error("Invalid refresh token");
    }

    // Check whether this refresh token exists in DB
    const storedToken =
        await prisma.memberRefreshToken.findUnique({
            where: {
                refresh_token: refreshToken,
            },
        });

    if (!storedToken) {
        throw new Error("Refresh token not found");
    }

    if (storedToken.revoked) {
        throw new Error("Refresh token has been revoked");
    }

    if (storedToken.expires_at < new Date()) {
        await prisma.memberRefreshToken.update({
            where: {
                id: storedToken.id,
            },
            data: {
                revoked: true,
            },
        });
        throw new Error("Refresh token has expired");
    }

    // Get member
    const member =
        await prisma.member.findUnique({
            where: {
                id: payload.id,
            },
        });

    if (
        !member ||
        !member.is_active ||
        member.is_deleted
    ) {
        throw new Error("Member not found");
    }

    // Generate new tokens
    const newAccessToken =
        generateMemberAccessToken({
            id: member.id,
            family_id: member.family_id,
            tenant_id: member.tenant_id,
        });

    const newRefreshToken =
        generateMemberRefreshToken({
            id: member.id,
            family_id: member.family_id,
            tenant_id: member.tenant_id,
        });

    // Rotate refresh token
    await prisma.memberRefreshToken.update({
        where: {
            id: storedToken.id,
        },
        data: {
            refresh_token: newRefreshToken,
            expires_at: getMemberRefreshTokenExpiry(),
            browser: deviceInfo.browser,
            device_name: deviceInfo.device_name,
            device_type: deviceInfo.device_type,
            user_agent: deviceInfo.user_agent,
            ip_address: deviceInfo.ip_address,
            last_used_at: new Date(),
        },
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};

export const logoutMemberService = async (
    refreshToken: string
) => {

    await prisma.memberRefreshToken.deleteMany({
        where: {
            refresh_token: refreshToken,
        },
    });

};