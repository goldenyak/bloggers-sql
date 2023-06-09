import { Entity, PrimaryGeneratedColumn, Column, OneToOne, PrimaryColumn } from "typeorm";
import { UserProfile } from "./user-profile.entity";
import { UserBanInfo } from "./user-ban-info.entity";
import { v4 as uuidv4 } from 'uuid';

@Entity({ name: "Users" })
export class Users{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({collation: 'C'})
  login: string

  @Column()
  email: string

  @Column({nullable: true})
  isLogin: boolean

  @OneToOne(() => UserProfile, userProfile => userProfile.user)
  userProfile: UserProfile;

  @OneToOne(() => UserBanInfo, userBanInfo => userBanInfo.user)
  userBanInfo: UserBanInfo;
}