import {
  Column,
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany
} from "typeorm";
import { List } from "src/list/models/list.entity";
import { Card } from "src/card/models/card.entity";
import { Board } from "src/board/models/board.entity";
import { UserBoard } from "src/board/models/user-board.entity";
import { UserCard } from "src/card/models/user-card.entity";

@Entity('users')
export class User {

  @PrimaryGeneratedColumn("uuid")
  user_id: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  @CreateDateColumn()
  create_date_time: Date;

  @OneToMany(() => Board, (board) => board.creator)
  created_boards: Promise<Board[]>;

  @OneToMany(() => List, (list) => list.creator)
  created_lists: Promise<Board[]>;

  @OneToMany(() => Card, (card) => card.creator)
  created_cards: Promise<Board[]>;

  @OneToMany(() => UserBoard, (userBoard) => userBoard.user)
  joined_boards: Promise<UserBoard[]>;

  @OneToMany(() => UserCard, (userCard) => userCard.user)
  assigned_cards: Promise<UserCard[]>;
}