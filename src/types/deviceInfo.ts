import { DeviceType } from "@prisma/client";

export type DeviceInfo = {
    ip_address?: string;
    user_agent?: string;
    browser?: string;
    device_name?: string;
    device_type?: DeviceType;
};