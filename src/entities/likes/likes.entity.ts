import { Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity({ name: "Likes" })
export class Likes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: string

  @Column()
  createdAt: string

  @Column()
  parentId: string

  @Column()
  userId: string

  @Column()
  login: string

  @Column({nullable: true})
  userBanStatus: boolean
}