import prisma from "../../config/prisma";
import {
    announcementCount,
    recentAnnouncements
} from "../broadcast/broadcast.service";

import {
    getContributionSummaryService
} from "../contributions/contributions.service";

export const getMemberDashboardService =
    async (
        member_id: string,
        family_id: string,
        tenant_id: string
    ) => {

        // Family Summary

        const family =
            await prisma.family.findFirst({

                where: {
                    id: family_id,
                    tenant_id,
                },

                include: {
                    members: true,
                },

            });

        // Contribution Summary

        const contribution_summary =
            await getContributionSummaryService(
                member_id,
                tenant_id
            );

        // Announcement Count

        const announcements_count =
            await announcementCount(
                tenant_id
            );

        // Recent Announcements

        const recent_announcements =
            await recentAnnouncements(
                tenant_id
            );
        return {

            family_summary: {

                family_name:
                    family?.name || "",

                members_count:
                    family?.members.length || 0,

            },

            contribution_summary,

            announcement_summary: {

                count:
                    announcements_count,

            },

            recent_announcements,

        };

    };