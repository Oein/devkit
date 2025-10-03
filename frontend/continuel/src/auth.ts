import type Continuel from ".";

// Auth API Response Types
export interface AuthSuccessResponse {
  success: true;
}

export interface AuthErrorResponse {
  success: false;
  error: string;
}

export interface UserData {
  username: string;
  nickname: string;
  profileImage: string | null;
}

export interface GetUserSuccessResponse {
  success: true;
  user: UserData;
}

export interface GetUserNotLoggedInResponse {
  success: false;
}

export interface UploadProfileSuccessResponse {
  success: true;
  profileImage: string;
}

// Request types
export interface SigninRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  nickname: string;
  password: string;
}

// Union types for responses
export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;
export type GetUserResponse =
  | GetUserSuccessResponse
  | GetUserNotLoggedInResponse
  | AuthErrorResponse;
export type UploadProfileResponse =
  | UploadProfileSuccessResponse
  | AuthErrorResponse;

export class ContinuelAuth {
  constructor(public continuel: Continuel) {}

  /**
   * Sign in an existing user
   */
  async signin(data: SigninRequest): Promise<AuthResponse> {
    const response = await this.continuel.request({
      method: "POST",
      url: "/deepslate/auth/signin",
      body: data,
    });

    if (response.networkError) {
      return {
        success: false,
        error: "Network error",
      };
    }

    return response.data as AuthResponse;
  }

  /**
   * Sign out the current user
   */
  async signout(): Promise<AuthResponse> {
    const response = await this.continuel.request({
      method: "POST",
      url: "/deepslate/auth/signout",
    });

    if (response.networkError) {
      return {
        success: false,
        error: "Network error",
      };
    }

    return response.data as AuthResponse;
  }

  /**
   * Sign up a new user
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await this.continuel.request({
      method: "POST",
      url: "/deepslate/auth/signup",
      body: data,
    });

    if (response.networkError) {
      return {
        success: false,
        error: "Network error",
      };
    }

    return response.data as AuthResponse;
  }

  /**
   * Get the current user's information
   */
  async getUser(): Promise<GetUserResponse> {
    const response = await this.continuel.request({
      method: "GET",
      url: "/deepslate/auth/user",
    });

    if (response.networkError) {
      return {
        success: false,
        error: "Network error",
      };
    }

    return response.data as GetUserResponse;
  }

  /**
   * Sign out and delete the current user
   */
  async deleteUser(): Promise<AuthResponse> {
    const response = await this.continuel.request({
      method: "DELETE",
      url: "/deepslate/auth/user",
    });

    if (response.networkError) {
      return {
        success: false,
        error: "Network error",
      };
    }

    return response.data as AuthResponse;
  }

  /**
   * Upload a profile image for the current user
   * @param imageData The image data as an ArrayBuffer or Blob (should be in WebP format)
   */
  async uploadProfile(
    imageData: ArrayBuffer | Blob
  ): Promise<UploadProfileResponse> {
    // Convert to appropriate format for the request
    const body =
      imageData instanceof ArrayBuffer ? new Uint8Array(imageData) : imageData;

    const response = await this.continuel.request({
      method: "POST",
      url: "/deepslate/auth/profile/upload",
      body,
      headers: {
        "Content-Type": "image/webp",
      },
    });

    if (response.networkError) {
      return {
        success: false,
        error: "Network error",
      };
    }

    return response.data as UploadProfileResponse;
  }
}
