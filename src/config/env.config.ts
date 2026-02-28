const env = process.env;
export const ENV = {
    MONGO_URI: env.MONGO_URI as string,
    PORT: env.PORT || 5000,
    NODE_ENV: env.NODE_ENV || 'development',
    // JWT_SECRET: env.JWT_SECRET as string,
    ALLOWED_ORIGINS: env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173"],
    FRONTEND_URL: env.FRONTEND_URL || "http://localhost:5173",

    JWT: {
        ACCESS_SECRET: env.JWT_ACCESS_SECRET as string,
        ACCESS_EXPIRE: env.JWT_ACCESS_EXPIRE || "1h",
        REFRESH_SECRET: env.JWT_REFRESH_SECRET as string,
        REFRESH_EXPIRE: env.JWT_REFRESH_EXPIRE || "30d",
    },
    // Add these for better security:
    JWT_ISSUER: 'bunyeni-fc-api',
    JWT_AUDIENCE: 'bunyeni-fc-client',
    COOKIE_SECURE: true,  // Set to true in production(requires HTTPS)
    RATE_LIMIT_WINDOW: 900000,  // 15 minutes in ms
    RATE_LIMIT_MAX: 100,  // requests per window
    CLOUDINARY: {
        NAME: 'djzfztrig',
        KEY: '816511478531121',
        SECRET: 'jaPifLrfNYyxzb0V17TG-4nXTQU',
        URL: 'cloudinary://816511478531121:jaPifLrfNYyxzb0V17TG-4nXTQU@djzfztrig'
    },
    CLOUDINARY_CLOUD_NAME: 'djzfztrig',
    CLOUDINARY_API_KEY: '816511478531121',
    CLOUDINARY_API_SECRET: 'jaPifLrfNYyxzb0V17TG-4nXTQU'
};
