/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import { sha512_256 as sha } from "js-sha512";

interface User {
  readonly username: string;
  readonly password: string;
  fullname?: string;
}

interface UserSettings {
  username?: string;
  password?: string;
  fullname?: string;
}

class Usermode {
  private static filepath: string;
  private static users: User;
  static dirpath: string;

  static init(filepath: string): void {
    if (!fs.existsSync(filepath)) {
      fs.writeFileSync(filepath, "{}");
    }
    this.filepath = filepath;
    this.users = this.readFile();
    this.dirpath = path.dirname(this.filepath);
  }

  private static readFile(): User {
    return JSON.parse(fs.readFileSync(this.filepath).toString());
  }

  private static writeFile(): void {
    fs.writeFileSync(this.filepath, JSON.stringify(this.users));
  }

  static getUser(username: string): User | void {
    return this.users[username];
  }

  static setUser(
    user: User,
    update: {
      password?: string;
      fullname?: string;
      __force?: boolean;
    }
  ): User {
    const dbUser: any = this.getUser(user.username);
    const data: UserSettings = {};

    if (!dbUser) {
      throw new Error(`Username "${user.username}" does not exist!`);
    }

    if (dbUser.password !== user.password && !update.__force) {
      throw new Error(`Password "${user.password}" does not match!`);
    }

    data.password = update.password ? sha(update.password) : dbUser.password;
    data.fullname = update.fullname || dbUser.fullname;
    this.users[user.username] = { ...data, username: dbUser.username };
    this.writeFile();

    return this.users[user.username];
  }

  static addUser(user: User): User {
    const passHash = sha(user.password);

    this.users[user.username] = {
      username: user.username,
      password: passHash,
      fullname: user.fullname,
    };

    this.writeFile();

    return this.users[user.username];
  }

  static setHome(username: string): string {
    const homePath = path.join(this.dirpath, username);

    if (!fs.existsSync(homePath)) {
      fs.mkdirSync(homePath);
    }

    return homePath;
  }

  static getHome(username: string): string | void {
    const homePath = path.join(this.dirpath, username);

    if (fs.existsSync(homePath)) {
      return homePath;
    }
  }
}

export { Usermode };
