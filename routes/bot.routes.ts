import express from "express";
import { Bot, Context, MemorySessionStorage, session } from "grammy";
import { run } from "@grammyjs/runner";
import {
  AccountCallback,
  BuyCallback,
  FundCallback,
  PositionsCallback,
  RequestCACallback,
  SettingsCallback,
  StartContext,
  TokenProfileCallback,
  WithdrawCallback,
} from "../controllers/callbackQueries";
import {
  handleFundWallet,
  handleFundWithdrawal,
  handleTokenBuy,
  handleTokenCA,
} from "../controllers/messageHandler";
import type {
  ISessionData,
  ISessionMemoryData,
  ISessionStorageData,
  TContext,
} from "../d";
import { initialStateData, initialStoreData } from "../helpers/store";

const router = express.Router();

const botToken = process.env.TG_BOT_API!;

let bot: Bot<TContext> | null = null;

const getBotInstance = () => {
  try {
    if (!bot) {
      bot = new Bot<TContext>(botToken);

      bot.use(
        session({
          type: "multi",
          state: {
            initial: initialStateData,
          },
          store: {
            initial: initialStoreData,
          },
        })
      );

      bot.command("start", StartContext);

      bot.on("message", async (ctx: Context) => {
        const replyText: string | undefined =
          ctx.message?.reply_to_message?.text;
        const isReply: boolean = !!replyText;

        if (!isReply) {
          handleTokenCA(ctx);
        } else {
          switch (replyText) {
            case "Please paste the Contract Address of the token you wish to buy in the chat":
              handleTokenCA(ctx);
              break;
            case "How much would you like to credit into your account?":
              handleFundWallet(ctx);
              break;
            case "How much would you like to withdraw?":
              handleFundWithdrawal(ctx);
              break;
            case "Please input the amount you want to buy in USDC":
              handleTokenBuy(ctx);
              break;
            default:
              handleTokenCA(ctx);
          }
        }
      });

      //   bot callbacks

      //   config callbacks
      bot.callbackQuery("settings", SettingsCallback);
      bot.callbackQuery("account", AccountCallback);
      bot.callbackQuery("back", StartContext);

      // wallet balance callbacks
      bot.callbackQuery("fund", FundCallback);
      bot.callbackQuery("withdraw", WithdrawCallback);

      //   trade callbacks
      bot.callbackQuery("request_ca", RequestCACallback);
      bot.callbackQuery("buy", BuyCallback);
      bot.callbackQuery("positions", PositionsCallback);
      bot.callbackQuery("sell (.+)/", (ctx) => {
        const ca = ctx.match[0];
        ctx.reply(`CA found ${ca}`);
      });
    }
    run(bot);
    console.log("Bot is now running");
  } catch (error) {
    console.log({ error });
  } finally {
    return bot;
  }
};

getBotInstance();

export default router;
