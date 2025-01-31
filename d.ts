export type TToken = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isOpenTrade: boolean; // Should be boolean, not false
  userId: string;
  tradeId: string;
};
