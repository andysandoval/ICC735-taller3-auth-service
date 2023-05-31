import verify from "../../src/controllers/verify.controller.js";
import { expect, sinon } from "../chai.config.js";
import * as VerifyLogic from "../../src/logic/verify.logic.js";
import verifyMessages from "../../src/messages/verify.messages";
import { HTTPError } from "../../src/helpers/error.helper";

describe("Controller: Verify", () =>{
    const { any } = sinon.match;

    const mockResponse = () => {
        const res = {};
		res.status = sinon.stub().returns(res);
		res.json = sinon.stub().returns(res);
		return res;
    }

    let verifyLogicStub;

    beforeEach(() => {
		verifyLogicStub = sinon.stub(VerifyLogic, "default");
	});

	afterEach(() => {
		verifyLogicStub.restore();
	});

	it("[SUCCESS] Should return a 200 status code and a success message", async () => {	
		const req = {
			userId: "some-id",
			body: {
				code: "123456",
			},
		};

		const res = mockResponse();	

		await verify(req, res);
		expect(res.status).to.be.calledWith(200);
		expect(res.json).to.be.calledWith({ response: verifyMessages.success });
		expect(verifyLogicStub).to.be.calledWith(any);
	});

	it("[SUCCES] Should return a 200 when the code is not a number", async () => {
		const req = {
			body: {
				code: "123456",
			},
		};

		const res = mockResponse();

		await verify(req, res);
		expect(res.status).to.be.calledWith(200);
		expect(res.json).to.be.calledWith({ response: verifyMessages.success });
		expect(verifyLogicStub).to.be.called;
	});

    it("[ERROR] Should throw an error when the code doesn't exists in the body", async () => {
		const req = {
			body: {},
		};

		const httpError = new HTTPError({
			name: verifyMessages.validation.name,
			msg: verifyMessages.validation.messages.code,
			code: 400,
		});

		const res = mockResponse();

		await verify(req, res);
		expect(res.status).to.be.calledWith(400);
		expect(res.json).to.be.calledWith({ error: { ...httpError } });
		expect(verifyLogicStub).to.not.be.called;
	});

	it("[ERROR] Should throw an error when the code is not a 6 digits number", async () => {
		const req = {
			body: {
				code: 123,
			},
		};

		const httpError = new HTTPError({
			name: verifyMessages.validation.name,
			msg: verifyMessages.validation.messages.code,
			code: 400,
		});

		const res = mockResponse();

		await verify(req, res);
		expect(res.status).to.be.calledWith(400);
		expect(res.json).to.be.calledWith({ error: { ...httpError } });
		expect(verifyLogicStub).to.not.be.called;
	});	
});