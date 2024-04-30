const path = require("path");

const baseURL = process.env.APP_BASE_URL || "http://localhost:3000";
const profilePathPrefix = "public/uploads/profile_pictures";

const config = {
  environment: process.env.NODE_ENV || "development", // 'development', 'production'
  port: process.env.PORT || 3000,
  databaseUri: process.env.DB_URL,
  apiPrefix: process.env.API_PREFIX || "api",
  logLevel: process.env.LOG_LEVEL || "info", // 'error', 'warn', 'info', 'verbose', 'debug', 'silly',
  cookiesExpiryTime: process.env.COOKIE_EXPIRES_TIME,
  profile: {
    prefix: profilePathPrefix,
    basePath: `${baseURL}/${profilePathPrefix}/`,
  },
  baseURL,
  passwordPolicy: {
    rule: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{6,}$",
    min: "Must have at least 6 characters",
    message:
      "Password must contain at least one number and one uppercase and lowercase letter, and at least 6 or more characters",
  },
  rateLimitOptions: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  },
  viewEngine: {
    engine: "ejs",
    options: {
      views: path.resolve(__dirname, "../views"),
    },
  },
  cors: {
    // origin: ['http://localhost:3000','http://192.168.172.8:3000','*'],
    origin: "*",
    methods: ["DELETE", "POST", "GET", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  },
  mail: {
    driver: process.env.MAIL_DRIVER,
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    userName: process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD,
    encryption: process.env.MAIL_ENCRYPTION,
    fromAddress: process.env.MAIL_FROM_ADDRESS,
    fromName: process.env.MAIL_FROM_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiryTime: process.env.JWT_EXPIRES_TIME,
  },
};

module.exports = config;
