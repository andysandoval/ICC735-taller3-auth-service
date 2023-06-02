import jwt from "jsonwebtoken";
import { expect, sinon } from "../chai.config.js";
import {
  generateToken,
  verifyToken
} from "../../src/helpers/jwt.helper.js";

describe("JWT Token Tests", () => {
    const SECRET = "secret";
    const DEFAULT_EXPIRES = "1d";
  
    describe("generateToken", () => {
      it("[SUCCES] should generate a JWT token with the provided data", () => {
        const data = { id: 12345, username: "andy.sandoval" };
        const token = generateToken({ data });

        const decoded = jwt.verify(token, SECRET);
        const { id, username } = decoded;
        expect(id).to.equal(data.id);
        expect(username).to.equal(data.username);
      });
    });
  
    describe("verifyToken", () => {
      it("[SUCCES] should verify and decode a valid JWT token", () => {
        const data = { id: 12345, username: "andy.sandoval" };
        const token = jwt.sign(data, SECRET, { expiresIn: DEFAULT_EXPIRES });
  
        const decoded = verifyToken(token);
        const { id, username } = decoded;
        expect(id).to.equal(data.id);
        expect(username).to.equal(data.username);
      });
  
      it("[ERROR] should throw an error for an invalid JWT token", () => {
        const invalidToken = "invalid-token";
  
        expect(() => {
          verifyToken(invalidToken);
        }).to.throw(jwt.JsonWebTokenError);
      });
    });
  });