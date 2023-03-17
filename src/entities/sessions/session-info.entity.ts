import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";

@Entity({ name: "Session_info" })
export class SessionInfo {
  @PrimaryGeneratedColumn()
  ip: string

  @Column()
  title: string

  @Column()
  deviceId: string;

  @Column()
  lastActiveDate: string;

  @Column('uuid')
  userId: string;
}