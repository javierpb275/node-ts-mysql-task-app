export default {
  DB: {},
  AUTH: {
    ACCESS_TOKEN_SECRET:
      process.env.ACCESS_TOKEN_SECRET || "someaccesstokensecret",
    REFRESH_TOKEN_SECRET:
      process.env.REFRESH_TOKEN_SECRET || "somerefreshtokensecret",
    ACCESS_TOKEN_EXPIRATION: "1h",
    REFRESH_TOKEN_EXPIRATION: "30d",
  },
};
