import prisma from "../config/prisma";
import type { TToken } from "../d";
import { TradeType } from "@prisma/client";

interface ITokenData {
  success: boolean;
  message?: string;
  meta?: { balance: number };
  data?: {
    address: string;
    symbol: string;
    name: string;
    logo: string;
    creator: string;
    twitter: string;
    website: string;
    telegram: string;
    marketCap: number;
    liquidity: number;
    price: number;
    priceSol: string;
    tradeUserCount: number;
    tradeVolume24h: number;
    bondingCurveProgress: number;
    top10Holder: number;
    buyCount24h: number;
    sellCount24h: number;
  };
}

class Meme {
  baseUrl = "https://meme-api.openocean.finance";

  async data(ca: string, user?: number): Promise<ITokenData> {
    const url = `${this.baseUrl}/market/token/detail?address=${ca}`;

    try {
      const req = await fetch(url);

      if (!req.ok) throw new Error("Failed to get token data");

      const res = await req.json();

      if (res.data == null) {
        return { success: false, message: "No token found" };
      }

      const {
        address,
        symbol,
        name,
        logo,
        creator,
        twitter,
        website,
        telegram,
        marketCap,
        liquidity,
        price,
        priceSol,
        tradeUserCount,
        tradeVolume24h,
        bondingCurveProgress,
        top10Holder,
        buyCount24h,
        sellCount24h,
      } = res.data;

      let balance = 0;

      if (user) {
        const account = await prisma.user.findFirst({
          where: { chatId: user.toString() },
        });
        balance = account?.balance!;
      }

      return {
        success: true,
        meta: { balance },
        data: {
          address,
          symbol,
          name,
          logo,
          creator,
          twitter,
          website,
          telegram,
          marketCap,
          liquidity,
          price,
          priceSol,
          tradeUserCount,
          tradeVolume24h,
          bondingCurveProgress,
          top10Holder,
          buyCount24h,
          sellCount24h,
        },
      };
    } catch (error: any) {
      console.log({ error });
      return { success: false, message: error.message };
    }
  }

  // session management will be done from bot callbackQuesries

  async buy({
    chatId,
    ca,
    amount,
  }: {
    chatId: string;
    ca: string;
    amount: number;
  }): Promise<{
    success: boolean;
    message?: string;
    data?: { buy: { mc: number; price: number }; quantity: number };
  }> {
    try {
      const user = await prisma.user.findFirst({
        where: { chatId },
        include: { tokens: { where: { ca } }, stats: {} },
      });

      if (user?.balance! < amount) {
        return {
          success: false,
          message: "Balance too low for this transaction 🤭",
        };
      }

      const tokenInfo = (await this.data(ca)).data;
      const buyQtty = amount / tokenInfo?.price!;

      const { marketCap, price } = tokenInfo!;

      if (!user?.tokens || user?.tokens?.length < 1) {
        const tokenBuy = await prisma.token.create({
          data: {
            userId: user?.id!,
            ca,
            name: tokenInfo?.name!,
            symbol: tokenInfo?.symbol!,
            trades: {
              create: [
                {
                  marketCap: tokenInfo?.marketCap!,
                  usdValue: tokenInfo?.price!,
                  quantity: buyQtty!,
                  type: TradeType.BUY,
                  userId: user?.id!,
                },
              ],
            },
          },
        });
        console.log({ tokenBuy });
      } else {
        await prisma.trade.create({
          data: {
            tokenId: user.tokens[0].id,
            marketCap: tokenInfo?.marketCap!,
            quantity: buyQtty,
            type: TradeType.BUY,
            userId: user.id,
            usdValue: tokenInfo?.price!,
          },
        });
      }

      return {
        success: true,
        data: {
          buy: { mc: tokenInfo?.marketCap!, price: tokenInfo?.price! },
          quantity: buyQtty,
        },
      };

      // const prevStats = user.stats.find();
      // const newStats = {
      //   count: prevStats?.count! + 1,
      //   volume: prevStats?.volume! + amount,
      // };

      // // debit the user and update stats
      // const newBalance = balance - amount;
      // user.balance = newBalance;
      // user.stats = newStats;
      // user.save();

      // return {
      //   success: true,
      //   data: { buy: { mc: marketCap, price }, quantity: buyQtty },
      // };
    } catch (error: any) {
      console.log({ error });
      return {
        success: false,
        message: "An error occurred while processing your transaction ⚠️",
      };
    }
  }

  async positions(chatId: number): Promise<{
    success: boolean;
    message?: string;
    data?: TToken[];
    meta?: { balance: number; trades: { count: number } };
  }> {
    try {
      // clear all transactions from database!!!
      // this.emptyStorage();

      // const trades = await Transaction.find({ trader: chatId, isOpen: true });
      const tokens = await prisma.user.findFirst({
        where: { chatId: chatId.toString() },
        include: { tokens: { where: { isOpenTrade: true } } },
      });

      console.log({ tokens });

      // const user = await User.findOne({ chatId });
      // const balance = user.balance;

      // if (!trades)
      //   return {
      //     success: false,
      //     message: "Your wallet is as clean as a rugged project",
      //   };
      return {
        success: true,
        data: tokens?.tokens || [],
        meta: {
          balance: tokens?.balance ?? 0,
          trades: { count: tokens?.tokens.length ?? 0 },
        },
      };
    } catch (error: any) {
      console.log({ error });
      return {
        success: false,
        message: "An error occurred while fetching your positions ⚠️",
      };
    }
  }

  async emptyStorage() {
    try {
      const deleteTrade = await prisma.trade.deleteMany();
      const deleteToken = await prisma.token.deleteMany();

      // await prisma.$transaction([deleteTrade, deleteToken]);
    } catch (error) {
      return { success: false, message: "Failed to delete all transactions" };
    }
  }
}

const meme = new Meme();
export default meme;
