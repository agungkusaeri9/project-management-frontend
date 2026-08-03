export interface User {
  username: string;
  name: string;
}

export interface Token {
  access_token: string;
  expired_at: string;
}

export interface LoginResponse {
  message: string;
  data: {
    token: Token;
    user: User;
  };
}
