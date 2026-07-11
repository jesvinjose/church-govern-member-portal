import ms, { StringValue } from "ms";

export const getMemberRefreshTokenExpiry = (): Date => {

    const expiresIn =
        (process.env.MEMBER_REFRESH_TOKEN_EXPIRE ??
            "30d") as StringValue;

    return new Date(
        Date.now() + ms(expiresIn)
    );

};