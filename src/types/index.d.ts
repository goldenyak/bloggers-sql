import { Users } from "../entities/user/users.entity";

declare global {
  declare namespace Express {
    export interface Request {
      user: Users | null
    }
  }
}