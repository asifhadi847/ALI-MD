const { cmd ,commands } = require('../command');
const { exec } = require('child_process');
const config = require('../config');
const {sleep} = require('../lib/functions')

const botOwner = "923003588997"; // Ensure owner number is correctly set

const isAuthorizedUser = (sender, bot) => {
  return sender.includes(botOwner) || sender.includes(bot.user.id.split(":")[0]);
};

// 1. Shutdown Bot
cmd({
    pattern: "shutdown",
    desc: "Shutdown the bot.",
    category: "owner",
    react: "🛑",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    reply("🛑 Shutting down...").then(() => process.exit());
});
// 2. Broadcast Message to All Groups
cmd({
    pattern: "broadcast",
    desc: "Broadcast a message to all groups.",
    category: "owner",
    react: "📢",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, args, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    if (args.length === 0) return reply("📢 Please provide a message to broadcast.");
    const message = args.join(' ');
    const groups = Object.keys(await conn.groupFetchAllParticipating());
    for (const groupId of groups) {
        await conn.sendMessage(groupId, { text: message }, { quoted: mek });
    }
    reply("📢 Message broadcasted to all groups.");
});
// 3. Set Profile Picture
cmd({
    pattern: "setpp",
    desc: "Set bot profile picture.",
    category: "owner",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, quoted, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    if (!quoted || !quoted.message.imageMessage) return reply("❌ Please reply to an image.");
    try {
        const media = await conn.downloadMediaMessage(quoted);
        await conn.updateProfilePicture(conn.user.jid, { url: media });
        reply("🖼️ Profile picture updated successfully!");
    } catch (error) {
        reply(`❌ Error updating profile picture: ${error.message}`);
    }
});
// 8. Group JIDs List
cmd({
    pattern: "gjid",
    desc: "Get the list of JIDs for all groups the bot is part of.",
    category: "owner",
    react: "📝",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");
    const groups = await conn.groupFetchAllParticipating();
    const groupJids = Object.keys(groups).join('\n');
    reply(`📝 *Group JIDs:*\n\n${groupJids}`);
});
cmd(
  {
    pattern: "pin",
    desc: "Pins a chat 📌",
    category: "user",
    filename: __filename,
  },
  async (conn, mek, m, { sender, from }) => {
    if (!isAuthorizedUser(sender, conn)) return;

    try {
      await conn.chatModify({ pin: true }, from);
    } catch (error) {
      console.error(`Failed to pin chat: ${error.message}`);
    }
  }
);

// Unpin a chat
cmd(
  {
    pattern: "unpin",
    desc: "Unpins a chat ❌",
    category: "user",
    filename: __filename,
  },
  async (conn, mek, m, { sender, from }) => {
    if (!isAuthorizedUser(sender, conn)) return;

    try {
      await conn.chatModify({ pin: false }, from);
    } catch (error) {
      console.error(`Failed to unpin chat: ${error.message}`);
    }
  }
);

// Archive a chat
cmd(
  {
    pattern: "archive",
    desc: "Archives a chat 📂",
    category: "user",
    filename: __filename,
  },
  async (conn, mek, m, { sender, from }) => {
    if (!isAuthorizedUser(sender, conn)) return;

    try {
      await conn.chatModify({ archive: true }, from);
    } catch (error) {
      console.error(`Failed to archive chat: ${error.message}`);
    }
  }
);

// Unarchive a chat
cmd(
  {
    pattern: "unarchive",
    desc: "Unarchives a chat 📂",
    category: "user",
    filename: __filename,
  },
  async (conn, mek, m, { sender, from }) => {
    if (!isAuthorizedUser(sender, conn)) return;

    try {
      await conn.chatModify({ archive: false }, from);
    } catch (error) {
      console.error(`Failed to unarchive chat: ${error.message}`);
    }
  }
);

// Clear chat
cmd(
  {
    pattern: "clear",
    desc: "Clears the chat history 🗑️",
    category: "user",
    filename: __filename,
  },
  async (conn, mek, m, { sender, from }) => {
    if (!isAuthorizedUser(sender, conn)) return;

    try {
      await conn.chatModify({ clear: true }, from);
    } catch (error) {
      console.error(`Failed to clear chat: ${error.message}`);
    }
  }
);
