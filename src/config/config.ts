export default {
  DB: {
    HOST: process.env.DB_HOST || "somedbhost",
    USER: process.env.DB_USER || "somedbuser",
    PASSWORD: process.env.DB_PASSWORD || "somedbpassword",
    NAME: process.env.DB_NAME || "somedbname",
  },
  AUTH: {
    ACCESS_TOKEN_SECRET:
      process.env.ACCESS_TOKEN_SECRET || "someaccesstokensecret",
    REFRESH_TOKEN_SECRET:
      process.env.REFRESH_TOKEN_SECRET || "somerefreshtokensecret",
    ACCESS_TOKEN_EXPIRATION: "1h",
    REFRESH_TOKEN_EXPIRATION: "30d",
  },
};
