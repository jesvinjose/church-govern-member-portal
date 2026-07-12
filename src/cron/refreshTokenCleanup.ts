import cron from "node-cron";
import prisma from "../config/prisma";

export const startRefreshTokenCleanup = () => {

    console.log("🧹 Refresh Token Cleanup Cron Started");

    cron.schedule(
        "0 3 * * *",
        async () => {

            console.log(
                "Cleaning refresh tokens..."
            );

            const cutoffDate = new Date();

            cutoffDate.setDate(
                cutoffDate.getDate() - 30
            );

            const result =
                await prisma.memberRefreshToken.deleteMany({

                    where: {

                        OR: [

                            {
                                revoked: true,
                                updated_at: {
                                    lt: cutoffDate,
                                },
                            },

                            {
                                expires_at: {
                                    lt: cutoffDate,
                                },
                            },

                        ],

                    },

                });

            console.log(
                `${result.count} refresh tokens removed`
            );

        }
    );

};