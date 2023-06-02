import { expect, sinon } from "../chai.config.js";
import UserModel from "../../src/models/user.model.js";
import { HTTPError } from "../../src/helpers/error.helper.js";
import verifyMessages from "../../src/messages/verify.messages.js";
import verify from "../../src/logic/verify.logic.js";

describe("verify", () => {
  let findByIdStub;
  let verifyTokenStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(UserModel, "findById");
    verifyTokenStub = sinon
      .stub()
      .callsFake(() => ({ code: "decodedCodeMismatch" }));
  });

  afterEach(() => {
    sinon.restore();
    findByIdStub.restore();
  });

  it("[ERROR] should throw an HTTPError with code 404 if the user is not found", async () => {
    const userId = "user_id";
    const code = "tokenCode";

    findByIdStub.returns({
      select: sinon.stub().returnsThis(),
      exec: sinon.stub().resolves(null),
    });

    try {
      await verify({ userId, code });
      throw new Error("Test failed. Expected an HTTPError to be thrown.");
    } catch (error) {
      expect(error).to.be.instanceOf(HTTPError);
      expect(error.statusCode).to.equal(404);
      expect(error.name).to.equal(verifyMessages.userNotFound.name);
      expect(error.msg).to.equal(verifyMessages.userNotFound.message);
    }
  });

  it("[ERROR] should throw an HTTPError with code 400 if the user is already verified", async () => {
    const userId = "user_id";
    const code = "tokenCode";
    const foundUser = { verified: true };

    findByIdStub.returns({
      select: sinon.stub().returnsThis(),
      exec: sinon.stub().resolves(foundUser),
    });

    try {
      await verify({ userId, code });
      throw new Error("Test failed. Expected an HTTPError to be thrown.");
    } catch (error) {
      expect(error).to.be.instanceOf(HTTPError);
      expect(error.statusCode).to.equal(400);
      expect(error.name).to.equal(verifyMessages.alreadyVerified.name);
      expect(error.msg).to.equal(verifyMessages.alreadyVerified.message);
    }
  });

  it("[ERROR] should throw an HTTPError with code 404 if the user code is null or empty", async () => {
    const userId = "user_id";
    const code = "tokenCode";
    const foundUser = { verified: false, code: null };

    findByIdStub.returns({
      select: sinon.stub().returnsThis(),
      exec: sinon.stub().resolves(foundUser),
    });

    try {
      await verify({ userId, code });
      throw new Error("Test failed. Expected an HTTPError to be thrown.");
    } catch (error) {
      expect(error).to.be.instanceOf(HTTPError);
      expect(error.statusCode).to.equal(404);
      expect(error.name).to.equal(verifyMessages.codeNotFound.name);
      expect(error.msg).to.equal(verifyMessages.codeNotFound.message);
    }
  });

  it("[ERROR] should throw an HTTPError with code 400 if the decoded code does not match the input code", async () => {
    const userId = "user_id";
    const code = "tokenCode";
    const foundUser = { verified: false, code: code };

    findByIdStub.returns({
      select: sinon.stub().returnsThis(),
      exec: sinon.stub().resolves(foundUser),
    });

    try {
      await verify({ userId, code });
      throw new Error("Test failed. Expected an HTTPError to be thrown.");
    } catch (error) {
      expect(error).to.be.instanceOf(HTTPError);
      expect(error.statusCode).to.equal(400);
    }
  });
});