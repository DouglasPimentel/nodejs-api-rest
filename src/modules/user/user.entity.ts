import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum UserRole {
  OWNER = "owner",
  MANAGER = "manager",
  VIEWER = "viewer",
}

@Entity({ name: "users" })
export class User {
  constructor(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: UserRole.VIEWER
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text", { name: "first_name", nullable: false })
  firstName: string;

  @Column("text", { nullable: false })
  lastName: string;

  @Column("text", { unique: true, nullable: false })
  email: string;

  @Column("text", { nullable: false })
  password: string;

  @Column("boolean", { default: true })
  active!: boolean;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.VIEWER,
  })
  role!: UserRole;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
