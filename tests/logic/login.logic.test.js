import { expect, sinon } from "../chai.config.js";
import UserModel from "../../src/models/user.model.js";
import { HTTPError } from "../../src/helpers/error.helper.js";
import login from "../../src/logic/login.logic.js";
import loginMessages from "../../src/messages/login.messages.js";
import checkIfUserBlocked from "../../src/logic/login.logic.js";

describe("Login Tests", () => {
  describe("login", () => {
    let findOneStub;
    let comparePasswordStub;

    beforeEach(() => {
      findOneStub = sinon.stub(UserModel, "findOne");
      comparePasswordStub = sinon.stub().returns(true);
    });

    afterEach(() => {
      findOneStub.restore();
    });

    it("should return a token and verified status when login is successful", async () => {
      const email = "email@email.com";
      const password = "password";
      const foundUser = {
        _id: "user_id",
        verified: true,
        comparePassword: comparePasswordStub,
      };
      const generateTokenStub = sinon.stub().returns("generated_token");

      findOneStub.returns({
        select: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(foundUser),
      });

      const result = await login({ email, password });
      const { token } = result;

      expect(findOneStub).to.be.calledWith({
        email: new RegExp(`^${email}$`, "i"),
      });
      expect(comparePasswordStub).to.be.calledWith(password);
      expect(result).to.deep.equal({ token: token, verified: true });
    });

    it("should throw an error when user is blocked", async () => {
      const email = "email@email.com";
      const password = "password";
      const blockedUser = {
        blocked: true,
      };
      const foundUser = {
        _id: "user_id",
        verified: true,
        comparePassword: comparePasswordStub,
      };

      findOneStub.returns({
        select: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(blockedUser),
      });

      findOneStub.returns({
        select: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(foundUser),
      });

      try {
        await login({ email, password });
        expect(comparePasswordStub).to.be.calledWith(password);
      } catch (error) {
        expect(error).to.be.instanceOf(HTTPError);
        expect(error.code).to.equal(400);
      }
    });

    it("should throw an error for invalid credentials", async () => {
      const email = "email@email.com";
      const password = "password";

      findOneStub.returns({
        select: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(null),
      });

      try {
        await login({ email, password });
      } catch (error) {
        expect(error).to.be.instanceOf(HTTPError);
      }
    });
  });

  describe("checkIfUserBlocked", () => {
    it("should throw an HTTPError with code 403 when user is blocked", () => {
      const blocked = true;
      const loginMessagesMock = {
        blocked: {
          name: "BlockedUser",
          message: "User is blocked",
        },
      };

      sinon.stub(loginMessages, "blocked").value(loginMessagesMock.blocked);

      try {
        checkIfUserBlocked({ blocked });
      } catch (error) {
        expect(error).to.be.instanceOf(HTTPError);
        expect(error.code).to.equal(403);
        expect(error.name).to.equal(loginMessagesMock.blocked.name);
        expect(error.msg).to.equal(loginMessagesMock.blocked.message);
      } finally {
        sinon.restore();
      }
    });

    it("should not throw an error when user is not blocked", () => {
      const blocked = false;

      expect(() => {
        checkIfUserBlocked({ blocked });
      }).to.not.throw();
    });
  });
});
