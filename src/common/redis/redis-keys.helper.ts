export class RedisKeys {
  private static readonly appPrefix = 'management';

  static jwt = {
    access: (userId: number | string) =>
      `${this.appPrefix}:jwtSecret:access:${userId}`,
    refresh: (userId: number | string) =>
      `${this.appPrefix}:jwtSecret:refresh:${userId}`,
  };

  static user = {
    all: () => `${this.appPrefix}:user:list:all`,
    byId: (id: number | string) => `${this.appPrefix}:user:${id}`,
  };

  static post = {
    all: () => `${this.appPrefix}:post:list:all`,
    byId: (id: number | string) => `${this.appPrefix}:post:${id}`,
  };

  static comment = {
    all: () => `${this.appPrefix}:comment:list:all`,
    byId: (id: number | string) => `${this.appPrefix}:comment:${id}`,
    byPost: (postId: number | string) =>
      `${this.appPrefix}:comment:post:${postId}`,
  };
}
