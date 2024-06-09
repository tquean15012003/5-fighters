"use strict";

import { Request, Response, NextFunction } from "express";
import { CREATED, OK } from "../core/success.response";
import ChatService from "../services/chat.service";

export class chatController {
  static createConversation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    new CREATED({
      message: "Succesfull create a new conversation",
      metadata: await ChatService.createConversation({ ...req.body }),
    }).send(res);
  };

  static allConversation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.log(req.params.id);
    new OK({
      message: "Succesfull retrieve all conversations",
      metadata: await ChatService.allConversation(req?.params?.id),
    }).send(res);
  };

  static getConversationContent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    new OK({
      message: "Succesfull retrieve conversation content",
      metadata: await ChatService.getConversationContent(req?.params?.id),
    }).send(res);
  };

  static sendMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    new OK({
      message: "Succesfull send a new message",
      metadata: await ChatService.sendMessage({ ...req.body }),
    }).send(res);
  };
}
