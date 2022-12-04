export interface User {
  id?: number;
  username: string;
  password: string;
  deposit?: number;
  role?: Role;
}

enum Role {
  Seller = 'seller',
  Buyer = 'buyer',
}