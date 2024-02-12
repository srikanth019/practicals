import { Router } from "express";
import { Routes } from "@interface";
import { UserController } from "@controller";
import { isAuthenticated } from "@/middleware";

export class UserRoutes implements Routes {
  public router = Router();
  public path = "/user";
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/signup`, this.userController.signUp);
    this.router.post(`${this.path}/login`, this.userController.logIn);
    this.router.post(
      `${this.path}/logout`,
      isAuthenticated,
      this.userController.logOut
    );
    this.router.post(
      `${this.path}/refresh-token`,
      this.userController.refreshToken
    );
    this.router.post(
      `${this.path}/change-password`,
      isAuthenticated,
      this.userController.changeCurrentPassword
    );
  }
}
