import Noblox, { PlayerInfo } from "noblox.js";
import { Bot } from "../../necos";
const { getPlayerInfo, getIdFromUsername } = Noblox;

export default async (
  bot: Bot,
  username: string
): Promise<[PlayerInfo, number]> => {
  let userId = undefined;

  try {
    userId = await getIdFromUsername(username)
  } catch (error) {
    console.log("it errorred");
    return [{
      username: "Unknown",
      displayName: "Unknown",
      blurb: "Unknown",
      joinDate: new Date(),
      isBanned: false
    }, -1]
  }

  if (!userId) return [{
    username: "Unknown",
    displayName: "Unknown",
    blurb: "Unknown",
    joinDate: new Date(),
    isBanned: false
  }, -1]

  bot.userIdCache[username] = userId;

  const playerInfo = await getPlayerInfo(userId).catch((error) => {
    throw new Error(`PlayerInfo failed to fetch. ${error}`);
  });

  return [playerInfo, userId];
};
