const conf = require('./config.js');
const fs = require('fs');
const noblox = require('noblox.js');
const axios = require('axios');
const configPath = './config.json';

let run = true;
if (conf.ROBLOX_COOKIE.trim() === '') {
  run = false;
  console.log('Roblox Cookie is empty. Please add a cookie to the config.json file');
  setTimeout(() => process.kill(0), 5000);
}

(async () => {
  if (!run) return;
  try {
    const currentUser = await noblox.setCookie(conf.ROBLOX_COOKIE);
    console.log(`Logged in as ${currentUser.name}`);

    let friendIds = [];
    let nextCursor = null;

    do {
      let url = `https://friends.roblox.com/v1/users/${currentUser.id}/friends/find`;
      if (nextCursor) {
        url += `?cursor=${nextCursor}`;
      }

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
      console.log(`Friends list is empty. Updating with ${friendIds.length} current friends...`);
      config.Friends = friendIds;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
      console.log('Config updated with current friends.');
    } else {
      const newFriends = friendIds.filter(id => !existingFriends.includes(id));

      if (newFriends.length > 0) {
        console.log(`Removing ${newFriends.length} new friends...`);
        for (const id of newFriends) {
          await noblox.removeFriend(id);
        }
      } else {
        console.log('No new friends to unfriend.');
      }
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }

  console.log('You can close this now.');
  setInterval(() => {}, 1000);
})();
