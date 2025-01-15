const fs = require('fs');
const noblox = require('noblox.js');
const axios = require('axios');
const colors = require('colors');
const prompt = require('prompt-sync')();
const conf = require('./config.js');

const configPath = './config.json';

(async () => {
  try {
    let cookie;
    if (!conf.ROBLOX_COOKIE || conf.ROBLOX_COOKIE.trim() === '') {
      const userCookie = prompt('Enter Your Roblox Cookie (or open config.json5 and put it there): '.yellow);
      if (!userCookie.trim()) {
        console.log('No cookie provided. Exiting in 5 seconds...'.red);
        setTimeout(() => process.exit(0), 5000);
        return;
      } else {
        let jsonConfig = {};
        try {
          jsonConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (err) {
          console.log(`Error: ${err.message}`.red);
          setTimeout(() => process.exit(0), 5000);
          return;
        }

        jsonConfig.ROBLOX_COOKIE = userCookie;
        ROBLOX_COOKIE = userCookie
        cookie = userCookie
        fs.writeFileSync(configPath, JSON.stringify(jsonConfig, null, 2), 'utf8');
        console.log('Roblox Cookie updated.'.green);
      }
    }

    const currentUser = await noblox.setCookie(conf.ROBLOX_COOKIE ? conf.ROBLOX_COOKIE : cookie);
    console.log(`Logged in as ${currentUser.name}`.green);

    let friendIds = [];
    let nextCursor = null;

    do {
      let url = `https://friends.roblox.com/v1/users/${currentUser.id}/friends/find`;
      if (nextCursor) url += `?cursor=${nextCursor}`;

      const response = await axios.get(url, {
        headers: {
          cookie: `.ROBLOSECURITY=${conf.ROBLOX_COOKIE}`,
          'Content-Type': 'application/json',
        },
      });

      const friendData = response.data;
      friendIds.push(...friendData.PageItems.map(item => item.id));
      nextCursor = friendData.NextCursor;
    } while (nextCursor);

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const existingFriends = config.Friends || [];

    if (existingFriends.length === 0) {
      console.log(`Saving ${friendIds.length} current friends...`.yellow);
      config.Friends = friendIds;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
      console.log(`Saved ${friendIds.length} friends.`.green);
    } else {
      const newFriends = friendIds.filter(id => !existingFriends.includes(id));

      if (newFriends.length > 0) {
        console.log(`Removing ${newFriends.length} new friends...`.magenta);
        for (const id of newFriends) await noblox.removeFriend(id);
        console.log('Unfriending complete!'.green);
      } else {
        console.log('No new friends to unfriend.'.cyan);
      }
    }
  } catch (error) {
    console.error('An error occurred:'.red, error);
  }

  console.log('You can close this now.'.bold);
  setInterval(() => {}, 1000);
})();
