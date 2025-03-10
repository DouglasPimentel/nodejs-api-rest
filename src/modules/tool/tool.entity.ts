import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "tools" })
export class Tool {
  constructor(name: string, description: string, website: string) {
    this.name = name;
    this.description = description;
    this.website = website;
  }

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text", { unique: true, nullable: false })
  name: string;

  @Column("text", { nullable: false })
  description: string;

  @Column("text", { nullable: false })
  website: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
