import { Types } from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserModel } from "@model/user.model";
import { User } from "@interface";
import { ApiError } from "@/utils";
import { REFRESH_TOKEN_SECRET } from "@/config";

export class UserService {
  public async signup(userData: User): Promise<User> {
    const existingUser = await UserModel.findOne({
      $or: [{ email: userData.email }, { username: userData.username }],
    });

    if (existingUser) {
      const field =
        existingUser.email === userData.email ? "email" : "username";
      throw new ApiError(
        409,
        `This ${field} ${userData[field]} already exists`
      );
    }

    const user = await UserModel.create(userData);
    const createdUser = await UserModel.findById(user._id).select([
      "-password",
    ]);
    if (!createdUser) {
      throw new ApiError();
    }

    return createdUser;
  }

  public async login(
    userData: User
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await UserModel.findOne({
      $or: [{ email: userData.email }, { username: userData.username }],
    });
    if (!user) {
      throw new ApiError(404, "User does not exists");
    }
    const isPasswordValid = await user.isPasswordCorrect(userData.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
    }
    // type assertion
    const { accessToken, refreshToken } = (await generateAccessAndRefreshToken(
      user._id
    )) as { accessToken: string; refreshToken: string };

    return { accessToken, refreshToken };
  }

  public async logout(user: User): Promise<User | null> {
    return await UserModel.findByIdAndUpdate(
      user._id,
      {
        $set: {
          refreshToken: null,
        },
      },
      { new: false }
    );
  }

  public async getNewRefreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const decodedToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET!);

    if (!decodedToken) {
      throw new ApiError(401, "Invalid refresh token");
    }
    const user = await UserModel.findById((decodedToken as JwtPayload)?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (refreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token expired or used");
    }

    return (await generateAccessAndRefreshToken(user._id)) as {
      accessToken: string;
      refreshToken: string;
    };
  }
}

const generateAccessAndRefreshToken = async (
  userId: string | Types.ObjectId
) => {
  try {
    const user = await UserModel.findById(userId);
    if (user) {
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
      return { accessToken, refreshToken };
    }
  } catch (error) {
    console.log(/error/, error);

    throw new ApiError(
      500,
      "Something went wrong while generating generating access and refresh token"
    );
  }
};
