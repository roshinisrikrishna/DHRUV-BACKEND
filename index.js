// Import the Express framework to create and manage the web server
const express = require("express");

// Import the GracefulShutdownServer for handling graceful shutdown of the server
const { GracefulShutdownServer } = require("medusa-core-utils");

// Import the loaders from MedusaJS to initialize core components and inject dependencies
const loaders = require("@medusajs/medusa/dist/loaders/index").default;

// Import CORS to enable Cross-Origin Resource Sharing for the Express app
const cors = require("cors");

// Immediately invoked function expression (IIFE) to allow async/await at the top level
(async() => {

  // Defines an asynchronous start function to encapsulate server initialization logic
  async function start() {
    // Create an instance of Express
    const app = express();

    // Retrieves the current working directory of the process
    const directory = process.cwd();

    // Define CORS options including allowed origins
    const corsOptions = {
      origin: ['http://192.168.29.239:8000', 'https://dhruvcraftshouse.com', 'http://195.35.20.220:8000', 'https://dhruvcraftshouse.com/store', 'https://dhruvcraftshouse.com/admin'], 
    };

    // Apply CORS middleware to the Express app using the defined options
    app.use(cors(corsOptions));

    try {
      // Load Medusa core components and dependencies into the Express app
      const { container } = await loaders({
        directory,
        expressApp: app
      });

      // Resolve the configModule from the container to access configuration settings
      const configModule = container.resolve("configModule");

      // Determine the port to listen on from environment variables or the project configuration, defaulting to 9000 if neither is specified
      const port = process.env.PORT ?? configModule.projectConfig.port ?? 9000;

      // Create a server with graceful shutdown capabilities and start listening on the determined port
      const server = GracefulShutdownServer.create(
        app.listen(port, (err) => {
          if (err) {
            return;
          }
          // Log a message when the server is successfully ready and listening
          console.log(`Server is ready on port: ${port}`);
        })
      );

      // Define a function to handle graceful shutdown of the server
      const gracefulShutDown = () => {
        server
          .shutdown()
          .then(() => {
            // Log a message when the server is gracefully stopping
            console.info("Gracefully stopping the server.");
            process.exit(0); // Exit the process successfully
          })
          .catch((e) => {
            // Log an error if there's an issue shutting down the server
            console.error("Error received when shutting down the server.", e);
            process.exit(1); // Exit the process with an error code
          });
      };

      // Listen for SIGTERM signal to trigger graceful shutdown
      process.on("SIGTERM", gracefulShutDown);
      // Listen for SIGINT signal (e.g., Ctrl+C) to trigger graceful shutdown
      process.on("SIGINT", gracefulShutDown);
    } catch (err) {
      // Log any errors encountered during server startup
      console.error("Error starting server", err);
      process.exit(1); // Exit the process with an error code
    }
  }

  // Start the server
  await start();
})();
