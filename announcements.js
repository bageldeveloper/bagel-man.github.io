// =============================================
// ANNOUNCEMENTS
// =============================================
const ANNOUNCEMENTS = [
  { id: 'ann-2026-08-10', date: 'August 14th, 2026', text: 'Welcome back everyone! We touched up all the games over the summer, so all the games are working now. Additionally, if bagelcomics.com is blocked in your school district, you can access the canvas version at tinyurl.com/bagelcomicsunblocked -Carter' },
  { id: 'ann-2026-05-10', date: 'May 12th, 2026', text: 'I apologize for anyone using the canvas course since it got hacked. However, some of the games on canvas still work, so go to tinyurl.com/bagelminecraft for the time being. -Carter' },
  { id: 'ann-2026-05-10b', date: 'May 10th, 2026', text: 'Hey guys! I added Drats, Phobia, and The Jimmy Bean Game, you can find them under the orginal games section. -Tom' },
  { id: 'ann-2026-05-07', date: 'May 7th, 2026', text: 'You can pick your own name in the chat now! Also maybe youll see one of us in the chat hehe ;) -Tom' },
  { id: 'ann-2026-02-13', date: 'February 13th, 2026', text: 'The website has been overhauled, looks better, easier to navigate, and less of a mess. Also added wheely games. -Tom' },
  { id: 'ann-2025-10-11', date: 'October 11th, 2025', text: "Long time no see. Daniel had a bunch of unreleased flash games (now available) and I've fixed Minecraft 1.8. -Carter" },
  { id: 'ann-2025-02-14', date: 'February 14th, 2025', text: 'Updated the site with more games. The Jimmy Bean game is now on here. -Tom' },
  { id: 'ann-2023-11-15b', date: 'November 15th, 2023', text: "Haven't really done much this past month. We are gonna start it back up hopefully. -Carter" },
  { id: 'ann-2023-11-15a', date: 'November 15th, 2023', text: 'NEW GAME RELEASE ON THANKSGIVING -Carter' },
  { id: 'ann-2023-11-13', date: 'November 13th, 2023', text: 'THE NEW WEBSITE IS BAGELCOMICS.ORG GUYS GO TO IT NOW -tom' },
  { id: 'ann-2023-11-09', date: 'November 9th, 2023', text: "Bruh we get blocked after like 20 minutes?! Anyways new site will be bagelcomics.org. Edit: SOMEONE SUBSCRIBED TO THE PATREON!!!!! -Dirty Dan" },
  { id: 'ann-2023-11-08', date: 'November 8th, 2023', text: 'Added some new chat names. Also NGW baby! Added Crush the Castle 1 and 2, Strike Force Heroes 1, 2, and 3. -Dirty Dan' },
  { id: 'ann-2023-11-06b', date: 'November 6th, 2023', text: 'Added a Sterling quote of the day in the projects page. Check it everyday for out of context Sterling quotes. -Dirty Dan' },
  { id: 'ann-2023-11-06a', date: 'November 6th, 2023', text: 'Added a Game of the Day section to keep things new and fresh every day. -Dirty Dan' },
  { id: 'ann-2023-11-01', date: 'November 1st, 2023', text: "Halloween is over. Added Zelda Link to the Past, Earthbound, Banjo Kazooie, Line Rider 2 and 3. Also added a shop on the Patreon. -Dirty Dan" },
  { id: 'ann-2023-10-31', date: 'October 31st, 2023', text: 'Sorry that the website was broken this morning, hopefully we fixed it. Happy Halloween! -Tom' },
  { id: 'ann-2023-10-28', date: 'October 28th, 2023', text: 'Chat is back! We now have a Patreon with benefits and a free tier. -The whole bagelcomics team' },
  { id: 'ann-2023-10-18', date: 'October 18th, 2023', text: 'NGW is back! Added the rest of the Hobo Games (3rd through 7th). -Dirty Dan' },
  { id: 'ann-2023-10-10', date: 'October 10th, 2023', text: 'bagelcomics.com is dead, we are EGGYOLKERS. Also removed chat cuz no one used it. -Tom' },
  { id: 'ann-2023-10-08', date: 'October 8th, 2023', text: "NGW is back! Added the Waitress and Escape Series games. -Dirty Dan" },
  { id: 'ann-2023-10-04', date: 'October 4th, 2023', text: 'You like the spooky theme? Also added Mega Man X2 and X3. Happy Halloween! -Dirty Dan' },
  { id: 'ann-2023-09-27', date: 'September 27th, 2023', text: 'Still a competition going on. Added every Red Ball game I could find. -Dirty Dan' },
  { id: 'ann-2023-09-25b', date: 'September 25th, 2023', text: 'Added Star Wars Episode 1 Racer. Also announcing a tournament — winner gets a mystery gift! -Dirty Dan' },
  { id: 'ann-2023-09-25a', date: 'September 25th, 2023', text: "Unfortunately Tom doesn't want to work on this anymore so it's just me and Daniel. -Carter" },
  { id: 'ann-2023-09-21', date: 'September 21st, 2023', text: 'WE ARE SO BACK BABY WOOOOOOOOOOOO -Tom' },
  { id: 'ann-2023-06-19', date: 'June 19th, 2023', text: 'Games section was a little unorganized. Made it fit the vibe better. -Dirty Dan' },
  { id: 'ann-2023-05-18', date: 'May 18th, 2023', text: 'Added Super Smash Bros, Super Punch Out!!, and Stop GMO. Moved old Nintendo games to the Nintendo Games Section. -Dirty Dan' },
  { id: 'ann-2023-05-15', date: 'May 15th, 2023', text: 'New emulator for N64, NES, SNES, NDS, and SEGA Genesis! Now you can fullscreen and customize controls. -Dirty Dan' },
  { id: 'ann-2023-05-13', date: 'May 13th, 2023', text: 'Added literally every Papa game ever made. -Dirty Dan' },
  { id: 'ann-2023-05-12', date: 'May 12th, 2023', text: 'Added ANOTHER ZELDA GAME, BATMAN, DUCKTALES, SUPER MARIO BROS 1/2/3, PUNCH OUT!, MEGA MAN 2, CONTRA, and more! -Dirty Dan' },
  { id: 'ann-2023-05-08b', date: "May 8th, 2023", text: "It's my Birthday :) -Dirty Dan" },
  { id: 'ann-2023-05-06', date: 'May 6th, 2023', text: "Papas games aren't broken anymore! Also fixed Awesome Tanks 2 and Learn to Fly 2. -Dirty Dan" },
  { id: 'ann-2023-04-27', date: 'April 27th, 2023', text: 'Added some good old checkers. Still recruiting! -Dirty Dan' },
  { id: 'ann-2023-04-25', date: 'April 25th, 2023', text: "New Games Tuesday? Added Mario Kart 64 and fixed multiple Papas games. -Tom" },
  { id: 'ann-2023-04-13', date: 'April 13th, 2023', text: 'Added raft wars :)' },
  { id: 'ann-2023-03-23', date: 'March 23rd, 2023', text: 'I set the repository to private but that broke everything so I\'m sorry that it was down yesterday.' },
  { id: 'ann-2023-03-21', date: 'March 21st, 2023', text: 'New game wednesday! Added Papas Pancakeria, Papas Hotdogeria, Papas Burgeria, Plants vs Zombies 1 & 2, and Line Rider. -Tom' },
  { id: 'ann-2023-03-15', date: 'March 15th, 2023', text: 'New games: Vex 6, Getaway Shootout, Drift Hunters, and Awesome Tanks 2. -Tom' },
  { id: 'ann-2023-03-01', date: 'March 1st, 2023', text: 'Starting NGW! New games: Canyon Defense, 1 on 1 Soccer, Chibi Knight, 8 Ball Pool, Portal 2D, and Siftheads. -Tom' },
  { id: 'ann-2023-01-16', date: 'January 16th, 2023', text: 'Got the 1.8 Minecraft client actually working. -Tom' },
  { id: 'ann-2022-12-09b', date: 'December 9th, 2022', text: 'Bagel Royal is working (not on Chromebooks sadly). Added Sword and Sandals 1 and 2. -Dirty Dan' },
  { id: 'ann-2022-12-07', date: 'December 7th, 2022', text: 'Added Jacksmith, which is a flash game someone asked for.' },
  { id: 'ann-2022-12-05', date: 'December 5th, 2022', text: "Added Quake 1/3, also added Zelda Ocarina of Time. -Dirty Dan" },
  { id: 'ann-2022-12-04', date: 'December 4th, 2022', text: 'New games: Duck Life 4 and all of the Riddle School games. Papas games coming soon. -Dirty Dan' },
  { id: 'ann-2022-12-03', date: 'December 3rd, 2022', text: 'Added Super Smash Flash, pretty fun.' },
  { id: 'ann-2022-11-20', date: 'November 20th, 2022', text: 'Added a whole truck load of new games including Learn to Fly 1, 2, and 3 and Art of War. -Dirty Dan' },
  { id: 'ann-2022-11-18', date: 'November 18th, 2022', text: 'Gave Carter editing access. Now working on it together. -Tom' },
  { id: 'ann-2022-11-06', date: 'November 6th, 2022', text: 'Added a Minecraft client, basically an exact port of 1.5. -Tom' },
  { id: 'ann-2022-11-01', date: 'November 1st, 2022', text: 'Made a new game for Thanksgiving lol. -Tom' },
  { id: 'ann-2022-10-31', date: 'October 31st, 2022', text: "WE HAVE CONTROL OF THE WEBSITE AGAIN! Slapped together an actual Bagel With a Gun 2 sneak peak. Also revamped the website! Happy Halloween! -Tom" },
  { id: 'ann-2022-09-26', date: 'September 26th, 2022', text: 'Added Super Mario 64! New game coming out pretty soon, stay tuned. -Tom' },
  { id: 'ann-2022-09-14', date: 'September 14th, 2022', text: 'Thank you for 10,000 visits! Also making a sequel to Bagel with a Gun. -Tom' },
  { id: 'ann-2022-09-08', date: 'September 8th, 2022', text: 'Made the announcements fancy. -Tom' },
];

function isUnseen(ann) { return !localStorage.getItem(ann.id); }
function getLatestUnseen() {
  const latest = ANNOUNCEMENTS[0];
  return localStorage.getItem(latest.id) ? null : latest;
}

function renderNewTab() {
  const ann = getLatestUnseen();
  const el = document.getElementById('ann-new-content');
  if (!ann) {
    el.innerHTML = '<div class="ann-caught-up">🎉 You\'re all caught up!</div>';
    return;
  }
  el.innerHTML = `
    <div class="ann-new-date">${ann.date}</div>
    <div class="ann-new-text">${ann.text}</div>
    <button class="ann-dismiss" onclick="dismissAnnouncement()">Dismiss</button>
  `;
}

function renderAllTab() {
  const list = document.getElementById('ann-all-list');
  list.innerHTML = '';
  ANNOUNCEMENTS.forEach(ann => {
    const div = document.createElement('div');
    div.className = 'ann-item' + (isUnseen(ann) ? ' unseen' : '');
    div.innerHTML = `<div class="ann-item-date">${ann.date}</div><div class="ann-item-text">${ann.text}</div>`;
    list.appendChild(div);
  });
}

function dismissAnnouncement() {
  const ann = getLatestUnseen();
  if (ann) localStorage.setItem(ann.id, '1');
  renderNewTab();
  renderAllTab();
  document.getElementById('announce-dot').classList.toggle('visible', !!getLatestUnseen());
}

function toggleAnnouncePanel() {
  const panel = document.getElementById('announce-panel');
  const isOpen = panel.classList.toggle('visible');
  if (isOpen) {
    document.getElementById('settings-panel').classList.remove('open');
    document.getElementById('chat-panel').classList.remove('open');
    switchAnnTab('new');
    renderNewTab();
  }
}

function switchAnnTab(tab) {
  document.getElementById('pane-new').classList.toggle('active', tab === 'new');
  document.getElementById('pane-all').classList.toggle('active', tab === 'all');
  document.getElementById('tab-new').classList.toggle('active', tab === 'new');
  document.getElementById('tab-all').classList.toggle('active', tab === 'all');
  if (tab === 'all') renderAllTab();
}

function initAnnouncements() {
  const hasUnseen = !!getLatestUnseen();
  document.getElementById('announce-dot').classList.toggle('visible', hasUnseen);
  renderNewTab();
  if (hasUnseen && !sessionStorage.getItem('annShown')) {
    sessionStorage.setItem('annShown', '1');
    setTimeout(() => {
      document.getElementById('announce-panel').classList.add('visible');
      switchAnnTab('new');
    }, 600);
  }
}

// Close announcement panel when clicking outside
document.addEventListener('click', e => {
  const panel = document.getElementById('announce-panel');
  const btn = document.getElementById('announce-btn');
  if (panel.classList.contains('visible') && !panel.contains(e.target) && !btn.contains(e.target)) {
    panel.classList.remove('visible');
  }
});

initAnnouncements();
