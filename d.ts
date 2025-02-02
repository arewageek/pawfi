import type { TradeType } from "@prisma/client";

export type TToken = {
  id: string;

  name: string;
  symbol: string;
  ca: string;
  isOpenTrade: boolean; // Should be boolean, not false

  userId: string;

  trades?: TTrade[];

  createdAt: Date;
  updatedAt: Date;
};

export type TTrade = {
  id: string;
  type: TradeType;

  marketCap: number;
  usdValue: number;
  quantity: number;

  userId: string;
  tokenId: string;
};
