import { Entity, PrimaryGeneratedColumn, Column, OneToOne, PrimaryColumn } from "typeorm";

@Entity({ name: "Blogs" })
export class Blogs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({collation: 'C'})
  name: string

  @Column()
  description: string

  @Column()
  websiteUrl: string

  @Column()
  createdAt: string

  @Column()
  userId: string

  @Column({nullable: true})
  userLogin: string

  @Column({nullable: true})
  isMembership: boolean

}