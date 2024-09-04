let corsOrigins = process.env.CORS_ORIGINS;

if (corsOrigins == undefined) {
    corsOrigins = [];
} else {
    corsOrigins = corsOrigins.split(",").map(origin => origin.trim());
}

const config = {
    db: {
        connStr: process.env.DB_CONN_STR || "",
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || "postgres",
        username: process.env.DB_USER || "postgres",
        password: process.env.DB_PASS || "postgres",
        max: Number(process.env.DB_POOL_MAX) || 10,
        idleTimeout: Number(process.env.DB_IDLE_TIMEOUT) || 30,
    },
    app: {
        port: Number(process.env.APP_PORT) || 5000,
        sessionSecret: process.env.EXPRESS_SESSION_SECRET || "will not be this secret",
        sessionConfig: {
            maxAge: Number(process.env.EXPRESS_SESSION_AGE) || 600000,
            secure: true,
            httpOnly: true,
        },
        corsConfig: {
            origin: corsOrigins || ["http://localhost:3000"],
            credentials: true,
        },
        awsConfig: {
            regionName: process.env.AWS_REGION || "ap-southeast-1",
            accessKey: process.env.AWS_ACCESS_KEY_ID || "",
            secretKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        },
        s3Config: {
            bucketName: process.env.AWS_S3_BUCKET_NAME || "",
            pathPrefix: process.env.AWS_S3_PATH_PREFIX || "/",
        },
    }
}

module.exports = config;