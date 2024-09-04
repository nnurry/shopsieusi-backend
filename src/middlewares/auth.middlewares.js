const { StatusCodes: status } = require("http-status-codes");
const sessionService = require("../services/session.services");
const configs = require("../configs/configs");

const deleteCookieConfig = {};
for (key in configs.app.sessionConfig) {
    if (key != "maxAge") {
        deleteCookieConfig[key] = configs.app.sessionConfig[key];
    }
}

async function checkSession(req, res, next) {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) {
        return res.status(status.NOT_FOUND).json({
            status: status.NOT_FOUND,
            message: "session not found",
        })
    }
    const userResult = await sessionService.getUserBySessionId(sessionId);
    if (userResult.user != null) {
        const { user } = userResult;
        req.body.user = {
            // i limit to only these 2 fields
            userId: user.userId,
            role: user.role,
        };
        next();
    }
    else {
        // i don't care if there is error or not, will just clear cookie anyway
        await sessionService.deleteSession(sessionId);
        res.clearCookie("sessionId", deleteCookieConfig);
        return res.status(status.NOT_FOUND).json({
            status: status.NOT_FOUND,
            message: "session not found",
        })
    }
}

module.exports = { checkSession };