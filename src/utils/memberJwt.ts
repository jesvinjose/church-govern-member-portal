import jwt from "jsonwebtoken";

type MemberTokenPayload = {
    id: string;
    family_id: string;
    tenant_id?: string | null;
};

const generateJwtToken = (
    payload: object,
    secret: string,
    expiresIn: string
) => {
    return jwt.sign(payload, secret, {
        expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    });
};

export const generateMemberAccessToken = (
    payload: MemberTokenPayload
) => {
    return generateJwtToken(
        {
            ...payload,
            token_type: "access",
        },
        process.env.MEMBER_ACCESS_TOKEN_SECRET!,
        process.env.MEMBER_ACCESS_TOKEN_EXPIRE!
    );
};

export const generateMemberRefreshToken = (
    payload: MemberTokenPayload
) => {
    return generateJwtToken(
        {
            ...payload,
            token_type: "refresh",
        },
        process.env.MEMBER_REFRESH_TOKEN_SECRET!,
        process.env.MEMBER_REFRESH_TOKEN_EXPIRE!
    );
};

export const verifyMemberAccessToken = (token: string) => {
    return jwt.verify(
        token,
        process.env.MEMBER_ACCESS_TOKEN_SECRET!
    );
};

export const verifyMemberRefreshToken = (token: string) => {
    return jwt.verify(
        token,
        process.env.MEMBER_REFRESH_TOKEN_SECRET!
    );
};