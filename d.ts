import type { TradeType } from "@prisma/client";
import type { Context, SessionFlavor } from "grammy";

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

export type ISessionStorageData = {
  balance: number;
  positions: TToken[];
};

export type ISessionMemoryData = {
  trade?: {
    ca: string;
    amount: number;
    withdraw: number;
    fund: number;
  };
  preferences?: {
    trade: {
      defaultBuy: number;
      defaultSell: number;
      steps: {
        buy: number[];
        sell: number;
      };
    };
    currency: "usdc" | "sol";
  };
  confirmation?: {
    isResetAccount: boolean;
    isDeleteAccount: boolean;
    isEmptyAccount: boolean;
  };
  token?: {
    meta: {
      symbol: string;
      name: string;
      ca: string;
    };
    trade: {
      mc: number;
      liq: number;
      price: number;
      vol: {
        "5min"?: [number, number];
        "10min"?: [number, number];
        "15min"?: [number, number];
        "30min"?: [number, number];
        "1hr"?: [number, number];
        "4hr"?: [number, number];
        "24hr": [number, number];
        "7d": [number, number];
        "1mo": [number, number];
      };
    };
    chart?: {
      url?: string;
      isVisible: boolean;
    };
  };
};

export interface ISessionData {
  state: ISessionMemoryData;
  store: ISessionStorageData;
}

export type TContext = Context & SessionFlavor<ISessionData>;
