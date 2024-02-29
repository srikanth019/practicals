import { Request, Response, NextFunction } from "express";
import { UserService } from "@/services";
import { CustomUserRequest, User } from "@interface";
import { ApiError, ApiResponse } from "@/utils";
import fs from "fs";
export class UserController extends UserService {
  public signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const avatar = req.file?.path;
      const { username, fullName, email, password } = req.body;
      if (
        ![username, fullName, email, username, password].every(
          (field) => field && field.trim() !== ""
        )
      ) {
        if (avatar) fs.unlinkSync(avatar);
        throw new ApiError(409, "Please provide required fields");
      }

      const userData: User = req.body;
      const signUpUserData: User = await this.signup(userData, avatar);
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

  public changeCurrentPassword = async (
    req: CustomUserRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { user } = req;
      const { currentPassword, newPassword } = req.body;
      await this.changePassword(user, currentPassword, newPassword);
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
    } catch (error) {
      next(error);
    }
  };

  public getUsers = async (
    req: CustomUserRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1; // Convert to number or default to 1
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const userData = await this.GetUsers(page, limit);

      if (!userData.users?.length) {
        throw new ApiError(404, `Users not found.`);
      }
      return res
        .status(200)
        .json(new ApiResponse(200, userData, "Users fetched successfully"));
    } catch (error) {
      next(error);
    }
  };

  public getUser = async (
    req: CustomUserRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params;
      const user = await this.GetUser(userId);
      if (!user) {
        throw new ApiError(404, `User not found with id ${userId}`);
      }
      return res.status(200).json(new ApiResponse(200, user, "User fetched"));
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (
    req: CustomUserRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { fullName, username } = req.body;

      const avatar = req.file?.path;

      const { userId } = req.params;
      if (!username || !fullName) {
        throw new ApiError(409, "email and fullName required");
      }
      const updatedUser = await this.UpdateUser(
        userId,
        fullName,
        username,
        avatar
      );
      return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "User updated"));
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (
    req: CustomUserRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params;
      const data = await this.DeleteUser(userId);
      console.log(data);

      if (!data) {
        throw new ApiError(404, `User not found with id ${userId}`);
      }
      return res.status(200).json(new ApiResponse(200, data, "User deleted."));
    } catch (error) {
      next(error);
    }
  };
}
