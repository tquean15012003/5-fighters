"use strict";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

class ErrorResponse extends Error {
  status: StatusCodes;

  constructor(message: string, status: StatusCodes) {
    super(message);
    this.status = status;
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor(
    message: string = ReasonPhrases.CONFLICT,
    status: StatusCodes = StatusCodes.CONFLICT
  ) {
    super(message, status);
  }
}

class BadRequestError extends ErrorResponse {
  constructor(
    message: string = ReasonPhrases.FORBIDDEN,
    status: StatusCodes = StatusCodes.FORBIDDEN
  ) {
    super(message, status);
  }
}

class AuthFailureError extends ErrorResponse {
  constructor(
    message: string = ReasonPhrases.UNAUTHORIZED,
    status: StatusCodes = StatusCodes.UNAUTHORIZED
  ) {
    super(message, status);
  }
}

class NotFoundError extends ErrorResponse {
  constructor(
    message: string = ReasonPhrases.NOT_FOUND,
    status: StatusCodes = StatusCodes.NOT_FOUND
  ) {
    super(message, status);
  }
}
class ForbiddenError extends ErrorResponse {
  constructor(
    message: string = ReasonPhrases.FORBIDDEN,
    status: StatusCodes = StatusCodes.FORBIDDEN
  ) {
    super(message, status);
  }
}

export {
  ErrorResponse,
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError,
};
