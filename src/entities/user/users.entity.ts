import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { UserProfile } from "./user-profile.entity";
import { UserBanInfo } from "./user-ban-info.entity";

@Entity({ name: "Users" })
export class Users{
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  login: string

  @Column()
  email: string

  @OneToOne(() => UserProfile, userProfile => userProfile.user)
  userProfile: UserProfile;

  @OneToOne(() => UserBanInfo, userBanInfo => userBanInfo.user)
  userBanInfo: UserBanInfo;
}