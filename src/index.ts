/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import { sha512_256 as sha } from "js-sha512";

interface User {
  username: string;
  password: string;
  fullname?: string;
}
class Usermode {
  private static filepath: string;
  private static users: User;
  static dirpath: string;

  static init(filepath: string): void {
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
    }
  ): User | void {
    const dbUser: any = this.getUser(user.username);

    if (!dbUser) return;
    if (dbUser.password !== user.password) return;

    user.password = update.password ? sha(update.password) : user.password;
    user.fullname = update.fullname || user.fullname;
    this.users[user.username] = user;
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

module.exports = { Usermode };
