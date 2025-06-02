const fs = require("fs");
const { cmd, commands } = require('../command');
const config = require('../config');
const axios = require('axios');
const prefix = config.PREFIX;
const AdmZip = require("adm-zip");
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');

//--------------------------------------------
//  ANTI-LINK COMMANDS
//--------------------------------------------
cmd({
  pattern: "antilink",
  desc: "Configure ANTILINK system with menu",
  category: "owner",
  react: "🛡️",
  filename: __filename
}, async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    // Check for group, bot admin, and user admin permissions
    if (!isGroup) return reply('This command can only be used in a group.');
    if (!isBotAdmins) return reply('*📛 ι ɴєє∂ тσ вє αɴ α∂мιɴ тσ ᴜѕє тнιѕ ᴄσммαɴ∂.*');
    if (!isAdmins) return reply('*📛 σɴℓʏ gʀσᴜᴘ α∂мιɴs σʀ тнє σωɴєʀ ᴄαɴ ᴜsє тнιѕ ᴄσммαɴ∂.*');

    const currentMode =
      config.ANTI_LINK_KICK === "true"
        ? "кι¢к"
        : config.ANTI_LINK_WARN === "true"
        ? "ωαʀɴ"
        : config.ANTI_LINK_DELETE === "true"
        ? "∂єℓєтє"
        : "∂ιѕαвℓє∂";

    const text = `*⌈ ీ𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 𝐂𝐌𝐃 𝐆𝐔𝐈𝐃𝐄ీ ⌋*\n‎*╭──────────────────✑*\n‎*┋* *⬡ ☇ *¢ᴜʀʀєɴᴛ мσ∂є:${currentMode}*\n‎*┋* *⬡ 𝟏: αɴтι-ℓιɴк ωαʀɴ*\n‎*┋* *⬡ 𝟐: αɴтι-ℓιɴк ∂єℓєтє*\n*┋* *⬡ 𝟑: αɴтι-ℓιɴк кι¢к*\n‎*┋* *⬡ 𝟒: αɴтι-ℓιɴк αℓℓ ∂ιѕαвℓє∂*\n‎*╰──────────────────✑*\n> *© ᴘσωєʀє∂ ву αℓι м∂⎯꯭̽💀🐍*`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: "https://files.catbox.moe/33hd05.jpg" },
      caption: text
    }, { quoted: mek });

    const messageID = sentMsg.key.id;

    const handler = async (msgData) => {
      try {
        const receivedMsg = msgData.messages[0];
        if (!receivedMsg?.message || !receivedMsg.key?.remoteJid) return;

        const quotedId = receivedMsg.message?.extendedTextMessage?.contextInfo?.stanzaId;
        const isReply = quotedId === messageID;
        if (!isReply) return;

        const replyText =
          receivedMsg.message?.conversation ||
          receivedMsg.message?.extendedTextMessage?.text ||
          "";

        const sender = receivedMsg.key.remoteJid;

        // Reset all modes
        config.ANTI_LINK_DELETE = "false";
        config.ANTI_LINK_WARN = "false";
        config.ANTI_LINK_KICK = "false";

        if (replyText === "1") {
          config.ANTI_LINK_WARN = "true";
          await conn.sendMessage(sender, { text: "*✅ αɴтι-ℓιɴк ωαʀɴ нαѕ вєєи єɴαвℓє∂*" }, { quoted: receivedMsg });
        } else if (replyText === "2") {
          config.ANTI_LINK_DELETE = "true";
          await conn.sendMessage(sender, { text: "*✅ αɴтι-ℓιɴк ∂єℓєтє нαѕ вєєи єɴαвℓє∂*" }, { quoted: receivedMsg });
        } else if (replyText === "3") {
          config.ANTI_LINK_KICK = "true";
          await conn.sendMessage(sender, { text: "*✅ αɴтι-ℓιɴк кι¢к нαѕ вєєи єɴαвℓє∂*" }, { quoted: receivedMsg });
        } else if (replyText === "4") {
          await conn.sendMessage(sender, { text: "*❌ αɴтι-ℓιɴк all нαѕ вєєи ∂ιѕαвℓє∂*" }, { quoted: receivedMsg });
        } else {
          await conn.sendMessage(sender, { text: "*⛔ ιɴναℓι∂ σρтισɴ. ρℓєαѕє ʀєρℓу ωιтн 1, 2, 3, σʀ 4.*" }, { quoted: receivedMsg });
        }

        conn.ev.off("messages.upsert", handler);
      } catch (err) {
        console.log("Antilink handler error:", err);
      }
    };

    conn.ev.on("messages.upsert", handler);

    setTimeout(() => {
      conn.ev.off("messages.upsert", handler);
    }, 600000);
  } catch (e) {
    reply(`❗ Error: ${e.message}`);
  }
});
//
cmd({
  on: 'body'
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins
}) => {
  try {
    if (!isGroup || isAdmins || !isBotAdmins) {
      return;
    }
    const linkPatterns = [
  /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi,
  /^https?:\/\/(www\.)?whatsapp\.com\/channel\/([a-zA-Z0-9_-]+)$/,
  /wa\.me\/\S+/gi,
  /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,
  /https?:\/\/(?:www\.)?youtube\.com\/\S+/gi,
  /https?:\/\/youtu\.be\/\S+/gi,
  /https?:\/\/(?:www\.)?facebook\.com\/\S+/gi,
  /https?:\/\/fb\.me\/\S+/gi,
  /https?:\/\/(?:www\.)?instagram\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?twitter\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?tiktok\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?snapchat\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?pinterest\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,
  /https?:\/\/ngl\/\S+/gi,
  /https?:\/\/(?:www\.)?discord\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,
  /https?:\/\/(?:www\.)?vimeo\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?dailymotion\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?medium\.com\/\S+/gi
];
    const containsLink = linkPatterns.some(pattern => pattern.test(body));

    if (containsLink && config.ANTI_LINK_DELETE === 'true') {
      await conn.sendMessage(from, { delete: m.key }, { quoted: m });
      await conn.sendMessage(from, {
        'text': `*⚠️ ℓιɴкѕ αʀє ɴσт αℓℓσωє∂ ιɴ тнιѕ gʀσυρ* @⁨${sender.split('@')[0]}̄⁩ *ρℓєαѕє ανσι∂ ѕєɴ∂ιиg ℓιɴкѕ.🚫*`,
        'mentions': [sender]
      }, { 'quoted': m });
    }
  } catch (error) {
    console.error(error);
  }
});
//
cmd({
  'on': "body"
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {
  try {
    // Initialize warnings if not exists
    if (!global.warnings) {
      global.warnings = {};
    }

    // Only act in groups where bot is admin and sender isn't admin
    if (!isGroup || isAdmins || !isBotAdmins) {
      return;
    }

    // List of link patterns to detect
    const linkPatterns = [
      /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi, // WhatsApp links
      /https?:\/\/(?:api\.whatsapp\.com|wa\.me)\/\S+/gi,  // WhatsApp API links
      /wa\.me\/\S+/gi,                                    // WhatsApp.me links
      /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,         // Telegram links
      /https?:\/\/(?:www\.)?\.com\/\S+/gi,                // Generic .com links
      /https?:\/\/(?:www\.)?twitter\.com\/\S+/gi,         // Twitter links
      /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,        // LinkedIn links
      /https?:\/\/(?:whatsapp\.com|channel\.me)\/\S+/gi,  // Other WhatsApp/channel links
      /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,          // Reddit links
      /https?:\/\/(?:www\.)?discord\.com\/\S+/gi,         // Discord links
      /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,           // Twitch links
      /https?:\/\/(?:www\.)?vimeo\.com\/\S+/gi,           // Vimeo links
      /https?:\/\/(?:www\.)?dailymotion\.com\/\S+/gi,     // Dailymotion links
      /https?:\/\/(?:www\.)?medium\.com\/\S+/gi           // Medium links
    ];

    // Check if message contains any forbidden links
    const containsLink = linkPatterns.some(pattern => pattern.test(body));

    // Only proceed if anti-link is enabled and link is detected
    if (containsLink && config.ANTI_LINK_WARN === 'true') {
      console.log(`Link detected from ${sender}: ${body}`);

      // Try to delete the message
      try {
        await conn.sendMessage(from, {
          delete: m.key
        });
        console.log(`Message deleted: ${m.key.id}`);
      } catch (error) {
        console.error("Failed to delete message:", error);
      }

      // Update warning count for user
      global.warnings[sender] = (global.warnings[sender] || 0) + 1;
      const warningCount = global.warnings[sender];

      // Handle warnings
      if (warningCount < 4) {
        // Send warning message
        await conn.sendMessage(from, {
          text: `‎*⚠️ ℓιɴкѕ αʀє ɴσт αℓℓσωє∂ ⚠️*\n*╭────⬡ ᴡαʀɴιɴg ⬡────*\n*├▢ ᴜsєʀ :* @${sender.split('@')[0]}!\n*├▢ ᴄσᴜɴᴛ : ${warningCount}*\n*├▢ ʀєαѕσɴ : ℓιɴᴋ ѕєɴ∂ιɴg*\n*├▢ ᴡαʀɴ ℓιмιт : 3*\n*╰────────────────*`,
          mentions: [sender]
        });
      } else {
        // Remove user if they exceed warning limit
        await conn.sendMessage(from, {
          text: `@${sender.split('@')[0]} *нαѕ вєєи ʀємσνє∂ ᴡαʀɴ ℓιмιт єχᴄєє∂є∂!*`,
          mentions: [sender]
        });
        await conn.groupParticipantsUpdate(from, [sender], "remove");
        delete global.warnings[sender];
      }
    }
  } catch (error) {
    console.error("Anti-link error:", error);
    reply("❌ An error occurred while processing the message.");
  }
});
//
cmd({
  'on': "body"
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {
  try {
    if (!isGroup || isAdmins || !isBotAdmins) {
      return;
    }
    const linkPatterns = [
  /https?:\/\/(?:chat\.whatsapp\.com|wa\.me)\/\S+/gi,
  /^https?:\/\/(www\.)?whatsapp\.com\/channel\/([a-zA-Z0-9_-]+)$/,
  /wa\.me\/\S+/gi,
  /https?:\/\/(?:t\.me|telegram\.me)\/\S+/gi,
  /https?:\/\/(?:www\.)?youtube\.com\/\S+/gi,
  /https?:\/\/youtu\.be\/\S+/gi,
  /https?:\/\/(?:www\.)?facebook\.com\/\S+/gi,
  /https?:\/\/fb\.me\/\S+/gi,
  /https?:\/\/(?:www\.)?instagram\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?twitter\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?tiktok\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?linkedin\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?snapchat\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?pinterest\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?reddit\.com\/\S+/gi,
  /https?:\/\/ngl\/\S+/gi,
  /https?:\/\/(?:www\.)?discord\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?twitch\.tv\/\S+/gi,
  /https?:\/\/(?:www\.)?vimeo\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?dailymotion\.com\/\S+/gi,
  /https?:\/\/(?:www\.)?medium\.com\/\S+/gi
];
    const containsLink = linkPatterns.some(pattern => pattern.test(body));

    if (containsLink && config.ANTI_LINK_KICK === 'true') {
      await conn.sendMessage(from, { 'delete': m.key }, { 'quoted': m });
      await conn.sendMessage(from, {
        'text': `*⌈⚠️ ℓιɴк ∂єтє¢тє∂ ⌋*\n*╭────────────────┄┈┈*\n*│🫩 υѕєʀ:* @${sender.split('@')[0]}\n*│🛩️ кι¢кє∂: ѕυ¢¢єѕѕfυℓℓу!*\n*│📑 ʀєαѕσɴ: ℓιикѕ ɴσт αℓℓσωє∂*\n*╰────────────────┄┈┈*`,
        'mentions': [sender]
      }, { 'quoted': m });

      await conn.groupParticipantsUpdate(from, [sender], "remove");
    }
  } catch (error) {
    console.error(error);
    reply("An error occurred while processing the message.");
  }
});

cmd({
    pattern: "anti-bad",
    alias: ["antibadword","abw"],
    desc: "enable or disable antibad.",
    category: "owner",
    filename: __filename
},    
async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("_*❗This Command Can Only Be Used By My Owner !*_");

    const status = args[0]?.toLowerCase();
    // Check the argument for enabling or disabling the anticall feature
    if (args[0] === "on") {
        config.ANTI_BAD_WORD = "true";
        return reply("*✅ αитι-вα∂ ωσя∂ѕ нαѕ вєєи єɴαвℓє∂*");
    } else if (args[0] === "off") {
        config.ANTI_BAD_WORD = "false";
        return reply("*❌ αитι-вα∂ ωσя∂ѕ нαѕ вєєи ∂ιѕαвℓє∂*");
    } else {
        return reply(`*🏷️ єχαмρℓє: αɴтι-вα∂ σɴ/σff*`);
    }
});
// Anti-Bad Words System
cmd({
  'on': "body"
}, async (conn, m, store, {
  from,
  body,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply,
  sender
}) => {
  try {
    const badWords = ["wtf", "mia", "xxx", "سکس", "کوس", "غین", "کون", "fuck", 'sex', "boobs", "pakaya", 'porn', "hutto"];

    if (!isGroup || isAdmins || !isBotAdmins) {
      return;
    }

    const messageText = body.toLowerCase();
    const containsBadWord = badWords.some(word => messageText.includes(word));

    if (containsBadWord && config.ANTI_BAD_WORD === "true") {
      await conn.sendMessage(from, { 'delete': m.key }, { 'quoted': m });
      await conn.sendMessage(from, { 'text': "*⚠️ вα∂ ωσя∂ѕ иσт αℓℓσωє∂ ιи 🚫*" }, { 'quoted': m });
    }
  } catch (error) {
    console.error(error);
    reply("An error occurred while processing the message.");
  }
});
