import { ContinuelAuth } from "./auth";
import { ContinuelUtils } from "./utils";

import axios from "axios";

// Re-export types for convenience
export type {
  AuthSuccessResponse,
  AuthErrorResponse,
  UserData,
  GetUserSuccessResponse,
  GetUserNotLoggedInResponse,
  UploadProfileSuccessResponse,
  SigninRequest,
  SignupRequest,
  AuthResponse,
  GetUserResponse,
  UploadProfileResponse,
} from "./auth";

export type {
  ImageConversionOptions,
  ConversionResult,
  ConversionError,
  ImageConversionResult,
} from "./utils";

class Continuel {
  baseUrl: string;

  auth: ContinuelAuth;
  utils: ContinuelUtils;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;

    this.auth = new ContinuelAuth(this);
    this.utils = new ContinuelUtils(this);
  }

  async request(props: {
    method: "GET" | "POST" | "PUT" | "DELETE";
    url: string;
    body?: any;
    headers?: Record<string, string>;
  }): Promise<
    | {
        networkError: true;
      }
    | {
        networkError: false;
        status: number;
        data: any;
      }
  > {
    try {
      const response = await axios.request({
        method: props.method,
        url: this.baseUrl + props.url,
        data: props.body,
        headers: props.headers,
      });

      return {
        networkError: false,
        status: response.status,
        data: response.data,
      };
    } catch (error: any) {
      if (error.response) {
        return {
          networkError: false,
          status: error.response.status,
          data: error.response.data,
        };
      }
      return {
        networkError: true,
      };
    }
  }
}

export default Continuel;
