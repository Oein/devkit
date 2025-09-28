import JoseJWT from "../implements/joseJWT";

class CustomJWT extends JoseJWT {
  override async sign(userID: string, userData: any): Promise<string> {
    let newUserData = { ...userData };
    console.log("Original User Data", newUserData);
    delete newUserData.email;
    console.log("Modified User Data", newUserData);
    return super.sign(userID, newUserData);
  }
}

import JSONDatabase from "../../database/file";
import BunHasher from "../implements/bunHasher";
import { SimpleAuth } from "../simpleAuth";

const simpleAuth = new SimpleAuth(
  new CustomJWT(),
  new JSONDatabase("./db.json", {
    saveOnAction: true,
    formatOnSave: true,
    createIfNotExists: true,
  }),
  new BunHasher()
);

await simpleAuth.removeUser("username");
console.log(
  "Sign in for username:password",
  await simpleAuth.signIn("username", "password")
);

console.log(
  "Sign up for username:password",
  await simpleAuth.signUp("username", "password", {
    email: "user@example.com",
    nickname: "userNickname",
  })
);

console.log(
  "Sign in for username:password",
  await simpleAuth.signIn("username", "password")
);

const jwt = await simpleAuth.getUserToken("username");
console.log("Get user token for username", jwt);

if (jwt == null) {
  console.log("No token found for the user.");
} else {
  const payload = jwt.split(".")![1];
  if (!payload) {
    console.log("No payload found in the JWT token.");
  } else {
    console.log(
      "Payload of the JWT token",
      atob(jwt.split(".")![1]!) // Decode the payload part of the JWT token
    );
  }
}
