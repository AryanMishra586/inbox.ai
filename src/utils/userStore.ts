import redisClient from "../db/redis";
import User from "../types/user";

class UserStore {
  private prefix: string = "user:";

  async addUser(user: User): Promise<void> {
    const key = `${this.prefix}${user.id}`;
    await redisClient.set(key, JSON.stringify(user), 3600);
  }

  async getUser(userId: string): Promise<User | null> {
    const key = `${this.prefix}${userId}`;
    const data = await redisClient.get(key);
    if (data) {
      return JSON.parse(data) as User;
    }
    return null;
  }

  async removeUser(userId: string): Promise<void> {
    const key = `${this.prefix}${userId}`;
    await redisClient.delete(key);
  }
}

const userStore = new UserStore();
export default userStore;
