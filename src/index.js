const conf = require('./config.js');
const fs = require('fs');
const noblox = require('noblox.js');
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
    console.log(`Logged in as ${currentUser}`);

    const friends = await noblox.getFriends(currentUser.id);
    const friendIds = friends.data.map(friend => friend.id);

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const existingFriends = config.Friends || [];

    if (existingFriends.length === 0) {
      console.log('Friends list is empty. Updating with current friends...');
      config.Friends = friendIds;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
      console.log('Config updated with current friends.');
    } else {
      const newFriends = friendIds.filter(id => !existingFriends.includes(id));
      console.log(friendIds)
      if (newFriends.length > 0) {
        console.log(`Removing ${newFriends.length} new friends.`);
        newFriends.forEach(id => noblox.removeFriend(id));
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
