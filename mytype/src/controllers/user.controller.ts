import { Request, Response, NextFunction } from "express";
import { UserService } from "@/services";
import { CustomUserRequest, User } from "@interface";
import { ApiError, ApiResponse } from "@/utils";

export class UserController extends UserService {
  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, fullName, email, password } = req.body;
      if (
        ![username, fullName, email, username, password].every(
          (field) => field && field.trim() !== ""
        )
      ) {
        throw new ApiError(409, "Please provide required fields");
      }
      const userData: User = req.body;
      const signUpUserData: User = await this.signup(userData);
      return res
        .status(201)
        .json(
          new ApiResponse(200, signUpUserData, "User registered successfully")
        );
    } catch (error) {
      next(error);
    }
  };
  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password } = req.body;
      if (!(username || email) && password) {
        throw new ApiError(409, "Please provide required fields for Login");
      }
      const loginData: User = req.body;
      const { accessToken, refreshToken } = await this.login(loginData);
      const options = {
        httpOnly: true,
        secure: true,
      };
      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            { accessToken, refreshToken },
            "User login successfully"
          )
        );
    } catch (error) {
      next(error);
    }
  };
  public logOut = async (
    req: CustomUserRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { user } = req;
    console.log(/user/, user);

    await this.logout(user);
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logout successfully"));
  };
  public refreshToken = async (
    req: CustomUserRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const oldRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;
      if (!oldRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
      }
      const { accessToken, refreshToken } = await this.getNewRefreshToken(
        oldRefreshToken
      );
      const options = {
        httpOnly: true,
        secure: true,
      };
      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            { accessToken, refreshToken },
            "Access token refreshed"
          )
        );
    } catch (error) {
      next(error);
    }
  };
}
