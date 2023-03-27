import { Entity, PrimaryGeneratedColumn, Column, OneToOne, PrimaryColumn } from "typeorm";

@Entity({ name: "Black_list_blogs" })
export class Black_list_blogs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blogId: string

  @Column()
  ownerId: string

  @Column()
  createdAt: string

  @Column()
  bannedUserId: string

  @Column({nullable: true})
  bannedUserLogin: string

  @Column({nullable: true})
  banReason: string
}