import { Entity, PrimaryGeneratedColumn, Column, OneToOne, PrimaryColumn } from "typeorm";

@Entity({ name: "Posts" })
export class Posts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string

  @Column()
  shortDescription: string

  @Column()
  content: string

  @Column()
  blogId: string

  @Column()
  blogName: string

  @Column()
  createdAt: string

  @Column()
  userId: string

}