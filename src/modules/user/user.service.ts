import type { Repository } from "typeorm";
import { AppDataSource } from "#/database/data-source";
import { User, UserRole } from "#/modules/user/user.entity";
import { hashPassword } from "#/utils/hashPassword";

export async function getAllUsers(): Promise<User[]> {
  const userRepository: Repository<User> = AppDataSource.getRepository(User);

  const users: User[] = await userRepository.find();

  return users;
}

export async function checkUserExistsByEmail(
  email: string
): Promise<User | null> {
  const userRepository: Repository<User> = AppDataSource.getRepository(User);

  const user: User | null = await userRepository.findOneBy({ email });

  return user;
}

export async function createUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<User> {
  const userRepository: Repository<User> = AppDataSource.getRepository(User);

  const hash: string = await hashPassword(password);

  const user: User = new User(firstName, lastName, email, hash, UserRole.VIEW);

  const newUser: User = await userRepository.save(user);

  return newUser;
}

export async function userById(id: string): Promise<User | null> {
  const userRepository: Repository<User> = AppDataSource.getRepository(User);

  const user: User | null = await userRepository.findOneBy({ id });

  return user;
}

export async function updateUser(
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<void> {
  const userRepository: Repository<User> = AppDataSource.getRepository(User);

  const hash: string = await hashPassword(password);

  await userRepository.update(id, {
    firstName,
    lastName,
    email,
    password: hash,
  });
}

export async function deleteUser(id: string) {
  const userRepository: Repository<User> = AppDataSource.getRepository(User);

  await userRepository.delete({ id });
}
