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