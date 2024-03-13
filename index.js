const express = require("express");
const { GracefulShutdownServer } = require("medusa-core-utils");
const loaders = require("@medusajs/medusa/dist/loaders/index").default;
const cors = require("cors"); // Import CORS

(async() => {
  async function start() {
    const app = express();
    const directory = process.cwd();

    // Define CORS options
    const corsOptions = {
      origin: ['http://192.168.29.239:8000','https://dhruvcraftshouse.com','http://195.35.20.220:8000','https://dhruvcraftshouse.com/store','https://dhruvcraftshouse.com/admin'], // Allowed origins
    };

    app.use(cors(corsOptions)); // Use CORS middleware with specified options

    try {
      const { container } = await loaders({
        directory,
        expressApp: app
      });
      const configModule = container.resolve("configModule");
      const port = process.env.PORT ?? configModule.projectConfig.port ?? 9000;

      const server = GracefulShutdownServer.create(
        app.listen(port, (err) => {
          if (err) {
            return;
          }
          console.log(`Server is ready on port: ${port}`);
        })
      );

      // Handle graceful shutdown
      const gracefulShutDown = () => {
        server
          .shutdown()
          .then(() => {
            console.info("Gracefully stopping the server.");
            process.exit(0);
          })
          .catch((e) => {
            console.error("Error received when shutting down the server.", e);
            process.exit(1);
          });
      };
      process.on("SIGTERM", gracefulShutDown);
      process.on("SIGINT", gracefulShutDown);
    } catch (err) {
      console.error("Error starting server", err);
      process.exit(1);
    }
  }

  await start();
})();
