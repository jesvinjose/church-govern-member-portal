import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import { s3Client } from "../config/s3";

export const uploadToSpaces = async (
    file: Express.Multer.File
) => {
    const fileName =
        `requests/${uuid()}-${file.originalname}`;

    await s3Client.send(
        new PutObjectCommand({
            Bucket: process.env.DO_SPACES_BUCKET,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read",
        })
    );

    return `${process.env.DO_SPACES_CDN}/${fileName}`;
};