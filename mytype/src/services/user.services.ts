import { Types } from "mongoose";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserModel, UserDocument } from "@model/user.model";
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
      throw new ApiError(401, "Invalid user password");
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

  public async changePassword(
    user: UserDocument,
    currentPassword: string,
    newPassword: string
  ) {
    const currentUser = await UserModel.findById(user?._id);
    if (!currentUser?.isPasswordCorrect(currentPassword)) {
      throw new ApiError(401, "Invalid old password");
    }
    currentUser.password = newPassword;
    await currentUser.save({ validateBeforeSave: false });
  }

  public async GetUsers(
    page: number,
    limit: number
  ): Promise<{ users: any[]; userCount: number | string }> {
    const skip = (page - 1) * limit;
    // const data = await UserModel.aggregate([
    //   {
    //     $facet: {
    //       users: [
    //         { $skip: skip },
    //         { $limit: limit },
    //         // Add other pipeline stages if needed for filtering, sorting, etc.
    //       ],
    //       userCount: [{ $count: "count" }],
    //     },
    //   },
    //   {
    //     $project: {
    //       users: 1,
    //       userCount: {
    //         $ifNull: [{ $arrayElemAt: ["$userCount.count", 0] }, 0],
    //       },
    //     },
    //   },
    // ]);

    const users = await UserModel.find({})
      .skip(skip)
      .limit(limit)
      // Exclude the password field from the result
      .select("-password")
      // Add other query conditions if needed for filtering, sorting, etc.
      .exec();

    const userCount = await UserModel.countDocuments({});

    const result = {
      users: users,
      userCount: userCount,
    };

    // Now `result` contains both the array of users (with "password" excluded) and the total count.

    console.log(/data/, result);
    return result;
  }

  public async GetUser(userId: string | Types.ObjectId) {
    return await UserModel.findById(userId).select("-password");
  }

  public async UpdateUser(
    userId: string | Types.ObjectId,
    fullName: string,
    username: string
  ) {
    return await UserModel.findByIdAndUpdate(
      userId,
      {
        fullName,
        username,
      },
      { new: true }
    );
  }

  public async DeleteUser(userId: string | Types.ObjectId) {
    return await UserModel.findByIdAndDelete(userId).select("-password");
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
