function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.sharingContainer = document.querySelector(".score-sharing");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continue = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var titleMsgs=new Array(11);
  titleMsgs[0]="九州是一滴水，我们希望它变成海洋。";
  titleMsgs[1]="";
  titleMsgs[2]="我们从月亮上，从石头上，从翻动的杂志书页上闻到了远古的气息，那就是九州的恐龙生涯。";
  titleMsgs[3]="那些年，那些男人，他们，还彼此相爱。";
  titleMsgs[4]="对你来说，也许只是需要买的杂志又多了一本。";
  titleMsgs[5]="我横竖睡不着，仔细看了半夜，才从字缝里看出字来，满本都写着两个字是“折现”！";
  titleMsgs[6]="又多了一本。";
  titleMsgs[7]="大过年打孩子，闲着也是闲着。";
  titleMsgs[8]="";
  titleMsgs[9]="";
  titleMsgs[10]="最终，我们仍然不知道要走向何方。";
  var getNumber = function (m) { var r = 0; while (m > 1) r++, m >>= 1; return r; }

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = "";
  if (tile.value <= 2048) inner.title = titleMsgs[getNumber(tile.value) - 1];

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var lostMsgs=new Array(11);
  lostMsgs[0]="虽然不知道你怎么做到的，但还是要恭喜你在一切的开端就逃离了苦海……"; // 4 科幻世界奇幻版、奇幻世界
  lostMsgs[1]="8 吐槽暂缺吐槽暂缺吐槽暂缺吐槽暂缺吐槽暂缺"; // 8 恐龙·九州幻想
  lostMsgs[2]="16 吐槽暂缺吐槽暂缺吐槽暂缺吐槽暂缺吐槽暂缺"; // 16 那些男人
  lostMsgs[3]="32 吐槽暂缺吐槽暂缺吐槽暂缺吐槽暂缺吐槽暂缺"; // 32 幻想1+1
  lostMsgs[4]="64 吐槽暂缺吐槽暂缺吐槽暂缺吐槽暂缺吐槽暂缺"; // 64 创造古卷
  lostMsgs[5]="128 吐槽暂缺吐槽暂缺吐槽暂缺吐槽暂缺吐槽暂缺"; // 128 九州志
  lostMsgs[6]="如果在一场闹剧中结束一切，也未尝不是一个不算太坏的结果。"; // 256 大过年打孩子
  lostMsgs[7]="有的时候，你以为有了曙光；但最终会发现，一切都是不过是奢望。"; // 512 纵横中文网
  lostMsgs[8]="到了这种境况……你还不明白吗？我们对他们的要求……看起来确实高了点啊。"; // 1024 九州世界OL
  var getNumber = function (m) { var r = 0; while (m > 1) r++, m >>= 1; return r; }

  var type    = won ? "game-won" : "game-over";
  var message = won ? "这个游戏，没有胜利者。" : lostMsgs[getNumber(maxscore) - 2];


  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;

  this.clearContainer(this.sharingContainer);
  // this.sharingContainer.appendChild(this.scoreTweetButton());
  // twttr.widgets.load();
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.scoreTweetButton = function () {
  var tweet = document.createElement("a");
  tweet.classList.add("twitter-share-button");
  tweet.setAttribute("href", "https://twitter.com/share");
  tweet.setAttribute("data-via", "oprilzeng");
  tweet.setAttribute("data-url", "http://oprilzeng.github.io/2048");
  tweet.setAttribute("data-counturl", "http://oprilzeng.github.io/2048/");
  tweet.textContent = "Tweet";

  var text = "I scored " + this.score + " points at PRC2048, a game where you " +
             "join numbers to score high! #PRC2048";
  tweet.setAttribute("data-text", text);

  return tweet;
};
