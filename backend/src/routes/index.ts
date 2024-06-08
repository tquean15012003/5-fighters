import { Router } from "express";
import chat from "./chat";

const routes = Router();

routes.use("/v1/api", chat);

export default routes;
