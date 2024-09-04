// write session handler
const sessionRepo = require("../repositories/session.repositories");
const { StatusCodes: status } = require("http-status-codes");

class SessionService {
    static async createSession({ userId }) {
        const createResult = await sessionRepo.createSession(userId);
        if (createResult.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                sessionId: null,
                message: "server error",
            }
        }
        return {
            status: status.CREATED,
            sessionId: createResult.sessionId,
            message: "ok",
        }
    }
    static async deleteSession(sessionId) {
        const deleteResult = await sessionRepo.deleteSession(sessionId);
        if (deleteResult.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                success: false,
                message: "server error",
            }
        }
        return {
            status: status.OK,
            success: true,
            message: "ok",
        }
    }
    static async getUserBySessionId(sessionId) {
        const userResult = await sessionRepo.getUserBySession(sessionId);
        if (userResult.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                user: null,
                message: "server error",
            }
        } 
        return {
            status: status.OK,
            user: userResult.user,
            message: "ok",
        }
    }
}

module.exports = SessionService;