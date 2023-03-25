import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";


@Entity({ name: "Blog_ban_info" })
export class BlogBanInfo {
  @PrimaryGeneratedColumn()
  id: string

  @Column({nullable: true})
  isBanned: boolean

  @Column({nullable: true})
  banDate: string | null

  @Column()
  userId: string

  @Column()
  blogId: string

}