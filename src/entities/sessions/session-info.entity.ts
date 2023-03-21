import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";

@Entity({ name: "Session_info" })
export class SessionInfo {
  @PrimaryGeneratedColumn('uuid')
  deviceId: string

  @Column()
  title: string

  @Column()
  ip: string;

  @Column()
  lastActiveDate: string;

  @Column({nullable: true})
  expiredDate: string;

  @Column('uuid')
  userId: string;
}