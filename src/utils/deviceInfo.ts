import { UAParser } from "ua-parser-js";
import { Request } from "express";
import { DeviceType } from "@prisma/client";

export const getDeviceInfo = (req: Request) => {

    const parser =
        new UAParser(req.get("user-agent") || "");

    const result =
        parser.getResult();

    return {

        ip_address:
            req.ip,

        user_agent:
            req.get("user-agent"),

        browser:
            result.browser.name ?? undefined,

        device_name:
            result.device.model ??
            result.os.name ??
            undefined,

        device_type:
            (() => {

                switch (result.device.type) {

                    case "mobile":
                        return DeviceType.MOBILE;

                    case "tablet":
                        return DeviceType.TABLET;

                    default:

                        if (
                            result.os.name === "Windows" ||
                            result.os.name === "macOS" ||
                            result.os.name === "Linux"
                        ) {
                            return DeviceType.DESKTOP;
                        }

                        return DeviceType.UNKNOWN;

                }

            })(),

    };

};