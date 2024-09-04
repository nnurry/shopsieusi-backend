const bcrypt = require("bcrypt");
const userRepo = require("../repositories/user.repositories");
const { StatusCodes: status } = require("http-status-codes");

class UserService {
    static async signIn({ email, password }) {
        const findResult = await userRepo.findUserByEmail(email);
        if (findResult.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                user: null,
                message: "server error",
            }
        }
        if (findResult.user == null) {
            return {
                status: status.NOT_FOUND,
                user: null,
                message: "user not found",
            }
        }
        try {
            const identical = await bcrypt.compare(password, findResult.user.passwordHash);
            if (identical) {
                return {
                    status: status.OK,
                    user: findResult.user,
                    message: "ok",
                }
            }
            return {
                status: status.UNAUTHORIZED,
                user: null,
                message: "wrong password",
            }
        } catch (err) {
            console.error("Error comparing password:", err);
            return {
                status: status.INTERNAL_SERVER_ERROR,
                user: null,
                message: "server error",
            }
        }
    }
    static async signUp({ firstName, lastName, email, password, role }) {
        const userExists = await userRepo.findUserIdByEmail(email);
        if (userExists.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                user: null,
                message: "server error",
            }
        }
        if (userExists.userId != null) {
            return {
                status: status.CONFLICT,
                user: null,
                message: "user existed",
            }
        }

        // 10 salt-round is balanced for security and computational complexity
        const saltRounds = 10;
        try {
            const salt = await bcrypt.genSalt(saltRounds);
            const passwordHash = await bcrypt.hash(password, salt);
            // add into DB with given payload
            const userPayload = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                passwordHash: passwordHash,
                verified: false,
                role: role,
            };
            const insertedUser = await userRepo.createUser(userPayload);
            // if no result is returned
            if (insertedUser.err != null) {
                return {
                    status: status.INTERNAL_SERVER_ERROR,
                    user: null,
                    message: "server error",
                }
            }
            return {
                status: status.CREATED,
                user: userPayload,
                message: "ok",
            }
        } catch (err) {
            console.error("Error generating password hash:", err);
            return {
                status: status.INTERNAL_SERVER_ERROR,
                user: null,
                message: "server error",
            }
        }
    }
    static async getAllUsers() {
        const findResult = await userRepo.findAll();
        if (findResult.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                users: null,
                message: "server error",
            }
        }
        const users = findResult.users.map(({ passwordHash, ...rest }) => rest);
        return {
            status: status.OK,
            users: users,
            message: "ok",
        }
    }
    static async softDeleteUser(userId) {
        const res = await userRepo.softDeleteUser(userId);
        if (res.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                user: null,
                message: "server error",
            };
        }

        if (res.user != null) {
            return {
                status: status.OK,
                user: res.user,
                message: "ok",
            };
        }

        // Product not found
        return {
            status: status.NOT_FOUND,
            user: null,
            message: "user not found",
        };
    }
    static async changeUserPassword(userId, oldPassword, newPassword, isAdmin) {
        if (!isAdmin) {
            const findResult = await userRepo.findPwdHashByUserId(userId);
            if (findResult.err != null) {
                return {
                    status: status.INTERNAL_SERVER_ERROR,
                    message: "server error",
                }
            }

            const identical = await bcrypt.compare(oldPassword, findResult.passwordHash);
            if (!identical) {
                return {
                    status: status.BAD_REQUEST,
                    message: "password doesn't match",
                }
            }
        }
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(newPassword, salt);
        const result = await userRepo.updatePassword(userId, passwordHash);
        // if no result is returned
        if (result.err != null) {
            return {
                status: status.INTERNAL_SERVER_ERROR,
                message: "server error",
            }
        }
        return {
            status: status.OK,
            message: "ok",
        }
    }
}

module.exports = UserService;