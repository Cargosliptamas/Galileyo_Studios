import { initAuth } from "./index";

const auth = initAuth({
  baseUrl: "http://localhost:3000",
  productionUrl: "https://galileyo.com",
  secret: "secret",
  emailOptions: {
    sendMagicLink: ({ email, token, url }) => {
      console.log(
        `Sending magic link to ${email} with token ${token} and url ${url}`,
      );
    },
  },
});

export default auth;
