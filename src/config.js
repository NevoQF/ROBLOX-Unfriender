const fs = require('fs');

const defaultConfig = `{
  "ROBLOX_COOKIE": "",
  "Friends": []
}`;

if (!fs.existsSync('./config.json')) {
  fs.writeFileSync('./config.json', defaultConfig);
}

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

module.exports = config;
