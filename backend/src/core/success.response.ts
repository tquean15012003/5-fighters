"use strict";

import { ReasonPhrases, StatusCodes } from "http-status-codes";

interface Headers {
  [key: string]: string;
}

interface Metadata {
  [key: string]: any;
}

class SuccessResponse {
  message: string;
  status: StatusCodes;
  metadata: Metadata;

  constructor({
    message,
    statusCode = StatusCodes.OK,
    reasonStatusCode = ReasonPhrases.OK,
    metadata = {},
  }: {
    message?: string;
    statusCode?: StatusCodes;
    reasonStatusCode?: ReasonPhrases;
    metadata?: Metadata;
  }) {
    this.message = !message ? reasonStatusCode : message;
    this.status = statusCode;
    this.metadata = metadata;
  }

  send(res: any, headers: Headers = {}): any {
    return res.status(this.status).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata }: { message?: string; metadata: Metadata }) {
    super({ message, metadata });
  }
}

class CREATED extends SuccessResponse {
  constructor({
    message,
    statusCode = StatusCodes.CREATED,
    reasonStatusCode = ReasonPhrases.CREATED,
    metadata,
  }: {
    message?: string;
    statusCode?: StatusCodes;
    reasonStatusCode?: ReasonPhrases;
    metadata: Metadata;
  }) {
    super({ message, statusCode, reasonStatusCode, metadata });
  }
}

export { SuccessResponse, OK, CREATED };
