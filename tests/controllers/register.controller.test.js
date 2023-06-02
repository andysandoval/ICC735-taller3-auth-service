import register from "../../src/controllers/register.controller.js";
import { expect, sinon } from "../chai.config.js";
import * as RegisterLogic from "../../src/logic/register.logic.js";
import registerMessages from "../../src/messages/register.messages.js";
import { HTTPError } from "../../src/helpers/error.helper.js";

describe("Controller: Register", () => {
	const mockResponse = () => {
		const res = {};
		res.status = sinon.stub().returns(res);
		res.json = sinon.stub().returns(res);
		return res;
	};

	let registerLogicStub;

	beforeEach(() => {
		registerLogicStub = sinon.stub(RegisterLogic, "default");
	});

	afterEach(() => {
		registerLogicStub.restore();
	});

	it("[ERROR] Should throw an error when the email doesn't exists in the body", async () => {
		const req = {
			body: {
				password: "password",
				name: "name",
				rut: "rut",
			},
		};

		const httpError = new HTTPError({
			name: registerMessages.validation.name,
			msg: registerMessages.validation.messages.email,
			code: 400,
		});

		const res = mockResponse();

		await register(req, res);
		expect(res.status).to.be.calledWith(400);
		expect(res.json).to.be.calledWith({ error: { ...httpError } });
		expect(registerLogicStub).to.not.be.called;
	});

	it("[ERROR] Should throw an error when the password doesn't exists in the body", async () => {
		const req = {
			body: {
				email: "email@email.com",
				name: "name",
				rut: "rut",
			},
		};

		const httpError = new HTTPError({
			name: registerMessages.validation.name,
			msg: registerMessages.validation.messages.password,
			code: 400,
		});

		const res = mockResponse();

		await register(req, res);
		expect(res.status).to.be.calledWith(400);
		expect(res.json).to.be.calledWith({ error: { ...httpError } });
		expect(registerLogicStub).to.not.be.called;
	});

	it("[ERROR] Should throw an error when the rut doesn't exists in the body", async () => {
		const req = {
			body: {
				email: "email@email.com",
				name: "name",
				password: "password",
			},
		};

		const httpError = new HTTPError({
			name: registerMessages.validation.name,
			msg: registerMessages.validation.messages.rut,
			code: 400,
		});

		const res = mockResponse();

		await register(req, res);
		expect(res.status).to.be.calledWith(400);
		expect(res.json).to.be.calledWith({ error: { ...httpError } });
		expect(registerLogicStub).to.not.be.called;
	});

	it("[ERROR] Should throw an error when the name doesn't exists in the body", async () => {
		const req = {
			body: {
				email: "email@email.com",
				rut: "rut",
				password: "password",
			},
		};

		const httpError = new HTTPError({
			name: registerMessages.validation.name,
			msg: registerMessages.validation.messages.name,
			code: 400,
		});

		const res = mockResponse();

		await register(req, res);
		expect(res.status).to.be.calledWith(400);
		expect(res.json).to.be.calledWith({ error: { ...httpError } });
		expect(registerLogicStub).to.not.be.called;
	});

	it("[ERROR] Should throw an error when the password doesn't has numbers", async () => {
		const req = {
			body: {
				email: "email@email.com",
				rut: "rut",
				password: "asdasd",
				name: "name",
			},
		};

		const httpError = new HTTPError({
			name: registerMessages.validation.name,
			msg: registerMessages.validation.messages.weakPassword,
			code: 400,
		});

		const res = mockResponse();

		await register(req, res);
		expect(res.status).to.be.calledWith(400);
		expect(res.json).to.be.calledWith({ error: { ...httpError } });
		expect(registerLogicStub).to.not.be.called;
	});

	it("[ERROR] Should throw an error when the password doesn't has a capital letter", async () => {
		const req = {
			body: {
				email: "email@email.com",
				rut: "rut",
				password: "asdasd123@",
				name: "name",
			},
		};

		const httpError = new HTTPError({
			name: registerMessages.validation.name,
			msg: registerMessages.validation.messages.weakPassword,
			code: 400,
		});

		const res = mockResponse();

		await register(req, res);
		expect(res.status).to.be.calledWith(400);
		expect(res.json).to.be.calledWith({ error: { ...httpError } });
		expect(registerLogicStub).to.not.be.called;
	});

	it("[ERROR] Should throw an error when the password doesn't has a symbol", async () => {
		const req = {
			body: {
				email: "email@email.com",
				rut: "rut",
				password: "Asdasd123",
				name: "name",
			},
		};

		const httpError = new HTTPError({
			name: registerMessages.validation.name,
			msg: registerMessages.validation.messages.weakPassword,
			code: 400,
		});

		const res = mockResponse();

		await register(req, res);
		expect(res.status).to.be.calledWith(400);
		expect(res.json).to.be.calledWith({ error: { ...httpError } });
		expect(registerLogicStub).to.not.be.called;
	});

	it("[ERROR] Should throw an error when the rut is invalid", async () => {
		const req = {
			body: {
				email: "email@email.com",
				rut: "11111111-3",
				password: "Asdasd123@",
				name: "name",
			},
		};

		const httpError = new HTTPError({
			name: registerMessages.validation.name,
			msg: registerMessages.validation.messages.invalidRut,
			code: 400,
		});

		const res = mockResponse();

		await register(req, res);
		expect(res.status).to.be.calledWith(400);
		expect(res.json).to.be.calledWith({ error: { ...httpError } });
		expect(registerLogicStub).to.not.be.called;
	});

	it("[ERROR] Should throw a 500 error when RegisterLogic throws a TypeError", async () => {
		const error = new TypeError("some-error");

		const res = mockResponse();

		registerLogicStub.rejects(error);

		const req = {
			body: {
				email: "email@email.com",
				rut: "11111111-1",
				password: "Asdasd123@",
				name: "name",
			},
		};

		await register(req, res);
		expect(res.status).to.be.calledWith(500);
		expect(res.json).to.be.calledWith({ error: error.toString() });
		expect(registerLogicStub).to.be.called;
	});

	it("[ERROR] Should throw a BusinessError when RegisterLogic logic throws a BusinessError", async () => {
		const error = new HTTPError({
			name: registerMessages.validation.name,
			msg: registerMessages.validation.messages.email,
			code: 400,
		});

		const res = mockResponse();

		registerLogicStub.rejects(error);

		const req = {
			body: {
				email: "email@email.com",
				rut: "11111111-1",
				password: "Asdasd123@",
				name: "name",
			},
		};

		await register(req, res);
		expect(res.status).to.be.calledWith(400);
		expect(res.json).to.be.calledWith({ error: { ...error } });
		expect(registerLogicStub).to.be.called;
	});

	it("[SUCCESS] Should return a userId when RegisterLogic return the userId", async () => {
		const res = mockResponse();

		const userId = "some-id";

		registerLogicStub.resolves(userId);

		const req = {
			body: {
				email: "email@email.com",
				rut: "11111111-1",
				password: "Asdasd123@",
				name: "name",
			},
		};

		await register(req, res);
		expect(res.status).to.be.calledWith(201);
		expect(res.json).to.be.calledWith({ userId });
		expect(registerLogicStub).to.be.called;
	});
});
