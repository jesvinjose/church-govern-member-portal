import { Response }
    from "express";

import { catchAsync }
    from "../../utils/catchAsync";

import { sendResponse }
    from "../../utils/response";

import {
    MemberAuthRequest
} from "../../middlewares/memberAuth.middleware";

import {
    getMemberDashboardService
} from "./dashboard.service";

export const getMemberDashboard =
    catchAsync(
        async (
            req: MemberAuthRequest,
            res: Response
        ) => {

            const dashboard =
                await getMemberDashboardService(

                    req.member_id as string,

                    req.family_id as string,

                    req.tenant_id as string

                );

            return sendResponse(
                res,
                200,
                "Dashboard fetched successfully",
                dashboard
            );

        }
    );