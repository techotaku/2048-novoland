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
  titleMsgs[0]="那时候柳文扬还活着，大角还没有结婚，世界上还没有一本叫做九州的杂志；而那些男人，他们还彼此相爱。";
  titleMsgs[1]="这里是中国幻想文学的最高峰，甚至试图去逼近当代世界奇幻文学的脚步，惟一一次。";
  titleMsgs[2]="我们从月亮上，从石头上，从翻动的杂志书页上闻到了远古的气息，那就是九州的恐龙生涯。";
  titleMsgs[3]="我一直在想，如果悠殿或者小角看到这一期杂志，问他们的爸爸照片背后的故事，他们会怎么去讲呢？";
  titleMsgs[4]="自始至终，作为实体杂志的存在中，貌似只有它做过一期纯九州的，当时有人很自豪地说，为了这一期，上海部门的同事倾尽所有，提供支持。";
  titleMsgs[5]="据说南九州的设定集，准备在游戏上市以后同步强势推出，于是设定集简直就成了衰败的前兆，一本导致了分裂，一本直接宣布了退场。";
  titleMsgs[6]="只有苏瑾深一个人卑贱地活到最后，就如同那本唯一尚且存活于世的九州实体刊，他怀念铁驷车一定如同它怀念九州志·狮牙之卷。";
  titleMsgs[7]="有一天忽然想看看当初打孩子的帖子，发现那时候的很多主战场都已经不见了。";
  titleMsgs[8]="说起来，当初看到幻想纵横和九州幻想联合刊首声明合作的时候，满心欢喜的样子就跟玩这个游戏到了这里就以为赢定了一样傻逼呢。";
  titleMsgs[9]="游戏里有个写着铁甲安在的碑铭，不知道停服的那一天有没有人聚在那里呢。";
  titleMsgs[10]="后来，有人在知乎提起九州，有人在微博调侃九州，甚至有人为九州做2048，但没人知道九州在哪。【可惜的是，就算是赢了，也看不到这一条了……】";
  var getNumber = function (m) { var r = 0; while (m > 1) r++, m >>= 1; return r; }

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var innerBg   = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = "";
  if (tile.value <= 2048)
  { 
    inner.title = titleMsgs[getNumber(tile.value) - 1];
    innerBg.classList.add("sprite");
    innerBg.classList.add("sprite-" + tile.value);
  }

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
  inner.appendChild(innerBg);

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
  lostMsgs[0]="后来，它改名为《飞·奇幻世界》，并最终于2013年停刊了。"; // 4 科幻世界奇幻版、奇幻世界
  lostMsgs[1]="后来，它的刊号到期，于2007年停刊了。"; // 8 恐龙·九州幻想
  lostMsgs[2]="后来，其中三个人平均每年在现实中见一两面，另外三个人平均每年在网络上吵一两架。"; // 16 那些男人
  lostMsgs[3]="后来，它改名为《幻想纵横》，并最终于2009年停刊了。"; // 32 幻想1+1
  lostMsgs[4]="后来，两家杂志都没怎么按那里面的设定去做九州的新内容。"; // 64 创造古卷
  lostMsgs[5]="后来，它给自己换了一个又一个刊号，并最终以书代刊地还在市面上存在着。"; // 128 九州志
  lostMsgs[6]="后来，他们忙于做游戏、写剧本和当首富，偶尔想打孩子却发现孩子大多已经不小心打死了。"; // 256 大过年打孩子
  lostMsgs[7]="后来，纵横中文网人事剧烈调整，并于四年后被完美卖给了百度。"; // 512 纵横中文网
  lostMsgs[8]="后来，游戏服务器关闭了。"; // 1024 九州世界OL
  var getNumber = function (m) { var r = 0; while (m > 1) r++, m >>= 1; return r; }

  var type    = won ? "game-won" : "game-over";
  var message = won ? "已经赢了你还在问后来？还有后来么？" : lostMsgs[getNumber(maxscore) - 2];


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
