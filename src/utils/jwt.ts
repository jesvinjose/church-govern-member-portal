import jwt from "jsonwebtoken";

export const generateToken = (payload: {
  id: string;
  email: string;
  roles: string[];
  tenant_id?: string | null;
  token_type: string,
}) => {
  const jwtExpire =
    process.env.JWT_EXPIRE || "7d";
  return jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    {
      expiresIn: jwtExpire as jwt.SignOptions["expiresIn"],
    }
  );
};