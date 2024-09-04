const configs = require("../configs/configs");
const db = require("../db/db.singleton");

class SessionRepository {
    static async getSessionById(sessionId) {
        try {
            const res = await db.sql`
                SELECT session_id, user_id, created_at FROM sessions WHERE session_id = ${sessionId};
            `;
            if (res.length) {
                const [sessionData] = res;
                return {
                    session: {
                        sessionId: sessionData.session_id,
                        userId: sessionData.user_id,
                        createdAt: sessionData.created_at,
                    },
                    err: null,
                }
            }
            return {
                session: null,
                err: null,
            }
        } catch (err) {
            console.error("Error fetching session:", err);
            return {
                session: null,
                err: err,
            };
        }
    }
    static async createSession(userId) {
        try {
            const sessionMaxAge = Math.round(configs.app.sessionConfig.maxAge / 1000); // this is in seconds
            // should push expire date generation to database
            // for simplicity, this will be generated in JS code
            const expireDate = new Date();
            expireDate.setSeconds(expireDate.getSeconds() + sessionMaxAge);
            const res = await db.sql`
                INSERT INTO sessions (user_id, expires_at) 
                VALUES (
                    ${userId}, 
                    ${expireDate}
                )
                RETURNING session_id;
            `;
            const [sessionData] = res;
            return {
                sessionId: sessionData.session_id,
                err: null,
            }
        } catch (err) {
            console.error("Error creating session:", err);
            return {
                sessionId: null,
                err: err,
            }
        }
    }
    static async deleteSession(sessionId) {
        try {
            await db.sql`
                DELETE FROM sessions WHERE session_id = ${sessionId};
            `;
            return {
                err: null,
            }
        } catch (err) {
            console.error("Error deleting session:", err);
            return {
                err: err,
            }
        }
    }
    static async invalidateSessions(userId) {
        try {
            await db.sql`
                DELETE FROM sessions WHERE user_id = ${userId};
            `;
            return {
                err: null
            };
        } catch (err) {
            console.log("Error deleting all sessions of user:", err);
            return {
                err: err
            };
        }
    }
    static async getActiveSessions(userId) {
        try {
            const res = await db.sql`
                SELECT session_id, expires_at
                FROM sessions
                WHERE user_id = ${userId} AND expires_at > CURRENT_TIMESTAMP;
            `;
            const sessions = res.map(session => {
                return {
                    sessionId: session.session_id,
                    expiresAt: session.expires_at,
                }
            })
            return {
                sessions: sessions,
                err: null,
            }
        } catch (err) {
            console.error("Error getting active sessions:", err);
            return {
                sessions: null,
                err: err,
            }
        }
    }
    static async getUserBySession(sessionId) {
        try {
            const res = await db.sql`
                SELECT sessions.user_id, email, verified
                FROM (
                    SELECT session_id, user_id, expires_at
                    FROM sessions
                    WHERE session_id = ${sessionId} AND expires_at > CURRENT_TIMESTAMP
                ) sessions
                JOIN users
                ON sessions.user_id = users.user_id;
            `;
            if (res.length) {
                const [sessionData] = res;
                return {
                    user: {
                        userId: sessionData.user_id,
                        email: sessionData.email,
                        verified: sessionData.verified,
                        role: sessionData.role,
                    },
                    err: null,
                }
            }
            return {
                user: null,
                err: null,
            }
        } catch (err) {
            console.error("Error getting user by session:", err);
            return {
                user: null,
                err: err,
            }
        }
    }
}

module.exports = SessionRepository;