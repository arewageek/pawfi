import type { ISessionMemoryData, ISessionStorageData } from "../d";

// initial storage session data
export const initialStoreData = (): ISessionStorageData => {
  return {
    balance: 0,
    positions: [],
  };
};

// initial state session data
export const initialStateData = (): ISessionMemoryData => {
  return {
    trade: undefined,
    preferences: undefined,
    confirmation: undefined,
    token: undefined,
  };
};
