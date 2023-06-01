import { expect, sinon } from "../chai.config.js";
import bcrypt from "bcrypt";
import UserModel from "../../src/models/user.model.js";
import { connectDB } from "../../src/config/mongo.js";

describe("UserModel", () => {
   describe("pre save", () => {
    const userModelStub = jest.spyOn(UserModel, "create");

	beforeAll(async () => {
		await connectDB();
	});

	beforeEach(async () => {
		await UserModel.deleteMany({});
	});

    it("should hash the password if it has been modified", (done) => {
        const user = new UserModel({
          name: "Andy Sandoval",
          email: "andy@gmail.com",
          password: "AndySandoval#",
          rut: "20365362k",
        });

        userModelStub.mockReturnValue();
  
        const isModifiedStub = sinon.stub(user, "isModified").returns(true);
        const genSaltStub = sinon.stub(bcrypt, "genSalt");
        const hashStub = sinon.stub(bcrypt, "hash");

        genSaltStub.callsFake((rounds, callback) => {
          callback(null, "salt");
        });
  
        hashStub.callsFake((password, salt, callback) => {
          callback(null, "hashedPassword");
        });
  
        user.save((err) => {
          expect(err).to.be.null;
          expect(user.password).to.equal("hashedPassword");
          expect(isModifiedStub.called).to.be.true;
          expect(genSaltStub.called).to.be.true;
          expect(hashStub.called).to.be.true;
  
          isModifiedStub.restore();
          genSaltStub.restore();
          hashStub.restore();
  
          done();
        });
      });
    });

  describe("comparePassword", () => {
    it("should return true if the candidate password matches the hashed password", async () => {
      const user = new UserModel({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        rut: "ABCD1234",
      });

      sinon.stub(bcrypt, "compareSync").returns(true);

      const result = await user.comparePassword("password123");

      expect(result).to.be.true;
      bcrypt.compareSync.restore();
    });

    it("should return false if the candidate password does not match the hashed password", async () => {
      const user = new UserModel({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        rut: "ABCD1234",
      });

      sinon.stub(bcrypt, "compareSync").returns(false);

      const result = await user.comparePassword("incorrectPassword");

      expect(result).to.be.false;
      bcrypt.compareSync.restore();
    });
  });

  describe("setVerified", () => {
    it("should set user.verified to true and remove user.code", (done) => {
      const user = new UserModel({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        rut: "ABCD1234",
        verified: false,
        code: "verificationCode",
      });

      sinon.stub(user, "save").callsFake(() => {
        user.code = null;
        user.verified = true;
      });

      user.setVerified();

      expect(user.code).to.be.null;
      expect(user.verified).to.be.true;
      expect(user.save.calledOnce).to.be.true;
      user.save.restore();
      done();
    });
  });
});
