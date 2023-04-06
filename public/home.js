let boxes = document.getElementsByClassName('box').length;
const GameEndEvent = 'gameEnd';
const GameStartEvent = 'gameStart';


function start() {
  this.configureWebSocket();
  
  for(let i = 1; i <= boxes; i++){
    if(localStorage.length > 0){
      var checked = JSON.parse(localStorage.getItem("checkbox" + String(i)));
      document.getElementById(String(i)).checked = checked;
    }
  }
  this.broadcastEvent(this.getPlayerName(), GameStartEvent, {});

}
function save() {	
  for(let i = 1; i <= boxes; i++){
	  var checkbox = document.getElementById(String(i));
    localStorage.setItem("checkbox" + String(i), checkbox.checked);	
  }
}

function getCount() {
    const count = document.querySelectorAll('input[type="checkbox"]:checked').length;
    localStorage.setItem("count",count);
    saveScore(count);
}

function getPlayerName() {
    return localStorage.getItem('userName') ?? 'Mystery player';
}

function clean() {
    localStorage.clear();
}

function updateScore(score) {
  const scoreEl = document.querySelector('#score');
  scoreEl.textContent = score;
}

async function saveScore(score) {
  const userName = this.getPlayerName();
  const newScore = { name: userName, score: score};

  try {
    const response = await fetch('/api/score', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newScore),
    });

    this.broadcastEvent(userName, GameEndEvent, newScore);

    // Store what the service gave us as the high scores
    const scores = await response.json();
    localStorage.setItem('scores', JSON.stringify(scores));
  } catch {
    // If there was an error then just track scores locally
    this.updateScoresLocal(newScore);
  }
}

function updateScoresLocal(newScore) {
  let scores = [];
  const scoresText = localStorage.getItem('scores');
  if (scoresText) {
    scores = JSON.parse(scoresText);
  }

  let found = false;
  for (const [i, prevScore] of scores.entries()) {
    if (newScore > prevScore.score) {
      scores.splice(i, 0, newScore);
      found = true;
      break;
    }
  }

  if (!found) {
    scores.push(newScore);
  }

  if (scores.length > 10) {
    scores.length = 10;
  }

  localStorage.setItem('scores', JSON.stringify(scores));
}

function configureWebSocket() {
  const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
  this.socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
  this.socket.onopen = (event) => {
    this.displayMsg('system', 'You are', 'connected');
  };
  this.socket.onclose = (event) => {
    this.displayMsg('system', 'You are', 'disconnected');
  };
  this.socket.onmessage = async (event) => {
    const msg = JSON.parse(await event.data.text());
    if (msg.type === GameEndEvent) {
      this.displayMsg('player', msg.from, `has completed ${msg.value.score}`);
    } else if (msg.type === GameStartEvent) {
      this.displayMsg('player', msg.from, `started tracking`);
    }
  };
}

function displayMsg(cls, from, msg) {
  const chatText = document.querySelector('#player-messages');
  chatText.innerHTML =
    `<div class="event"><span class="${cls}-event">${from}</span> ${msg}</div>` + chatText.innerHTML;
}

function broadcastEvent(from, type, value) {
  const event = {
    from: from,
    type: type,
    value: value,
  };
  this.socket.send(JSON.stringify(event));
}

// function saveScore(score) {
//     const userName = this.getPlayerName();
//     let scores = [];
//     const scoresText = localStorage.getItem('scores');
//     if (scoresText) {
//       scores = JSON.parse(scoresText);
//     }
//     scores = this.updateScores(userName, score, scores);

//     localStorage.setItem('scores', JSON.stringify(scores));
//   }

//   function updateScores(userName, score, scores) {
//     const newScore = { name: userName, score: score};

//     let found = false;
//     for (const [i, prevScore] of scores.entries()) {
//       if (newScore.name === prevScore.name) {
//         delete scores[i];
//         scores.splice(i, 0, newScore);
//         found = true;
//         break;
//       }

//       else if (score > prevScore.score) {
//         scores.splice(i, 0, newScore);
//         found = true;
//         break;
//       }
//     }

//     if (!found) {
//       scores.push(newScore);
//     }

//     if (scores.length > 10) {
//       scores.length = 10;
//     }

//     return scores;
//   }

//for loading
this.start();

window.addEventListener('change', save);