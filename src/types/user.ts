export interface User {
  id?: string;
  name?: string;
  avatar?: string;
  email?: string;
  userdata:  null | {
    access_token: string, refresh_token: string, user_id: string, name: string, user_location: string
  };

  [key: string]: unknown;
}