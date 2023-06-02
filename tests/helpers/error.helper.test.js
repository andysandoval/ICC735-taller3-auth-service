import { expect, sinon } from "../chai.config";
import { JsonWebTokenError } from "jsonwebtoken";
import {
  HTTPError,
  returnErrorResponse,
  isBusinessError,
} from "../../src/helpers/error.helper.js";

describe("Helper: returnErrorResponse", () => {
  const mockResponse = () => {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    return res;
  };

  it("[ERROR] Should return HTTPError response when error is an instance of HTTPError", () => {
    const error = new HTTPError({
      name: "TestError",
      msg: "This is a test error",
      code: 400,
    });

    const res = mockResponse();

    returnErrorResponse(error, res);

    expect(res.status).to.be.calledWith(400);
    expect(res.json).to.be.calledWith({ error: { ...error } });
  });

  it("[ERROR] Should return JWTError response when error is an instance of JsonWebTokenError", () => {
    const error = new JsonWebTokenError("Invalid token");

    const res = mockResponse();

    returnErrorResponse(error, res);

    const jwtError = new HTTPError({
      name: error.name,
      msg: error.message,
      code: 403,
    });

    expect(res.status).to.be.calledWith(403);
    expect(res.json).to.be.calledWith({ error: { ...jwtError } });
  });

  it("[ERROR] Should return generic error response with status code 500 for other errors", () => {
    const error = new Error("Internal server error");

    const res = mockResponse();

    returnErrorResponse(error, res);

    expect(res.status).to.be.calledWith(500);
    expect(res.json).to.be.calledWith({ error: error.toString() });
  });
});

describe("Helper: isBusinessError", () => {
  it("[SUCCESS] Should return true if the error has a status code starting with '4'", () => {
    const error = {
      statusCode: 404,
    };

    const result = isBusinessError(error);

    expect(result).to.be.true;
  });

  it("[ERROR] Should return false if the error does not have a status code starting with '4'", () => {
    const error = {
      statusCode: 500,
    };

    const result = isBusinessError(error);

    expect(result).to.be.false;
  });

  it("[ERROR] Should return false if the error does not have a status code", () => {
    const error = new Error("Internal server error");

    const result =
      error.statusCode !== undefined &&
      Number(error.statusCode) >= 400 &&
      Number(error.statusCode) <= 499;

    expect(result).to.be.false;
  });
});