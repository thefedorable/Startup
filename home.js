let boxes = document.getElementsByClassName('box').length;

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

function saveScore(score) {
    const userName = this.getPlayerName();
    let scores = [];
    const scoresText = localStorage.getItem('scores');
    if (scoresText) {
      scores = JSON.parse(scoresText);
    }
    scores = this.updateScores(userName, score, scores);

    localStorage.setItem('scores', JSON.stringify(scores));
  }

  function updateScores(userName, score, scores) {
    const newScore = { name: userName, score: score};

    let found = false;
    for (const [i, prevScore] of scores.entries()) {
      if (newScore.name === prevScore.name) {
        delete scores[i];
        scores.splice(i, 0, newScore);
        found = true;
        break;
      }

      else if (score > prevScore.score) {
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

    return scores;
  }

//for loading
for(let i = 1; i <= boxes; i++){
  if(localStorage.length > 0){
    var checked = JSON.parse(localStorage.getItem("checkbox" + String(i)));
    document.getElementById(String(i)).checked = checked;
  }
}
window.addEventListener('change', save);