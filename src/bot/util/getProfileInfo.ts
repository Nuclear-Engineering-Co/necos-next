import Noblox, { PlayerInfo } from "noblox.js";
import { Bot } from "../../necos";
const { getPlayerInfo, getIdFromUsername } = Noblox;

export default async (
  bot: Bot,
  username: string
): Promise<[PlayerInfo, number]> => {
  const userId =
    bot.userIdCache[username] ||
    (await getIdFromUsername(username).catch((error) => {
      throw new Error(`Username failed to fetch. ${error}`);
    }));

  bot.userIdCache[username] = userId;

  const playerInfo = await getPlayerInfo(userId).catch((error) => {
    throw new Error(`PlayerInfo failed to fetch. ${error}`);
  });

  return [playerInfo, userId];
};
