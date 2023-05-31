import login from "../../src/controllers/login.controller.js";
import { expect, sinon } from "../chai.config.js";
import * as LoginLogic from "../../src/logic/login.logic.js";
import { HTTPError } from "../../src/helpers/error.helper.js";
import loginMessages from "../../src/messages/login.messages.js";

describe("Controller: Login", () => {
	const { any } = sinon.match;

	const defaultReq = {
		body: {
			email: "email@host.com",
			password: "password",
		},
	};

	const mockResponse = () =>{
		const res = {};
		res.status = sinon.stub().returns(res);
		res.json = sinon.stub().returns(res);
		return res;
	}

	let loginLogicStub;

	beforeEach(() => {
		loginLogicStub = sinon.stub(LoginLogic, "default");
	});

	afterEach(() => {
		loginLogicStub.restore();
	});

	it("[ERROR] Should throw an error when the email doesn't exists in the body", async () => {
		const req = {
			body: {
				password: "password",
			},
		};

		const httpError = new HTTPError({
			name: loginMessages.validation.name,
			msg: loginMessages.validation.messages.email,
			code: 400,
		});

		const res = mockResponse();

		await login(req, res);
		expect(res.status).to.be.calledWith(400);
		expect(res.json).to.be.calledWith({ error: { ...httpError } });
		expect(loginLogicStub).to.not.be.called;
	});

	it("[ERROR] Should throw an error when the password doesn't exists in the body", async () => {
		const req = {
			body: {
				email: "email@some.com",
			},
		};

		const httpError = new HTTPError({
			name: loginMessages.validation.name,
			msg: loginMessages.validation.messages.password,
			code: 400,
		});

		const res = mockResponse();

		await login(req, res);
		expect(res.status).to.be.calledWith(400);
		expect(res.json).to.be.calledWith({ error: { ...httpError } });
		expect(loginLogicStub).to.not.be.called;
	});

	it("[ERROR] Should throw an error when the email format is invalid", async () => {
		const httpError = new HTTPError({
			name: loginMessages.validation.name,
			msg: loginMessages.validation.messages.email,
			code: 400,
		});

		const req = {
			body: {
				email: "email",
				password: "password",
			},
		};

		const res = mockResponse();

		await login(req, res);
		expect(res.status).to.be.calledWith(400);
		expect(res.json).to.be.calledWith({ error: { ...httpError } });
		expect(loginLogicStub).to.not.be.called;
	});

	it("[ERROR] Should throw an 500 error when LoginLogic throws an TypeError", async () => {
		const error = new TypeError("some-error");

		const res = mockResponse();

		loginLogicStub.rejects(error);

		await login(defaultReq, res);
		expect(res.status).to.be.calledWith(500);
		expect(res.json).to.be.calledWith({ error: error.toString() });
		expect(loginLogicStub).to.be.called;
	});

	it("[ERROR] Should throw an 400 error when LoginLogic throws an HTTPError with 400 code", async () => {
		const error = new HTTPError({
			name: loginMessages.validation.name,
			msg: loginMessages.validation.messages.email,
			code: 400,
		});

		const res = mockResponse();

		loginLogicStub.rejects(error);

		await login(defaultReq, res);
		expect(res.status).to.be.calledWith(400);
		expect(res.json).to.be.calledWith({ error: { ...error } });
		expect(loginLogicStub).to.be.called;
	});

	it("[SUCCESS] Should return a token when LoginLogic return the token", async () => {
		const token = "this-is-a-token";
		const verified = true;

		const res = mockResponse();

		loginLogicStub.resolves({ token, verified });

		await login(defaultReq, res);
		expect(res.status).to.be.calledWith(200);
		expect(res.json).to.be.calledWith({ token, verified });
		expect(loginLogicStub).to.be.calledWith({
			email: defaultReq.body.email,
			password: defaultReq.body.password,
		});
	});
});
