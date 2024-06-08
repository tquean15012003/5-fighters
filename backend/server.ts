import { httpServer } from "./src/socket/socket";

const PORT = process.env.PORT || 3100;

const server = httpServer.listen(3100, "0.0.0.0", () => {
  console.log(`Connected port :: 3100`);
});
