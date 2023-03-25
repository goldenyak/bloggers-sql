import { Entity, PrimaryGeneratedColumn, Column, OneToOne, PrimaryColumn } from "typeorm";

@Entity({ name: "Comments" })
export class Comments {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string

  @Column()
  createdAt: string

  @Column()
  parentId: string

  @Column()
  userId: string

  @Column()
  userLogin: string

}