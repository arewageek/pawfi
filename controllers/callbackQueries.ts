import { InlineKeyboard, type Context } from "grammy";
import users from "../helpers/account";
import type { TContext, TToken } from "../d";
import meme from "../helpers/transactions";
import { format } from "../lib/number-formatter";

// start-bot context
export const StartContext = async (ctx: TContext) => {
  try {
    const sender = ctx.chat?.first_name;

    const user = await users.authenticate(ctx);

    console.log({ userFromCallback_Start: user });

    const stats = user.data?.stats || { count: 0, volume: 0 };
    const balance = Number(user.data?.balance);

    const welcomMessage = `\*Hey, ${sender}, Welcome to Pawn Finance\* 🤗
        \nWe present you with an opportunity to learn and perfect your understanding trading memes on solana
        \nThink of this as a learning environment where you can simulate trades without real funds
        \nYou will be provided with a demo wallet and can fund it at any time using using the deposit button below
        \n\*How to trade?💡\*\nSimply paste the CA in the chat and we'll take it up from there
        \n\*Wallet Balance: \`$${
          balance.toLocaleString() || 990
        }\`\* ┃ \*Total Trades: \`${
      stats.count.toLocaleString() || 340
    }\`\* ┃ \*Total Volume: \`$${stats.volume.toLocaleString() || 100}\`\*
        \n⚠️\*Please note:\* This bot is 100% free to use
        `;

    ctx.reply(welcomMessage, {
      parse_mode: "MarkdownV2",
      reply_markup: new InlineKeyboard()
        .text("Buy 🟢", "request_ca")
        .text("Positions 📈", "positions")
        .row()
        .text("Account 💰", "account")
        // .text("Settings ⚙️", "settings")
        .text("⟲ Refresh", "refresh")
        // .row()
        .row()
        .url("Follow us on X", "https://x.com/paw_fi")
        .url("Follow our dev", "https://x.com/arewaofweb3"),
    });
  } catch (error) {
    console.log({ startMessageError: error });
  }
};

// trade callbacks
export const RequestCACallback = async (ctx: Context) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    "Please paste the Contract Address of the token you wish to buy in the chat",
    { reply_markup: { force_reply: true } }
  );
};

export const SettingsCallback = async (ctx: Context) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText("Editted for the settings callback");
};

export const AccountCallback = async (ctx: Context) => {
  await ctx.answerCallbackQuery();

  const user = await users.authenticate(ctx);
  const { balance, stats } = user?.data!;
  const response = `Below you find information about your account and options to update your balance
  \n\*Wallet Balance: \`$${
    balance.toLocaleString() || 0
  }\`\* ┃ \*Total Trades: \`${
    stats.count.toLocaleString() || 0
  }\`\* ┃ \*Total Volume: \`$${stats.volume.toLocaleString() || 0}\`\*
  `;
  await ctx.editMessageText(response, {
    parse_mode: "MarkdownV2",
    reply_markup: new InlineKeyboard()
      .text("⬅ Back", "back")
      .text("⚠️🚨 Reset Account 🚨⚠️", "reset_account")
      .row()
      .text("⏬ Fund Wallet", "fund")
      .text("⏫ Withdraw", "withdraw"),
  });
};

// ████████

export const FundCallback = async (ctx: Context) => {
  const response = "How much would you like to credit into your account?";
  await ctx.reply(response, { reply_markup: { force_reply: true } });
};

export const WithdrawCallback = async (ctx: Context) => {
  const response = "How much would you like to withdraw?";
  await ctx.reply(response, { reply_markup: { force_reply: true } });
};

export const BuyCallback = async (ctx: Context) => {
  const reply = "Please input the amount you want to buy in USDC";
  await ctx.reply(reply, { reply_markup: { force_reply: true } });
};

export const PositionsCallback = async (ctx: TContext) => {
  const trader = ctx.chatId!;

  let positions: TToken[];

  if (ctx.session.positions.length > 0) {
    positions = ctx.session.positions;
  } else {
    const trades = await meme.positions(trader);
    positions = trades.data!;

    ctx.session.positions = positions;
  }

  console.log({ positionsFromQuery: positions });

  const inlineKeyboard = new InlineKeyboard();

  if (positions?.length) {
    positions.forEach((trade, index) => {
      const contextCallback = `sell ${trade.ca}`;

      inlineKeyboard.text(
        `${trade.name} (${format(trade.trades, 6)} $${trade.symbol})`,
        contextCallback
      );

      index % 2 === 1 && inlineKeyboard.row();
    });
  } else {
    inlineKeyboard.text("No open trades", "no_trades");
  }

  inlineKeyboard.row().text("Back", "back");

  const reply = `\*Managing your Open trades\*\n\n\*Balance:\* $${format(
    positions.meta?.balance!
  )}\n*Positions:* ${positions.meta?.trades.count!} trades\n`;

  await ctx.reply(reply, {
    parse_mode: "Markdown",
    reply_markup: inlineKeyboard,
  });
};

export const TokenProfileCallback = async (ctx: Context) => {
  // const ca = ctx.match?.[0]!;
  // const tokenDetails = await meme.data(ca);
  const reply = `Content`;
  const inlineKeyboard = new InlineKeyboard();
  inlineKeyboard
    .text("Back", "back")
    .text("Refresh", "refresh")
    .row()
    .text("Buy More", "buy_more")
    .text("Sell Initials", "sell_initials")
    .row()
    .text("Sell", "sell");

  ctx.reply(reply);
};
