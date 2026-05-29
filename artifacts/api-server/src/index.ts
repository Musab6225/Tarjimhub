import app from "./app.js";
import { logger } from "./lib/logger.js";
import { env } from "./lib/env.js";

const port = env.PORT;

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
