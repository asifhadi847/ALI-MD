const fs = require("fs");
const path = require("path");

const warningsFile = path.join(__dirname, "database/warnings.json");

// Ensure warnings file exists
const ensureWarningsFile = () => {
    if (!fs.existsSync(warningsFile)) {
        fs.writeFileSync(warningsFile, JSON.stringify({}));
    }
};

// Load warnings
const getWarnings = () => {
    ensureWarningsFile();
    return JSON.parse(fs.readFileSync(warningsFile, "utf-8"));
};

// Increment warning count
const incrementWarning = (groupJid, userJid) => {
    const warnings = getWarnings();
    if (!warnings[groupJid]) warnings[groupJid] = {};
    if (!warnings[groupJid][userJid]) warnings[groupJid][userJid] = 0;
    
    warnings[groupJid][userJid]++;
    fs.writeFileSync(warningsFile, JSON.stringify(warnings));
    
    return warnings[groupJid][userJid];
};

// Reset warning count
const resetWarning = (groupJid, userJid) => {
    const warnings = getWarnings();
    if (warnings[groupJid]) delete warnings[groupJid][userJid];
    fs.writeFileSync(warningsFile, JSON.stringify(warnings));
};

module.exports = {
    incrementWarning,
    resetWarning
};
