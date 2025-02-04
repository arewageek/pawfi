import type { ISessionMemoryData, ISessionStorageData } from "../d";

// initial storage session data
export const initialStoreData = (): ISessionStorageData => {
  return {
    balance: 0,
    positions: [],
  };
};

// initial state session data
export const initialStateData = async (): Promise<ISessionMemoryData> => {
  return {
    trade: undefined,
    preferences: undefined,
    confirmation: undefined,
    token: undefined,
  };
};
