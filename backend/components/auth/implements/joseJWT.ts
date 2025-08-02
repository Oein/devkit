import type IAuthJwt from "../jwt";
import { SignJWT, jwtVerify } from "jose";

export default class JoseJWT implements IAuthJwt {
  private secret: Uint8Array = new TextEncoder().encode(
    "cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2"
  );
  private alg: string = "HS256";
  private issuer: string = "urn:example:issuer";
  private audience: string = "urn:example:audience";
  private expirationTime: string = "2h";

  constructor(props?: {
    secret?: string;
    alg?: string;
    issuer?: string;
    audience?: string;
    expirationTime?: string;
  }) {
    if (props == null) return;
    if (props.secret) {
      this.secret = new TextEncoder().encode(props.secret);
    }
    if (props.alg) {
      this.alg = props.alg;
    }
    if (props.issuer) {
      this.issuer = props.issuer;
    }
    if (props.audience) {
      this.audience = props.audience;
    }
    if (props.expirationTime) {
      this.expirationTime = props.expirationTime;
    }
  }

  async sign(userID: string, userData: any): Promise<string> {
    const jwt = await new SignJWT({
      id: userID,
      data: userData,
    })
      .setProtectedHeader({ alg: this.alg })
      .setIssuedAt()
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setExpirationTime(this.expirationTime)
      .sign(this.secret);

    return jwt;
  }

  async verify(token: string): Promise<boolean> {
    try {
      const { payload } = await jwtVerify(token, this.secret);
      return payload != null;
    } catch {
      return false;
    }
  }
}
