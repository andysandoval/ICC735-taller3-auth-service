import dotenv from "dotenv";

const NODE_ENV = process.env.NODE_ENV;

dotenv.config({ path: NODE_ENV ? `env/.${NODE_ENV}.env` : `env/.local.env` });

export default {
	ENVS: {
		local: "local",
		dev: "development",
		stg: "staging",
		prod: "production",
	},
	NODE_ENV,
	JWT: {
		SECRET: process.env.PORT || "secret",
		DEFAULT_EXPIRES: "1d",
	},
	HOST: process.env.HOST || "http://localhost",
	PORT: process.env.PORT || 3001,
	MONGO_URI:
		process.env.MONGO_URI || "mongodb://127.0.0.1:27017/auth-service-local",
	EMAIL_SERVICE: {
		BASE_URL: process.env.EMAIL_SERVICE_BASE_URL || "http://localhost:3002",
		ENDPOINTS: {
			SEND_EMAIL: "/send-email",
			SEND_PUSH: "/send-push",
		},
		SUBJECTS: {
			VALIDATE: "Valida tu email",
			BLOCKED: "Cuenta bloqueada :(",
			VERIFIED: "Cuenta verificada :)",
		},
	},
	REGISTRO_CIVIL_API: {
		BASE_URL: process.env.REGISTRO_CIVIL_API_BASE_URL || "",
		APIKEY: process.env.REGISTRO_CIVIL_API_BASE_URL || "",
	},
};
