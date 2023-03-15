import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Users } from "./users.entity";

@Entity({ name: "User_ban_info" })
export class UserBanInfo {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  isBanned: boolean

  @Column({nullable: true})
  banDate: string | null

  @Column({nullable: true})
  banReason: string | null

  @OneToOne(() => Users, user => user.userBanInfo)
  @JoinColumn()
  user: Users
}