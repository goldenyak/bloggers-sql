import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Users } from "./users.entity";

@Entity({ name: "User_profile" })
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  password: string

  @Column()
  createdAt: string

  @Column()
  confirmationCode: string

  @Column({nullable: true})
  recoveryCode: string | null

  @Column()
  isConfirmed: boolean

  @OneToOne(() => Users, user => user.userProfile)
  @JoinColumn()
  user: Users
}