// import { httpServer } from "./src/socket/socket";

import app from "./src/app";

const PORT = process.env.PORT || 3100;

const server = app.listen(3100, "0.0.0.0", () => {
  console.log(`Connected port :: 3100`);
});
