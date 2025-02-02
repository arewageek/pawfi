export type TToken = {
  id: string;

  name: string;
  symbol: string;
  ca: string;
  isOpenTrade: boolean; // Should be boolean, not false

  userId: string;

  createdAt: Date;
  updatedAt: Date;
};
