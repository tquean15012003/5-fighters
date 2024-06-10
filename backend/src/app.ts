import dotenv from "dotenv";
import express, { NextFunction } from "express";
import compression from "compression";
import { Request, Response } from "express";
import cors from "cors";
import { instanceMongodb } from "./dbs/init.mongodb";
import routes from "./routes";
import { ErrorResponse } from "./core/error.response";
// import session from "express-session";
// import { app } from "./socket/socket";
dotenv.config();

const app = express();

app.use(
  cors({
    credentials: true,
    origin: ["*"],
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(
//   session({
//     secret: "secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       // sameSite: "none",
//       // httpOnly: true,
//       // secure: true,
//     },
//   })
// );
app.use(routes);

instanceMongodb();
// instanceMongodb.getConversations();

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new ErrorResponse("Not Found", 404);
  next(error);
});

app.use(
  (error: ErrorResponse, req: Request, res: Response, next: NextFunction) => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
      status: "error",
      code: statusCode,
      stack: error.stack,
      message: error.message || "Internal server error",
    });
  }
);

export default app;
