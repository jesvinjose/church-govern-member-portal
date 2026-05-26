import jwt from "jsonwebtoken";

export const generateMemberToken = (
    payload: {
        member_id: string;
        family_id: string;
        tenant_id?: string | null;
    }
) => {

    return jwt.sign(
        payload,
        process.env.JWT_SECRET as string,
        {
            expiresIn:
                process.env.JWT_EXPIRE as jwt.SignOptions["expiresIn"],
        }
    );

};