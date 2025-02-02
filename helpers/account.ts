import type { Context } from "grammy";
import { connectMongoDB } from "../lib/mongodb";
import User, { type IUser } from "../models/User.model";
import prisma from "../config/prisma";

class Users {
  async authenticate(ctx: Context): Promise<{
    success: Boolean;
    data?: IUser;
    message?: string;
  }> {
    try {
      const chatId = ctx.chatId?.toString()!;

      const user = await prisma.user.findFirst({ where: { chatId } });

      console.log({ userFromControllerStat: user });

      if (!user) {
        const trader = await prisma.user.create({
          data: {
            chatId: chatId,
            balance: 0,
          },
        });

        console.log({ trader });

        return {
          success: true,
          message: "Your account has been successfully created",
        };
      }
      return { success: true, message: "" };
    } catch (error) {
      console.log({ error });
      return { success: false, message: "Error verifying user" };
    }
  }

  async find(chatId: number) {
    try {
      connectMongoDB();
      const user = await User.findOne({ chatId });
      return user;
    } catch (error) {
      return null;
    }
  }

  async fund({
    chatId,
    amount,
  }: {
    chatId: number;
    amount: number;
  }): Promise<{ success: boolean }> {
    try {
      connectMongoDB();
      const user = await User.findOne({ chatId });
      const balance = { prev: user.balance, new: user.balance };
      balance.new = balance.prev + amount;

      user.balance = balance.new;
      user.save();

      return { success: true };
    } catch (error) {
      console.log({ fundWalletError: error });
      return { success: false };
    }
  }

  async withdraw({
    amount,
    chatId,
  }: {
    amount: number;
    chatId: number;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const user = await this.find(chatId);
      if (!user) return { success: false };

      if (user.balance < amount)
        return { success: false, message: "Insufficient funds in wallet" };

      const balance = { old: user.balance, new: user.balance };
      balance.new = balance.old - amount;
      user.balance = balance.new;
      user.save();
      return { success: true };
    } catch (error) {
      console.log({ error });
      return { success: false };
    }
  }
}

const users = new Users();

export default users;
