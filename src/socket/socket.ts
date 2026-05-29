import { Server, Socket } from "socket.io";

let io: Server;

export const initializeSocket = (server: any) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            credentials: true,
        },
    });

    io.on("connection", (socket: Socket) => {
        console.log("Socket connected:", socket.id);

        socket.on(
            "join",
            ({
                userId,
                memberId,
                tenantId,
                role,
            }: {
                userId?: string;
                memberId?: string;
                tenantId?: string;
                role?: string;
            }) => {

                // Join user room
                if (userId) {
                    socket.join(`user_${userId}`);
                }

                // Join member room
                if (memberId) {
                    socket.join(`member_${memberId}`);
                }

                // Join parish room
                if (tenantId) {
                    socket.join(`tenant_${tenantId}`);
                }

                // Join admin room
                if (tenantId && role === "ADMIN") {
                    socket.join(`tenant_${tenantId}_admins`);
                }

                console.log("Socket rooms joined successfully");
            }
        );

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }

    return io;
};