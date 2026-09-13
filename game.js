(function () {
  "use strict";

  var tries = 6;
  var wordLength = 5;
  var answer = "";
  var guesses = [];
  var current = "";
  var gameOver = false;
  var lastAnswer = null;

  var words = [
    "apple", "brain", "crane", "drain", "early", "flame", "grape", "heart",
    "juice", "knife", "lemon", "mango", "night", "ocean", "piano", "queen",
    "river", "sunny", "tiger", "under", "vivid", "water", "xenon", "youth",
    "zebra", "cloud", "dance", "eager", "fruit", "glass", "horse", "jolly",
    "koala", "light", "magic", "noble", "orbit", "pearl", "quick", "rocky",
    "sugar", "tower", "unity", "valor", "whale", "young", "bloom", "charm",
    "dream", "frost", "glory", "honor", "jewel", "lucky", "mirth", "nadir",
    "opera", "prism", "quilt", "raven", "shine", "thyme", "utter", "viper",
    "waltz", "yield", "amber", "blaze", "crisp", "drift", "ember", "fable",
    "gloom", "haste", "ionic", "jumpy", "kayak", "lucid", "nylon", "onion",
    "pride", "quiet", "royal", "sandy", "trace", "usher", "vocal", "witty",
    "zesty", "cider", "doubt", "eagle", "flint", "gourd", "husky", "inbox"
  ];

  var rand = Math.random;

  function dailyAnswer() {
    var now = new Date();
    var dayIndex = Math.floor(now.getTime() / 86400000);
    return words[dayIndex % words.length];
  }

  function pickRandom() {
    return words[Math.floor(rand() * words.length)];
  }

  function startGame(target) {
    answer = target || pickRandom();
    lastAnswer = answer;
    guesses = [];
    current = "";
    gameOver = false;
    buildBoard();
    buildKeyboard();
    setMessage("");
  }

  function buildBoard() {
    var board = document.getElementById("board");
    board.innerHTML = "";
    for (var r = 0; r < tries; r++) {
      var row = document.createElement("div");
      row.className = "row";
      row.dataset.row = r;
      for (var c = 0; c < wordLength; c++) {
        var tile = document.createElement("div");
        tile.className = "tile";
        tile.dataset.col = c;
        row.appendChild(tile);
      }
      board.appendChild(row);
    }
  }

  function buildKeyboard() {
    var kb = document.getElementById("keyboard");
    kb.innerHTML = "";
    var layout = [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
      ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"]
    ];
    layout.forEach(function (keys) {
      var rowEl = document.createElement("div");
      rowEl.className = "kb-row";
      keys.forEach(function (key) {
        var btn = document.createElement("button");
        btn.className = "kb-key";
        btn.textContent = key === "enter" ? "ENTER" : key.toUpperCase();
        btn.dataset.key = key;
        if (key === "enter" || key === "backspace") btn.classList.add("wide");
        btn.addEventListener("click", function () { handleKey(key); });
        rowEl.appendChild(btn);
      });
      kb.appendChild(rowEl);
    });
  }

  function render() {
    var rows = document.querySelectorAll("#board .row");
    for (var r = 0; r < tries; r++) {
      var tiles = rows[r].querySelectorAll(".tile");
      var guess = guesses[r];
      for (var c = 0; c < wordLength; c++) {
        var tile = tiles[c];
        tile.textContent = "";
        tile.className = "tile";
        if (guess) {
          tile.textContent = guess[c].toUpperCase();
          tile.classList.add(guess[c]);
        } else if (r === guesses.length) {
          if (c < current.length) {
            tile.textContent = current[c].toUpperCase();
            tile.classList.add("filled");
          }
        }
      }
    }
  }

  function evaluateGuess(guess) {
    var answerArr = answer.split("");
    var result = new Array(wordLength).fill(null);
    var used = new Array(wordLength).fill(false);
    var i, j;

    for (i = 0; i < wordLength; i++) {
      if (guess[i] === answerArr[i]) {
        result[i] = "correct";
        used[i] = true;
      }
    }
    for (i = 0; i < wordLength; i++) {
      if (result[i] === "correct") continue;
      for (j = 0; j < wordLength; j++) {
        if (!used[j] && guess[i] === answerArr[j]) {
          result[i] = "present";
          used[j] = true;
          break;
        }
      }
      if (!result[i]) result[i] = "absent";
    }
    return result;
  }

  function submitGuess() {
    var guess = current;
    if (gameOver || guess.length !== wordLength) return;

    var result = evaluateGuess(guess);
    guesses.push(guess);
    var rowIndex = guesses.length - 1;

    var rows = document.querySelectorAll("#board .row");
    var tiles = rows[rowIndex].querySelectorAll(".tile");
    var colorMap = {};

    for (var c = 0; c < wordLength; c++) {
      tiles[c].textContent = guess[c].toUpperCase();
      setTimeout(function (tile, color) {
        tile.classList.add(color);
      }, c * 250, tiles[c], result[c]);

      if (!colorMap[guess[c]] || colorMap[guess[c]] === "correct" ||
          (colorMap[guess[c]] === "absent" && result[c] === "present")) {
        colorMap[guess[c]] = result[c];
      }
    }

    updateKeyboard(guess, result, colorMap);
    current = "";

    setTimeout(function () {
      if (guess === answer) {
        gameOver = true;
        setMessage("恭喜！你猜对了！");
        showModal("恭喜你", "正确单词是「" + answer.toUpperCase() + "」！");
        return;
      }
      if (guesses.length >= tries) {
        gameOver = true;
        setMessage("很遗憾，游戏结束");
        showModal("游戏结束", "正确单词是「" + answer.toUpperCase() + "」，点击「新游戏」再来一局。");
      }
    }, wordLength * 250);
  }

  function updateKeyboard(guess, result, colorMap) {
    var keys = document.querySelectorAll("#keyboard .kb-key");
    keys.forEach(function (btn) {
      var key = btn.dataset.key;
      if (key === "enter" || key === "backspace") return;
      if (!colorMap[key]) return;
      btn.classList.remove("correct", "present", "absent");
      btn.classList.add(colorMap[key]);
    });
  }

  function setMessage(text) {
    var el = document.getElementById("message");
    el.textContent = text;
    el.classList.toggle("hidden", !text);
  }

  function handleKey(key) {
    if (gameOver) return;
    if (key === "enter") {
      if (current.length !== wordLength) {
        setMessage("请输入 5 个字母再确认");
        return;
      }
      submitGuess();
      return;
    }
    if (key === "backspace") {
      current = current.slice(0, -1);
      setMessage("");
      render();
      return;
    }
    if (current.length >= wordLength) return;
    if (!/^[a-z]$/.test(key)) return;
    current += key;
    render();
    popLast();
  }

  function popLast() {
    var rows = document.querySelectorAll("#board .row");
    var row = rows[guesses.length];
    if (!row) return;
    var tiles = row.querySelectorAll(".tile");
    var last = tiles[wordLength - 1];
    if (last.textContent) {
      last.classList.remove("anim-pop");
      void last.offsetWidth;
      last.classList.add("anim-pop");
    }
  }

  function showModal(title, text) {
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-text").textContent = text;
    document.getElementById("modal").classList.remove("hidden");
  }

  function hideModal() {
    document.getElementById("modal").classList.add("hidden");
  }

  function showHelp() {
    var text = "猜出隐藏的 5 个字母单词。\n" +
      "输入你的猜测，点击 ENTER 提交。\n" +
      "提示：每提交一次，字母会变成不同颜色：\n" +
      "- <span class='example'><span class='color-sample green'></span>绿色：字母正确且位置正确</span>\n" +
      "- <span class='example'><span class='color-sample yellow'></span>黄色：字母在单词中但位置不对</span>\n" +
      "- <span class='example'><span class='color-sample gray'></span>灰色：字母不在单词中</span>";
    document.getElementById("modal-title").textContent = "游戏说明";
    document.getElementById("modal-text").innerHTML = text;
    document.getElementById("modal").classList.remove("hidden");
  }

  document.addEventListener("keydown", function (e) {
    if (document.getElementById("modal").classList.contains("hidden") === false) {
      if (e.key === "Enter" || e.key === "Escape") hideModal();
      return;
    }
    if (e.key === "Enter") { e.preventDefault(); handleKey("enter"); }
    else if (e.key === "Backspace") handleKey("backspace");
    else handleKey(e.key.toLowerCase());
  });

  document.getElementById("modal-btn").addEventListener("click", hideModal);
  document.getElementById("modal").addEventListener("click", function (e) {
    if (e.target === this) hideModal();
  });
  document.getElementById("help-btn").addEventListener("click", showHelp);
  document.getElementById("new-game").addEventListener("click", function () {
    hideModal();
    startGame();
  });

  document.addEventListener("DOMContentLoaded", function () {
    startGame(dailyAnswer());
  });

  startGame(dailyAnswer());
})();