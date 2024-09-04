const configs = require("../configs/configs");
const UserRoles = require("../constants/user-roles.constants");
const { StatusCodes: status } = require("http-status-codes");
const { checkPresenceObject } = require("../helpers/utils");

const sessionService = require("../services/session.services");
const userService = require("../services/user.services");

const deleteCookieConfig = {};
for (key in configs.app.sessionConfig) {
    if (key != "maxAge") {
        deleteCookieConfig[key] = configs.app.sessionConfig[key];
    }
}

class UserController {
    static async checkSession(req, res) {
        const sessionId = req.cookies.sessionId;
        const userResult = await sessionService.getUserBySessionId(sessionId);
        if (userResult.user != null) {
            const { user } = userResult;
            return res.status(status.OK).json({
                status: status.OK,
                user: {
                    // i limit to only these 2 fields
                    userId: user.userId,
                    role: user.role,
                },
                message: "ok",
            });
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

    static async login(req, res) {
        const validateFields = ["email", "password"];
        const validatedBody = checkPresenceObject(req.body, validateFields);

        if (validatedBody == null) {
            return res.status(status.BAD_REQUEST).json({
                status: status.BAD_REQUEST,
                user: null,
                message: "invalid body",
            })
        }
        const signInResult = await userService.signIn({ ...validatedBody });
        if (signInResult.status === status.OK) {
            // update session
            const { user } = signInResult;
            const sessionResult = await sessionService.createSession({ userId: user.userId });
            if (sessionResult.status === status.INTERNAL_SERVER_ERROR) {
                return res.status(sessionResult.status).json({
                    status: sessionResult.status,
                    user: null,
                    message: sessionResult.message,
                });
            }
            res.cookie("sessionId", sessionResult.sessionId, configs.app.sessionConfig);
            let expirationTime = new Date().getTime() + configs.app.sessionConfig.maxAge;
            expirationTime = new Date(expirationTime);
            return res.status(status.OK).json({
                status: status.OK,
                user: {
                    userId: user.userId,
                    expiration: expirationTime,
                    role: user.role,
                },
                message: "ok", // custom message since it goes through auth service and session service
            });
        }

        return res.status(signInResult.status).json({
            status: signInResult.status,
            user: null,
            message: signInResult.message,
        });
    }
    static async logout(req, res) {
        const sessionId = req.cookies.sessionId;
        if (!sessionId || sessionId == "undefined") {
            // session token not present in cookies
            return res.status(status.BAD_REQUEST).json({
                status: status.BAD_REQUEST,
                success: false,
                message: "no session cookie found",
            });
        }

        const deleteResult = await sessionService.deleteSession(sessionId);
        if (deleteResult.status === status.OK) {
            // remove cookie from user
            const deleteCookieConfig = {};
            for (key in configs.app.sessionConfig) {
                if (key != "maxAge") {
                    deleteCookieConfig[key] = configs.app.sessionConfig[key];
                }
            }
            res.clearCookie("sessionId", deleteCookieConfig);
        }
        return res.status(deleteResult.status).json(deleteResult);
    }
    static async signup(req, res) {
        const validateFields = ["firstName", "lastName", "email", "password"];
        const validatedBody = checkPresenceObject(req.body, validateFields);

        if (validatedBody == null) {
            return res.status(status.BAD_REQUEST).json({
                status: status.BAD_REQUEST,
                userId: null,
                message: "invalid body",
            })
        }
        const signUpResult = await userService.signUp({ ...validatedBody, role: UserRoles.USER });
        return res.status(signUpResult.status).json(signUpResult);
    }
    // separate logic from normal signup
    static async adminCreateUser(req, res) {
        const validateFields = ["firstName", "lastName", "email", "password", "role"];
        const validatedBody = checkPresenceObject(req.body, validateFields);

        if (validatedBody == null) {
            return res.status(status.BAD_REQUEST).json({
                status: status.BAD_REQUEST,
                user: null,
                message: "invalid body",
            })
        }

        const stringRoles = Object.values(UserRoles);
        if (stringRoles.findIndex((val) => val == validatedBody.role) < 0) {
            // input role is not in pre-defined roles
            return res.status(status.BAD_REQUEST).json({
                status: status.BAD_REQUEST,
                user: null,
                message: `invalid role (${validatedBody.role} not in ${stringRoles.join(", ")})`, // safe to send this to admin
            })
        }

        const signUpResult = await userService.signUp({ ...validatedBody });
        return res.status(signUpResult.status).json(signUpResult);
    }

    static async getRoles(req, res) {
        const stringRoles = Object.values(UserRoles);
        return res.status(status.OK).json({
            status: status.OK,
            roles: stringRoles,
            message: "ok",
        })
    }

    static async getAllUsers(req, res) {
        const findResult = await userService.getAllUsers();
        return res.status(findResult.status).json(findResult);
    }

    static async softDeleteUser(req, res) {
        const userId = req.params.userId;
        const deleteResult = await userService.softDeleteUser(userId)
        return res.status(deleteResult.status).json(deleteResult);
    }
    
    static async changeUserPassword(req, res) {
        const {isAdmin, oldPassword, newPassword} = req.body;
        const userId = req.params.userId;
        const changeResult = await userService.changeUserPassword(
            userId, 
            oldPassword, 
            newPassword, 
            isAdmin,
        );
        return res.status(changeResult.status).json(changeResult);
    }
}

module.exports = UserController;