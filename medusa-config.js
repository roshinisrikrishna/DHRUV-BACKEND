// Import the dotenv package to load environment variables from a file
const dotenv = require("dotenv");

// Initialize a variable to hold the name of the environment file
let ENV_FILE_NAME = "";

// Switch statement to set the ENV_FILE_NAME based on the NODE_ENV environment variable
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = ".env.production"; // Set for production environment
    break;
  case "staging":
    ENV_FILE_NAME = ".env.staging"; // Set for staging environment
    break;
  case "test":
    ENV_FILE_NAME = ".env.test"; // Set for test environment
    break;
  case "development":
  default:
    ENV_FILE_NAME = ".env"; // Default to .env for development or unspecified environment
    break;
}

// Try to load environment variables from the specified file, catching any errors silently
try {
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {}

// Define CORS options for the admin panel, with a default value
const ADMIN_CORS =
  process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

// Define CORS options for the store, with a default value
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000,http://195.35.20.220:8000,,https://dhruvcraftshouse.com";

// Define database connection variables, defaulting to environment variables
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_DATABASE = process.env.DB_DATABASE;

// Explicitly define a DATABASE_URL, not currently utilizing the above DB variables
const DATABASE_URL = 
  `postgres://postgres:new_password@195.35.20.220:5432/medusa_backend_db`;

// Define the REDIS_URL, with a default value
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Array of plugins for Medusa, including their configurations
const plugins = [
  // Manual fulfillment plugin
  `medusa-fulfillment-manual`,
  // Manual payment plugin
  `medusa-payment-manual`,
  // Local file storage plugin configuration
  {
    resolve: `@medusajs/file-local`,
    options: {
      upload_dir: "uploads",
    },
  },
  // Admin panel plugin configuration
  {
    resolve: "@medusajs/admin",
    options: {
      autoRebuild: true, // Automatically rebuild on changes
      develop: {
        open: process.env.OPEN_BROWSER !== "false", // Control browser auto-opening
      },
    },
  },
];

// Modules object, currently commented out. Could be used for additional configurations
const modules = {
  /*eventBus: {
    resolve: "@medusajs/event-bus-redis",
    options: {
      redisUrl: REDIS_URL
    }
  },
  cacheService: {
    resolve: "@medusajs/cache-redis",
    options: {
      redisUrl: REDIS_URL
    }
  },*/
};

// Project configuration for Medusa
const projectConfig = {
  // JWT secret for authentication
  jwtSecret: process.env.JWT_SECRET,
  // Cookie secret for securing cookies
  cookieSecret: process.env.COOKIE_SECRET,
  // Store CORS options
  store_cors: STORE_CORS,
  // Database URL for connecting to the database
  database_url: DATABASE_URL,
  // Admin CORS options
  admin_cors: ADMIN_CORS,
  // Additional database options, enabling SSL for non-development environments
  database_extra: process.env.NODE_ENV !== "development" ?
  {
    ssl: {
      rejectUnauthorized: false,
    },
  } : {},
  // Uncomment the following lines to enable REDIS
  // redis_url: REDIS_URL
};

// Export the configuration module, including feature flags, project configuration, plugins, and modules
module.exports = {
  featureFlags: {
    product_categories: true, // Enable product categories feature
  },
  projectConfig,
  plugins,
  modules,
};
