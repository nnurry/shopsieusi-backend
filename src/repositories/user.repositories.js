const db = require("../db/db.singleton");

class UserRepository {
    static async findUserIdByEmail(email) {
        try {
            const res = await db.sql`
                SELECT
                    user_id
                FROM users
                WHERE email = ${email}
                AND is_deleted = false;
            `;
            if (res.length > 0) {
                const [userData] = res;
                return {
                    userId: userData.user_id,
                    err: null,
                }
            }
            return {
                userId: null,
                err: null,
            }
        } catch (err) {
            console.error("Error checking email:", err);
            return {
                userId: null,
                err: err,
            }
        }
    }
    static async findPwdHashByEmail(email) {
        try {
            const res = await db.sql`
                SELECT 
                    password_hash 
                FROM users 
                WHERE email = ${email}
                AND is_deleted = false;
            `;
            if (res.length > 0) {
                const [userData] = res;
                return {
                    passwordHash: userData.password_hash,
                    err: null,
                }
            }
            return {
                passwordHash: null,
                err: null,
            }
        } catch (err) {
            console.error("Error fetching pwd hash:", err);
            return {
                passwordHash: null,
                err: err,
            }
        }
    }

    static async findPwdHashByUserId(userId) {
        try {
            const res = await db.sql`
                SELECT 
                    password_hash 
                FROM users 
                WHERE user_id = ${userId}
                AND is_deleted = false;
            `;
            if (res.length > 0) {
                const [userData] = res;
                return {
                    passwordHash: userData.password_hash,
                    err: null,
                }
            }
            return {
                passwordHash: null,
                err: null,
            }
        } catch (err) {
            console.error("Error fetching pwd hash:", err);
            return {
                passwordHash: null,
                err: err,
            }
        }
    }

    static async findUserByEmail(email) {
        try {
            const res = await db.sql`
                SELECT 
                    user_id, first_name, last_name,
                    password_hash, verified, role
                FROM users 
                WHERE email = ${email}
                AND is_deleted = false;
            `;
            if (res.length > 0) {
                const [userData] = res;
                return {
                    user: {
                        userId: userData.user_id,
                        firstName: userData.first_name,
                        lastName: userData.last_name,
                        email: userData.email,
                        passwordHash: userData.password_hash,
                        verified: userData.verified,
                        role: userData.role,
                    },
                    err: null,
                }
            }
            return {
                user: null,
                err: null,
            };
        } catch (err) {
            console.error("Error fetching user:", err);
            return {
                user: null,
                err: err,
            }
        }
    }
    static async createUser({ firstName, lastName, email, passwordHash, verified, role }) {
        // add into DB with given payload
        try {
            const res = await db.sql`
                INSERT INTO users (
                    first_name, last_name,
                    email, password_hash,
                    verified, role
                ) 
                VALUES (
                    ${firstName}, ${lastName},
                    ${email}, ${passwordHash},
                    ${verified}, ${role}
                )
                RETURNING user_id;
            `;
            const [newUser] = res;
            return {
                userId: newUser.user_id,
                err: null,
            };
        } catch (err) {
            console.error("Error creating user:", err);
            return {
                userId: null,
                err: err,
            };
        }
    }
    static async findAll() {
        // add into DB with given payload
        try {
            const res = await db.sql`
                SELECT 
                    user_id, first_name, last_name, 
                    email, password_hash, verified, role
                FROM users
                WHERE is_deleted = false;
            `;
            const users = res.map(user => {
                return {
                    userId: user.user_id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    passwordHash: user.password_hash,
                    verified: user.verified,
                    role: user.role,
                }
            })
            return {
                users: users,
                err: null,
            };
        } catch (err) {
            console.error("Error listing users:", err);
            return {
                users: null,
                err: err,
            };
        }
    }
    static async softDeleteUser(userId) {
        try {
            const res = await db.sql`
                UPDATE users
                SET is_deleted = TRUE, updated_at = now()
                WHERE user_id = ${userId}
                RETURNING user_id
            `;

            if (res.length !== 0) {
                const [deletedUser] = res;
                return {
                    user: {
                        userId: deletedUser.user_id,
                    },
                    err: null
                };
            }
            return {
                user: null,
                err: null,
            };
        } catch (err) {
            console.error("Error soft deleting user:", err);
            return {
                user: null,
                err: err,
            };
        }
    }
    static async updatePassword(userId, passwordHash) {
        try {
            const res = await db.sql`
                UPDATE users
                SET password_hash = ${passwordHash}, updated_at = NOW()
                WHERE user_id = ${userId}
                RETURNING user_id, email
            `;
            if (res.length !== 0) {
                const [updatedUser] = res;
                return {
                    user: {
                        userId: updatedUser.user_id,
                        email: updatedUser.email,
                    },
                    err: null
                };
            }
            return {
                user: null,
                err: null,
            };
        } catch (err) {
            console.error("Error changing user password:", err);
            return {
                user: null,
                err: err,
            };
        }
    }
}

module.exports = UserRepository;