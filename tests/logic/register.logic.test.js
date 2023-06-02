import register from "../../src/logic/register.logic.js";
import UserModel from "../../src/models/user.model.js";
import { getCriminalRecords } from "../../src/services/registro-civil.service.js";
import { sendEmail } from "../../src/services/notification.service.js";
import { HTTPError } from "../../src/helpers/error.helper.js";

jest.mock("../../src/models/user.model.js");
jest.mock("../../src/services/registro-civil.service.js");
jest.mock("../../src/services/notification.service.js");

describe("register", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("[SUCCESS] Should register a new user and return the created user ID", async () => {
    const user = {
      rut: "20365362-K",
      email: "email@email.com",
    };

    const savedUser = {
      _id: "user-id",
      email: user.email,
    };

    sendEmail.mockImplementation(() => Promise.resolve());

    UserModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    getCriminalRecords.mockResolvedValue(true);
    UserModel.prototype.save.mockResolvedValue(savedUser);

    const result = await register(user);

    expect(UserModel.findOne).toHaveBeenCalledWith({
      $or: [
        { email: new RegExp(`^${user.email}$`, "i") },
        { rut: new RegExp(`^${user.rut}$`, "i") },
      ],
    });
    expect(getCriminalRecords).toHaveBeenCalledWith(user.rut);
    expect(UserModel.prototype.save).toHaveBeenCalledWith();
    expect(sendEmail).toHaveBeenCalled();
    expect(result).toBe(savedUser._id);
  });

  it("[ERROR] Should throw an error when the user already exists", async () => {
    const user = {
      rut: "20365362-K",
      email: "email@email.com",
    };

    const foundUser = {
      email: "email@email.com",
    };

    UserModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(foundUser),
    });
    getCriminalRecords.mockResolvedValue(true);

    await expect(register(user)).rejects.toThrow(HTTPError);
  });

  it("[ERROR] Should throw an error when the RUT is not allowed", async () => {
    const user = {
      rut: "20365362-K",
      email: "email@email.com",
    };

    getCriminalRecords.mockResolvedValue(false);

    await expect(register(user)).rejects.toThrow(HTTPError);
  });

  it("[ERROR] Should throw an error when sending the email fails", async () => {
    const user = {
      rut: "20365362-K",
      email: "email@email.com",
    };

    const savedUser = {
      _id: "user-id",
      email: user.email,
      remove: jest.fn(),
    };

    const sendEmailError = new Error("Failed to send email");

    sendEmail.mockImplementation(() => Promise.reject(sendEmailError));

    UserModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    getCriminalRecords.mockResolvedValue(true);
    UserModel.prototype.save.mockResolvedValue(savedUser);

    await expect(register(user)).rejects.toThrow(sendEmailError);

    expect(savedUser.remove).toHaveBeenCalled();
  });

  it("[ERROR] Should throw an error when user already exists", async () => {
    const user = {
      rut: "20365362-K",
      email: "email@email.com",
    };

    const foundUser = {
      email: "email@email.com",
    };

    UserModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(foundUser),
    });

    await expect(register(user)).rejects.toThrow(HTTPError);
  });
});
