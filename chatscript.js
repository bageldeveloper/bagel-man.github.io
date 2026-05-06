    // ---- CHAT PANEL LOGIC ----
    // ---- CHAT PANEL LOGIC ----
 
    const CLIENT_ID = '5Qcspn6KZFL4fZ97';
    const coolDown = 1500;
    let lastClick = Date.now() - coolDown;
    let members = [];
    let chatDrone;
 
    function getRandomName() {
      const adjs = ["cool","angry","giant","fat","stupid","yummy","slimy","bloody","floppy","tiny","salty","dirty","crazy","lazy","adorable","average","bored","greasy","chubby","useless","foolish","nasty","helpless","nutty","juicy","itchy","sportsy","jolly","hot","cold","saucy","old","innocent","embarrassing","monstrous","powerful","sexy","darth","deadly","star_spangled","patriotic","short_handed","mentally_insane","insane","ice_cold","man-eating","cold_blooded","long_distance","shocking","agents_of","disturbing","burning","frosty","chilly","freeze","beefy","radical","wacky","moist","hairy","spicy","slimy","totally_tubular","tubular","literally_insane","gaming","eating_this"];
      const nouns = ["bagel","kitty","guy","muffin","cat","corndog","keyboard","salt","gamer","fish","dog","chicken","nugget","nerd","face","paper","hotdog","burger","fries","drink","mouse","tiger","doofus","president","taylor_swift","discord_mod","policeman","spider","fridge","robot","rice","ninja","egg","sausage","girlfriend","boyfriend","bro","dude","sterling","turtle","toothbrush","peanut_butter","spider_man","vader","star","iron_man","destroyer","captain","michael_jordan","bull","maul","batman","alien","big_mac","stormtrooper","shield","mickey_mouse","zombie","ghost","snowman","turkey","jerky","mustard","tree","meme","baka","smuggler","bounty_hunter","officer","critical","copyright"];
      if (Math.floor(Math.random() * 100) === 69) return "The Ultimate Gamer";
      if (Math.floor(Math.random() * 1000000000000) === 420) return "Dirty Dan";
      return adjs[Math.floor(Math.random() * adjs.length)] + "_" + nouns[Math.floor(Math.random() * nouns.length)];
    }
    function getRandomColor() {
      return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    }
 
    // Connect immediately on page load — counts you as online right away
    chatDrone = new ScaleDrone(CLIENT_ID, {
      data: { name: getRandomName(), color: getRandomColor() }
    });
 
    chatDrone.on('open', () => {
      const room = chatDrone.subscribe('observable-room');
      room.on('members', m => { members = m; updatePanelMembers(); });
      room.on('member_join', m => { members.push(m); updatePanelMembers(); });
      room.on('member_leave', ({ id }) => {
        members.splice(members.findIndex(m => m.id === id), 1);
        updatePanelMembers();
      });
      room.on('data', (text, member) => {
        if (member) addPanelMessage(text, member);
      });
    });
 
    function updatePanelMembers() {
      const count = members.length;
      document.getElementById('online-count').textContent = count;
      document.getElementById('panel-member-count').textContent = count + ' nerd' + (count !== 1 ? 's' : '') + ' online';
      const list = document.getElementById('panel-members-list');
      list.innerHTML = '';
      members.forEach(m => {
        const el = document.createElement('span');
        el.className = 'member';
        el.textContent = m.clientData.name;
        el.style.color = m.clientData.color;
        list.appendChild(el);
      });
    }
 
    function addPanelMessage(text, member) {
      const box = document.getElementById('panel-messages');
      const msg = document.createElement('div');
      msg.className = 'message';
      const nameEl = document.createElement('span');
      nameEl.className = 'member';
      nameEl.textContent = member.clientData.name;
      nameEl.style.color = member.clientData.color;
      msg.appendChild(nameEl);
      msg.appendChild(document.createTextNode(text));
      box.appendChild(msg);
      box.scrollTop = box.scrollHeight;
    }
 
    // Single submit handler — covers both Enter and button click, never double-fires
    document.getElementById('panel-form').addEventListener('submit', e => {
      e.preventDefault();
 
      const now = Date.now();
      // Always update lastClick first so blocked messages still reset the timer
      const isSpam = now - lastClick < coolDown;
      lastClick = now;
 
      if (isSpam) {
        new Audio('stopspamming.mp3').play();
        alert('ayo dude stop spamming');
        return;
      }
 
      const input = document.getElementById('panel-input');
      const value = input.value.trim();
      if (!value) return;
      if (value.match(/(黑鬼|ass|cum|retard|bitch|shit|cunt|cock|dick|fuck|nigger|nigga|pussy|nazi|whore|faggot|handjob|penis|sex|hitler|niger|titties|gay|tit|boob|@ss|c0ck|b!tch|pu\$\$y|por|nigas|pp|incest|p0r|rape|r@pe|slut|threesum|foursum|twosum|shiz|p0r|nigg)/gi)) {
        alert('cmon man why you saying that kinda stuff?');
        return;
      }
      if (value.length > 100) {
        alert('my guy, that message is too big.. just like your mom gottem');
        return;
      }
      input.value = '';
      chatDrone.publish({ room: 'observable-room', message: value });
    });
 
    function toggleChat() {
      document.getElementById('chat-panel').classList.toggle('open');
    }