"use strict";

import { Request, Response, NextFunction } from "express";
import { CREATED, OK } from "../core/success.response";
import ChatService from "../services/chat.service";

export class chatController {
  static testing = async (req: Request, res: Response, next: NextFunction) => {
    new OK({
      message: "Succesfull testing",
      metadata: await ChatService.testing,
    }).send(res);
  };
}
