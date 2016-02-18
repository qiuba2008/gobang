(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var m = require("./max-min.js");

onmessage = function(e) {
  var p = m(e.data.board, e.data.deep);
  postMessage(p);
}

},{"./max-min.js":9}],2:[function(require,module,exports){
var SCORE = require("./score.js");

var score = function(count, block) {

  if(count >= 5) return SCORE.FIVE;

  if(block === 0) {
    switch(count) {
      case 1: return SCORE.ONE;
      case 2: return SCORE.TWO;
      case 3: return SCORE.THREE;
      case 4: return SCORE.FOUR;
    }
  }

  if(block === 1) {
    switch(count) {
      case 1: return SCORE.BLOCKED_ONE;
      case 2: return SCORE.BLOCKED_TWO;
      case 3: return SCORE.BLOCKED_THREE;
      case 4: return SCORE.BLOCKED_FOUR;
    }
  }

  return 0;
}

module.exports = score;

},{"./score.js":11}],3:[function(require,module,exports){
/*
 * 启发式评价函数
 * 这个是专门给某一个空位打分的，不是给整个棋盘打分的
 * 并且是只给某一个角色打分
 */
var S = require("./score.js");
var R = require("./role.js");
var score = require("./count-to-score.js");

/*
 * 表示在当前位置下一个棋子后的分数
 */

var s = function(board, p, role) {
  var result = 0;
  var count = 0, block = 0;

  var len = board.length;

  //横向
  count = 1;  //默认把当前位置当做己方棋子。因为算的是当前下了一个己方棋子后的分数
  block = 0;

  for(var i=p[1]+1;true;i++) {
    if(i>=len) {
      block ++;
      break;
    }
    var t = board[p[0]][i];
    if(t === R.empty) {
      break;
    }
    if(t === role) {
      count ++;
      continue;
    } else {
      block ++;
      break;
    }
  }

  for(var i=p[1]-1;true;i--) {
    if(i<0) {
      block ++;
      break;
    }
    var t = board[p[0]][i];
    if(t === R.empty) {
      break;
    }
    if(t === role) {
      count ++;
      continue;
    } else {
      block ++;
      break;
    }
  }

  result += score(count, block);

  //纵向
  count = 1;
  block = 0;

  for(var i=p[0]+1;true;i++) {
    if(i>=len) {
      block ++;
      break;
    }
    var t = board[i][p[1]];
    if(t === R.empty) {
      break;
    }
    if(t === role) {
      count ++;
      continue;
    } else {
      block ++;
      break;
    }
  }

  for(var i=p[0]-1;true;i--) {
    if(i<0) {
      block ++;
      break;
    }
    var t = board[i][p[1]];
    if(t === R.empty) {
      break;
    }
    if(t === role) {
      count ++;
      continue;
    } else {
      block ++;
      break;
    }
  }

  result += score(count, block);


  // \\
  count = 1;
  block = 0;

  for(var i=1;true;i++) {
    var x = p[0]+i, y = p[1]+i;
    if(x>=len || y>=len) {
      block ++;
      break;
    }
    var t = board[x][y];
    if(t === R.empty) {
      break;
    }
    if(t === role) {
      count ++;
      continue;
    } else {
      block ++;
      break;
    }
  }

  for(var i=1;true;i++) {
    var x = p[0]-i, y = p[1]-i;
    if(x<0||y<0) {
      block ++;
      break;
    }
    var t = board[x][y];
    if(t === R.empty) {
      break;
    }
    if(t === role) {
      count ++;
      continue;
    } else {
      block ++;
      break;
    }
  }

  result += score(count, block);


  // \/
  count = 1;
  block = 0;

  for(var i=1; true;i++) {
    var x = p[0]+i, y = p[1]-i;
    if(x>=len || y>=len) {
      block ++;
      break;
    }
    var t = board[x][y];
    if(t === R.empty) {
      break;
    }
    if(t === role) {
      count ++;
      continue;
    } else {
      block ++;
      break;
    }
  }

  for(var i=1;true;i++) {
    var x = p[0]-i, y = p[1]+i;
    if(x<0||y<0) {
      block ++;
      break;
    }
    var t = board[x][y];
    if(t === R.empty) {
      break;
    }
    if(t === role) {
      count ++;
      continue;
    } else {
      block ++;
      break;
    }
  }

  result += score(count, block);

  return result;

}

module.exports = s;

},{"./count-to-score.js":2,"./role.js":10,"./score.js":11}],4:[function(require,module,exports){
var r = require("./role");
var SCORE = require("./score.js");
var score = require("./count-to-score.js");
var table = require("./table.js");


//改进，使用棋型表进行打分
var eRow = function(line, role) {
  //先找到第一个己方棋子
  var first = -1;
  for(var i=0;i<line.length;i++) {
    if(line[i] == role) {
      first = i;
      break;
    }
  }

  if(first == -1) return 0; //空行


  //从first开始，分别向左右寻找
  var empty = 0;
  var s = first, e = first;
  //向左寻找
  while(--s>=0) {
    if(line[s] == r.empty) {
      empty ++;
      if(empty > 5) break;
    } else if(line[s] != role) break;
  }
  //向右寻找
  empty = 0;
  while(++e<line.length) {
    if(line[e] == r.empty) {
      empty ++;
      if(empty > 5) break;
    } else if(line[e] != role) break;
  }

  var str = line.slice(s+1, e).join("");
  str = str.replace(/0/g, "_").replace(role == 1 ? /1/g : /2/g, "O");

  var map = {
    "0": 0,
    "11": SCORE.BLOCKED_ONE,
    "21": SCORE.ONE,
    "31": SCORE.BLOCKED_TWO,
    "41": SCORE.TWO,
    "51": SCORE.BLOCKED_THREE,
    "61": SCORE.THREE,
    "71": SCORE.BLOCKED_FOUR,
    "72": SCORE.BLOCKED_FOUR, //特殊情况
    "81": SCORE.FOUR,
    "a1": SCORE.FIVE
  }

  if(e > line.length - 5) return map[table[str]] || 0;
  else return (map[table[str]] || 0) + eRow(line.slice(e), role);
}

module.exports = eRow;

},{"./count-to-score.js":2,"./role":10,"./score.js":11,"./table.js":12}],5:[function(require,module,exports){
var eRow = require("./evaluate-row.js");

var eRows = function(rows, role) {
  var r = 0;
  var scores = [];
  for(var i=0;i<rows.length;i++) {
    var s = eRow(rows[i], role);
    scores.push(s);
    r+= s;
  }
  return r;
}

module.exports = eRows;

},{"./evaluate-row.js":4}],6:[function(require,module,exports){
var flat = require("./flat");
var R = require("./role");
var eRows = require("./evaluate-rows.js");

var evaluate = function(board) {
  var rows = flat(board);
  var humScore = eRows(rows, R.hum);
  var comScore = eRows(rows, R.com);

  return comScore - humScore;
}

module.exports = evaluate;

},{"./evaluate-rows.js":5,"./flat":7,"./role":10}],7:[function(require,module,exports){
//一维化，把二位的棋盘四个一位数组。
var flat = function(board) {
  var result = [];
  var len = board.length;

  //横向
  for(var i=0;i<len;i++) {
    result.push(board[i]);
  }


  //纵向
  for(var i=0;i<len;i++) {
    var col = [];
    for(var j=0;j<len;j++) {
      col.push(board[j][i]);
    }
    result.push(col);
  }


  // \/ 方向
  for(var i=0;i<len*2;i++) {
    var line = [];
    for(var j=0;j<=i && j<len;j++) {
      if(i-j<len) line.push(board[i-j][j]);
    }
    if(line.length) result.push(line);
  }


  // \\ 方向
  for(var i=-1*len+1;i<len;i++) {
    var line = [];
    for(var j=0;j<len;j++) {
      if(j+i>=0 && j+i<len) line.push(board[j+i][j]);
    }
    if(line.length) result.push(line);
  }

  
  return result;
}

module.exports = flat;

},{}],8:[function(require,module,exports){
/*
 * 产生待选的节点
 * 这个函数的优化非常重要，这个函数产生的节点数，实际就是搜索总数的底数。比如这里平均产生50个节点，进行4层搜索，则平均搜索节点数为50的4次方（在没有剪枝的情况下）
 * 如果能减少产生的节点数，那么能指数级减少搜索时间
 * 如果能对返回的节点排序，先返回优先级高的节点。那么能极大提升剪枝效率，从而缩短计算时间。
 * 目前优化方式：
 * 1. 优先级排序，按估值进行排序
 * 2. 当搜索最后两层的时候，只搜索有相邻邻居的节点
 */

var R = require("./role.js");
var scorePoint = require("./evaluate-point.js");
var S = require("./score.js");

var gen = function(board, deep) {
  
  var fives = [];
  var fours=[];
  var twothrees=[];
  var threes = [];
  var twos = [];
  var neighbors = [];
  var nextNeighbors = [];

  for(var i=0;i<board.length;i++) {
    for(var j=0;j<board[i].length;j++) {
      if(board[i][j] == R.empty) {
        if(hasNeighbor(board, [i, j], 1, 1)) { //必须是有邻居的才行
          var scoreHum = scorePoint(board, [i,j], R.hum);
          var scoreCom= scorePoint(board, [i,j], R.com);

          if(scoreCom >= S.FIVE) {//先看电脑能不能连成5
            return [[i, j]];
          } else if(scoreHum >= S.FIVE) {//再看玩家能不能连成5
            //别急着返回，因为遍历还没完成，说不定电脑自己能成五。
            fives.push([i, j]);
          } else if(scoreCom >= S.FOUR) {
            fours.unshift([i,j]);
          } else if(scoreHum >= S.FOUR) {
            fours.push([i,j]);
          } else if(scoreCom >= 2*S.THREE) {
            //能成双三也行
            twothrees.unshift([i,j]);
          } else if(scoreHum >= 2*S.THREE) {
            twothrees.push([i,j]);
          } else if(scoreCom >= S.THREE) {
            threes.unshift([i, j]);
          } else if(scoreHum >= S.THREE) {
            threes.push([i, j]);
          } else if(scoreCom >= S.TWO) {
            twos.unshift([i, j]);
          } else if(scoreHum >= S.TWO) {
            twos.push([i, j]);
          } else {
            neighbors.push([i, j]);
          }
        } else if(deep >= 2 && hasNeighbor(board, [i, j], 2, 2)) {
          nextNeighbors.push([i, j]);
        }
      }
    }
  }

  //如果成五，是必杀棋，直接返回
  if(fives.length) return [fives[0]];
  
  if(fours.length) return fours;

  if(twothrees.length) return twothrees;

  return threes.concat(
      twos.concat(
        neighbors.concat(nextNeighbors)
      )
    );
}

//有邻居
var hasNeighbor = function(board, point, distance, count) {
  var len = board.length;
  var startX = point[0]-distance;
  var endX = point[0]+distance;
  var startY = point[1]-distance;
  var endY = point[1]+distance;
  for(var i=startX;i<=endX;i++) {
    if(i<0||i>=len) continue;
    for(var j=startY;j<=endY;j++) {
      if(j<0||j>=len) continue;
      if(i==point[0] && j==point[1]) continue;
      if(board[i][j] != R.empty) {
        count --;
        if(count <= 0) return true;
      }
    }
  }
  return false;
}


module.exports = gen;

},{"./evaluate-point.js":3,"./role.js":10,"./score.js":11}],9:[function(require,module,exports){
var evaluate = require("./evaluate");
var gen = require("./gen");
var R = require("./role");
var SCORE = require("./score.js");
var win = require("./win.js");

var MAX = SCORE.FIVE*10;
var MIN = -1*MAX;

var total,  //总节点数
    ABcut  //AB剪枝次数

/*
 * max min search
 * white is max, black is min
 */
var maxmin = function(board, deep) {
  var best = MIN;
  var points = gen(board, deep);
  var bestPoints = [];
  deep = deep === undefined ? 5 : deep;

  total = 0;
  ABcut = 0;


  for(var i=0;i<points.length;i++) {
    var p = points[i];
    board[p[0]][p[1]] = R.com;
    var v = min(board, deep-1, MAX, best > MIN ? best : MIN);

    //console.log(v, p);
    //如果跟之前的一个一样好，则把当前位子加入待选位子
    if(v == best) {
      bestPoints.push(p);
    }
    //找到一个更好的分，就把以前存的位子全部清除
    if(v > best) {
      best = v;
      bestPoints = [p];
    }
    board[p[0]][p[1]] = R.empty;
  }
  var result = bestPoints[Math.floor(bestPoints.length * Math.random())];
  console.log('当前局面分数：' + best);
  console.log('搜索节点数:'+ total+ ',AB剪枝次数:'+ABcut); //注意，减掉的节点数实际远远不止 ABcut 个，因为减掉的节点的子节点都没算进去。实际 4W个节点的时候，剪掉了大概 16W个节点
  return result;
}

var min = function(board, deep, alpha, beta) {
  var v = evaluate(board);
  total ++;
  if(deep <= 0 || win(board)) {
    return v;
  }

  var best = MAX;
  var points = gen(board, deep);

  for(var i=0;i<points.length;i++) {
    var p = points[i];
    board[p[0]][p[1]] = R.hum;
    var v = max(board, deep-1, best < alpha ? best : alpha, beta);
    board[p[0]][p[1]] = R.empty;
    if(v < best ) {
      best = v;
    }
    if(v < beta) {  //AB剪枝
      ABcut ++;
      break;
    }
  }
  return best ;
}


var max = function(board, deep, alpha, beta) {
  var v = evaluate(board);
  total ++;
  if(deep <= 0 || win(board)) {
    return v;
  }

  var best = MIN;
  var points = gen(board, deep);

  for(var i=0;i<points.length;i++) {
    var p = points[i];
    board[p[0]][p[1]] = R.com;
    var v = min(board, deep-1, alpha, best > beta ? best : beta);
    board[p[0]][p[1]] = R.empty;
    if(v > best) {
      best = v;
    }
    if(v > alpha) { //AB 剪枝
      ABcut ++;
      break;
    }
  }
  return best;
}

module.exports = maxmin;

},{"./evaluate":6,"./gen":8,"./role":10,"./score.js":11,"./win.js":13}],10:[function(require,module,exports){
module.exports = {
  com: 2,
  hum: 1,
  empty: 0
}

},{}],11:[function(require,module,exports){
module.exports = {
  ONE: 10,
  TWO: 100,
  THREE: 1000,
  FOUR: 10000,
  FIVE: 100000,
  BLOCKED_ONE: 1,
  BLOCKED_TWO: 10,
  BLOCKED_THREE: 100,
  BLOCKED_FOUR: 1000
}

},{}],12:[function(require,module,exports){
//棋型表

var str = `1	0	XX______XOX______XX
1	0	XX______XO_X_____XX
1	0	XX______XOOX_____XX
1	0	XX______XO__X____XX
1	0	XX______XO_OX____XX
1	0	XX______XOO_X____XX
1	0	XX______XOOOX____XX
1	0	XX______XO___X___XX
1	0	XX______XO__OX___XX
1	0	XX______XO_O_X___XX
1	0	XX______XO_OOX___XX
1	0	XX______XOO__X___XX
1	0	XX______XOO_OX___XX
1	0	XX______XOOO_X___XX
1	0	XX______XOOOOX___XX
1	11	XX______XO____X__XX
1	31	XX______XO___OX__XX
1	31	XX______XO__O_X__XX
1	51	XX______XO__OOX__XX
1	31	XX______XO_O__X__XX
1	51	XX______XO_O_OX__XX
1	51	XX______XO_OO_X__XX
1	71	XX______XO_OOOX__XX
1	31	XX______XOO___X__XX
1	51	XX______XOO__OX__XX
1	51	XX______XOO_O_X__XX
1	71	XX______XOO_OOX__XX
1	51	XX______XOOO__X__XX
1	71	XX______XOOO_OX__XX
1	71	XX______XOOOO_X__XX
1	a1	XX______XOOOOOX__XX
1	11	XX______XO_____X_XX
1	11	XX______XO____OX_XX
1	31	XX______XO___O_X_XX
1	31	XX______XO___OOX_XX
1	31	XX______XO__O__X_XX
1	31	XX______XO__O_OX_XX
1	51	XX______XO__OO_X_XX
1	51	XX______XO__OOOX_XX
1	31	XX______XO_O___X_XX
1	31	XX______XO_O__OX_XX
1	51	XX______XO_O_O_X_XX
1	51	XX______XO_O_OOX_XX
1	51	XX______XO_OO__X_XX
1	51	XX______XO_OO_OX_XX
1	71	XX______XO_OOO_X_XX
1	71	XX______XO_OOOOX_XX
1	31	XX______XOO____X_XX
1	31	XX______XOO___OX_XX
1	51	XX______XOO__O_X_XX
1	51	XX______XOO__OOX_XX
1	51	XX______XOO_O__X_XX
1	51	XX______XOO_O_OX_XX
1	71	XX______XOO_OO_X_XX
1	71	XX______XOO_OOOX_XX
1	51	XX______XOOO___X_XX
1	51	XX______XOOO__OX_XX
1	71	XX______XOOO_O_X_XX
1	71	XX______XOOO_OOX_XX
1	71	XX______XOOOO__X_XX
1	71	XX______XOOOO_OX_XX
1	a1	XX______XOOOOO_X_XX
1	a1	XX______XOOOOOOX_XX
1	0	XX_____X_OX______XX
1	0	XX_____XOOX______XX
1	0	XX_____X_O_X_____XX
1	0	XX_____X_OOX_____XX
1	0	XX_____XOO_X_____XX
1	0	XX_____XOOOX_____XX
1	0	XX_____X_O__X____XX
1	0	XX_____X_O_OX____XX
1	0	XX_____X_OO_X____XX
1	0	XX_____X_OOOX____XX
1	0	XX_____XOO__X____XX
1	0	XX_____XOO_OX____XX
1	0	XX_____XOOO_X____XX
1	0	XX_____XOOOOX____XX
1	11	XX_____X_O___X___XX
1	31	XX_____X_O__OX___XX
1	31	XX_____X_O_O_X___XX
1	51	XX_____X_O_OOX___XX
1	31	XX_____X_OO__X___XX
1	51	XX_____X_OO_OX___XX
1	51	XX_____X_OOO_X___XX
1	71	XX_____X_OOOOX___XX
1	31	XX_____XOO___X___XX
1	51	XX_____XOO__OX___XX
1	51	XX_____XOO_O_X___XX
1	71	XX_____XOO_OOX___XX
1	51	XX_____XOOO__X___XX
1	71	XX_____XOOO_OX___XX
1	71	XX_____XOOOO_X___XX
1	a1	XX_____XOOOOOX___XX
1	21	XX_____X_O____X__XX
1	31	XX_____X_O___OX__XX
1	41	XX_____X_O__O_X__XX
1	51	XX_____X_O__OOX__XX
1	41	XX_____X_O_O__X__XX
1	51	XX_____X_O_O_OX__XX
1	61	XX_____X_O_OO_X__XX
1	71	XX_____X_O_OOOX__XX
1	41	XX_____X_OO___X__XX
1	51	XX_____X_OO__OX__XX
1	61	XX_____X_OO_O_X__XX
1	71	XX_____X_OO_OOX__XX
1	61	XX_____X_OOO__X__XX
1	71	XX_____X_OOO_OX__XX
1	81	XX_____X_OOOO_X__XX
1	a1	XX_____X_OOOOOX__XX
1	31	XX_____XOO____X__XX
1	31	XX_____XOO___OX__XX
1	51	XX_____XOO__O_X__XX
1	51	XX_____XOO__OOX__XX
1	51	XX_____XOO_O__X__XX
1	51	XX_____XOO_O_OX__XX
1	71	XX_____XOO_OO_X__XX
1	71	XX_____XOO_OOOX__XX
1	51	XX_____XOOO___X__XX
1	51	XX_____XOOO__OX__XX
1	71	XX_____XOOO_O_X__XX
1	71	XX_____XOOO_OOX__XX
1	71	XX_____XOOOO__X__XX
1	71	XX_____XOOOO_OX__XX
1	a1	XX_____XOOOOO_X__XX
1	a1	XX_____XOOOOOOX__XX
1	21	XX_____X_O_____X_XX
1	21	XX_____X_O____OX_XX
1	31	XX_____X_O___O_X_XX
1	31	XX_____X_O___OOX_XX
1	41	XX_____X_O__O__X_XX
1	41	XX_____X_O__O_OX_XX
1	51	XX_____X_O__OO_X_XX
1	51	XX_____X_O__OOOX_XX
1	41	XX_____X_O_O___X_XX
1	41	XX_____X_O_O__OX_XX
1	51	XX_____X_O_O_O_X_XX
1	51	XX_____X_O_O_OOX_XX
1	61	XX_____X_O_OO__X_XX
1	61	XX_____X_O_OO_OX_XX
1	71	XX_____X_O_OOO_X_XX
1	71	XX_____X_O_OOOOX_XX
1	41	XX_____X_OO____X_XX
1	41	XX_____X_OO___OX_XX
1	51	XX_____X_OO__O_X_XX
1	51	XX_____X_OO__OOX_XX
1	61	XX_____X_OO_O__X_XX
1	61	XX_____X_OO_O_OX_XX
1	71	XX_____X_OO_OO_X_XX
1	71	XX_____X_OO_OOOX_XX
1	61	XX_____X_OOO___X_XX
1	61	XX_____X_OOO__OX_XX
1	71	XX_____X_OOO_O_X_XX
1	71	XX_____X_OOO_OOX_XX
1	81	XX_____X_OOOO__X_XX
1	81	XX_____X_OOOO_OX_XX
1	a1	XX_____X_OOOOO_X_XX
1	a1	XX_____X_OOOOOOX_XX
1	31	XX_____XOO_____X_XX
1	31	XX_____XOO____OX_XX
1	31	XX_____XOO___O_X_XX
1	31	XX_____XOO___OOX_XX
1	51	XX_____XOO__O__X_XX
1	51	XX_____XOO__O_OX_XX
1	51	XX_____XOO__OO_X_XX
1	51	XX_____XOO__OOOX_XX
1	51	XX_____XOO_O___X_XX
1	51	XX_____XOO_O__OX_XX
1	51	XX_____XOO_O_O_X_XX
1	51	XX_____XOO_O_OOX_XX
1	71	XX_____XOO_OO__X_XX
1	71	XX_____XOO_OO_OX_XX
1	71	XX_____XOO_OOO_X_XX
1	71	XX_____XOO_OOOOX_XX
1	51	XX_____XOOO____X_XX
1	51	XX_____XOOO___OX_XX
1	51	XX_____XOOO__O_X_XX
1	51	XX_____XOOO__OOX_XX
1	71	XX_____XOOO_O__X_XX
1	71	XX_____XOOO_O_OX_XX
1	71	XX_____XOOO_OO_X_XX
1	71	XX_____XOOO_OOOX_XX
1	71	XX_____XOOOO___X_XX
1	71	XX_____XOOOO__OX_XX
1	71	XX_____XOOOO_O_X_XX
1	71	XX_____XOOOO_OOX_XX
1	a1	XX_____XOOOOO__X_XX
1	a1	XX_____XOOOOO_OX_XX
1	a1	XX_____XOOOOOO_X_XX
1	a1	XX_____XOOOOOOOX_XX
1	0	XX____X__OX______XX
1	0	XX____X_OOX______XX
1	0	XX____XO_OX______XX
1	0	XX____XOOOX______XX
1	0	XX____X__O_X_____XX
1	0	XX____X__OOX_____XX
1	0	XX____X_OO_X_____XX
1	0	XX____X_OOOX_____XX
1	0	XX____XO_O_X_____XX
1	0	XX____XO_OOX_____XX
1	0	XX____XOOO_X_____XX
1	0	XX____XOOOOX_____XX
1	11	XX____X__O__X____XX
1	31	XX____X__O_OX____XX
1	31	XX____X__OO_X____XX
1	51	XX____X__OOOX____XX
1	31	XX____X_OO__X____XX
1	51	XX____X_OO_OX____XX
1	51	XX____X_OOO_X____XX
1	71	XX____X_OOOOX____XX
1	31	XX____XO_O__X____XX
1	51	XX____XO_O_OX____XX
1	51	XX____XO_OO_X____XX
1	71	XX____XO_OOOX____XX
1	51	XX____XOOO__X____XX
1	71	XX____XOOO_OX____XX
1	71	XX____XOOOO_X____XX
1	a1	XX____XOOOOOX____XX
1	21	XX____X__O___X___XX
1	31	XX____X__O__OX___XX
1	41	XX____X__O_O_X___XX
1	51	XX____X__O_OOX___XX
1	41	XX____X__OO__X___XX
1	51	XX____X__OO_OX___XX
1	61	XX____X__OOO_X___XX
1	71	XX____X__OOOOX___XX
1	41	XX____X_OO___X___XX
1	51	XX____X_OO__OX___XX
1	61	XX____X_OO_O_X___XX
1	71	XX____X_OO_OOX___XX
1	61	XX____X_OOO__X___XX
1	71	XX____X_OOO_OX___XX
1	81	XX____X_OOOO_X___XX
1	a1	XX____X_OOOOOX___XX
1	31	XX____XO_O___X___XX
1	31	XX____XO_O__OX___XX
1	51	XX____XO_O_O_X___XX
1	51	XX____XO_O_OOX___XX
1	51	XX____XO_OO__X___XX
1	51	XX____XO_OO_OX___XX
1	71	XX____XO_OOO_X___XX
1	71	XX____XO_OOOOX___XX
1	51	XX____XOOO___X___XX
1	51	XX____XOOO__OX___XX
1	71	XX____XOOO_O_X___XX
1	71	XX____XOOO_OOX___XX
1	71	XX____XOOOO__X___XX
1	71	XX____XOOOO_OX___XX
1	a1	XX____XOOOOO_X___XX
1	a1	XX____XOOOOOOX___XX
1	21	XX____X__O____X__XX
1	31	XX____X__O___OX__XX
1	41	XX____X__O__O_X__XX
1	51	XX____X__O__OOX__XX
1	41	XX____X__O_O__X__XX
1	51	XX____X__O_O_OX__XX
1	61	XX____X__O_OO_X__XX
1	71	XX____X__O_OOOX__XX
1	41	XX____X__OO___X__XX
1	51	XX____X__OO__OX__XX
1	61	XX____X__OO_O_X__XX
1	71	XX____X__OO_OOX__XX
1	61	XX____X__OOO__X__XX
1	71	XX____X__OOO_OX__XX
1	81	XX____X__OOOO_X__XX
1	a1	XX____X__OOOOOX__XX
1	41	XX____X_OO____X__XX
1	41	XX____X_OO___OX__XX
1	51	XX____X_OO__O_X__XX
1	51	XX____X_OO__OOX__XX
1	61	XX____X_OO_O__X__XX
1	61	XX____X_OO_O_OX__XX
1	71	XX____X_OO_OO_X__XX
1	71	XX____X_OO_OOOX__XX
1	61	XX____X_OOO___X__XX
1	61	XX____X_OOO__OX__XX
1	71	XX____X_OOO_O_X__XX
1	71	XX____X_OOO_OOX__XX
1	81	XX____X_OOOO__X__XX
1	81	XX____X_OOOO_OX__XX
1	a1	XX____X_OOOOO_X__XX
1	a1	XX____X_OOOOOOX__XX
1	31	XX____XO_O____X__XX
1	31	XX____XO_O___OX__XX
1	41	XX____XO_O__O_X__XX
1	51	XX____XO_O__OOX__XX
1	51	XX____XO_O_O__X__XX
1	51	XX____XO_O_O_OX__XX
1	61	XX____XO_O_OO_X__XX
1	71	XX____XO_O_OOOX__XX
1	51	XX____XO_OO___X__XX
1	51	XX____XO_OO__OX__XX
1	61	XX____XO_OO_O_X__XX
1	71	XX____XO_OO_OOX__XX
1	71	XX____XO_OOO__X__XX
1	72	XX____XO_OOO_OX__XX
1	81	XX____XO_OOOO_X__XX
1	a1	XX____XO_OOOOOX__XX
1	51	XX____XOOO____X__XX
1	51	XX____XOOO___OX__XX
1	51	XX____XOOO__O_X__XX
1	51	XX____XOOO__OOX__XX
1	71	XX____XOOO_O__X__XX
1	71	XX____XOOO_O_OX__XX
1	71	XX____XOOO_OO_X__XX
1	71	XX____XOOO_OOOX__XX
1	71	XX____XOOOO___X__XX
1	71	XX____XOOOO__OX__XX
1	71	XX____XOOOO_O_X__XX
1	71	XX____XOOOO_OOX__XX
1	a1	XX____XOOOOO__X__XX
1	a1	XX____XOOOOO_OX__XX
1	a1	XX____XOOOOOO_X__XX
1	a1	XX____XOOOOOOOX__XX
1	21	XX____X__O_____X_XX
1	21	XX____X__O____OX_XX
1	31	XX____X__O___O_X_XX
1	31	XX____X__O___OOX_XX
1	41	XX____X__O__O__X_XX
1	41	XX____X__O__O_OX_XX
1	51	XX____X__O__OO_X_XX
1	51	XX____X__O__OOOX_XX
1	41	XX____X__O_O___X_XX
1	41	XX____X__O_O__OX_XX
1	51	XX____X__O_O_O_X_XX
1	51	XX____X__O_O_OOX_XX
1	61	XX____X__O_OO__X_XX
1	61	XX____X__O_OO_OX_XX
1	71	XX____X__O_OOO_X_XX
1	71	XX____X__O_OOOOX_XX
1	41	XX____X__OO____X_XX
1	41	XX____X__OO___OX_XX
1	51	XX____X__OO__O_X_XX
1	51	XX____X__OO__OOX_XX
1	61	XX____X__OO_O__X_XX
1	61	XX____X__OO_O_OX_XX
1	71	XX____X__OO_OO_X_XX
1	71	XX____X__OO_OOOX_XX
1	61	XX____X__OOO___X_XX
1	61	XX____X__OOO__OX_XX
1	71	XX____X__OOO_O_X_XX
1	71	XX____X__OOO_OOX_XX
1	81	XX____X__OOOO__X_XX
1	81	XX____X__OOOO_OX_XX
1	a1	XX____X__OOOOO_X_XX
1	a1	XX____X__OOOOOOX_XX
1	41	XX____X_OO_____X_XX
1	41	XX____X_OO____OX_XX
1	41	XX____X_OO___O_X_XX
1	41	XX____X_OO___OOX_XX
1	51	XX____X_OO__O__X_XX
1	51	XX____X_OO__O_OX_XX
1	51	XX____X_OO__OO_X_XX
1	51	XX____X_OO__OOOX_XX
1	61	XX____X_OO_O___X_XX
1	61	XX____X_OO_O__OX_XX
1	61	XX____X_OO_O_O_X_XX
1	61	XX____X_OO_O_OOX_XX
1	71	XX____X_OO_OO__X_XX
1	71	XX____X_OO_OO_OX_XX
1	71	XX____X_OO_OOO_X_XX
1	71	XX____X_OO_OOOOX_XX
1	61	XX____X_OOO____X_XX
1	61	XX____X_OOO___OX_XX
1	61	XX____X_OOO__O_X_XX
1	61	XX____X_OOO__OOX_XX
1	71	XX____X_OOO_O__X_XX
1	71	XX____X_OOO_O_OX_XX
1	71	XX____X_OOO_OO_X_XX
1	71	XX____X_OOO_OOOX_XX
1	81	XX____X_OOOO___X_XX
1	81	XX____X_OOOO__OX_XX
1	81	XX____X_OOOO_O_X_XX
1	81	XX____X_OOOO_OOX_XX
1	a1	XX____X_OOOOO__X_XX
1	a1	XX____X_OOOOO_OX_XX
1	a1	XX____X_OOOOOO_X_XX
1	a1	XX____X_OOOOOOOX_XX
1	31	XX____XO_O_____X_XX
1	31	XX____XO_O____OX_XX
1	31	XX____XO_O___O_X_XX
1	31	XX____XO_O___OOX_XX
1	41	XX____XO_O__O__X_XX
1	41	XX____XO_O__O_OX_XX
1	51	XX____XO_O__OO_X_XX
1	51	XX____XO_O__OOOX_XX
1	51	XX____XO_O_O___X_XX
1	51	XX____XO_O_O__OX_XX
1	51	XX____XO_O_O_O_X_XX
1	51	XX____XO_O_O_OOX_XX
1	61	XX____XO_O_OO__X_XX
1	61	XX____XO_O_OO_OX_XX
1	71	XX____XO_O_OOO_X_XX
1	71	XX____XO_O_OOOOX_XX
1	51	XX____XO_OO____X_XX
1	51	XX____XO_OO___OX_XX
1	51	XX____XO_OO__O_X_XX
1	51	XX____XO_OO__OOX_XX
1	61	XX____XO_OO_O__X_XX
1	61	XX____XO_OO_O_OX_XX
1	71	XX____XO_OO_OO_X_XX
1	71	XX____XO_OO_OOOX_XX
1	71	XX____XO_OOO___X_XX
1	71	XX____XO_OOO__OX_XX
1	72	XX____XO_OOO_O_X_XX
1	72	XX____XO_OOO_OOX_XX
1	81	XX____XO_OOOO__X_XX
1	81	XX____XO_OOOO_OX_XX
1	a1	XX____XO_OOOOO_X_XX
1	a1	XX____XO_OOOOOOX_XX
1	51	XX____XOOO_____X_XX
1	51	XX____XOOO____OX_XX
1	51	XX____XOOO___O_X_XX
1	51	XX____XOOO___OOX_XX
1	51	XX____XOOO__O__X_XX
1	51	XX____XOOO__O_OX_XX
1	51	XX____XOOO__OO_X_XX
1	51	XX____XOOO__OOOX_XX
1	71	XX____XOOO_O___X_XX
1	71	XX____XOOO_O__OX_XX
1	71	XX____XOOO_O_O_X_XX
1	71	XX____XOOO_O_OOX_XX
1	71	XX____XOOO_OO__X_XX
1	71	XX____XOOO_OO_OX_XX
1	71	XX____XOOO_OOO_X_XX
1	71	XX____XOOO_OOOOX_XX
1	71	XX____XOOOO____X_XX
1	71	XX____XOOOO___OX_XX
1	71	XX____XOOOO__O_X_XX
1	71	XX____XOOOO__OOX_XX
1	71	XX____XOOOO_O__X_XX
1	71	XX____XOOOO_O_OX_XX
1	71	XX____XOOOO_OO_X_XX
1	71	XX____XOOOO_OOOX_XX
1	a1	XX____XOOOOO___X_XX
1	a1	XX____XOOOOO__OX_XX
1	a1	XX____XOOOOO_O_X_XX
1	a1	XX____XOOOOO_OOX_XX
1	a1	XX____XOOOOOO__X_XX
1	a1	XX____XOOOOOO_OX_XX
1	a1	XX____XOOOOOOO_X_XX
1	a1	XX____XOOOOOOOOX_XX
1	0	XX___X___OX______XX
1	0	XX___X__OOX______XX
1	0	XX___X_O_OX______XX
1	0	XX___X_OOOX______XX
1	0	XX___XO__OX______XX
1	0	XX___XO_OOX______XX
1	0	XX___XOO_OX______XX
1	0	XX___XOOOOX______XX
1	11	XX___X___O_X_____XX
1	31	XX___X___OOX_____XX
1	31	XX___X__OO_X_____XX
1	51	XX___X__OOOX_____XX
1	31	XX___X_O_O_X_____XX
1	51	XX___X_O_OOX_____XX
1	51	XX___X_OOO_X_____XX
1	71	XX___X_OOOOX_____XX
1	31	XX___XO__O_X_____XX
1	51	XX___XO__OOX_____XX
1	51	XX___XO_OO_X_____XX
1	71	XX___XO_OOOX_____XX
1	51	XX___XOO_O_X_____XX
1	71	XX___XOO_OOX_____XX
1	71	XX___XOOOO_X_____XX
1	a1	XX___XOOOOOX_____XX
1	21	XX___X___O__X____XX
1	31	XX___X___O_OX____XX
1	41	XX___X___OO_X____XX
1	51	XX___X___OOOX____XX
1	41	XX___X__OO__X____XX
1	51	XX___X__OO_OX____XX
1	61	XX___X__OOO_X____XX
1	71	XX___X__OOOOX____XX
1	41	XX___X_O_O__X____XX
1	51	XX___X_O_O_OX____XX
1	61	XX___X_O_OO_X____XX
1	71	XX___X_O_OOOX____XX
1	61	XX___X_OOO__X____XX
1	71	XX___X_OOO_OX____XX
1	81	XX___X_OOOO_X____XX
1	a1	XX___X_OOOOOX____XX
1	31	XX___XO__O__X____XX
1	31	XX___XO__O_OX____XX
1	51	XX___XO__OO_X____XX
1	51	XX___XO__OOOX____XX
1	51	XX___XO_OO__X____XX
1	51	XX___XO_OO_OX____XX
1	71	XX___XO_OOO_X____XX
1	71	XX___XO_OOOOX____XX
1	51	XX___XOO_O__X____XX
1	51	XX___XOO_O_OX____XX
1	71	XX___XOO_OO_X____XX
1	71	XX___XOO_OOOX____XX
1	71	XX___XOOOO__X____XX
1	71	XX___XOOOO_OX____XX
1	a1	XX___XOOOOO_X____XX
1	a1	XX___XOOOOOOX____XX
1	21	XX___X___O___X___XX
1	31	XX___X___O__OX___XX
1	41	XX___X___O_O_X___XX
1	51	XX___X___O_OOX___XX
1	41	XX___X___OO__X___XX
1	51	XX___X___OO_OX___XX
1	61	XX___X___OOO_X___XX
1	71	XX___X___OOOOX___XX
1	41	XX___X__OO___X___XX
1	51	XX___X__OO__OX___XX
1	61	XX___X__OO_O_X___XX
1	71	XX___X__OO_OOX___XX
1	61	XX___X__OOO__X___XX
1	71	XX___X__OOO_OX___XX
1	81	XX___X__OOOO_X___XX
1	a1	XX___X__OOOOOX___XX
1	41	XX___X_O_O___X___XX
1	41	XX___X_O_O__OX___XX
1	51	XX___X_O_O_O_X___XX
1	51	XX___X_O_O_OOX___XX
1	61	XX___X_O_OO__X___XX
1	61	XX___X_O_OO_OX___XX
1	71	XX___X_O_OOO_X___XX
1	71	XX___X_O_OOOOX___XX
1	61	XX___X_OOO___X___XX
1	61	XX___X_OOO__OX___XX
1	71	XX___X_OOO_O_X___XX
1	71	XX___X_OOO_OOX___XX
1	81	XX___X_OOOO__X___XX
1	81	XX___X_OOOO_OX___XX
1	a1	XX___X_OOOOO_X___XX
1	a1	XX___X_OOOOOOX___XX
1	31	XX___XO__O___X___XX
1	31	XX___XO__O__OX___XX
1	41	XX___XO__O_O_X___XX
1	51	XX___XO__O_OOX___XX
1	51	XX___XO__OO__X___XX
1	51	XX___XO__OO_OX___XX
1	61	XX___XO__OOO_X___XX
1	71	XX___XO__OOOOX___XX
1	51	XX___XO_OO___X___XX
1	51	XX___XO_OO__OX___XX
1	61	XX___XO_OO_O_X___XX
1	71	XX___XO_OO_OOX___XX
1	71	XX___XO_OOO__X___XX
1	72	XX___XO_OOO_OX___XX
1	81	XX___XO_OOOO_X___XX
1	a1	XX___XO_OOOOOX___XX
1	51	XX___XOO_O___X___XX
1	51	XX___XOO_O__OX___XX
1	51	XX___XOO_O_O_X___XX
1	51	XX___XOO_O_OOX___XX
1	71	XX___XOO_OO__X___XX
1	71	XX___XOO_OO_OX___XX
1	71	XX___XOO_OOO_X___XX
1	71	XX___XOO_OOOOX___XX
1	71	XX___XOOOO___X___XX
1	71	XX___XOOOO__OX___XX
1	71	XX___XOOOO_O_X___XX
1	71	XX___XOOOO_OOX___XX
1	a1	XX___XOOOOO__X___XX
1	a1	XX___XOOOOO_OX___XX
1	a1	XX___XOOOOOO_X___XX
1	a1	XX___XOOOOOOOX___XX
1	21	XX___X___O____X__XX
1	31	XX___X___O___OX__XX
1	41	XX___X___O__O_X__XX
1	51	XX___X___O__OOX__XX
1	41	XX___X___O_O__X__XX
1	51	XX___X___O_O_OX__XX
1	61	XX___X___O_OO_X__XX
1	71	XX___X___O_OOOX__XX
1	41	XX___X___OO___X__XX
1	51	XX___X___OO__OX__XX
1	61	XX___X___OO_O_X__XX
1	71	XX___X___OO_OOX__XX
1	61	XX___X___OOO__X__XX
1	71	XX___X___OOO_OX__XX
1	81	XX___X___OOOO_X__XX
1	a1	XX___X___OOOOOX__XX
1	41	XX___X__OO____X__XX
1	41	XX___X__OO___OX__XX
1	51	XX___X__OO__O_X__XX
1	51	XX___X__OO__OOX__XX
1	61	XX___X__OO_O__X__XX
1	61	XX___X__OO_O_OX__XX
1	71	XX___X__OO_OO_X__XX
1	71	XX___X__OO_OOOX__XX
1	61	XX___X__OOO___X__XX
1	61	XX___X__OOO__OX__XX
1	71	XX___X__OOO_O_X__XX
1	71	XX___X__OOO_OOX__XX
1	81	XX___X__OOOO__X__XX
1	81	XX___X__OOOO_OX__XX
1	a1	XX___X__OOOOO_X__XX
1	a1	XX___X__OOOOOOX__XX
1	41	XX___X_O_O____X__XX
1	41	XX___X_O_O___OX__XX
1	41	XX___X_O_O__O_X__XX
1	51	XX___X_O_O__OOX__XX
1	51	XX___X_O_O_O__X__XX
1	51	XX___X_O_O_O_OX__XX
1	61	XX___X_O_O_OO_X__XX
1	71	XX___X_O_O_OOOX__XX
1	61	XX___X_O_OO___X__XX
1	61	XX___X_O_OO__OX__XX
1	61	XX___X_O_OO_O_X__XX
1	71	XX___X_O_OO_OOX__XX
1	71	XX___X_O_OOO__X__XX
1	72	XX___X_O_OOO_OX__XX
1	81	XX___X_O_OOOO_X__XX
1	a1	XX___X_O_OOOOOX__XX
1	61	XX___X_OOO____X__XX
1	61	XX___X_OOO___OX__XX
1	61	XX___X_OOO__O_X__XX
1	61	XX___X_OOO__OOX__XX
1	71	XX___X_OOO_O__X__XX
1	71	XX___X_OOO_O_OX__XX
1	71	XX___X_OOO_OO_X__XX
1	71	XX___X_OOO_OOOX__XX
1	81	XX___X_OOOO___X__XX
1	81	XX___X_OOOO__OX__XX
1	81	XX___X_OOOO_O_X__XX
1	81	XX___X_OOOO_OOX__XX
1	a1	XX___X_OOOOO__X__XX
1	a1	XX___X_OOOOO_OX__XX
1	a1	XX___X_OOOOOO_X__XX
1	a1	XX___X_OOOOOOOX__XX
1	31	XX___XO__O____X__XX
1	31	XX___XO__O___OX__XX
1	41	XX___XO__O__O_X__XX
1	51	XX___XO__O__OOX__XX
1	41	XX___XO__O_O__X__XX
1	51	XX___XO__O_O_OX__XX
1	61	XX___XO__O_OO_X__XX
1	71	XX___XO__O_OOOX__XX
1	51	XX___XO__OO___X__XX
1	51	XX___XO__OO__OX__XX
1	61	XX___XO__OO_O_X__XX
1	71	XX___XO__OO_OOX__XX
1	61	XX___XO__OOO__X__XX
1	71	XX___XO__OOO_OX__XX
1	81	XX___XO__OOOO_X__XX
1	a1	XX___XO__OOOOOX__XX
1	51	XX___XO_OO____X__XX
1	51	XX___XO_OO___OX__XX
1	51	XX___XO_OO__O_X__XX
1	51	XX___XO_OO__OOX__XX
1	61	XX___XO_OO_O__X__XX
1	61	XX___XO_OO_O_OX__XX
1	71	XX___XO_OO_OO_X__XX
1	71	XX___XO_OO_OOOX__XX
1	71	XX___XO_OOO___X__XX
1	71	XX___XO_OOO__OX__XX
1	72	XX___XO_OOO_O_X__XX
1	72	XX___XO_OOO_OOX__XX
1	81	XX___XO_OOOO__X__XX
1	81	XX___XO_OOOO_OX__XX
1	a1	XX___XO_OOOOO_X__XX
1	a1	XX___XO_OOOOOOX__XX
1	51	XX___XOO_O____X__XX
1	51	XX___XOO_O___OX__XX
1	51	XX___XOO_O__O_X__XX
1	51	XX___XOO_O__OOX__XX
1	51	XX___XOO_O_O__X__XX
1	51	XX___XOO_O_O_OX__XX
1	61	XX___XOO_O_OO_X__XX
1	71	XX___XOO_O_OOOX__XX
1	71	XX___XOO_OO___X__XX
1	71	XX___XOO_OO__OX__XX
1	71	XX___XOO_OO_O_X__XX
1	72	XX___XOO_OO_OOX__XX
1	71	XX___XOO_OOO__X__XX
1	72	XX___XOO_OOO_OX__XX
1	81	XX___XOO_OOOO_X__XX
1	a1	XX___XOO_OOOOOX__XX
1	71	XX___XOOOO____X__XX
1	71	XX___XOOOO___OX__XX
1	71	XX___XOOOO__O_X__XX
1	71	XX___XOOOO__OOX__XX
1	71	XX___XOOOO_O__X__XX
1	71	XX___XOOOO_O_OX__XX
1	71	XX___XOOOO_OO_X__XX
1	71	XX___XOOOO_OOOX__XX
1	a1	XX___XOOOOO___X__XX
1	a1	XX___XOOOOO__OX__XX
1	a1	XX___XOOOOO_O_X__XX
1	a1	XX___XOOOOO_OOX__XX
1	a1	XX___XOOOOOO__X__XX
1	a1	XX___XOOOOOO_OX__XX
1	a1	XX___XOOOOOOO_X__XX
1	a1	XX___XOOOOOOOOX__XX
1	21	XX___X___O_____X_XX
1	21	XX___X___O____OX_XX
1	31	XX___X___O___O_X_XX
1	31	XX___X___O___OOX_XX
1	41	XX___X___O__O__X_XX
1	41	XX___X___O__O_OX_XX
1	51	XX___X___O__OO_X_XX
1	51	XX___X___O__OOOX_XX
1	41	XX___X___O_O___X_XX
1	41	XX___X___O_O__OX_XX
1	51	XX___X___O_O_O_X_XX
1	51	XX___X___O_O_OOX_XX
1	61	XX___X___O_OO__X_XX
1	61	XX___X___O_OO_OX_XX
1	71	XX___X___O_OOO_X_XX
1	71	XX___X___O_OOOOX_XX
1	41	XX___X___OO____X_XX
1	41	XX___X___OO___OX_XX
1	51	XX___X___OO__O_X_XX
1	51	XX___X___OO__OOX_XX
1	61	XX___X___OO_O__X_XX
1	61	XX___X___OO_O_OX_XX
1	71	XX___X___OO_OO_X_XX
1	71	XX___X___OO_OOOX_XX
1	61	XX___X___OOO___X_XX
1	61	XX___X___OOO__OX_XX
1	71	XX___X___OOO_O_X_XX
1	71	XX___X___OOO_OOX_XX
1	81	XX___X___OOOO__X_XX
1	81	XX___X___OOOO_OX_XX
1	a1	XX___X___OOOOO_X_XX
1	a1	XX___X___OOOOOOX_XX
1	41	XX___X__OO_____X_XX
1	41	XX___X__OO____OX_XX
1	41	XX___X__OO___O_X_XX
1	41	XX___X__OO___OOX_XX
1	51	XX___X__OO__O__X_XX
1	51	XX___X__OO__O_OX_XX
1	51	XX___X__OO__OO_X_XX
1	51	XX___X__OO__OOOX_XX
1	61	XX___X__OO_O___X_XX
1	61	XX___X__OO_O__OX_XX
1	61	XX___X__OO_O_O_X_XX
1	61	XX___X__OO_O_OOX_XX
1	71	XX___X__OO_OO__X_XX
1	71	XX___X__OO_OO_OX_XX
1	71	XX___X__OO_OOO_X_XX
1	71	XX___X__OO_OOOOX_XX
1	61	XX___X__OOO____X_XX
1	61	XX___X__OOO___OX_XX
1	61	XX___X__OOO__O_X_XX
1	61	XX___X__OOO__OOX_XX
1	71	XX___X__OOO_O__X_XX
1	71	XX___X__OOO_O_OX_XX
1	71	XX___X__OOO_OO_X_XX
1	71	XX___X__OOO_OOOX_XX
1	81	XX___X__OOOO___X_XX
1	81	XX___X__OOOO__OX_XX
1	81	XX___X__OOOO_O_X_XX
1	81	XX___X__OOOO_OOX_XX
1	a1	XX___X__OOOOO__X_XX
1	a1	XX___X__OOOOO_OX_XX
1	a1	XX___X__OOOOOO_X_XX
1	a1	XX___X__OOOOOOOX_XX
1	41	XX___X_O_O_____X_XX
1	41	XX___X_O_O____OX_XX
1	41	XX___X_O_O___O_X_XX
1	41	XX___X_O_O___OOX_XX
1	41	XX___X_O_O__O__X_XX
1	41	XX___X_O_O__O_OX_XX
1	51	XX___X_O_O__OO_X_XX
1	51	XX___X_O_O__OOOX_XX
1	51	XX___X_O_O_O___X_XX
1	51	XX___X_O_O_O__OX_XX
1	51	XX___X_O_O_O_O_X_XX
1	51	XX___X_O_O_O_OOX_XX
1	61	XX___X_O_O_OO__X_XX
1	61	XX___X_O_O_OO_OX_XX
1	71	XX___X_O_O_OOO_X_XX
1	71	XX___X_O_O_OOOOX_XX
1	61	XX___X_O_OO____X_XX
1	61	XX___X_O_OO___OX_XX
1	61	XX___X_O_OO__O_X_XX
1	61	XX___X_O_OO__OOX_XX
1	61	XX___X_O_OO_O__X_XX
1	61	XX___X_O_OO_O_OX_XX
1	71	XX___X_O_OO_OO_X_XX
1	71	XX___X_O_OO_OOOX_XX
1	71	XX___X_O_OOO___X_XX
1	71	XX___X_O_OOO__OX_XX
1	72	XX___X_O_OOO_O_X_XX
1	72	XX___X_O_OOO_OOX_XX
1	81	XX___X_O_OOOO__X_XX
1	81	XX___X_O_OOOO_OX_XX
1	a1	XX___X_O_OOOOO_X_XX
1	a1	XX___X_O_OOOOOOX_XX
1	61	XX___X_OOO_____X_XX
1	61	XX___X_OOO____OX_XX
1	61	XX___X_OOO___O_X_XX
1	61	XX___X_OOO___OOX_XX
1	61	XX___X_OOO__O__X_XX
1	61	XX___X_OOO__O_OX_XX
1	61	XX___X_OOO__OO_X_XX
1	61	XX___X_OOO__OOOX_XX
1	71	XX___X_OOO_O___X_XX
1	71	XX___X_OOO_O__OX_XX
1	71	XX___X_OOO_O_O_X_XX
1	71	XX___X_OOO_O_OOX_XX
1	71	XX___X_OOO_OO__X_XX
1	71	XX___X_OOO_OO_OX_XX
1	71	XX___X_OOO_OOO_X_XX
1	71	XX___X_OOO_OOOOX_XX
1	81	XX___X_OOOO____X_XX
1	81	XX___X_OOOO___OX_XX
1	81	XX___X_OOOO__O_X_XX
1	81	XX___X_OOOO__OOX_XX
1	81	XX___X_OOOO_O__X_XX
1	81	XX___X_OOOO_O_OX_XX
1	81	XX___X_OOOO_OO_X_XX
1	81	XX___X_OOOO_OOOX_XX
1	a1	XX___X_OOOOO___X_XX
1	a1	XX___X_OOOOO__OX_XX
1	a1	XX___X_OOOOO_O_X_XX
1	a1	XX___X_OOOOO_OOX_XX
1	a1	XX___X_OOOOOO__X_XX
1	a1	XX___X_OOOOOO_OX_XX
1	a1	XX___X_OOOOOOO_X_XX
1	a1	XX___X_OOOOOOOOX_XX
1	31	XX___XO__O_____X_XX
1	31	XX___XO__O____OX_XX
1	31	XX___XO__O___O_X_XX
1	31	XX___XO__O___OOX_XX
1	41	XX___XO__O__O__X_XX
1	41	XX___XO__O__O_OX_XX
1	51	XX___XO__O__OO_X_XX
1	51	XX___XO__O__OOOX_XX
1	41	XX___XO__O_O___X_XX
1	41	XX___XO__O_O__OX_XX
1	51	XX___XO__O_O_O_X_XX
1	51	XX___XO__O_O_OOX_XX
1	61	XX___XO__O_OO__X_XX
1	61	XX___XO__O_OO_OX_XX
1	71	XX___XO__O_OOO_X_XX
1	71	XX___XO__O_OOOOX_XX
1	51	XX___XO__OO____X_XX
1	51	XX___XO__OO___OX_XX
1	51	XX___XO__OO__O_X_XX
1	51	XX___XO__OO__OOX_XX
1	61	XX___XO__OO_O__X_XX
1	61	XX___XO__OO_O_OX_XX
1	71	XX___XO__OO_OO_X_XX
1	71	XX___XO__OO_OOOX_XX
1	61	XX___XO__OOO___X_XX
1	61	XX___XO__OOO__OX_XX
1	71	XX___XO__OOO_O_X_XX
1	71	XX___XO__OOO_OOX_XX
1	81	XX___XO__OOOO__X_XX
1	81	XX___XO__OOOO_OX_XX
1	a1	XX___XO__OOOOO_X_XX
1	a1	XX___XO__OOOOOOX_XX
1	51	XX___XO_OO_____X_XX
1	51	XX___XO_OO____OX_XX
1	51	XX___XO_OO___O_X_XX
1	51	XX___XO_OO___OOX_XX
1	51	XX___XO_OO__O__X_XX
1	51	XX___XO_OO__O_OX_XX
1	51	XX___XO_OO__OO_X_XX
1	51	XX___XO_OO__OOOX_XX
1	61	XX___XO_OO_O___X_XX
1	61	XX___XO_OO_O__OX_XX
1	61	XX___XO_OO_O_O_X_XX
1	61	XX___XO_OO_O_OOX_XX
1	71	XX___XO_OO_OO__X_XX
1	71	XX___XO_OO_OO_OX_XX
1	71	XX___XO_OO_OOO_X_XX
1	71	XX___XO_OO_OOOOX_XX
1	71	XX___XO_OOO____X_XX
1	71	XX___XO_OOO___OX_XX
1	71	XX___XO_OOO__O_X_XX
1	71	XX___XO_OOO__OOX_XX
1	72	XX___XO_OOO_O__X_XX
1	72	XX___XO_OOO_O_OX_XX
1	72	XX___XO_OOO_OO_X_XX
1	72	XX___XO_OOO_OOOX_XX
1	81	XX___XO_OOOO___X_XX
1	81	XX___XO_OOOO__OX_XX
1	81	XX___XO_OOOO_O_X_XX
1	81	XX___XO_OOOO_OOX_XX
1	a1	XX___XO_OOOOO__X_XX
1	a1	XX___XO_OOOOO_OX_XX
1	a1	XX___XO_OOOOOO_X_XX
1	a1	XX___XO_OOOOOOOX_XX
1	51	XX___XOO_O_____X_XX
1	51	XX___XOO_O____OX_XX
1	51	XX___XOO_O___O_X_XX
1	51	XX___XOO_O___OOX_XX
1	51	XX___XOO_O__O__X_XX
1	51	XX___XOO_O__O_OX_XX
1	51	XX___XOO_O__OO_X_XX
1	51	XX___XOO_O__OOOX_XX
1	51	XX___XOO_O_O___X_XX
1	51	XX___XOO_O_O__OX_XX
1	51	XX___XOO_O_O_O_X_XX
1	51	XX___XOO_O_O_OOX_XX
1	61	XX___XOO_O_OO__X_XX
1	61	XX___XOO_O_OO_OX_XX
1	71	XX___XOO_O_OOO_X_XX
1	71	XX___XOO_O_OOOOX_XX
1	71	XX___XOO_OO____X_XX
1	71	XX___XOO_OO___OX_XX
1	71	XX___XOO_OO__O_X_XX
1	71	XX___XOO_OO__OOX_XX
1	71	XX___XOO_OO_O__X_XX
1	71	XX___XOO_OO_O_OX_XX
1	72	XX___XOO_OO_OO_X_XX
1	72	XX___XOO_OO_OOOX_XX
1	71	XX___XOO_OOO___X_XX
1	71	XX___XOO_OOO__OX_XX
1	72	XX___XOO_OOO_O_X_XX
1	72	XX___XOO_OOO_OOX_XX
1	81	XX___XOO_OOOO__X_XX
1	81	XX___XOO_OOOO_OX_XX
1	a1	XX___XOO_OOOOO_X_XX
1	a1	XX___XOO_OOOOOOX_XX
1	71	XX___XOOOO_____X_XX
1	71	XX___XOOOO____OX_XX
1	71	XX___XOOOO___O_X_XX
1	71	XX___XOOOO___OOX_XX
1	71	XX___XOOOO__O__X_XX
1	71	XX___XOOOO__O_OX_XX
1	71	XX___XOOOO__OO_X_XX
1	71	XX___XOOOO__OOOX_XX
1	71	XX___XOOOO_O___X_XX
1	71	XX___XOOOO_O__OX_XX
1	71	XX___XOOOO_O_O_X_XX
1	71	XX___XOOOO_O_OOX_XX
1	71	XX___XOOOO_OO__X_XX
1	71	XX___XOOOO_OO_OX_XX
1	71	XX___XOOOO_OOO_X_XX
1	71	XX___XOOOO_OOOOX_XX
1	a1	XX___XOOOOO____X_XX
1	a1	XX___XOOOOO___OX_XX
1	a1	XX___XOOOOO__O_X_XX
1	a1	XX___XOOOOO__OOX_XX
1	a1	XX___XOOOOO_O__X_XX
1	a1	XX___XOOOOO_O_OX_XX
1	a1	XX___XOOOOO_OO_X_XX
1	a1	XX___XOOOOO_OOOX_XX
1	a1	XX___XOOOOOO___X_XX
1	a1	XX___XOOOOOO__OX_XX
1	a1	XX___XOOOOOO_O_X_XX
1	a1	XX___XOOOOOO_OOX_XX
1	a1	XX___XOOOOOOO__X_XX
1	a1	XX___XOOOOOOO_OX_XX
1	a1	XX___XOOOOOOOO_X_XX
1	a1	XX___XOOOOOOOOOX_XX
1	11	XX__X____OX______XX
1	31	XX__X___OOX______XX
1	31	XX__X__O_OX______XX
1	51	XX__X__OOOX______XX
1	31	XX__X_O__OX______XX
1	51	XX__X_O_OOX______XX
1	51	XX__X_OO_OX______XX
1	71	XX__X_OOOOX______XX
1	31	XX__XO___OX______XX
1	51	XX__XO__OOX______XX
1	51	XX__XO_O_OX______XX
1	71	XX__XO_OOOX______XX
1	51	XX__XOO__OX______XX
1	71	XX__XOO_OOX______XX
1	71	XX__XOOO_OX______XX
1	a1	XX__XOOOOOX______XX
1	21	XX__X____O_X_____XX
1	31	XX__X____OOX_____XX
1	41	XX__X___OO_X_____XX
1	51	XX__X___OOOX_____XX
1	41	XX__X__O_O_X_____XX
1	51	XX__X__O_OOX_____XX
1	61	XX__X__OOO_X_____XX
1	71	XX__X__OOOOX_____XX
1	41	XX__X_O__O_X_____XX
1	51	XX__X_O__OOX_____XX
1	61	XX__X_O_OO_X_____XX
1	71	XX__X_O_OOOX_____XX
1	61	XX__X_OO_O_X_____XX
1	71	XX__X_OO_OOX_____XX
1	81	XX__X_OOOO_X_____XX
1	a1	XX__X_OOOOOX_____XX
1	31	XX__XO___O_X_____XX
1	31	XX__XO___OOX_____XX
1	51	XX__XO__OO_X_____XX
1	51	XX__XO__OOOX_____XX
1	51	XX__XO_O_O_X_____XX
1	51	XX__XO_O_OOX_____XX
1	71	XX__XO_OOO_X_____XX
1	71	XX__XO_OOOOX_____XX
1	51	XX__XOO__O_X_____XX
1	51	XX__XOO__OOX_____XX
1	71	XX__XOO_OO_X_____XX
1	71	XX__XOO_OOOX_____XX
1	71	XX__XOOO_O_X_____XX
1	71	XX__XOOO_OOX_____XX
1	a1	XX__XOOOOO_X_____XX
1	a1	XX__XOOOOOOX_____XX
1	21	XX__X____O__X____XX
1	31	XX__X____O_OX____XX
1	41	XX__X____OO_X____XX
1	51	XX__X____OOOX____XX
1	41	XX__X___OO__X____XX
1	51	XX__X___OO_OX____XX
1	61	XX__X___OOO_X____XX
1	71	XX__X___OOOOX____XX
1	41	XX__X__O_O__X____XX
1	51	XX__X__O_O_OX____XX
1	61	XX__X__O_OO_X____XX
1	71	XX__X__O_OOOX____XX
1	61	XX__X__OOO__X____XX
1	71	XX__X__OOO_OX____XX
1	81	XX__X__OOOO_X____XX
1	a1	XX__X__OOOOOX____XX
1	41	XX__X_O__O__X____XX
1	41	XX__X_O__O_OX____XX
1	51	XX__X_O__OO_X____XX
1	51	XX__X_O__OOOX____XX
1	61	XX__X_O_OO__X____XX
1	61	XX__X_O_OO_OX____XX
1	71	XX__X_O_OOO_X____XX
1	71	XX__X_O_OOOOX____XX
1	61	XX__X_OO_O__X____XX
1	61	XX__X_OO_O_OX____XX
1	71	XX__X_OO_OO_X____XX
1	71	XX__X_OO_OOOX____XX
1	81	XX__X_OOOO__X____XX
1	81	XX__X_OOOO_OX____XX
1	a1	XX__X_OOOOO_X____XX
1	a1	XX__X_OOOOOOX____XX
1	31	XX__XO___O__X____XX
1	31	XX__XO___O_OX____XX
1	41	XX__XO___OO_X____XX
1	51	XX__XO___OOOX____XX
1	51	XX__XO__OO__X____XX
1	51	XX__XO__OO_OX____XX
1	61	XX__XO__OOO_X____XX
1	71	XX__XO__OOOOX____XX
1	51	XX__XO_O_O__X____XX
1	51	XX__XO_O_O_OX____XX
1	61	XX__XO_O_OO_X____XX
1	71	XX__XO_O_OOOX____XX
1	71	XX__XO_OOO__X____XX
1	72	XX__XO_OOO_OX____XX
1	81	XX__XO_OOOO_X____XX
1	a1	XX__XO_OOOOOX____XX
1	51	XX__XOO__O__X____XX
1	51	XX__XOO__O_OX____XX
1	51	XX__XOO__OO_X____XX
1	51	XX__XOO__OOOX____XX
1	71	XX__XOO_OO__X____XX
1	71	XX__XOO_OO_OX____XX
1	71	XX__XOO_OOO_X____XX
1	71	XX__XOO_OOOOX____XX
1	71	XX__XOOO_O__X____XX
1	71	XX__XOOO_O_OX____XX
1	71	XX__XOOO_OO_X____XX
1	71	XX__XOOO_OOOX____XX
1	a1	XX__XOOOOO__X____XX
1	a1	XX__XOOOOO_OX____XX
1	a1	XX__XOOOOOO_X____XX
1	a1	XX__XOOOOOOOX____XX
1	21	XX__X____O___X___XX
1	31	XX__X____O__OX___XX
1	41	XX__X____O_O_X___XX
1	51	XX__X____O_OOX___XX
1	41	XX__X____OO__X___XX
1	51	XX__X____OO_OX___XX
1	61	XX__X____OOO_X___XX
1	71	XX__X____OOOOX___XX
1	41	XX__X___OO___X___XX
1	51	XX__X___OO__OX___XX
1	61	XX__X___OO_O_X___XX
1	71	XX__X___OO_OOX___XX
1	61	XX__X___OOO__X___XX
1	71	XX__X___OOO_OX___XX
1	81	XX__X___OOOO_X___XX
1	a1	XX__X___OOOOOX___XX
1	41	XX__X__O_O___X___XX
1	41	XX__X__O_O__OX___XX
1	51	XX__X__O_O_O_X___XX
1	51	XX__X__O_O_OOX___XX
1	61	XX__X__O_OO__X___XX
1	61	XX__X__O_OO_OX___XX
1	71	XX__X__O_OOO_X___XX
1	71	XX__X__O_OOOOX___XX
1	61	XX__X__OOO___X___XX
1	61	XX__X__OOO__OX___XX
1	71	XX__X__OOO_O_X___XX
1	71	XX__X__OOO_OOX___XX
1	81	XX__X__OOOO__X___XX
1	81	XX__X__OOOO_OX___XX
1	a1	XX__X__OOOOO_X___XX
1	a1	XX__X__OOOOOOX___XX
1	41	XX__X_O__O___X___XX
1	41	XX__X_O__O__OX___XX
1	41	XX__X_O__O_O_X___XX
1	51	XX__X_O__O_OOX___XX
1	51	XX__X_O__OO__X___XX
1	51	XX__X_O__OO_OX___XX
1	61	XX__X_O__OOO_X___XX
1	71	XX__X_O__OOOOX___XX
1	61	XX__X_O_OO___X___XX
1	61	XX__X_O_OO__OX___XX
1	61	XX__X_O_OO_O_X___XX
1	71	XX__X_O_OO_OOX___XX
1	71	XX__X_O_OOO__X___XX
1	72	XX__X_O_OOO_OX___XX
1	81	XX__X_O_OOOO_X___XX
1	a1	XX__X_O_OOOOOX___XX
1	61	XX__X_OO_O___X___XX
1	61	XX__X_OO_O__OX___XX
1	61	XX__X_OO_O_O_X___XX
1	61	XX__X_OO_O_OOX___XX
1	71	XX__X_OO_OO__X___XX
1	71	XX__X_OO_OO_OX___XX
1	71	XX__X_OO_OOO_X___XX
1	71	XX__X_OO_OOOOX___XX
1	81	XX__X_OOOO___X___XX
1	81	XX__X_OOOO__OX___XX
1	81	XX__X_OOOO_O_X___XX
1	81	XX__X_OOOO_OOX___XX
1	a1	XX__X_OOOOO__X___XX
1	a1	XX__X_OOOOO_OX___XX
1	a1	XX__X_OOOOOO_X___XX
1	a1	XX__X_OOOOOOOX___XX
1	31	XX__XO___O___X___XX
1	31	XX__XO___O__OX___XX
1	41	XX__XO___O_O_X___XX
1	51	XX__XO___O_OOX___XX
1	41	XX__XO___OO__X___XX
1	51	XX__XO___OO_OX___XX
1	61	XX__XO___OOO_X___XX
1	71	XX__XO___OOOOX___XX
1	51	XX__XO__OO___X___XX
1	51	XX__XO__OO__OX___XX
1	61	XX__XO__OO_O_X___XX
1	71	XX__XO__OO_OOX___XX
1	61	XX__XO__OOO__X___XX
1	71	XX__XO__OOO_OX___XX
1	81	XX__XO__OOOO_X___XX
1	a1	XX__XO__OOOOOX___XX
1	51	XX__XO_O_O___X___XX
1	51	XX__XO_O_O__OX___XX
1	51	XX__XO_O_O_O_X___XX
1	51	XX__XO_O_O_OOX___XX
1	61	XX__XO_O_OO__X___XX
1	61	XX__XO_O_OO_OX___XX
1	71	XX__XO_O_OOO_X___XX
1	71	XX__XO_O_OOOOX___XX
1	71	XX__XO_OOO___X___XX
1	71	XX__XO_OOO__OX___XX
1	72	XX__XO_OOO_O_X___XX
1	72	XX__XO_OOO_OOX___XX
1	81	XX__XO_OOOO__X___XX
1	81	XX__XO_OOOO_OX___XX
1	a1	XX__XO_OOOOO_X___XX
1	a1	XX__XO_OOOOOOX___XX
1	51	XX__XOO__O___X___XX
1	51	XX__XOO__O__OX___XX
1	51	XX__XOO__O_O_X___XX
1	51	XX__XOO__O_OOX___XX
1	51	XX__XOO__OO__X___XX
1	51	XX__XOO__OO_OX___XX
1	61	XX__XOO__OOO_X___XX
1	71	XX__XOO__OOOOX___XX
1	71	XX__XOO_OO___X___XX
1	71	XX__XOO_OO__OX___XX
1	71	XX__XOO_OO_O_X___XX
1	72	XX__XOO_OO_OOX___XX
1	71	XX__XOO_OOO__X___XX
1	72	XX__XOO_OOO_OX___XX
1	81	XX__XOO_OOOO_X___XX
1	a1	XX__XOO_OOOOOX___XX
1	71	XX__XOOO_O___X___XX
1	71	XX__XOOO_O__OX___XX
1	71	XX__XOOO_O_O_X___XX
1	71	XX__XOOO_O_OOX___XX
1	71	XX__XOOO_OO__X___XX
1	71	XX__XOOO_OO_OX___XX
1	71	XX__XOOO_OOO_X___XX
1	71	XX__XOOO_OOOOX___XX
1	a1	XX__XOOOOO___X___XX
1	a1	XX__XOOOOO__OX___XX
1	a1	XX__XOOOOO_O_X___XX
1	a1	XX__XOOOOO_OOX___XX
1	a1	XX__XOOOOOO__X___XX
1	a1	XX__XOOOOOO_OX___XX
1	a1	XX__XOOOOOOO_X___XX
1	a1	XX__XOOOOOOOOX___XX
1	21	XX__X____O____X__XX
1	31	XX__X____O___OX__XX
1	41	XX__X____O__O_X__XX
1	51	XX__X____O__OOX__XX
1	41	XX__X____O_O__X__XX
1	51	XX__X____O_O_OX__XX
1	61	XX__X____O_OO_X__XX
1	71	XX__X____O_OOOX__XX
1	41	XX__X____OO___X__XX
1	51	XX__X____OO__OX__XX
1	61	XX__X____OO_O_X__XX
1	71	XX__X____OO_OOX__XX
1	61	XX__X____OOO__X__XX
1	71	XX__X____OOO_OX__XX
1	81	XX__X____OOOO_X__XX
1	a1	XX__X____OOOOOX__XX
1	41	XX__X___OO____X__XX
1	41	XX__X___OO___OX__XX
1	51	XX__X___OO__O_X__XX
1	51	XX__X___OO__OOX__XX
1	61	XX__X___OO_O__X__XX
1	61	XX__X___OO_O_OX__XX
1	71	XX__X___OO_OO_X__XX
1	71	XX__X___OO_OOOX__XX
1	61	XX__X___OOO___X__XX
1	61	XX__X___OOO__OX__XX
1	71	XX__X___OOO_O_X__XX
1	71	XX__X___OOO_OOX__XX
1	81	XX__X___OOOO__X__XX
1	81	XX__X___OOOO_OX__XX
1	a1	XX__X___OOOOO_X__XX
1	a1	XX__X___OOOOOOX__XX
1	41	XX__X__O_O____X__XX
1	41	XX__X__O_O___OX__XX
1	41	XX__X__O_O__O_X__XX
1	51	XX__X__O_O__OOX__XX
1	51	XX__X__O_O_O__X__XX
1	51	XX__X__O_O_O_OX__XX
1	61	XX__X__O_O_OO_X__XX
1	71	XX__X__O_O_OOOX__XX
1	61	XX__X__O_OO___X__XX
1	61	XX__X__O_OO__OX__XX
1	61	XX__X__O_OO_O_X__XX
1	71	XX__X__O_OO_OOX__XX
1	71	XX__X__O_OOO__X__XX
1	72	XX__X__O_OOO_OX__XX
1	81	XX__X__O_OOOO_X__XX
1	a1	XX__X__O_OOOOOX__XX
1	61	XX__X__OOO____X__XX
1	61	XX__X__OOO___OX__XX
1	61	XX__X__OOO__O_X__XX
1	61	XX__X__OOO__OOX__XX
1	71	XX__X__OOO_O__X__XX
1	71	XX__X__OOO_O_OX__XX
1	71	XX__X__OOO_OO_X__XX
1	71	XX__X__OOO_OOOX__XX
1	81	XX__X__OOOO___X__XX
1	81	XX__X__OOOO__OX__XX
1	81	XX__X__OOOO_O_X__XX
1	81	XX__X__OOOO_OOX__XX
1	a1	XX__X__OOOOO__X__XX
1	a1	XX__X__OOOOO_OX__XX
1	a1	XX__X__OOOOOO_X__XX
1	a1	XX__X__OOOOOOOX__XX
1	41	XX__X_O__O____X__XX
1	41	XX__X_O__O___OX__XX
1	41	XX__X_O__O__O_X__XX
1	51	XX__X_O__O__OOX__XX
1	41	XX__X_O__O_O__X__XX
1	51	XX__X_O__O_O_OX__XX
1	61	XX__X_O__O_OO_X__XX
1	71	XX__X_O__O_OOOX__XX
1	51	XX__X_O__OO___X__XX
1	51	XX__X_O__OO__OX__XX
1	61	XX__X_O__OO_O_X__XX
1	71	XX__X_O__OO_OOX__XX
1	61	XX__X_O__OOO__X__XX
1	71	XX__X_O__OOO_OX__XX
1	81	XX__X_O__OOOO_X__XX
1	a1	XX__X_O__OOOOOX__XX
1	61	XX__X_O_OO____X__XX
1	61	XX__X_O_OO___OX__XX
1	61	XX__X_O_OO__O_X__XX
1	61	XX__X_O_OO__OOX__XX
1	61	XX__X_O_OO_O__X__XX
1	61	XX__X_O_OO_O_OX__XX
1	71	XX__X_O_OO_OO_X__XX
1	71	XX__X_O_OO_OOOX__XX
1	71	XX__X_O_OOO___X__XX
1	71	XX__X_O_OOO__OX__XX
1	72	XX__X_O_OOO_O_X__XX
1	72	XX__X_O_OOO_OOX__XX
1	81	XX__X_O_OOOO__X__XX
1	81	XX__X_O_OOOO_OX__XX
1	a1	XX__X_O_OOOOO_X__XX
1	a1	XX__X_O_OOOOOOX__XX
1	61	XX__X_OO_O____X__XX
1	61	XX__X_OO_O___OX__XX
1	61	XX__X_OO_O__O_X__XX
1	61	XX__X_OO_O__OOX__XX
1	61	XX__X_OO_O_O__X__XX
1	61	XX__X_OO_O_O_OX__XX
1	61	XX__X_OO_O_OO_X__XX
1	71	XX__X_OO_O_OOOX__XX
1	71	XX__X_OO_OO___X__XX
1	71	XX__X_OO_OO__OX__XX
1	71	XX__X_OO_OO_O_X__XX
1	72	XX__X_OO_OO_OOX__XX
1	71	XX__X_OO_OOO__X__XX
1	72	XX__X_OO_OOO_OX__XX
1	81	XX__X_OO_OOOO_X__XX
1	a1	XX__X_OO_OOOOOX__XX
1	81	XX__X_OOOO____X__XX
1	81	XX__X_OOOO___OX__XX
1	81	XX__X_OOOO__O_X__XX
1	81	XX__X_OOOO__OOX__XX
1	81	XX__X_OOOO_O__X__XX
1	81	XX__X_OOOO_O_OX__XX
1	81	XX__X_OOOO_OO_X__XX
1	81	XX__X_OOOO_OOOX__XX
1	a1	XX__X_OOOOO___X__XX
1	a1	XX__X_OOOOO__OX__XX
1	a1	XX__X_OOOOO_O_X__XX
1	a1	XX__X_OOOOO_OOX__XX
1	a1	XX__X_OOOOOO__X__XX
1	a1	XX__X_OOOOOO_OX__XX
1	a1	XX__X_OOOOOOO_X__XX
1	a1	XX__X_OOOOOOOOX__XX
1	31	XX__XO___O____X__XX
1	31	XX__XO___O___OX__XX
1	41	XX__XO___O__O_X__XX
1	51	XX__XO___O__OOX__XX
1	41	XX__XO___O_O__X__XX
1	51	XX__XO___O_O_OX__XX
1	61	XX__XO___O_OO_X__XX
1	71	XX__XO___O_OOOX__XX
1	41	XX__XO___OO___X__XX
1	51	XX__XO___OO__OX__XX
1	61	XX__XO___OO_O_X__XX
1	71	XX__XO___OO_OOX__XX
1	61	XX__XO___OOO__X__XX
1	71	XX__XO___OOO_OX__XX
1	81	XX__XO___OOOO_X__XX
1	a1	XX__XO___OOOOOX__XX
1	51	XX__XO__OO____X__XX
1	51	XX__XO__OO___OX__XX
1	51	XX__XO__OO__O_X__XX
1	51	XX__XO__OO__OOX__XX
1	61	XX__XO__OO_O__X__XX
1	61	XX__XO__OO_O_OX__XX
1	71	XX__XO__OO_OO_X__XX
1	71	XX__XO__OO_OOOX__XX
1	61	XX__XO__OOO___X__XX
1	61	XX__XO__OOO__OX__XX
1	71	XX__XO__OOO_O_X__XX
1	71	XX__XO__OOO_OOX__XX
1	81	XX__XO__OOOO__X__XX
1	81	XX__XO__OOOO_OX__XX
1	a1	XX__XO__OOOOO_X__XX
1	a1	XX__XO__OOOOOOX__XX
1	51	XX__XO_O_O____X__XX
1	51	XX__XO_O_O___OX__XX
1	51	XX__XO_O_O__O_X__XX
1	51	XX__XO_O_O__OOX__XX
1	51	XX__XO_O_O_O__X__XX
1	51	XX__XO_O_O_O_OX__XX
1	61	XX__XO_O_O_OO_X__XX
1	71	XX__XO_O_O_OOOX__XX
1	61	XX__XO_O_OO___X__XX
1	61	XX__XO_O_OO__OX__XX
1	61	XX__XO_O_OO_O_X__XX
1	71	XX__XO_O_OO_OOX__XX
1	71	XX__XO_O_OOO__X__XX
1	72	XX__XO_O_OOO_OX__XX
1	81	XX__XO_O_OOOO_X__XX
1	a1	XX__XO_O_OOOOOX__XX
1	71	XX__XO_OOO____X__XX
1	71	XX__XO_OOO___OX__XX
1	71	XX__XO_OOO__O_X__XX
1	71	XX__XO_OOO__OOX__XX
1	72	XX__XO_OOO_O__X__XX
1	72	XX__XO_OOO_O_OX__XX
1	72	XX__XO_OOO_OO_X__XX
1	72	XX__XO_OOO_OOOX__XX
1	81	XX__XO_OOOO___X__XX
1	81	XX__XO_OOOO__OX__XX
1	81	XX__XO_OOOO_O_X__XX
1	81	XX__XO_OOOO_OOX__XX
1	a1	XX__XO_OOOOO__X__XX
1	a1	XX__XO_OOOOO_OX__XX
1	a1	XX__XO_OOOOOO_X__XX
1	a1	XX__XO_OOOOOOOX__XX
1	51	XX__XOO__O____X__XX
1	51	XX__XOO__O___OX__XX
1	51	XX__XOO__O__O_X__XX
1	51	XX__XOO__O__OOX__XX
1	51	XX__XOO__O_O__X__XX
1	51	XX__XOO__O_O_OX__XX
1	61	XX__XOO__O_OO_X__XX
1	71	XX__XOO__O_OOOX__XX
1	51	XX__XOO__OO___X__XX
1	51	XX__XOO__OO__OX__XX
1	61	XX__XOO__OO_O_X__XX
1	71	XX__XOO__OO_OOX__XX
1	61	XX__XOO__OOO__X__XX
1	71	XX__XOO__OOO_OX__XX
1	81	XX__XOO__OOOO_X__XX
1	a1	XX__XOO__OOOOOX__XX
1	71	XX__XOO_OO____X__XX
1	71	XX__XOO_OO___OX__XX
1	71	XX__XOO_OO__O_X__XX
1	71	XX__XOO_OO__OOX__XX
1	71	XX__XOO_OO_O__X__XX
1	71	XX__XOO_OO_O_OX__XX
1	72	XX__XOO_OO_OO_X__XX
1	72	XX__XOO_OO_OOOX__XX
1	71	XX__XOO_OOO___X__XX
1	71	XX__XOO_OOO__OX__XX
1	72	XX__XOO_OOO_O_X__XX
1	72	XX__XOO_OOO_OOX__XX
1	81	XX__XOO_OOOO__X__XX
1	81	XX__XOO_OOOO_OX__XX
1	a1	XX__XOO_OOOOO_X__XX
1	a1	XX__XOO_OOOOOOX__XX
1	71	XX__XOOO_O____X__XX
1	71	XX__XOOO_O___OX__XX
1	71	XX__XOOO_O__O_X__XX
1	71	XX__XOOO_O__OOX__XX
1	71	XX__XOOO_O_O__X__XX
1	71	XX__XOOO_O_O_OX__XX
1	71	XX__XOOO_O_OO_X__XX
1	72	XX__XOOO_O_OOOX__XX
1	71	XX__XOOO_OO___X__XX
1	71	XX__XOOO_OO__OX__XX
1	71	XX__XOOO_OO_O_X__XX
1	72	XX__XOOO_OO_OOX__XX
1	71	XX__XOOO_OOO__X__XX
1	72	XX__XOOO_OOO_OX__XX
1	81	XX__XOOO_OOOO_X__XX
1	a1	XX__XOOO_OOOOOX__XX
1	a1	XX__XOOOOO____X__XX
1	a1	XX__XOOOOO___OX__XX
1	a1	XX__XOOOOO__O_X__XX
1	a1	XX__XOOOOO__OOX__XX
1	a1	XX__XOOOOO_O__X__XX
1	a1	XX__XOOOOO_O_OX__XX
1	a1	XX__XOOOOO_OO_X__XX
1	a1	XX__XOOOOO_OOOX__XX
1	a1	XX__XOOOOOO___X__XX
1	a1	XX__XOOOOOO__OX__XX
1	a1	XX__XOOOOOO_O_X__XX
1	a1	XX__XOOOOOO_OOX__XX
1	a1	XX__XOOOOOOO__X__XX
1	a1	XX__XOOOOOOO_OX__XX
1	a1	XX__XOOOOOOOO_X__XX
1	a1	XX__XOOOOOOOOOX__XX
1	21	XX__X____O_____X_XX
1	21	XX__X____O____OX_XX
1	31	XX__X____O___O_X_XX
1	31	XX__X____O___OOX_XX
1	41	XX__X____O__O__X_XX
1	41	XX__X____O__O_OX_XX
1	51	XX__X____O__OO_X_XX
1	51	XX__X____O__OOOX_XX
1	41	XX__X____O_O___X_XX
1	41	XX__X____O_O__OX_XX
1	51	XX__X____O_O_O_X_XX
1	51	XX__X____O_O_OOX_XX
1	61	XX__X____O_OO__X_XX
1	61	XX__X____O_OO_OX_XX
1	71	XX__X____O_OOO_X_XX
1	71	XX__X____O_OOOOX_XX
1	41	XX__X____OO____X_XX
1	41	XX__X____OO___OX_XX
1	51	XX__X____OO__O_X_XX
1	51	XX__X____OO__OOX_XX
1	61	XX__X____OO_O__X_XX
1	61	XX__X____OO_O_OX_XX
1	71	XX__X____OO_OO_X_XX
1	71	XX__X____OO_OOOX_XX
1	61	XX__X____OOO___X_XX
1	61	XX__X____OOO__OX_XX
1	71	XX__X____OOO_O_X_XX
1	71	XX__X____OOO_OOX_XX
1	81	XX__X____OOOO__X_XX
1	81	XX__X____OOOO_OX_XX
1	a1	XX__X____OOOOO_X_XX
1	a1	XX__X____OOOOOOX_XX
1	41	XX__X___OO_____X_XX
1	41	XX__X___OO____OX_XX
1	41	XX__X___OO___O_X_XX
1	41	XX__X___OO___OOX_XX
1	51	XX__X___OO__O__X_XX
1	51	XX__X___OO__O_OX_XX
1	51	XX__X___OO__OO_X_XX
1	51	XX__X___OO__OOOX_XX
1	61	XX__X___OO_O___X_XX
1	61	XX__X___OO_O__OX_XX
1	61	XX__X___OO_O_O_X_XX
1	61	XX__X___OO_O_OOX_XX
1	71	XX__X___OO_OO__X_XX
1	71	XX__X___OO_OO_OX_XX
1	71	XX__X___OO_OOO_X_XX
1	71	XX__X___OO_OOOOX_XX
1	61	XX__X___OOO____X_XX
1	61	XX__X___OOO___OX_XX
1	61	XX__X___OOO__O_X_XX
1	61	XX__X___OOO__OOX_XX
1	71	XX__X___OOO_O__X_XX
1	71	XX__X___OOO_O_OX_XX
1	71	XX__X___OOO_OO_X_XX
1	71	XX__X___OOO_OOOX_XX
1	81	XX__X___OOOO___X_XX
1	81	XX__X___OOOO__OX_XX
1	81	XX__X___OOOO_O_X_XX
1	81	XX__X___OOOO_OOX_XX
1	a1	XX__X___OOOOO__X_XX
1	a1	XX__X___OOOOO_OX_XX
1	a1	XX__X___OOOOOO_X_XX
1	a1	XX__X___OOOOOOOX_XX
1	41	XX__X__O_O_____X_XX
1	41	XX__X__O_O____OX_XX
1	41	XX__X__O_O___O_X_XX
1	41	XX__X__O_O___OOX_XX
1	41	XX__X__O_O__O__X_XX
1	41	XX__X__O_O__O_OX_XX
1	51	XX__X__O_O__OO_X_XX
1	51	XX__X__O_O__OOOX_XX
1	51	XX__X__O_O_O___X_XX
1	51	XX__X__O_O_O__OX_XX
1	51	XX__X__O_O_O_O_X_XX
1	51	XX__X__O_O_O_OOX_XX
1	61	XX__X__O_O_OO__X_XX
1	61	XX__X__O_O_OO_OX_XX
1	71	XX__X__O_O_OOO_X_XX
1	71	XX__X__O_O_OOOOX_XX
1	61	XX__X__O_OO____X_XX
1	61	XX__X__O_OO___OX_XX
1	61	XX__X__O_OO__O_X_XX
1	61	XX__X__O_OO__OOX_XX
1	61	XX__X__O_OO_O__X_XX
1	61	XX__X__O_OO_O_OX_XX
1	71	XX__X__O_OO_OO_X_XX
1	71	XX__X__O_OO_OOOX_XX
1	71	XX__X__O_OOO___X_XX
1	71	XX__X__O_OOO__OX_XX
1	72	XX__X__O_OOO_O_X_XX
1	72	XX__X__O_OOO_OOX_XX
1	81	XX__X__O_OOOO__X_XX
1	81	XX__X__O_OOOO_OX_XX
1	a1	XX__X__O_OOOOO_X_XX
1	a1	XX__X__O_OOOOOOX_XX
1	61	XX__X__OOO_____X_XX
1	61	XX__X__OOO____OX_XX
1	61	XX__X__OOO___O_X_XX
1	61	XX__X__OOO___OOX_XX
1	61	XX__X__OOO__O__X_XX
1	61	XX__X__OOO__O_OX_XX
1	61	XX__X__OOO__OO_X_XX
1	61	XX__X__OOO__OOOX_XX
1	71	XX__X__OOO_O___X_XX
1	71	XX__X__OOO_O__OX_XX
1	71	XX__X__OOO_O_O_X_XX
1	71	XX__X__OOO_O_OOX_XX
1	71	XX__X__OOO_OO__X_XX
1	71	XX__X__OOO_OO_OX_XX
1	71	XX__X__OOO_OOO_X_XX
1	71	XX__X__OOO_OOOOX_XX
1	81	XX__X__OOOO____X_XX
1	81	XX__X__OOOO___OX_XX
1	81	XX__X__OOOO__O_X_XX
1	81	XX__X__OOOO__OOX_XX
1	81	XX__X__OOOO_O__X_XX
1	81	XX__X__OOOO_O_OX_XX
1	81	XX__X__OOOO_OO_X_XX
1	81	XX__X__OOOO_OOOX_XX
1	a1	XX__X__OOOOO___X_XX
1	a1	XX__X__OOOOO__OX_XX
1	a1	XX__X__OOOOO_O_X_XX
1	a1	XX__X__OOOOO_OOX_XX
1	a1	XX__X__OOOOOO__X_XX
1	a1	XX__X__OOOOOO_OX_XX
1	a1	XX__X__OOOOOOO_X_XX
1	a1	XX__X__OOOOOOOOX_XX
1	41	XX__X_O__O_____X_XX
1	41	XX__X_O__O____OX_XX
1	41	XX__X_O__O___O_X_XX
1	41	XX__X_O__O___OOX_XX
1	41	XX__X_O__O__O__X_XX
1	41	XX__X_O__O__O_OX_XX
1	51	XX__X_O__O__OO_X_XX
1	51	XX__X_O__O__OOOX_XX
1	41	XX__X_O__O_O___X_XX
1	41	XX__X_O__O_O__OX_XX
1	51	XX__X_O__O_O_O_X_XX
1	51	XX__X_O__O_O_OOX_XX
1	61	XX__X_O__O_OO__X_XX
1	61	XX__X_O__O_OO_OX_XX
1	71	XX__X_O__O_OOO_X_XX
1	71	XX__X_O__O_OOOOX_XX
1	51	XX__X_O__OO____X_XX
1	51	XX__X_O__OO___OX_XX
1	51	XX__X_O__OO__O_X_XX
1	51	XX__X_O__OO__OOX_XX
1	61	XX__X_O__OO_O__X_XX
1	61	XX__X_O__OO_O_OX_XX
1	71	XX__X_O__OO_OO_X_XX
1	71	XX__X_O__OO_OOOX_XX
1	61	XX__X_O__OOO___X_XX
1	61	XX__X_O__OOO__OX_XX
1	71	XX__X_O__OOO_O_X_XX
1	71	XX__X_O__OOO_OOX_XX
1	81	XX__X_O__OOOO__X_XX
1	81	XX__X_O__OOOO_OX_XX
1	a1	XX__X_O__OOOOO_X_XX
1	a1	XX__X_O__OOOOOOX_XX
1	61	XX__X_O_OO_____X_XX
1	61	XX__X_O_OO____OX_XX
1	61	XX__X_O_OO___O_X_XX
1	61	XX__X_O_OO___OOX_XX
1	61	XX__X_O_OO__O__X_XX
1	61	XX__X_O_OO__O_OX_XX
1	61	XX__X_O_OO__OO_X_XX
1	61	XX__X_O_OO__OOOX_XX
1	61	XX__X_O_OO_O___X_XX
1	61	XX__X_O_OO_O__OX_XX
1	61	XX__X_O_OO_O_O_X_XX
1	61	XX__X_O_OO_O_OOX_XX
1	71	XX__X_O_OO_OO__X_XX
1	71	XX__X_O_OO_OO_OX_XX
1	71	XX__X_O_OO_OOO_X_XX
1	71	XX__X_O_OO_OOOOX_XX
1	71	XX__X_O_OOO____X_XX
1	71	XX__X_O_OOO___OX_XX
1	71	XX__X_O_OOO__O_X_XX
1	71	XX__X_O_OOO__OOX_XX
1	72	XX__X_O_OOO_O__X_XX
1	72	XX__X_O_OOO_O_OX_XX
1	72	XX__X_O_OOO_OO_X_XX
1	72	XX__X_O_OOO_OOOX_XX
1	81	XX__X_O_OOOO___X_XX
1	81	XX__X_O_OOOO__OX_XX
1	81	XX__X_O_OOOO_O_X_XX
1	81	XX__X_O_OOOO_OOX_XX
1	a1	XX__X_O_OOOOO__X_XX
1	a1	XX__X_O_OOOOO_OX_XX
1	a1	XX__X_O_OOOOOO_X_XX
1	a1	XX__X_O_OOOOOOOX_XX
1	61	XX__X_OO_O_____X_XX
1	61	XX__X_OO_O____OX_XX
1	61	XX__X_OO_O___O_X_XX
1	61	XX__X_OO_O___OOX_XX
1	61	XX__X_OO_O__O__X_XX
1	61	XX__X_OO_O__O_OX_XX
1	61	XX__X_OO_O__OO_X_XX
1	61	XX__X_OO_O__OOOX_XX
1	61	XX__X_OO_O_O___X_XX
1	61	XX__X_OO_O_O__OX_XX
1	61	XX__X_OO_O_O_O_X_XX
1	61	XX__X_OO_O_O_OOX_XX
1	61	XX__X_OO_O_OO__X_XX
1	61	XX__X_OO_O_OO_OX_XX
1	71	XX__X_OO_O_OOO_X_XX
1	71	XX__X_OO_O_OOOOX_XX
1	71	XX__X_OO_OO____X_XX
1	71	XX__X_OO_OO___OX_XX
1	71	XX__X_OO_OO__O_X_XX
1	71	XX__X_OO_OO__OOX_XX
1	71	XX__X_OO_OO_O__X_XX
1	71	XX__X_OO_OO_O_OX_XX
1	72	XX__X_OO_OO_OO_X_XX
1	72	XX__X_OO_OO_OOOX_XX
1	71	XX__X_OO_OOO___X_XX
1	71	XX__X_OO_OOO__OX_XX
1	72	XX__X_OO_OOO_O_X_XX
1	72	XX__X_OO_OOO_OOX_XX
1	81	XX__X_OO_OOOO__X_XX
1	81	XX__X_OO_OOOO_OX_XX
1	a1	XX__X_OO_OOOOO_X_XX
1	a1	XX__X_OO_OOOOOOX_XX
1	81	XX__X_OOOO_____X_XX
1	81	XX__X_OOOO____OX_XX
1	81	XX__X_OOOO___O_X_XX
1	81	XX__X_OOOO___OOX_XX
1	81	XX__X_OOOO__O__X_XX
1	81	XX__X_OOOO__O_OX_XX
1	81	XX__X_OOOO__OO_X_XX
1	81	XX__X_OOOO__OOOX_XX
1	81	XX__X_OOOO_O___X_XX
1	81	XX__X_OOOO_O__OX_XX
1	81	XX__X_OOOO_O_O_X_XX
1	81	XX__X_OOOO_O_OOX_XX
1	81	XX__X_OOOO_OO__X_XX
1	81	XX__X_OOOO_OO_OX_XX
1	81	XX__X_OOOO_OOO_X_XX
1	81	XX__X_OOOO_OOOOX_XX
1	a1	XX__X_OOOOO____X_XX
1	a1	XX__X_OOOOO___OX_XX
1	a1	XX__X_OOOOO__O_X_XX
1	a1	XX__X_OOOOO__OOX_XX
1	a1	XX__X_OOOOO_O__X_XX
1	a1	XX__X_OOOOO_O_OX_XX
1	a1	XX__X_OOOOO_OO_X_XX
1	a1	XX__X_OOOOO_OOOX_XX
1	a1	XX__X_OOOOOO___X_XX
1	a1	XX__X_OOOOOO__OX_XX
1	a1	XX__X_OOOOOO_O_X_XX
1	a1	XX__X_OOOOOO_OOX_XX
1	a1	XX__X_OOOOOOO__X_XX
1	a1	XX__X_OOOOOOO_OX_XX
1	a1	XX__X_OOOOOOOO_X_XX
1	a1	XX__X_OOOOOOOOOX_XX
1	31	XX__XO___O_____X_XX
1	31	XX__XO___O____OX_XX
1	31	XX__XO___O___O_X_XX
1	31	XX__XO___O___OOX_XX
1	41	XX__XO___O__O__X_XX
1	41	XX__XO___O__O_OX_XX
1	51	XX__XO___O__OO_X_XX
1	51	XX__XO___O__OOOX_XX
1	41	XX__XO___O_O___X_XX
1	41	XX__XO___O_O__OX_XX
1	51	XX__XO___O_O_O_X_XX
1	51	XX__XO___O_O_OOX_XX
1	61	XX__XO___O_OO__X_XX
1	61	XX__XO___O_OO_OX_XX
1	71	XX__XO___O_OOO_X_XX
1	71	XX__XO___O_OOOOX_XX
1	41	XX__XO___OO____X_XX
1	41	XX__XO___OO___OX_XX
1	51	XX__XO___OO__O_X_XX
1	51	XX__XO___OO__OOX_XX
1	61	XX__XO___OO_O__X_XX
1	61	XX__XO___OO_O_OX_XX
1	71	XX__XO___OO_OO_X_XX
1	71	XX__XO___OO_OOOX_XX
1	61	XX__XO___OOO___X_XX
1	61	XX__XO___OOO__OX_XX
1	71	XX__XO___OOO_O_X_XX
1	71	XX__XO___OOO_OOX_XX
1	81	XX__XO___OOOO__X_XX
1	81	XX__XO___OOOO_OX_XX
1	a1	XX__XO___OOOOO_X_XX
1	a1	XX__XO___OOOOOOX_XX
1	51	XX__XO__OO_____X_XX
1	51	XX__XO__OO____OX_XX
1	51	XX__XO__OO___O_X_XX
1	51	XX__XO__OO___OOX_XX
1	51	XX__XO__OO__O__X_XX
1	51	XX__XO__OO__O_OX_XX
1	51	XX__XO__OO__OO_X_XX
1	51	XX__XO__OO__OOOX_XX
1	61	XX__XO__OO_O___X_XX
1	61	XX__XO__OO_O__OX_XX
1	61	XX__XO__OO_O_O_X_XX
1	61	XX__XO__OO_O_OOX_XX
1	71	XX__XO__OO_OO__X_XX
1	71	XX__XO__OO_OO_OX_XX
1	71	XX__XO__OO_OOO_X_XX
1	71	XX__XO__OO_OOOOX_XX
1	61	XX__XO__OOO____X_XX
1	61	XX__XO__OOO___OX_XX
1	61	XX__XO__OOO__O_X_XX
1	61	XX__XO__OOO__OOX_XX
1	71	XX__XO__OOO_O__X_XX
1	71	XX__XO__OOO_O_OX_XX
1	71	XX__XO__OOO_OO_X_XX
1	71	XX__XO__OOO_OOOX_XX
1	81	XX__XO__OOOO___X_XX
1	81	XX__XO__OOOO__OX_XX
1	81	XX__XO__OOOO_O_X_XX
1	81	XX__XO__OOOO_OOX_XX
1	a1	XX__XO__OOOOO__X_XX
1	a1	XX__XO__OOOOO_OX_XX
1	a1	XX__XO__OOOOOO_X_XX
1	a1	XX__XO__OOOOOOOX_XX
1	51	XX__XO_O_O_____X_XX
1	51	XX__XO_O_O____OX_XX
1	51	XX__XO_O_O___O_X_XX
1	51	XX__XO_O_O___OOX_XX
1	51	XX__XO_O_O__O__X_XX
1	51	XX__XO_O_O__O_OX_XX
1	51	XX__XO_O_O__OO_X_XX
1	51	XX__XO_O_O__OOOX_XX
1	51	XX__XO_O_O_O___X_XX
1	51	XX__XO_O_O_O__OX_XX
1	51	XX__XO_O_O_O_O_X_XX
1	51	XX__XO_O_O_O_OOX_XX
1	61	XX__XO_O_O_OO__X_XX
1	61	XX__XO_O_O_OO_OX_XX
1	71	XX__XO_O_O_OOO_X_XX
1	71	XX__XO_O_O_OOOOX_XX
1	61	XX__XO_O_OO____X_XX
1	61	XX__XO_O_OO___OX_XX
1	61	XX__XO_O_OO__O_X_XX
1	61	XX__XO_O_OO__OOX_XX
1	61	XX__XO_O_OO_O__X_XX
1	61	XX__XO_O_OO_O_OX_XX
1	71	XX__XO_O_OO_OO_X_XX
1	71	XX__XO_O_OO_OOOX_XX
1	71	XX__XO_O_OOO___X_XX
1	71	XX__XO_O_OOO__OX_XX
1	72	XX__XO_O_OOO_O_X_XX
1	72	XX__XO_O_OOO_OOX_XX
1	81	XX__XO_O_OOOO__X_XX
1	81	XX__XO_O_OOOO_OX_XX
1	a1	XX__XO_O_OOOOO_X_XX
1	a1	XX__XO_O_OOOOOOX_XX
1	71	XX__XO_OOO_____X_XX
1	71	XX__XO_OOO____OX_XX
1	71	XX__XO_OOO___O_X_XX
1	71	XX__XO_OOO___OOX_XX
1	71	XX__XO_OOO__O__X_XX
1	71	XX__XO_OOO__O_OX_XX
1	71	XX__XO_OOO__OO_X_XX
1	71	XX__XO_OOO__OOOX_XX
1	72	XX__XO_OOO_O___X_XX
1	72	XX__XO_OOO_O__OX_XX
1	72	XX__XO_OOO_O_O_X_XX
1	72	XX__XO_OOO_O_OOX_XX
1	72	XX__XO_OOO_OO__X_XX
1	72	XX__XO_OOO_OO_OX_XX
1	72	XX__XO_OOO_OOO_X_XX
1	72	XX__XO_OOO_OOOOX_XX
1	81	XX__XO_OOOO____X_XX
1	81	XX__XO_OOOO___OX_XX
1	81	XX__XO_OOOO__O_X_XX
1	81	XX__XO_OOOO__OOX_XX
1	81	XX__XO_OOOO_O__X_XX
1	81	XX__XO_OOOO_O_OX_XX
1	81	XX__XO_OOOO_OO_X_XX
1	81	XX__XO_OOOO_OOOX_XX
1	a1	XX__XO_OOOOO___X_XX
1	a1	XX__XO_OOOOO__OX_XX
1	a1	XX__XO_OOOOO_O_X_XX
1	a1	XX__XO_OOOOO_OOX_XX
1	a1	XX__XO_OOOOOO__X_XX
1	a1	XX__XO_OOOOOO_OX_XX
1	a1	XX__XO_OOOOOOO_X_XX
1	a1	XX__XO_OOOOOOOOX_XX
1	51	XX__XOO__O_____X_XX
1	51	XX__XOO__O____OX_XX
1	51	XX__XOO__O___O_X_XX
1	51	XX__XOO__O___OOX_XX
1	51	XX__XOO__O__O__X_XX
1	51	XX__XOO__O__O_OX_XX
1	51	XX__XOO__O__OO_X_XX
1	51	XX__XOO__O__OOOX_XX
1	51	XX__XOO__O_O___X_XX
1	51	XX__XOO__O_O__OX_XX
1	51	XX__XOO__O_O_O_X_XX
1	51	XX__XOO__O_O_OOX_XX
1	61	XX__XOO__O_OO__X_XX
1	61	XX__XOO__O_OO_OX_XX
1	71	XX__XOO__O_OOO_X_XX
1	71	XX__XOO__O_OOOOX_XX
1	51	XX__XOO__OO____X_XX
1	51	XX__XOO__OO___OX_XX
1	51	XX__XOO__OO__O_X_XX
1	51	XX__XOO__OO__OOX_XX
1	61	XX__XOO__OO_O__X_XX
1	61	XX__XOO__OO_O_OX_XX
1	71	XX__XOO__OO_OO_X_XX
1	71	XX__XOO__OO_OOOX_XX
1	61	XX__XOO__OOO___X_XX
1	61	XX__XOO__OOO__OX_XX
1	71	XX__XOO__OOO_O_X_XX
1	71	XX__XOO__OOO_OOX_XX
1	81	XX__XOO__OOOO__X_XX
1	81	XX__XOO__OOOO_OX_XX
1	a1	XX__XOO__OOOOO_X_XX
1	a1	XX__XOO__OOOOOOX_XX
1	71	XX__XOO_OO_____X_XX
1	71	XX__XOO_OO____OX_XX
1	71	XX__XOO_OO___O_X_XX
1	71	XX__XOO_OO___OOX_XX
1	71	XX__XOO_OO__O__X_XX
1	71	XX__XOO_OO__O_OX_XX
1	71	XX__XOO_OO__OO_X_XX
1	71	XX__XOO_OO__OOOX_XX
1	71	XX__XOO_OO_O___X_XX
1	71	XX__XOO_OO_O__OX_XX
1	71	XX__XOO_OO_O_O_X_XX
1	71	XX__XOO_OO_O_OOX_XX
1	72	XX__XOO_OO_OO__X_XX
1	72	XX__XOO_OO_OO_OX_XX
1	72	XX__XOO_OO_OOO_X_XX
1	72	XX__XOO_OO_OOOOX_XX
1	71	XX__XOO_OOO____X_XX
1	71	XX__XOO_OOO___OX_XX
1	71	XX__XOO_OOO__O_X_XX
1	71	XX__XOO_OOO__OOX_XX
1	72	XX__XOO_OOO_O__X_XX
1	72	XX__XOO_OOO_O_OX_XX
1	72	XX__XOO_OOO_OO_X_XX
1	72	XX__XOO_OOO_OOOX_XX
1	81	XX__XOO_OOOO___X_XX
1	81	XX__XOO_OOOO__OX_XX
1	81	XX__XOO_OOOO_O_X_XX
1	81	XX__XOO_OOOO_OOX_XX
1	a1	XX__XOO_OOOOO__X_XX
1	a1	XX__XOO_OOOOO_OX_XX
1	a1	XX__XOO_OOOOOO_X_XX
1	a1	XX__XOO_OOOOOOOX_XX
1	71	XX__XOOO_O_____X_XX
1	71	XX__XOOO_O____OX_XX
1	71	XX__XOOO_O___O_X_XX
1	71	XX__XOOO_O___OOX_XX
1	71	XX__XOOO_O__O__X_XX
1	71	XX__XOOO_O__O_OX_XX
1	71	XX__XOOO_O__OO_X_XX
1	71	XX__XOOO_O__OOOX_XX
1	71	XX__XOOO_O_O___X_XX
1	71	XX__XOOO_O_O__OX_XX
1	71	XX__XOOO_O_O_O_X_XX
1	71	XX__XOOO_O_O_OOX_XX
1	71	XX__XOOO_O_OO__X_XX
1	71	XX__XOOO_O_OO_OX_XX
1	72	XX__XOOO_O_OOO_X_XX
1	72	XX__XOOO_O_OOOOX_XX
1	71	XX__XOOO_OO____X_XX
1	71	XX__XOOO_OO___OX_XX
1	71	XX__XOOO_OO__O_X_XX
1	71	XX__XOOO_OO__OOX_XX
1	71	XX__XOOO_OO_O__X_XX
1	71	XX__XOOO_OO_O_OX_XX
1	72	XX__XOOO_OO_OO_X_XX
1	72	XX__XOOO_OO_OOOX_XX
1	71	XX__XOOO_OOO___X_XX
1	71	XX__XOOO_OOO__OX_XX
1	72	XX__XOOO_OOO_O_X_XX
1	72	XX__XOOO_OOO_OOX_XX
1	81	XX__XOOO_OOOO__X_XX
1	81	XX__XOOO_OOOO_OX_XX
1	a1	XX__XOOO_OOOOO_X_XX
1	a1	XX__XOOO_OOOOOOX_XX
1	a1	XX__XOOOOO_____X_XX
1	a1	XX__XOOOOO____OX_XX
1	a1	XX__XOOOOO___O_X_XX
1	a1	XX__XOOOOO___OOX_XX
1	a1	XX__XOOOOO__O__X_XX
1	a1	XX__XOOOOO__O_OX_XX
1	a1	XX__XOOOOO__OO_X_XX
1	a1	XX__XOOOOO__OOOX_XX
1	a1	XX__XOOOOO_O___X_XX
1	a1	XX__XOOOOO_O__OX_XX
1	a1	XX__XOOOOO_O_O_X_XX
1	a1	XX__XOOOOO_O_OOX_XX
1	a1	XX__XOOOOO_OO__X_XX
1	a1	XX__XOOOOO_OO_OX_XX
1	a1	XX__XOOOOO_OOO_X_XX
1	a1	XX__XOOOOO_OOOOX_XX
1	a1	XX__XOOOOOO____X_XX
1	a1	XX__XOOOOOO___OX_XX
1	a1	XX__XOOOOOO__O_X_XX
1	a1	XX__XOOOOOO__OOX_XX
1	a1	XX__XOOOOOO_O__X_XX
1	a1	XX__XOOOOOO_O_OX_XX
1	a1	XX__XOOOOOO_OO_X_XX
1	a1	XX__XOOOOOO_OOOX_XX
1	a1	XX__XOOOOOOO___X_XX
1	a1	XX__XOOOOOOO__OX_XX
1	a1	XX__XOOOOOOO_O_X_XX
1	a1	XX__XOOOOOOO_OOX_XX
1	a1	XX__XOOOOOOOO__X_XX
1	a1	XX__XOOOOOOOO_OX_XX
1	a1	XX__XOOOOOOOOO_X_XX
1	a1	XX__XOOOOOOOOOOX_XX
1	11	XX_X_____OX______XX
1	31	XX_X____OOX______XX
1	31	XX_X___O_OX______XX
1	51	XX_X___OOOX______XX
1	31	XX_X__O__OX______XX
1	51	XX_X__O_OOX______XX
1	51	XX_X__OO_OX______XX
1	71	XX_X__OOOOX______XX
1	31	XX_X_O___OX______XX
1	51	XX_X_O__OOX______XX
1	51	XX_X_O_O_OX______XX
1	71	XX_X_O_OOOX______XX
1	51	XX_X_OO__OX______XX
1	71	XX_X_OO_OOX______XX
1	71	XX_X_OOO_OX______XX
1	a1	XX_X_OOOOOX______XX
1	11	XX_XO____OX______XX
1	31	XX_XO___OOX______XX
1	31	XX_XO__O_OX______XX
1	51	XX_XO__OOOX______XX
1	31	XX_XO_O__OX______XX
1	51	XX_XO_O_OOX______XX
1	51	XX_XO_OO_OX______XX
1	71	XX_XO_OOOOX______XX
1	31	XX_XOO___OX______XX
1	51	XX_XOO__OOX______XX
1	51	XX_XOO_O_OX______XX
1	71	XX_XOO_OOOX______XX
1	51	XX_XOOO__OX______XX
1	71	XX_XOOO_OOX______XX
1	71	XX_XOOOO_OX______XX
1	a1	XX_XOOOOOOX______XX
1	21	XX_X_____O_X_____XX
1	31	XX_X_____OOX_____XX
1	41	XX_X____OO_X_____XX
1	51	XX_X____OOOX_____XX
1	41	XX_X___O_O_X_____XX
1	51	XX_X___O_OOX_____XX
1	61	XX_X___OOO_X_____XX
1	71	XX_X___OOOOX_____XX
1	41	XX_X__O__O_X_____XX
1	51	XX_X__O__OOX_____XX
1	61	XX_X__O_OO_X_____XX
1	71	XX_X__O_OOOX_____XX
1	61	XX_X__OO_O_X_____XX
1	71	XX_X__OO_OOX_____XX
1	81	XX_X__OOOO_X_____XX
1	a1	XX_X__OOOOOX_____XX
1	31	XX_X_O___O_X_____XX
1	31	XX_X_O___OOX_____XX
1	51	XX_X_O__OO_X_____XX
1	51	XX_X_O__OOOX_____XX
1	51	XX_X_O_O_O_X_____XX
1	51	XX_X_O_O_OOX_____XX
1	71	XX_X_O_OOO_X_____XX
1	71	XX_X_O_OOOOX_____XX
1	51	XX_X_OO__O_X_____XX
1	51	XX_X_OO__OOX_____XX
1	71	XX_X_OO_OO_X_____XX
1	71	XX_X_OO_OOOX_____XX
1	71	XX_X_OOO_O_X_____XX
1	71	XX_X_OOO_OOX_____XX
1	a1	XX_X_OOOOO_X_____XX
1	a1	XX_X_OOOOOOX_____XX
1	21	XX_XO____O_X_____XX
1	31	XX_XO____OOX_____XX
1	41	XX_XO___OO_X_____XX
1	51	XX_XO___OOOX_____XX
1	41	XX_XO__O_O_X_____XX
1	51	XX_XO__O_OOX_____XX
1	61	XX_XO__OOO_X_____XX
1	71	XX_XO__OOOOX_____XX
1	41	XX_XO_O__O_X_____XX
1	51	XX_XO_O__OOX_____XX
1	61	XX_XO_O_OO_X_____XX
1	71	XX_XO_O_OOOX_____XX
1	61	XX_XO_OO_O_X_____XX
1	71	XX_XO_OO_OOX_____XX
1	81	XX_XO_OOOO_X_____XX
1	a1	XX_XO_OOOOOX_____XX
1	31	XX_XOO___O_X_____XX
1	31	XX_XOO___OOX_____XX
1	51	XX_XOO__OO_X_____XX
1	51	XX_XOO__OOOX_____XX
1	51	XX_XOO_O_O_X_____XX
1	51	XX_XOO_O_OOX_____XX
1	71	XX_XOO_OOO_X_____XX
1	71	XX_XOO_OOOOX_____XX
1	51	XX_XOOO__O_X_____XX
1	51	XX_XOOO__OOX_____XX
1	71	XX_XOOO_OO_X_____XX
1	71	XX_XOOO_OOOX_____XX
1	71	XX_XOOOO_O_X_____XX
1	71	XX_XOOOO_OOX_____XX
1	a1	XX_XOOOOOO_X_____XX
1	a1	XX_XOOOOOOOX_____XX
1	21	XX_X_____O__X____XX
1	31	XX_X_____O_OX____XX
1	41	XX_X_____OO_X____XX
1	51	XX_X_____OOOX____XX
1	41	XX_X____OO__X____XX
1	51	XX_X____OO_OX____XX
1	61	XX_X____OOO_X____XX
1	71	XX_X____OOOOX____XX
1	41	XX_X___O_O__X____XX
1	51	XX_X___O_O_OX____XX
1	61	XX_X___O_OO_X____XX
1	71	XX_X___O_OOOX____XX
1	61	XX_X___OOO__X____XX
1	71	XX_X___OOO_OX____XX
1	81	XX_X___OOOO_X____XX
1	a1	XX_X___OOOOOX____XX
1	41	XX_X__O__O__X____XX
1	41	XX_X__O__O_OX____XX
1	51	XX_X__O__OO_X____XX
1	51	XX_X__O__OOOX____XX
1	61	XX_X__O_OO__X____XX
1	61	XX_X__O_OO_OX____XX
1	71	XX_X__O_OOO_X____XX
1	71	XX_X__O_OOOOX____XX
1	61	XX_X__OO_O__X____XX
1	61	XX_X__OO_O_OX____XX
1	71	XX_X__OO_OO_X____XX
1	71	XX_X__OO_OOOX____XX
1	81	XX_X__OOOO__X____XX
1	81	XX_X__OOOO_OX____XX
1	a1	XX_X__OOOOO_X____XX
1	a1	XX_X__OOOOOOX____XX
1	31	XX_X_O___O__X____XX
1	31	XX_X_O___O_OX____XX
1	41	XX_X_O___OO_X____XX
1	51	XX_X_O___OOOX____XX
1	51	XX_X_O__OO__X____XX
1	51	XX_X_O__OO_OX____XX
1	61	XX_X_O__OOO_X____XX
1	71	XX_X_O__OOOOX____XX
1	51	XX_X_O_O_O__X____XX
1	51	XX_X_O_O_O_OX____XX
1	61	XX_X_O_O_OO_X____XX
1	71	XX_X_O_O_OOOX____XX
1	71	XX_X_O_OOO__X____XX
1	72	XX_X_O_OOO_OX____XX
1	81	XX_X_O_OOOO_X____XX
1	a1	XX_X_O_OOOOOX____XX
1	51	XX_X_OO__O__X____XX
1	51	XX_X_OO__O_OX____XX
1	51	XX_X_OO__OO_X____XX
1	51	XX_X_OO__OOOX____XX
1	71	XX_X_OO_OO__X____XX
1	71	XX_X_OO_OO_OX____XX
1	71	XX_X_OO_OOO_X____XX
1	71	XX_X_OO_OOOOX____XX
1	71	XX_X_OOO_O__X____XX
1	71	XX_X_OOO_O_OX____XX
1	71	XX_X_OOO_OO_X____XX
1	71	XX_X_OOO_OOOX____XX
1	a1	XX_X_OOOOO__X____XX
1	a1	XX_X_OOOOO_OX____XX
1	a1	XX_X_OOOOOO_X____XX
1	a1	XX_X_OOOOOOOX____XX
1	21	XX_XO____O__X____XX
1	31	XX_XO____O_OX____XX
1	41	XX_XO____OO_X____XX
1	51	XX_XO____OOOX____XX
1	41	XX_XO___OO__X____XX
1	51	XX_XO___OO_OX____XX
1	61	XX_XO___OOO_X____XX
1	71	XX_XO___OOOOX____XX
1	41	XX_XO__O_O__X____XX
1	51	XX_XO__O_O_OX____XX
1	61	XX_XO__O_OO_X____XX
1	71	XX_XO__O_OOOX____XX
1	61	XX_XO__OOO__X____XX
1	71	XX_XO__OOO_OX____XX
1	81	XX_XO__OOOO_X____XX
1	a1	XX_XO__OOOOOX____XX
1	41	XX_XO_O__O__X____XX
1	41	XX_XO_O__O_OX____XX
1	51	XX_XO_O__OO_X____XX
1	51	XX_XO_O__OOOX____XX
1	61	XX_XO_O_OO__X____XX
1	61	XX_XO_O_OO_OX____XX
1	71	XX_XO_O_OOO_X____XX
1	71	XX_XO_O_OOOOX____XX
1	61	XX_XO_OO_O__X____XX
1	61	XX_XO_OO_O_OX____XX
1	71	XX_XO_OO_OO_X____XX
1	71	XX_XO_OO_OOOX____XX
1	81	XX_XO_OOOO__X____XX
1	81	XX_XO_OOOO_OX____XX
1	a1	XX_XO_OOOOO_X____XX
1	a1	XX_XO_OOOOOOX____XX
1	31	XX_XOO___O__X____XX
1	31	XX_XOO___O_OX____XX
1	41	XX_XOO___OO_X____XX
1	51	XX_XOO___OOOX____XX
1	51	XX_XOO__OO__X____XX
1	51	XX_XOO__OO_OX____XX
1	61	XX_XOO__OOO_X____XX
1	71	XX_XOO__OOOOX____XX
1	51	XX_XOO_O_O__X____XX
1	51	XX_XOO_O_O_OX____XX
1	61	XX_XOO_O_OO_X____XX
1	71	XX_XOO_O_OOOX____XX
1	71	XX_XOO_OOO__X____XX
1	72	XX_XOO_OOO_OX____XX
1	81	XX_XOO_OOOO_X____XX
1	a1	XX_XOO_OOOOOX____XX
1	51	XX_XOOO__O__X____XX
1	51	XX_XOOO__O_OX____XX
1	51	XX_XOOO__OO_X____XX
1	51	XX_XOOO__OOOX____XX
1	71	XX_XOOO_OO__X____XX
1	71	XX_XOOO_OO_OX____XX
1	71	XX_XOOO_OOO_X____XX
1	71	XX_XOOO_OOOOX____XX
1	71	XX_XOOOO_O__X____XX
1	71	XX_XOOOO_O_OX____XX
1	71	XX_XOOOO_OO_X____XX
1	71	XX_XOOOO_OOOX____XX
1	a1	XX_XOOOOOO__X____XX
1	a1	XX_XOOOOOO_OX____XX
1	a1	XX_XOOOOOOO_X____XX
1	a1	XX_XOOOOOOOOX____XX
1	21	XX_X_____O___X___XX
1	31	XX_X_____O__OX___XX
1	41	XX_X_____O_O_X___XX
1	51	XX_X_____O_OOX___XX
1	41	XX_X_____OO__X___XX
1	51	XX_X_____OO_OX___XX
1	61	XX_X_____OOO_X___XX
1	71	XX_X_____OOOOX___XX
1	41	XX_X____OO___X___XX
1	51	XX_X____OO__OX___XX
1	61	XX_X____OO_O_X___XX
1	71	XX_X____OO_OOX___XX
1	61	XX_X____OOO__X___XX
1	71	XX_X____OOO_OX___XX
1	81	XX_X____OOOO_X___XX
1	a1	XX_X____OOOOOX___XX
1	41	XX_X___O_O___X___XX
1	41	XX_X___O_O__OX___XX
1	51	XX_X___O_O_O_X___XX
1	51	XX_X___O_O_OOX___XX
1	61	XX_X___O_OO__X___XX
1	61	XX_X___O_OO_OX___XX
1	71	XX_X___O_OOO_X___XX
1	71	XX_X___O_OOOOX___XX
1	61	XX_X___OOO___X___XX
1	61	XX_X___OOO__OX___XX
1	71	XX_X___OOO_O_X___XX
1	71	XX_X___OOO_OOX___XX
1	81	XX_X___OOOO__X___XX
1	81	XX_X___OOOO_OX___XX
1	a1	XX_X___OOOOO_X___XX
1	a1	XX_X___OOOOOOX___XX
1	41	XX_X__O__O___X___XX
1	41	XX_X__O__O__OX___XX
1	41	XX_X__O__O_O_X___XX
1	51	XX_X__O__O_OOX___XX
1	51	XX_X__O__OO__X___XX
1	51	XX_X__O__OO_OX___XX
1	61	XX_X__O__OOO_X___XX
1	71	XX_X__O__OOOOX___XX
1	61	XX_X__O_OO___X___XX
1	61	XX_X__O_OO__OX___XX
1	61	XX_X__O_OO_O_X___XX
1	71	XX_X__O_OO_OOX___XX
1	71	XX_X__O_OOO__X___XX
1	72	XX_X__O_OOO_OX___XX
1	81	XX_X__O_OOOO_X___XX
1	a1	XX_X__O_OOOOOX___XX
1	61	XX_X__OO_O___X___XX
1	61	XX_X__OO_O__OX___XX
1	61	XX_X__OO_O_O_X___XX
1	61	XX_X__OO_O_OOX___XX
1	71	XX_X__OO_OO__X___XX
1	71	XX_X__OO_OO_OX___XX
1	71	XX_X__OO_OOO_X___XX
1	71	XX_X__OO_OOOOX___XX
1	81	XX_X__OOOO___X___XX
1	81	XX_X__OOOO__OX___XX
1	81	XX_X__OOOO_O_X___XX
1	81	XX_X__OOOO_OOX___XX
1	a1	XX_X__OOOOO__X___XX
1	a1	XX_X__OOOOO_OX___XX
1	a1	XX_X__OOOOOO_X___XX
1	a1	XX_X__OOOOOOOX___XX
1	31	XX_X_O___O___X___XX
1	31	XX_X_O___O__OX___XX
1	41	XX_X_O___O_O_X___XX
1	51	XX_X_O___O_OOX___XX
1	41	XX_X_O___OO__X___XX
1	51	XX_X_O___OO_OX___XX
1	61	XX_X_O___OOO_X___XX
1	71	XX_X_O___OOOOX___XX
1	51	XX_X_O__OO___X___XX
1	51	XX_X_O__OO__OX___XX
1	61	XX_X_O__OO_O_X___XX
1	71	XX_X_O__OO_OOX___XX
1	61	XX_X_O__OOO__X___XX
1	71	XX_X_O__OOO_OX___XX
1	81	XX_X_O__OOOO_X___XX
1	a1	XX_X_O__OOOOOX___XX
1	51	XX_X_O_O_O___X___XX
1	51	XX_X_O_O_O__OX___XX
1	51	XX_X_O_O_O_O_X___XX
1	51	XX_X_O_O_O_OOX___XX
1	61	XX_X_O_O_OO__X___XX
1	61	XX_X_O_O_OO_OX___XX
1	71	XX_X_O_O_OOO_X___XX
1	71	XX_X_O_O_OOOOX___XX
1	71	XX_X_O_OOO___X___XX
1	71	XX_X_O_OOO__OX___XX
1	72	XX_X_O_OOO_O_X___XX
1	72	XX_X_O_OOO_OOX___XX
1	81	XX_X_O_OOOO__X___XX
1	81	XX_X_O_OOOO_OX___XX
1	a1	XX_X_O_OOOOO_X___XX
1	a1	XX_X_O_OOOOOOX___XX
1	51	XX_X_OO__O___X___XX
1	51	XX_X_OO__O__OX___XX
1	51	XX_X_OO__O_O_X___XX
1	51	XX_X_OO__O_OOX___XX
1	51	XX_X_OO__OO__X___XX
1	51	XX_X_OO__OO_OX___XX
1	61	XX_X_OO__OOO_X___XX
1	71	XX_X_OO__OOOOX___XX
1	71	XX_X_OO_OO___X___XX
1	71	XX_X_OO_OO__OX___XX
1	71	XX_X_OO_OO_O_X___XX
1	72	XX_X_OO_OO_OOX___XX
1	71	XX_X_OO_OOO__X___XX
1	72	XX_X_OO_OOO_OX___XX
1	81	XX_X_OO_OOOO_X___XX
1	a1	XX_X_OO_OOOOOX___XX
1	71	XX_X_OOO_O___X___XX
1	71	XX_X_OOO_O__OX___XX
1	71	XX_X_OOO_O_O_X___XX
1	71	XX_X_OOO_O_OOX___XX
1	71	XX_X_OOO_OO__X___XX
1	71	XX_X_OOO_OO_OX___XX
1	71	XX_X_OOO_OOO_X___XX
1	71	XX_X_OOO_OOOOX___XX
1	a1	XX_X_OOOOO___X___XX
1	a1	XX_X_OOOOO__OX___XX
1	a1	XX_X_OOOOO_O_X___XX
1	a1	XX_X_OOOOO_OOX___XX
1	a1	XX_X_OOOOOO__X___XX
1	a1	XX_X_OOOOOO_OX___XX
1	a1	XX_X_OOOOOOO_X___XX
1	a1	XX_X_OOOOOOOOX___XX
1	21	XX_XO____O___X___XX
1	31	XX_XO____O__OX___XX
1	41	XX_XO____O_O_X___XX
1	51	XX_XO____O_OOX___XX
1	41	XX_XO____OO__X___XX
1	51	XX_XO____OO_OX___XX
1	61	XX_XO____OOO_X___XX
1	71	XX_XO____OOOOX___XX
1	41	XX_XO___OO___X___XX
1	51	XX_XO___OO__OX___XX
1	61	XX_XO___OO_O_X___XX
1	71	XX_XO___OO_OOX___XX
1	61	XX_XO___OOO__X___XX
1	71	XX_XO___OOO_OX___XX
1	81	XX_XO___OOOO_X___XX
1	a1	XX_XO___OOOOOX___XX
1	41	XX_XO__O_O___X___XX
1	41	XX_XO__O_O__OX___XX
1	51	XX_XO__O_O_O_X___XX
1	51	XX_XO__O_O_OOX___XX
1	61	XX_XO__O_OO__X___XX
1	61	XX_XO__O_OO_OX___XX
1	71	XX_XO__O_OOO_X___XX
1	71	XX_XO__O_OOOOX___XX
1	61	XX_XO__OOO___X___XX
1	61	XX_XO__OOO__OX___XX
1	71	XX_XO__OOO_O_X___XX
1	71	XX_XO__OOO_OOX___XX
1	81	XX_XO__OOOO__X___XX
1	81	XX_XO__OOOO_OX___XX
1	a1	XX_XO__OOOOO_X___XX
1	a1	XX_XO__OOOOOOX___XX
1	41	XX_XO_O__O___X___XX
1	41	XX_XO_O__O__OX___XX
1	41	XX_XO_O__O_O_X___XX
1	51	XX_XO_O__O_OOX___XX
1	51	XX_XO_O__OO__X___XX
1	51	XX_XO_O__OO_OX___XX
1	61	XX_XO_O__OOO_X___XX
1	71	XX_XO_O__OOOOX___XX
1	61	XX_XO_O_OO___X___XX
1	61	XX_XO_O_OO__OX___XX
1	61	XX_XO_O_OO_O_X___XX
1	71	XX_XO_O_OO_OOX___XX
1	71	XX_XO_O_OOO__X___XX
1	72	XX_XO_O_OOO_OX___XX
1	81	XX_XO_O_OOOO_X___XX
1	a1	XX_XO_O_OOOOOX___XX
1	61	XX_XO_OO_O___X___XX
1	61	XX_XO_OO_O__OX___XX
1	61	XX_XO_OO_O_O_X___XX
1	61	XX_XO_OO_O_OOX___XX
1	71	XX_XO_OO_OO__X___XX
1	71	XX_XO_OO_OO_OX___XX
1	71	XX_XO_OO_OOO_X___XX
1	71	XX_XO_OO_OOOOX___XX
1	81	XX_XO_OOOO___X___XX
1	81	XX_XO_OOOO__OX___XX
1	81	XX_XO_OOOO_O_X___XX
1	81	XX_XO_OOOO_OOX___XX
1	a1	XX_XO_OOOOO__X___XX
1	a1	XX_XO_OOOOO_OX___XX
1	a1	XX_XO_OOOOOO_X___XX
1	a1	XX_XO_OOOOOOOX___XX
1	31	XX_XOO___O___X___XX
1	31	XX_XOO___O__OX___XX
1	41	XX_XOO___O_O_X___XX
1	51	XX_XOO___O_OOX___XX
1	41	XX_XOO___OO__X___XX
1	51	XX_XOO___OO_OX___XX
1	61	XX_XOO___OOO_X___XX
1	71	XX_XOO___OOOOX___XX
1	51	XX_XOO__OO___X___XX
1	51	XX_XOO__OO__OX___XX
1	61	XX_XOO__OO_O_X___XX
1	71	XX_XOO__OO_OOX___XX
1	61	XX_XOO__OOO__X___XX
1	71	XX_XOO__OOO_OX___XX
1	81	XX_XOO__OOOO_X___XX
1	a1	XX_XOO__OOOOOX___XX
1	51	XX_XOO_O_O___X___XX
1	51	XX_XOO_O_O__OX___XX
1	51	XX_XOO_O_O_O_X___XX
1	51	XX_XOO_O_O_OOX___XX
1	61	XX_XOO_O_OO__X___XX
1	61	XX_XOO_O_OO_OX___XX
1	71	XX_XOO_O_OOO_X___XX
1	71	XX_XOO_O_OOOOX___XX
1	71	XX_XOO_OOO___X___XX
1	71	XX_XOO_OOO__OX___XX
1	72	XX_XOO_OOO_O_X___XX
1	72	XX_XOO_OOO_OOX___XX
1	81	XX_XOO_OOOO__X___XX
1	81	XX_XOO_OOOO_OX___XX
1	a1	XX_XOO_OOOOO_X___XX
1	a1	XX_XOO_OOOOOOX___XX
1	51	XX_XOOO__O___X___XX
1	51	XX_XOOO__O__OX___XX
1	51	XX_XOOO__O_O_X___XX
1	51	XX_XOOO__O_OOX___XX
1	51	XX_XOOO__OO__X___XX
1	51	XX_XOOO__OO_OX___XX
1	61	XX_XOOO__OOO_X___XX
1	71	XX_XOOO__OOOOX___XX
1	71	XX_XOOO_OO___X___XX
1	71	XX_XOOO_OO__OX___XX
1	71	XX_XOOO_OO_O_X___XX
1	72	XX_XOOO_OO_OOX___XX
1	71	XX_XOOO_OOO__X___XX
1	72	XX_XOOO_OOO_OX___XX
1	81	XX_XOOO_OOOO_X___XX
1	a1	XX_XOOO_OOOOOX___XX
1	71	XX_XOOOO_O___X___XX
1	71	XX_XOOOO_O__OX___XX
1	71	XX_XOOOO_O_O_X___XX
1	71	XX_XOOOO_O_OOX___XX
1	71	XX_XOOOO_OO__X___XX
1	71	XX_XOOOO_OO_OX___XX
1	71	XX_XOOOO_OOO_X___XX
1	71	XX_XOOOO_OOOOX___XX
1	a1	XX_XOOOOOO___X___XX
1	a1	XX_XOOOOOO__OX___XX
1	a1	XX_XOOOOOO_O_X___XX
1	a1	XX_XOOOOOO_OOX___XX
1	a1	XX_XOOOOOOO__X___XX
1	a1	XX_XOOOOOOO_OX___XX
1	a1	XX_XOOOOOOOO_X___XX
1	a1	XX_XOOOOOOOOOX___XX
1	21	XX_X_____O____X__XX
1	31	XX_X_____O___OX__XX
1	41	XX_X_____O__O_X__XX
1	51	XX_X_____O__OOX__XX
1	41	XX_X_____O_O__X__XX
1	51	XX_X_____O_O_OX__XX
1	61	XX_X_____O_OO_X__XX
1	71	XX_X_____O_OOOX__XX
1	41	XX_X_____OO___X__XX
1	51	XX_X_____OO__OX__XX
1	61	XX_X_____OO_O_X__XX
1	71	XX_X_____OO_OOX__XX
1	61	XX_X_____OOO__X__XX
1	71	XX_X_____OOO_OX__XX
1	81	XX_X_____OOOO_X__XX
1	a1	XX_X_____OOOOOX__XX
1	41	XX_X____OO____X__XX
1	41	XX_X____OO___OX__XX
1	51	XX_X____OO__O_X__XX
1	51	XX_X____OO__OOX__XX
1	61	XX_X____OO_O__X__XX
1	61	XX_X____OO_O_OX__XX
1	71	XX_X____OO_OO_X__XX
1	71	XX_X____OO_OOOX__XX
1	61	XX_X____OOO___X__XX
1	61	XX_X____OOO__OX__XX
1	71	XX_X____OOO_O_X__XX
1	71	XX_X____OOO_OOX__XX
1	81	XX_X____OOOO__X__XX
1	81	XX_X____OOOO_OX__XX
1	a1	XX_X____OOOOO_X__XX
1	a1	XX_X____OOOOOOX__XX
1	41	XX_X___O_O____X__XX
1	41	XX_X___O_O___OX__XX
1	41	XX_X___O_O__O_X__XX
1	51	XX_X___O_O__OOX__XX
1	51	XX_X___O_O_O__X__XX
1	51	XX_X___O_O_O_OX__XX
1	61	XX_X___O_O_OO_X__XX
1	71	XX_X___O_O_OOOX__XX
1	61	XX_X___O_OO___X__XX
1	61	XX_X___O_OO__OX__XX
1	61	XX_X___O_OO_O_X__XX
1	71	XX_X___O_OO_OOX__XX
1	71	XX_X___O_OOO__X__XX
1	72	XX_X___O_OOO_OX__XX
1	81	XX_X___O_OOOO_X__XX
1	a1	XX_X___O_OOOOOX__XX
1	61	XX_X___OOO____X__XX
1	61	XX_X___OOO___OX__XX
1	61	XX_X___OOO__O_X__XX
1	61	XX_X___OOO__OOX__XX
1	71	XX_X___OOO_O__X__XX
1	71	XX_X___OOO_O_OX__XX
1	71	XX_X___OOO_OO_X__XX
1	71	XX_X___OOO_OOOX__XX
1	81	XX_X___OOOO___X__XX
1	81	XX_X___OOOO__OX__XX
1	81	XX_X___OOOO_O_X__XX
1	81	XX_X___OOOO_OOX__XX
1	a1	XX_X___OOOOO__X__XX
1	a1	XX_X___OOOOO_OX__XX
1	a1	XX_X___OOOOOO_X__XX
1	a1	XX_X___OOOOOOOX__XX
1	41	XX_X__O__O____X__XX
1	41	XX_X__O__O___OX__XX
1	41	XX_X__O__O__O_X__XX
1	51	XX_X__O__O__OOX__XX
1	41	XX_X__O__O_O__X__XX
1	51	XX_X__O__O_O_OX__XX
1	61	XX_X__O__O_OO_X__XX
1	71	XX_X__O__O_OOOX__XX
1	51	XX_X__O__OO___X__XX
1	51	XX_X__O__OO__OX__XX
1	61	XX_X__O__OO_O_X__XX
1	71	XX_X__O__OO_OOX__XX
1	61	XX_X__O__OOO__X__XX
1	71	XX_X__O__OOO_OX__XX
1	81	XX_X__O__OOOO_X__XX
1	a1	XX_X__O__OOOOOX__XX
1	61	XX_X__O_OO____X__XX
1	61	XX_X__O_OO___OX__XX
1	61	XX_X__O_OO__O_X__XX
1	61	XX_X__O_OO__OOX__XX
1	61	XX_X__O_OO_O__X__XX
1	61	XX_X__O_OO_O_OX__XX
1	71	XX_X__O_OO_OO_X__XX
1	71	XX_X__O_OO_OOOX__XX
1	71	XX_X__O_OOO___X__XX
1	71	XX_X__O_OOO__OX__XX
1	72	XX_X__O_OOO_O_X__XX
1	72	XX_X__O_OOO_OOX__XX
1	81	XX_X__O_OOOO__X__XX
1	81	XX_X__O_OOOO_OX__XX
1	a1	XX_X__O_OOOOO_X__XX
1	a1	XX_X__O_OOOOOOX__XX
1	61	XX_X__OO_O____X__XX
1	61	XX_X__OO_O___OX__XX
1	61	XX_X__OO_O__O_X__XX
1	61	XX_X__OO_O__OOX__XX
1	61	XX_X__OO_O_O__X__XX
1	61	XX_X__OO_O_O_OX__XX
1	61	XX_X__OO_O_OO_X__XX
1	71	XX_X__OO_O_OOOX__XX
1	71	XX_X__OO_OO___X__XX
1	71	XX_X__OO_OO__OX__XX
1	71	XX_X__OO_OO_O_X__XX
1	72	XX_X__OO_OO_OOX__XX
1	71	XX_X__OO_OOO__X__XX
1	72	XX_X__OO_OOO_OX__XX
1	81	XX_X__OO_OOOO_X__XX
1	a1	XX_X__OO_OOOOOX__XX
1	81	XX_X__OOOO____X__XX
1	81	XX_X__OOOO___OX__XX
1	81	XX_X__OOOO__O_X__XX
1	81	XX_X__OOOO__OOX__XX
1	81	XX_X__OOOO_O__X__XX
1	81	XX_X__OOOO_O_OX__XX
1	81	XX_X__OOOO_OO_X__XX
1	81	XX_X__OOOO_OOOX__XX
1	a1	XX_X__OOOOO___X__XX
1	a1	XX_X__OOOOO__OX__XX
1	a1	XX_X__OOOOO_O_X__XX
1	a1	XX_X__OOOOO_OOX__XX
1	a1	XX_X__OOOOOO__X__XX
1	a1	XX_X__OOOOOO_OX__XX
1	a1	XX_X__OOOOOOO_X__XX
1	a1	XX_X__OOOOOOOOX__XX
1	31	XX_X_O___O____X__XX
1	31	XX_X_O___O___OX__XX
1	41	XX_X_O___O__O_X__XX
1	51	XX_X_O___O__OOX__XX
1	41	XX_X_O___O_O__X__XX
1	51	XX_X_O___O_O_OX__XX
1	61	XX_X_O___O_OO_X__XX
1	71	XX_X_O___O_OOOX__XX
1	41	XX_X_O___OO___X__XX
1	51	XX_X_O___OO__OX__XX
1	61	XX_X_O___OO_O_X__XX
1	71	XX_X_O___OO_OOX__XX
1	61	XX_X_O___OOO__X__XX
1	71	XX_X_O___OOO_OX__XX
1	81	XX_X_O___OOOO_X__XX
1	a1	XX_X_O___OOOOOX__XX
1	51	XX_X_O__OO____X__XX
1	51	XX_X_O__OO___OX__XX
1	51	XX_X_O__OO__O_X__XX
1	51	XX_X_O__OO__OOX__XX
1	61	XX_X_O__OO_O__X__XX
1	61	XX_X_O__OO_O_OX__XX
1	71	XX_X_O__OO_OO_X__XX
1	71	XX_X_O__OO_OOOX__XX
1	61	XX_X_O__OOO___X__XX
1	61	XX_X_O__OOO__OX__XX
1	71	XX_X_O__OOO_O_X__XX
1	71	XX_X_O__OOO_OOX__XX
1	81	XX_X_O__OOOO__X__XX
1	81	XX_X_O__OOOO_OX__XX
1	a1	XX_X_O__OOOOO_X__XX
1	a1	XX_X_O__OOOOOOX__XX
1	51	XX_X_O_O_O____X__XX
1	51	XX_X_O_O_O___OX__XX
1	51	XX_X_O_O_O__O_X__XX
1	51	XX_X_O_O_O__OOX__XX
1	51	XX_X_O_O_O_O__X__XX
1	51	XX_X_O_O_O_O_OX__XX
1	61	XX_X_O_O_O_OO_X__XX
1	71	XX_X_O_O_O_OOOX__XX
1	61	XX_X_O_O_OO___X__XX
1	61	XX_X_O_O_OO__OX__XX
1	61	XX_X_O_O_OO_O_X__XX
1	71	XX_X_O_O_OO_OOX__XX
1	71	XX_X_O_O_OOO__X__XX
1	72	XX_X_O_O_OOO_OX__XX
1	81	XX_X_O_O_OOOO_X__XX
1	a1	XX_X_O_O_OOOOOX__XX
1	71	XX_X_O_OOO____X__XX
1	71	XX_X_O_OOO___OX__XX
1	71	XX_X_O_OOO__O_X__XX
1	71	XX_X_O_OOO__OOX__XX
1	72	XX_X_O_OOO_O__X__XX
1	72	XX_X_O_OOO_O_OX__XX
1	72	XX_X_O_OOO_OO_X__XX
1	72	XX_X_O_OOO_OOOX__XX
1	81	XX_X_O_OOOO___X__XX
1	81	XX_X_O_OOOO__OX__XX
1	81	XX_X_O_OOOO_O_X__XX
1	81	XX_X_O_OOOO_OOX__XX
1	a1	XX_X_O_OOOOO__X__XX
1	a1	XX_X_O_OOOOO_OX__XX
1	a1	XX_X_O_OOOOOO_X__XX
1	a1	XX_X_O_OOOOOOOX__XX
1	51	XX_X_OO__O____X__XX
1	51	XX_X_OO__O___OX__XX
1	51	XX_X_OO__O__O_X__XX
1	51	XX_X_OO__O__OOX__XX
1	51	XX_X_OO__O_O__X__XX
1	51	XX_X_OO__O_O_OX__XX
1	61	XX_X_OO__O_OO_X__XX
1	71	XX_X_OO__O_OOOX__XX
1	51	XX_X_OO__OO___X__XX
1	51	XX_X_OO__OO__OX__XX
1	61	XX_X_OO__OO_O_X__XX
1	71	XX_X_OO__OO_OOX__XX
1	61	XX_X_OO__OOO__X__XX
1	71	XX_X_OO__OOO_OX__XX
1	81	XX_X_OO__OOOO_X__XX
1	a1	XX_X_OO__OOOOOX__XX
1	71	XX_X_OO_OO____X__XX
1	71	XX_X_OO_OO___OX__XX
1	71	XX_X_OO_OO__O_X__XX
1	71	XX_X_OO_OO__OOX__XX
1	71	XX_X_OO_OO_O__X__XX
1	71	XX_X_OO_OO_O_OX__XX
1	72	XX_X_OO_OO_OO_X__XX
1	72	XX_X_OO_OO_OOOX__XX
1	71	XX_X_OO_OOO___X__XX
1	71	XX_X_OO_OOO__OX__XX
1	72	XX_X_OO_OOO_O_X__XX
1	72	XX_X_OO_OOO_OOX__XX
1	81	XX_X_OO_OOOO__X__XX
1	81	XX_X_OO_OOOO_OX__XX
1	a1	XX_X_OO_OOOOO_X__XX
1	a1	XX_X_OO_OOOOOOX__XX
1	71	XX_X_OOO_O____X__XX
1	71	XX_X_OOO_O___OX__XX
1	71	XX_X_OOO_O__O_X__XX
1	71	XX_X_OOO_O__OOX__XX
1	71	XX_X_OOO_O_O__X__XX
1	71	XX_X_OOO_O_O_OX__XX
1	71	XX_X_OOO_O_OO_X__XX
1	72	XX_X_OOO_O_OOOX__XX
1	71	XX_X_OOO_OO___X__XX
1	71	XX_X_OOO_OO__OX__XX
1	71	XX_X_OOO_OO_O_X__XX
1	72	XX_X_OOO_OO_OOX__XX
1	71	XX_X_OOO_OOO__X__XX
1	72	XX_X_OOO_OOO_OX__XX
1	81	XX_X_OOO_OOOO_X__XX
1	a1	XX_X_OOO_OOOOOX__XX
1	a1	XX_X_OOOOO____X__XX
1	a1	XX_X_OOOOO___OX__XX
1	a1	XX_X_OOOOO__O_X__XX
1	a1	XX_X_OOOOO__OOX__XX
1	a1	XX_X_OOOOO_O__X__XX
1	a1	XX_X_OOOOO_O_OX__XX
1	a1	XX_X_OOOOO_OO_X__XX
1	a1	XX_X_OOOOO_OOOX__XX
1	a1	XX_X_OOOOOO___X__XX
1	a1	XX_X_OOOOOO__OX__XX
1	a1	XX_X_OOOOOO_O_X__XX
1	a1	XX_X_OOOOOO_OOX__XX
1	a1	XX_X_OOOOOOO__X__XX
1	a1	XX_X_OOOOOOO_OX__XX
1	a1	XX_X_OOOOOOOO_X__XX
1	a1	XX_X_OOOOOOOOOX__XX
1	21	XX_XO____O____X__XX
1	31	XX_XO____O___OX__XX
1	41	XX_XO____O__O_X__XX
1	51	XX_XO____O__OOX__XX
1	41	XX_XO____O_O__X__XX
1	51	XX_XO____O_O_OX__XX
1	61	XX_XO____O_OO_X__XX
1	71	XX_XO____O_OOOX__XX
1	41	XX_XO____OO___X__XX
1	51	XX_XO____OO__OX__XX
1	61	XX_XO____OO_O_X__XX
1	71	XX_XO____OO_OOX__XX
1	61	XX_XO____OOO__X__XX
1	71	XX_XO____OOO_OX__XX
1	81	XX_XO____OOOO_X__XX
1	a1	XX_XO____OOOOOX__XX
1	41	XX_XO___OO____X__XX
1	41	XX_XO___OO___OX__XX
1	51	XX_XO___OO__O_X__XX
1	51	XX_XO___OO__OOX__XX
1	61	XX_XO___OO_O__X__XX
1	61	XX_XO___OO_O_OX__XX
1	71	XX_XO___OO_OO_X__XX
1	71	XX_XO___OO_OOOX__XX
1	61	XX_XO___OOO___X__XX
1	61	XX_XO___OOO__OX__XX
1	71	XX_XO___OOO_O_X__XX
1	71	XX_XO___OOO_OOX__XX
1	81	XX_XO___OOOO__X__XX
1	81	XX_XO___OOOO_OX__XX
1	a1	XX_XO___OOOOO_X__XX
1	a1	XX_XO___OOOOOOX__XX
1	41	XX_XO__O_O____X__XX
1	41	XX_XO__O_O___OX__XX
1	41	XX_XO__O_O__O_X__XX
1	51	XX_XO__O_O__OOX__XX
1	51	XX_XO__O_O_O__X__XX
1	51	XX_XO__O_O_O_OX__XX
1	61	XX_XO__O_O_OO_X__XX
1	71	XX_XO__O_O_OOOX__XX
1	61	XX_XO__O_OO___X__XX
1	61	XX_XO__O_OO__OX__XX
1	61	XX_XO__O_OO_O_X__XX
1	71	XX_XO__O_OO_OOX__XX
1	71	XX_XO__O_OOO__X__XX
1	72	XX_XO__O_OOO_OX__XX
1	81	XX_XO__O_OOOO_X__XX
1	a1	XX_XO__O_OOOOOX__XX
1	61	XX_XO__OOO____X__XX
1	61	XX_XO__OOO___OX__XX
1	61	XX_XO__OOO__O_X__XX
1	61	XX_XO__OOO__OOX__XX
1	71	XX_XO__OOO_O__X__XX
1	71	XX_XO__OOO_O_OX__XX
1	71	XX_XO__OOO_OO_X__XX
1	71	XX_XO__OOO_OOOX__XX
1	81	XX_XO__OOOO___X__XX
1	81	XX_XO__OOOO__OX__XX
1	81	XX_XO__OOOO_O_X__XX
1	81	XX_XO__OOOO_OOX__XX
1	a1	XX_XO__OOOOO__X__XX
1	a1	XX_XO__OOOOO_OX__XX
1	a1	XX_XO__OOOOOO_X__XX
1	a1	XX_XO__OOOOOOOX__XX
1	41	XX_XO_O__O____X__XX
1	41	XX_XO_O__O___OX__XX
1	41	XX_XO_O__O__O_X__XX
1	51	XX_XO_O__O__OOX__XX
1	41	XX_XO_O__O_O__X__XX
1	51	XX_XO_O__O_O_OX__XX
1	61	XX_XO_O__O_OO_X__XX
1	71	XX_XO_O__O_OOOX__XX
1	51	XX_XO_O__OO___X__XX
1	51	XX_XO_O__OO__OX__XX
1	61	XX_XO_O__OO_O_X__XX
1	71	XX_XO_O__OO_OOX__XX
1	61	XX_XO_O__OOO__X__XX
1	71	XX_XO_O__OOO_OX__XX
1	81	XX_XO_O__OOOO_X__XX
1	a1	XX_XO_O__OOOOOX__XX
1	61	XX_XO_O_OO____X__XX
1	61	XX_XO_O_OO___OX__XX
1	61	XX_XO_O_OO__O_X__XX
1	61	XX_XO_O_OO__OOX__XX
1	61	XX_XO_O_OO_O__X__XX
1	61	XX_XO_O_OO_O_OX__XX
1	71	XX_XO_O_OO_OO_X__XX
1	71	XX_XO_O_OO_OOOX__XX
1	71	XX_XO_O_OOO___X__XX
1	71	XX_XO_O_OOO__OX__XX
1	72	XX_XO_O_OOO_O_X__XX
1	72	XX_XO_O_OOO_OOX__XX
1	81	XX_XO_O_OOOO__X__XX
1	81	XX_XO_O_OOOO_OX__XX
1	a1	XX_XO_O_OOOOO_X__XX
1	a1	XX_XO_O_OOOOOOX__XX
1	61	XX_XO_OO_O____X__XX
1	61	XX_XO_OO_O___OX__XX
1	61	XX_XO_OO_O__O_X__XX
1	61	XX_XO_OO_O__OOX__XX
1	61	XX_XO_OO_O_O__X__XX
1	61	XX_XO_OO_O_O_OX__XX
1	61	XX_XO_OO_O_OO_X__XX
1	71	XX_XO_OO_O_OOOX__XX
1	71	XX_XO_OO_OO___X__XX
1	71	XX_XO_OO_OO__OX__XX
1	71	XX_XO_OO_OO_O_X__XX
1	72	XX_XO_OO_OO_OOX__XX
1	71	XX_XO_OO_OOO__X__XX
1	72	XX_XO_OO_OOO_OX__XX
1	81	XX_XO_OO_OOOO_X__XX
1	a1	XX_XO_OO_OOOOOX__XX
1	81	XX_XO_OOOO____X__XX
1	81	XX_XO_OOOO___OX__XX
1	81	XX_XO_OOOO__O_X__XX
1	81	XX_XO_OOOO__OOX__XX
1	81	XX_XO_OOOO_O__X__XX
1	81	XX_XO_OOOO_O_OX__XX
1	81	XX_XO_OOOO_OO_X__XX
1	81	XX_XO_OOOO_OOOX__XX
1	a1	XX_XO_OOOOO___X__XX
1	a1	XX_XO_OOOOO__OX__XX
1	a1	XX_XO_OOOOO_O_X__XX
1	a1	XX_XO_OOOOO_OOX__XX
1	a1	XX_XO_OOOOOO__X__XX
1	a1	XX_XO_OOOOOO_OX__XX
1	a1	XX_XO_OOOOOOO_X__XX
1	a1	XX_XO_OOOOOOOOX__XX
1	31	XX_XOO___O____X__XX
1	31	XX_XOO___O___OX__XX
1	41	XX_XOO___O__O_X__XX
1	51	XX_XOO___O__OOX__XX
1	41	XX_XOO___O_O__X__XX
1	51	XX_XOO___O_O_OX__XX
1	61	XX_XOO___O_OO_X__XX
1	71	XX_XOO___O_OOOX__XX
1	41	XX_XOO___OO___X__XX
1	51	XX_XOO___OO__OX__XX
1	61	XX_XOO___OO_O_X__XX
1	71	XX_XOO___OO_OOX__XX
1	61	XX_XOO___OOO__X__XX
1	71	XX_XOO___OOO_OX__XX
1	81	XX_XOO___OOOO_X__XX
1	a1	XX_XOO___OOOOOX__XX
1	51	XX_XOO__OO____X__XX
1	51	XX_XOO__OO___OX__XX
1	51	XX_XOO__OO__O_X__XX
1	51	XX_XOO__OO__OOX__XX
1	61	XX_XOO__OO_O__X__XX
1	61	XX_XOO__OO_O_OX__XX
1	71	XX_XOO__OO_OO_X__XX
1	71	XX_XOO__OO_OOOX__XX
1	61	XX_XOO__OOO___X__XX
1	61	XX_XOO__OOO__OX__XX
1	71	XX_XOO__OOO_O_X__XX
1	71	XX_XOO__OOO_OOX__XX
1	81	XX_XOO__OOOO__X__XX
1	81	XX_XOO__OOOO_OX__XX
1	a1	XX_XOO__OOOOO_X__XX
1	a1	XX_XOO__OOOOOOX__XX
1	51	XX_XOO_O_O____X__XX
1	51	XX_XOO_O_O___OX__XX
1	51	XX_XOO_O_O__O_X__XX
1	51	XX_XOO_O_O__OOX__XX
1	51	XX_XOO_O_O_O__X__XX
1	51	XX_XOO_O_O_O_OX__XX
1	61	XX_XOO_O_O_OO_X__XX
1	71	XX_XOO_O_O_OOOX__XX
1	61	XX_XOO_O_OO___X__XX
1	61	XX_XOO_O_OO__OX__XX
1	61	XX_XOO_O_OO_O_X__XX
1	71	XX_XOO_O_OO_OOX__XX
1	71	XX_XOO_O_OOO__X__XX
1	72	XX_XOO_O_OOO_OX__XX
1	81	XX_XOO_O_OOOO_X__XX
1	a1	XX_XOO_O_OOOOOX__XX
1	71	XX_XOO_OOO____X__XX
1	71	XX_XOO_OOO___OX__XX
1	71	XX_XOO_OOO__O_X__XX
1	71	XX_XOO_OOO__OOX__XX
1	72	XX_XOO_OOO_O__X__XX
1	72	XX_XOO_OOO_O_OX__XX
1	72	XX_XOO_OOO_OO_X__XX
1	72	XX_XOO_OOO_OOOX__XX
1	81	XX_XOO_OOOO___X__XX
1	81	XX_XOO_OOOO__OX__XX
1	81	XX_XOO_OOOO_O_X__XX
1	81	XX_XOO_OOOO_OOX__XX
1	a1	XX_XOO_OOOOO__X__XX
1	a1	XX_XOO_OOOOO_OX__XX
1	a1	XX_XOO_OOOOOO_X__XX
1	a1	XX_XOO_OOOOOOOX__XX
1	51	XX_XOOO__O____X__XX
1	51	XX_XOOO__O___OX__XX
1	51	XX_XOOO__O__O_X__XX
1	51	XX_XOOO__O__OOX__XX
1	51	XX_XOOO__O_O__X__XX
1	51	XX_XOOO__O_O_OX__XX
1	61	XX_XOOO__O_OO_X__XX
1	71	XX_XOOO__O_OOOX__XX
1	51	XX_XOOO__OO___X__XX
1	51	XX_XOOO__OO__OX__XX
1	61	XX_XOOO__OO_O_X__XX
1	71	XX_XOOO__OO_OOX__XX
1	61	XX_XOOO__OOO__X__XX
1	71	XX_XOOO__OOO_OX__XX
1	81	XX_XOOO__OOOO_X__XX
1	a1	XX_XOOO__OOOOOX__XX
1	71	XX_XOOO_OO____X__XX
1	71	XX_XOOO_OO___OX__XX
1	71	XX_XOOO_OO__O_X__XX
1	71	XX_XOOO_OO__OOX__XX
1	71	XX_XOOO_OO_O__X__XX
1	71	XX_XOOO_OO_O_OX__XX
1	72	XX_XOOO_OO_OO_X__XX
1	72	XX_XOOO_OO_OOOX__XX
1	71	XX_XOOO_OOO___X__XX
1	71	XX_XOOO_OOO__OX__XX
1	72	XX_XOOO_OOO_O_X__XX
1	72	XX_XOOO_OOO_OOX__XX
1	81	XX_XOOO_OOOO__X__XX
1	81	XX_XOOO_OOOO_OX__XX
1	a1	XX_XOOO_OOOOO_X__XX
1	a1	XX_XOOO_OOOOOOX__XX
1	71	XX_XOOOO_O____X__XX
1	71	XX_XOOOO_O___OX__XX
1	71	XX_XOOOO_O__O_X__XX
1	71	XX_XOOOO_O__OOX__XX
1	71	XX_XOOOO_O_O__X__XX
1	71	XX_XOOOO_O_O_OX__XX
1	71	XX_XOOOO_O_OO_X__XX
1	72	XX_XOOOO_O_OOOX__XX
1	71	XX_XOOOO_OO___X__XX
1	71	XX_XOOOO_OO__OX__XX
1	71	XX_XOOOO_OO_O_X__XX
1	72	XX_XOOOO_OO_OOX__XX
1	71	XX_XOOOO_OOO__X__XX
1	72	XX_XOOOO_OOO_OX__XX
1	81	XX_XOOOO_OOOO_X__XX
1	a1	XX_XOOOO_OOOOOX__XX
1	a1	XX_XOOOOOO____X__XX
1	a1	XX_XOOOOOO___OX__XX
1	a1	XX_XOOOOOO__O_X__XX
1	a1	XX_XOOOOOO__OOX__XX
1	a1	XX_XOOOOOO_O__X__XX
1	a1	XX_XOOOOOO_O_OX__XX
1	a1	XX_XOOOOOO_OO_X__XX
1	a1	XX_XOOOOOO_OOOX__XX
1	a1	XX_XOOOOOOO___X__XX
1	a1	XX_XOOOOOOO__OX__XX
1	a1	XX_XOOOOOOO_O_X__XX
1	a1	XX_XOOOOOOO_OOX__XX
1	a1	XX_XOOOOOOOO__X__XX
1	a1	XX_XOOOOOOOO_OX__XX
1	a1	XX_XOOOOOOOOO_X__XX
1	a1	XX_XOOOOOOOOOOX__XX
1	21	XX_X_____O_____X_XX
1	21	XX_X_____O____OX_XX
1	31	XX_X_____O___O_X_XX
1	31	XX_X_____O___OOX_XX
1	41	XX_X_____O__O__X_XX
1	41	XX_X_____O__O_OX_XX
1	51	XX_X_____O__OO_X_XX
1	51	XX_X_____O__OOOX_XX
1	41	XX_X_____O_O___X_XX
1	41	XX_X_____O_O__OX_XX
1	51	XX_X_____O_O_O_X_XX
1	51	XX_X_____O_O_OOX_XX
1	61	XX_X_____O_OO__X_XX
1	61	XX_X_____O_OO_OX_XX
1	71	XX_X_____O_OOO_X_XX
1	71	XX_X_____O_OOOOX_XX
1	41	XX_X_____OO____X_XX
1	41	XX_X_____OO___OX_XX
1	51	XX_X_____OO__O_X_XX
1	51	XX_X_____OO__OOX_XX
1	61	XX_X_____OO_O__X_XX
1	61	XX_X_____OO_O_OX_XX
1	71	XX_X_____OO_OO_X_XX
1	71	XX_X_____OO_OOOX_XX
1	61	XX_X_____OOO___X_XX
1	61	XX_X_____OOO__OX_XX
1	71	XX_X_____OOO_O_X_XX
1	71	XX_X_____OOO_OOX_XX
1	81	XX_X_____OOOO__X_XX
1	81	XX_X_____OOOO_OX_XX
1	a1	XX_X_____OOOOO_X_XX
1	a1	XX_X_____OOOOOOX_XX
1	41	XX_X____OO_____X_XX
1	41	XX_X____OO____OX_XX
1	41	XX_X____OO___O_X_XX
1	41	XX_X____OO___OOX_XX
1	51	XX_X____OO__O__X_XX
1	51	XX_X____OO__O_OX_XX
1	51	XX_X____OO__OO_X_XX
1	51	XX_X____OO__OOOX_XX
1	61	XX_X____OO_O___X_XX
1	61	XX_X____OO_O__OX_XX
1	61	XX_X____OO_O_O_X_XX
1	61	XX_X____OO_O_OOX_XX
1	71	XX_X____OO_OO__X_XX
1	71	XX_X____OO_OO_OX_XX
1	71	XX_X____OO_OOO_X_XX
1	71	XX_X____OO_OOOOX_XX
1	61	XX_X____OOO____X_XX
1	61	XX_X____OOO___OX_XX
1	61	XX_X____OOO__O_X_XX
1	61	XX_X____OOO__OOX_XX
1	71	XX_X____OOO_O__X_XX
1	71	XX_X____OOO_O_OX_XX
1	71	XX_X____OOO_OO_X_XX
1	71	XX_X____OOO_OOOX_XX
1	81	XX_X____OOOO___X_XX
1	81	XX_X____OOOO__OX_XX
1	81	XX_X____OOOO_O_X_XX
1	81	XX_X____OOOO_OOX_XX
1	a1	XX_X____OOOOO__X_XX
1	a1	XX_X____OOOOO_OX_XX
1	a1	XX_X____OOOOOO_X_XX
1	a1	XX_X____OOOOOOOX_XX
1	41	XX_X___O_O_____X_XX
1	41	XX_X___O_O____OX_XX
1	41	XX_X___O_O___O_X_XX
1	41	XX_X___O_O___OOX_XX
1	41	XX_X___O_O__O__X_XX
1	41	XX_X___O_O__O_OX_XX
1	51	XX_X___O_O__OO_X_XX
1	51	XX_X___O_O__OOOX_XX
1	51	XX_X___O_O_O___X_XX
1	51	XX_X___O_O_O__OX_XX
1	51	XX_X___O_O_O_O_X_XX
1	51	XX_X___O_O_O_OOX_XX
1	61	XX_X___O_O_OO__X_XX
1	61	XX_X___O_O_OO_OX_XX
1	71	XX_X___O_O_OOO_X_XX
1	71	XX_X___O_O_OOOOX_XX
1	61	XX_X___O_OO____X_XX
1	61	XX_X___O_OO___OX_XX
1	61	XX_X___O_OO__O_X_XX
1	61	XX_X___O_OO__OOX_XX
1	61	XX_X___O_OO_O__X_XX
1	61	XX_X___O_OO_O_OX_XX
1	71	XX_X___O_OO_OO_X_XX
1	71	XX_X___O_OO_OOOX_XX
1	71	XX_X___O_OOO___X_XX
1	71	XX_X___O_OOO__OX_XX
1	72	XX_X___O_OOO_O_X_XX
1	72	XX_X___O_OOO_OOX_XX
1	81	XX_X___O_OOOO__X_XX
1	81	XX_X___O_OOOO_OX_XX
1	a1	XX_X___O_OOOOO_X_XX
1	a1	XX_X___O_OOOOOOX_XX
1	61	XX_X___OOO_____X_XX
1	61	XX_X___OOO____OX_XX
1	61	XX_X___OOO___O_X_XX
1	61	XX_X___OOO___OOX_XX
1	61	XX_X___OOO__O__X_XX
1	61	XX_X___OOO__O_OX_XX
1	61	XX_X___OOO__OO_X_XX
1	61	XX_X___OOO__OOOX_XX
1	71	XX_X___OOO_O___X_XX
1	71	XX_X___OOO_O__OX_XX
1	71	XX_X___OOO_O_O_X_XX
1	71	XX_X___OOO_O_OOX_XX
1	71	XX_X___OOO_OO__X_XX
1	71	XX_X___OOO_OO_OX_XX
1	71	XX_X___OOO_OOO_X_XX
1	71	XX_X___OOO_OOOOX_XX
1	81	XX_X___OOOO____X_XX
1	81	XX_X___OOOO___OX_XX
1	81	XX_X___OOOO__O_X_XX
1	81	XX_X___OOOO__OOX_XX
1	81	XX_X___OOOO_O__X_XX
1	81	XX_X___OOOO_O_OX_XX
1	81	XX_X___OOOO_OO_X_XX
1	81	XX_X___OOOO_OOOX_XX
1	a1	XX_X___OOOOO___X_XX
1	a1	XX_X___OOOOO__OX_XX
1	a1	XX_X___OOOOO_O_X_XX
1	a1	XX_X___OOOOO_OOX_XX
1	a1	XX_X___OOOOOO__X_XX
1	a1	XX_X___OOOOOO_OX_XX
1	a1	XX_X___OOOOOOO_X_XX
1	a1	XX_X___OOOOOOOOX_XX
1	41	XX_X__O__O_____X_XX
1	41	XX_X__O__O____OX_XX
1	41	XX_X__O__O___O_X_XX
1	41	XX_X__O__O___OOX_XX
1	41	XX_X__O__O__O__X_XX
1	41	XX_X__O__O__O_OX_XX
1	51	XX_X__O__O__OO_X_XX
1	51	XX_X__O__O__OOOX_XX
1	41	XX_X__O__O_O___X_XX
1	41	XX_X__O__O_O__OX_XX
1	51	XX_X__O__O_O_O_X_XX
1	51	XX_X__O__O_O_OOX_XX
1	61	XX_X__O__O_OO__X_XX
1	61	XX_X__O__O_OO_OX_XX
1	71	XX_X__O__O_OOO_X_XX
1	71	XX_X__O__O_OOOOX_XX
1	51	XX_X__O__OO____X_XX
1	51	XX_X__O__OO___OX_XX
1	51	XX_X__O__OO__O_X_XX
1	51	XX_X__O__OO__OOX_XX
1	61	XX_X__O__OO_O__X_XX
1	61	XX_X__O__OO_O_OX_XX
1	71	XX_X__O__OO_OO_X_XX
1	71	XX_X__O__OO_OOOX_XX
1	61	XX_X__O__OOO___X_XX
1	61	XX_X__O__OOO__OX_XX
1	71	XX_X__O__OOO_O_X_XX
1	71	XX_X__O__OOO_OOX_XX
1	81	XX_X__O__OOOO__X_XX
1	81	XX_X__O__OOOO_OX_XX
1	a1	XX_X__O__OOOOO_X_XX
1	a1	XX_X__O__OOOOOOX_XX
1	61	XX_X__O_OO_____X_XX
1	61	XX_X__O_OO____OX_XX
1	61	XX_X__O_OO___O_X_XX
1	61	XX_X__O_OO___OOX_XX
1	61	XX_X__O_OO__O__X_XX
1	61	XX_X__O_OO__O_OX_XX
1	61	XX_X__O_OO__OO_X_XX
1	61	XX_X__O_OO__OOOX_XX
1	61	XX_X__O_OO_O___X_XX
1	61	XX_X__O_OO_O__OX_XX
1	61	XX_X__O_OO_O_O_X_XX
1	61	XX_X__O_OO_O_OOX_XX
1	71	XX_X__O_OO_OO__X_XX
1	71	XX_X__O_OO_OO_OX_XX
1	71	XX_X__O_OO_OOO_X_XX
1	71	XX_X__O_OO_OOOOX_XX
1	71	XX_X__O_OOO____X_XX
1	71	XX_X__O_OOO___OX_XX
1	71	XX_X__O_OOO__O_X_XX
1	71	XX_X__O_OOO__OOX_XX
1	72	XX_X__O_OOO_O__X_XX
1	72	XX_X__O_OOO_O_OX_XX
1	72	XX_X__O_OOO_OO_X_XX
1	72	XX_X__O_OOO_OOOX_XX
1	81	XX_X__O_OOOO___X_XX
1	81	XX_X__O_OOOO__OX_XX
1	81	XX_X__O_OOOO_O_X_XX
1	81	XX_X__O_OOOO_OOX_XX
1	a1	XX_X__O_OOOOO__X_XX
1	a1	XX_X__O_OOOOO_OX_XX
1	a1	XX_X__O_OOOOOO_X_XX
1	a1	XX_X__O_OOOOOOOX_XX
1	61	XX_X__OO_O_____X_XX
1	61	XX_X__OO_O____OX_XX
1	61	XX_X__OO_O___O_X_XX
1	61	XX_X__OO_O___OOX_XX
1	61	XX_X__OO_O__O__X_XX
1	61	XX_X__OO_O__O_OX_XX
1	61	XX_X__OO_O__OO_X_XX
1	61	XX_X__OO_O__OOOX_XX
1	61	XX_X__OO_O_O___X_XX
1	61	XX_X__OO_O_O__OX_XX
1	61	XX_X__OO_O_O_O_X_XX
1	61	XX_X__OO_O_O_OOX_XX
1	61	XX_X__OO_O_OO__X_XX
1	61	XX_X__OO_O_OO_OX_XX
1	71	XX_X__OO_O_OOO_X_XX
1	71	XX_X__OO_O_OOOOX_XX
1	71	XX_X__OO_OO____X_XX
1	71	XX_X__OO_OO___OX_XX
1	71	XX_X__OO_OO__O_X_XX
1	71	XX_X__OO_OO__OOX_XX
1	71	XX_X__OO_OO_O__X_XX
1	71	XX_X__OO_OO_O_OX_XX
1	72	XX_X__OO_OO_OO_X_XX
1	72	XX_X__OO_OO_OOOX_XX
1	71	XX_X__OO_OOO___X_XX
1	71	XX_X__OO_OOO__OX_XX
1	72	XX_X__OO_OOO_O_X_XX
1	72	XX_X__OO_OOO_OOX_XX
1	81	XX_X__OO_OOOO__X_XX
1	81	XX_X__OO_OOOO_OX_XX
1	a1	XX_X__OO_OOOOO_X_XX
1	a1	XX_X__OO_OOOOOOX_XX
1	81	XX_X__OOOO_____X_XX
1	81	XX_X__OOOO____OX_XX
1	81	XX_X__OOOO___O_X_XX
1	81	XX_X__OOOO___OOX_XX
1	81	XX_X__OOOO__O__X_XX
1	81	XX_X__OOOO__O_OX_XX
1	81	XX_X__OOOO__OO_X_XX
1	81	XX_X__OOOO__OOOX_XX
1	81	XX_X__OOOO_O___X_XX
1	81	XX_X__OOOO_O__OX_XX
1	81	XX_X__OOOO_O_O_X_XX
1	81	XX_X__OOOO_O_OOX_XX
1	81	XX_X__OOOO_OO__X_XX
1	81	XX_X__OOOO_OO_OX_XX
1	81	XX_X__OOOO_OOO_X_XX
1	81	XX_X__OOOO_OOOOX_XX
1	a1	XX_X__OOOOO____X_XX
1	a1	XX_X__OOOOO___OX_XX
1	a1	XX_X__OOOOO__O_X_XX
1	a1	XX_X__OOOOO__OOX_XX
1	a1	XX_X__OOOOO_O__X_XX
1	a1	XX_X__OOOOO_O_OX_XX
1	a1	XX_X__OOOOO_OO_X_XX
1	a1	XX_X__OOOOO_OOOX_XX
1	a1	XX_X__OOOOOO___X_XX
1	a1	XX_X__OOOOOO__OX_XX
1	a1	XX_X__OOOOOO_O_X_XX
1	a1	XX_X__OOOOOO_OOX_XX
1	a1	XX_X__OOOOOOO__X_XX
1	a1	XX_X__OOOOOOO_OX_XX
1	a1	XX_X__OOOOOOOO_X_XX
1	a1	XX_X__OOOOOOOOOX_XX
1	31	XX_X_O___O_____X_XX
1	31	XX_X_O___O____OX_XX
1	31	XX_X_O___O___O_X_XX
1	31	XX_X_O___O___OOX_XX
1	41	XX_X_O___O__O__X_XX
1	41	XX_X_O___O__O_OX_XX
1	51	XX_X_O___O__OO_X_XX
1	51	XX_X_O___O__OOOX_XX
1	41	XX_X_O___O_O___X_XX
1	41	XX_X_O___O_O__OX_XX
1	51	XX_X_O___O_O_O_X_XX
1	51	XX_X_O___O_O_OOX_XX
1	61	XX_X_O___O_OO__X_XX
1	61	XX_X_O___O_OO_OX_XX
1	71	XX_X_O___O_OOO_X_XX
1	71	XX_X_O___O_OOOOX_XX
1	41	XX_X_O___OO____X_XX
1	41	XX_X_O___OO___OX_XX
1	51	XX_X_O___OO__O_X_XX
1	51	XX_X_O___OO__OOX_XX
1	61	XX_X_O___OO_O__X_XX
1	61	XX_X_O___OO_O_OX_XX
1	71	XX_X_O___OO_OO_X_XX
1	71	XX_X_O___OO_OOOX_XX
1	61	XX_X_O___OOO___X_XX
1	61	XX_X_O___OOO__OX_XX
1	71	XX_X_O___OOO_O_X_XX
1	71	XX_X_O___OOO_OOX_XX
1	81	XX_X_O___OOOO__X_XX
1	81	XX_X_O___OOOO_OX_XX
1	a1	XX_X_O___OOOOO_X_XX
1	a1	XX_X_O___OOOOOOX_XX
1	51	XX_X_O__OO_____X_XX
1	51	XX_X_O__OO____OX_XX
1	51	XX_X_O__OO___O_X_XX
1	51	XX_X_O__OO___OOX_XX
1	51	XX_X_O__OO__O__X_XX
1	51	XX_X_O__OO__O_OX_XX
1	51	XX_X_O__OO__OO_X_XX
1	51	XX_X_O__OO__OOOX_XX
1	61	XX_X_O__OO_O___X_XX
1	61	XX_X_O__OO_O__OX_XX
1	61	XX_X_O__OO_O_O_X_XX
1	61	XX_X_O__OO_O_OOX_XX
1	71	XX_X_O__OO_OO__X_XX
1	71	XX_X_O__OO_OO_OX_XX
1	71	XX_X_O__OO_OOO_X_XX
1	71	XX_X_O__OO_OOOOX_XX
1	61	XX_X_O__OOO____X_XX
1	61	XX_X_O__OOO___OX_XX
1	61	XX_X_O__OOO__O_X_XX
1	61	XX_X_O__OOO__OOX_XX
1	71	XX_X_O__OOO_O__X_XX
1	71	XX_X_O__OOO_O_OX_XX
1	71	XX_X_O__OOO_OO_X_XX
1	71	XX_X_O__OOO_OOOX_XX
1	81	XX_X_O__OOOO___X_XX
1	81	XX_X_O__OOOO__OX_XX
1	81	XX_X_O__OOOO_O_X_XX
1	81	XX_X_O__OOOO_OOX_XX
1	a1	XX_X_O__OOOOO__X_XX
1	a1	XX_X_O__OOOOO_OX_XX
1	a1	XX_X_O__OOOOOO_X_XX
1	a1	XX_X_O__OOOOOOOX_XX
1	51	XX_X_O_O_O_____X_XX
1	51	XX_X_O_O_O____OX_XX
1	51	XX_X_O_O_O___O_X_XX
1	51	XX_X_O_O_O___OOX_XX
1	51	XX_X_O_O_O__O__X_XX
1	51	XX_X_O_O_O__O_OX_XX
1	51	XX_X_O_O_O__OO_X_XX
1	51	XX_X_O_O_O__OOOX_XX
1	51	XX_X_O_O_O_O___X_XX
1	51	XX_X_O_O_O_O__OX_XX
1	51	XX_X_O_O_O_O_O_X_XX
1	51	XX_X_O_O_O_O_OOX_XX
1	61	XX_X_O_O_O_OO__X_XX
1	61	XX_X_O_O_O_OO_OX_XX
1	71	XX_X_O_O_O_OOO_X_XX
1	71	XX_X_O_O_O_OOOOX_XX
1	61	XX_X_O_O_OO____X_XX
1	61	XX_X_O_O_OO___OX_XX
1	61	XX_X_O_O_OO__O_X_XX
1	61	XX_X_O_O_OO__OOX_XX
1	61	XX_X_O_O_OO_O__X_XX
1	61	XX_X_O_O_OO_O_OX_XX
1	71	XX_X_O_O_OO_OO_X_XX
1	71	XX_X_O_O_OO_OOOX_XX
1	71	XX_X_O_O_OOO___X_XX
1	71	XX_X_O_O_OOO__OX_XX
1	72	XX_X_O_O_OOO_O_X_XX
1	72	XX_X_O_O_OOO_OOX_XX
1	81	XX_X_O_O_OOOO__X_XX
1	81	XX_X_O_O_OOOO_OX_XX
1	a1	XX_X_O_O_OOOOO_X_XX
1	a1	XX_X_O_O_OOOOOOX_XX
1	71	XX_X_O_OOO_____X_XX
1	71	XX_X_O_OOO____OX_XX
1	71	XX_X_O_OOO___O_X_XX
1	71	XX_X_O_OOO___OOX_XX
1	71	XX_X_O_OOO__O__X_XX
1	71	XX_X_O_OOO__O_OX_XX
1	71	XX_X_O_OOO__OO_X_XX
1	71	XX_X_O_OOO__OOOX_XX
1	72	XX_X_O_OOO_O___X_XX
1	72	XX_X_O_OOO_O__OX_XX
1	72	XX_X_O_OOO_O_O_X_XX
1	72	XX_X_O_OOO_O_OOX_XX
1	72	XX_X_O_OOO_OO__X_XX
1	72	XX_X_O_OOO_OO_OX_XX
1	72	XX_X_O_OOO_OOO_X_XX
1	72	XX_X_O_OOO_OOOOX_XX
1	81	XX_X_O_OOOO____X_XX
1	81	XX_X_O_OOOO___OX_XX
1	81	XX_X_O_OOOO__O_X_XX
1	81	XX_X_O_OOOO__OOX_XX
1	81	XX_X_O_OOOO_O__X_XX
1	81	XX_X_O_OOOO_O_OX_XX
1	81	XX_X_O_OOOO_OO_X_XX
1	81	XX_X_O_OOOO_OOOX_XX
1	a1	XX_X_O_OOOOO___X_XX
1	a1	XX_X_O_OOOOO__OX_XX
1	a1	XX_X_O_OOOOO_O_X_XX
1	a1	XX_X_O_OOOOO_OOX_XX
1	a1	XX_X_O_OOOOOO__X_XX
1	a1	XX_X_O_OOOOOO_OX_XX
1	a1	XX_X_O_OOOOOOO_X_XX
1	a1	XX_X_O_OOOOOOOOX_XX
1	51	XX_X_OO__O_____X_XX
1	51	XX_X_OO__O____OX_XX
1	51	XX_X_OO__O___O_X_XX
1	51	XX_X_OO__O___OOX_XX
1	51	XX_X_OO__O__O__X_XX
1	51	XX_X_OO__O__O_OX_XX
1	51	XX_X_OO__O__OO_X_XX
1	51	XX_X_OO__O__OOOX_XX
1	51	XX_X_OO__O_O___X_XX
1	51	XX_X_OO__O_O__OX_XX
1	51	XX_X_OO__O_O_O_X_XX
1	51	XX_X_OO__O_O_OOX_XX
1	61	XX_X_OO__O_OO__X_XX
1	61	XX_X_OO__O_OO_OX_XX
1	71	XX_X_OO__O_OOO_X_XX
1	71	XX_X_OO__O_OOOOX_XX
1	51	XX_X_OO__OO____X_XX
1	51	XX_X_OO__OO___OX_XX
1	51	XX_X_OO__OO__O_X_XX
1	51	XX_X_OO__OO__OOX_XX
1	61	XX_X_OO__OO_O__X_XX
1	61	XX_X_OO__OO_O_OX_XX
1	71	XX_X_OO__OO_OO_X_XX
1	71	XX_X_OO__OO_OOOX_XX
1	61	XX_X_OO__OOO___X_XX
1	61	XX_X_OO__OOO__OX_XX
1	71	XX_X_OO__OOO_O_X_XX
1	71	XX_X_OO__OOO_OOX_XX
1	81	XX_X_OO__OOOO__X_XX
1	81	XX_X_OO__OOOO_OX_XX
1	a1	XX_X_OO__OOOOO_X_XX
1	a1	XX_X_OO__OOOOOOX_XX
1	71	XX_X_OO_OO_____X_XX
1	71	XX_X_OO_OO____OX_XX
1	71	XX_X_OO_OO___O_X_XX
1	71	XX_X_OO_OO___OOX_XX
1	71	XX_X_OO_OO__O__X_XX
1	71	XX_X_OO_OO__O_OX_XX
1	71	XX_X_OO_OO__OO_X_XX
1	71	XX_X_OO_OO__OOOX_XX
1	71	XX_X_OO_OO_O___X_XX
1	71	XX_X_OO_OO_O__OX_XX
1	71	XX_X_OO_OO_O_O_X_XX
1	71	XX_X_OO_OO_O_OOX_XX
1	72	XX_X_OO_OO_OO__X_XX
1	72	XX_X_OO_OO_OO_OX_XX
1	72	XX_X_OO_OO_OOO_X_XX
1	72	XX_X_OO_OO_OOOOX_XX
1	71	XX_X_OO_OOO____X_XX
1	71	XX_X_OO_OOO___OX_XX
1	71	XX_X_OO_OOO__O_X_XX
1	71	XX_X_OO_OOO__OOX_XX
1	72	XX_X_OO_OOO_O__X_XX
1	72	XX_X_OO_OOO_O_OX_XX
1	72	XX_X_OO_OOO_OO_X_XX
1	72	XX_X_OO_OOO_OOOX_XX
1	81	XX_X_OO_OOOO___X_XX
1	81	XX_X_OO_OOOO__OX_XX
1	81	XX_X_OO_OOOO_O_X_XX
1	81	XX_X_OO_OOOO_OOX_XX
1	a1	XX_X_OO_OOOOO__X_XX
1	a1	XX_X_OO_OOOOO_OX_XX
1	a1	XX_X_OO_OOOOOO_X_XX
1	a1	XX_X_OO_OOOOOOOX_XX
1	71	XX_X_OOO_O_____X_XX
1	71	XX_X_OOO_O____OX_XX
1	71	XX_X_OOO_O___O_X_XX
1	71	XX_X_OOO_O___OOX_XX
1	71	XX_X_OOO_O__O__X_XX
1	71	XX_X_OOO_O__O_OX_XX
1	71	XX_X_OOO_O__OO_X_XX
1	71	XX_X_OOO_O__OOOX_XX
1	71	XX_X_OOO_O_O___X_XX
1	71	XX_X_OOO_O_O__OX_XX
1	71	XX_X_OOO_O_O_O_X_XX
1	71	XX_X_OOO_O_O_OOX_XX
1	71	XX_X_OOO_O_OO__X_XX
1	71	XX_X_OOO_O_OO_OX_XX
1	72	XX_X_OOO_O_OOO_X_XX
1	72	XX_X_OOO_O_OOOOX_XX
1	71	XX_X_OOO_OO____X_XX
1	71	XX_X_OOO_OO___OX_XX
1	71	XX_X_OOO_OO__O_X_XX
1	71	XX_X_OOO_OO__OOX_XX
1	71	XX_X_OOO_OO_O__X_XX
1	71	XX_X_OOO_OO_O_OX_XX
1	72	XX_X_OOO_OO_OO_X_XX
1	72	XX_X_OOO_OO_OOOX_XX
1	71	XX_X_OOO_OOO___X_XX
1	71	XX_X_OOO_OOO__OX_XX
1	72	XX_X_OOO_OOO_O_X_XX
1	72	XX_X_OOO_OOO_OOX_XX
1	81	XX_X_OOO_OOOO__X_XX
1	81	XX_X_OOO_OOOO_OX_XX
1	a1	XX_X_OOO_OOOOO_X_XX
1	a1	XX_X_OOO_OOOOOOX_XX
1	a1	XX_X_OOOOO_____X_XX
1	a1	XX_X_OOOOO____OX_XX
1	a1	XX_X_OOOOO___O_X_XX
1	a1	XX_X_OOOOO___OOX_XX
1	a1	XX_X_OOOOO__O__X_XX
1	a1	XX_X_OOOOO__O_OX_XX
1	a1	XX_X_OOOOO__OO_X_XX
1	a1	XX_X_OOOOO__OOOX_XX
1	a1	XX_X_OOOOO_O___X_XX
1	a1	XX_X_OOOOO_O__OX_XX
1	a1	XX_X_OOOOO_O_O_X_XX
1	a1	XX_X_OOOOO_O_OOX_XX
1	a1	XX_X_OOOOO_OO__X_XX
1	a1	XX_X_OOOOO_OO_OX_XX
1	a1	XX_X_OOOOO_OOO_X_XX
1	a1	XX_X_OOOOO_OOOOX_XX
1	a1	XX_X_OOOOOO____X_XX
1	a1	XX_X_OOOOOO___OX_XX
1	a1	XX_X_OOOOOO__O_X_XX
1	a1	XX_X_OOOOOO__OOX_XX
1	a1	XX_X_OOOOOO_O__X_XX
1	a1	XX_X_OOOOOO_O_OX_XX
1	a1	XX_X_OOOOOO_OO_X_XX
1	a1	XX_X_OOOOOO_OOOX_XX
1	a1	XX_X_OOOOOOO___X_XX
1	a1	XX_X_OOOOOOO__OX_XX
1	a1	XX_X_OOOOOOO_O_X_XX
1	a1	XX_X_OOOOOOO_OOX_XX
1	a1	XX_X_OOOOOOOO__X_XX
1	a1	XX_X_OOOOOOOO_OX_XX
1	a1	XX_X_OOOOOOOOO_X_XX
1	a1	XX_X_OOOOOOOOOOX_XX
1	21	XX_XO____O_____X_XX
1	21	XX_XO____O____OX_XX
1	31	XX_XO____O___O_X_XX
1	31	XX_XO____O___OOX_XX
1	41	XX_XO____O__O__X_XX
1	41	XX_XO____O__O_OX_XX
1	51	XX_XO____O__OO_X_XX
1	51	XX_XO____O__OOOX_XX
1	41	XX_XO____O_O___X_XX
1	41	XX_XO____O_O__OX_XX
1	51	XX_XO____O_O_O_X_XX
1	51	XX_XO____O_O_OOX_XX
1	61	XX_XO____O_OO__X_XX
1	61	XX_XO____O_OO_OX_XX
1	71	XX_XO____O_OOO_X_XX
1	71	XX_XO____O_OOOOX_XX
1	41	XX_XO____OO____X_XX
1	41	XX_XO____OO___OX_XX
1	51	XX_XO____OO__O_X_XX
1	51	XX_XO____OO__OOX_XX
1	61	XX_XO____OO_O__X_XX
1	61	XX_XO____OO_O_OX_XX
1	71	XX_XO____OO_OO_X_XX
1	71	XX_XO____OO_OOOX_XX
1	61	XX_XO____OOO___X_XX
1	61	XX_XO____OOO__OX_XX
1	71	XX_XO____OOO_O_X_XX
1	71	XX_XO____OOO_OOX_XX
1	81	XX_XO____OOOO__X_XX
1	81	XX_XO____OOOO_OX_XX
1	a1	XX_XO____OOOOO_X_XX
1	a1	XX_XO____OOOOOOX_XX
1	41	XX_XO___OO_____X_XX
1	41	XX_XO___OO____OX_XX
1	41	XX_XO___OO___O_X_XX
1	41	XX_XO___OO___OOX_XX
1	51	XX_XO___OO__O__X_XX
1	51	XX_XO___OO__O_OX_XX
1	51	XX_XO___OO__OO_X_XX
1	51	XX_XO___OO__OOOX_XX
1	61	XX_XO___OO_O___X_XX
1	61	XX_XO___OO_O__OX_XX
1	61	XX_XO___OO_O_O_X_XX
1	61	XX_XO___OO_O_OOX_XX
1	71	XX_XO___OO_OO__X_XX
1	71	XX_XO___OO_OO_OX_XX
1	71	XX_XO___OO_OOO_X_XX
1	71	XX_XO___OO_OOOOX_XX
1	61	XX_XO___OOO____X_XX
1	61	XX_XO___OOO___OX_XX
1	61	XX_XO___OOO__O_X_XX
1	61	XX_XO___OOO__OOX_XX
1	71	XX_XO___OOO_O__X_XX
1	71	XX_XO___OOO_O_OX_XX
1	71	XX_XO___OOO_OO_X_XX
1	71	XX_XO___OOO_OOOX_XX
1	81	XX_XO___OOOO___X_XX
1	81	XX_XO___OOOO__OX_XX
1	81	XX_XO___OOOO_O_X_XX
1	81	XX_XO___OOOO_OOX_XX
1	a1	XX_XO___OOOOO__X_XX
1	a1	XX_XO___OOOOO_OX_XX
1	a1	XX_XO___OOOOOO_X_XX
1	a1	XX_XO___OOOOOOOX_XX
1	41	XX_XO__O_O_____X_XX
1	41	XX_XO__O_O____OX_XX
1	41	XX_XO__O_O___O_X_XX
1	41	XX_XO__O_O___OOX_XX
1	41	XX_XO__O_O__O__X_XX
1	41	XX_XO__O_O__O_OX_XX
1	51	XX_XO__O_O__OO_X_XX
1	51	XX_XO__O_O__OOOX_XX
1	51	XX_XO__O_O_O___X_XX
1	51	XX_XO__O_O_O__OX_XX
1	51	XX_XO__O_O_O_O_X_XX
1	51	XX_XO__O_O_O_OOX_XX
1	61	XX_XO__O_O_OO__X_XX
1	61	XX_XO__O_O_OO_OX_XX
1	71	XX_XO__O_O_OOO_X_XX
1	71	XX_XO__O_O_OOOOX_XX
1	61	XX_XO__O_OO____X_XX
1	61	XX_XO__O_OO___OX_XX
1	61	XX_XO__O_OO__O_X_XX
1	61	XX_XO__O_OO__OOX_XX
1	61	XX_XO__O_OO_O__X_XX
1	61	XX_XO__O_OO_O_OX_XX
1	71	XX_XO__O_OO_OO_X_XX
1	71	XX_XO__O_OO_OOOX_XX
1	71	XX_XO__O_OOO___X_XX
1	71	XX_XO__O_OOO__OX_XX
1	72	XX_XO__O_OOO_O_X_XX
1	72	XX_XO__O_OOO_OOX_XX
1	81	XX_XO__O_OOOO__X_XX
1	81	XX_XO__O_OOOO_OX_XX
1	a1	XX_XO__O_OOOOO_X_XX
1	a1	XX_XO__O_OOOOOOX_XX
1	61	XX_XO__OOO_____X_XX
1	61	XX_XO__OOO____OX_XX
1	61	XX_XO__OOO___O_X_XX
1	61	XX_XO__OOO___OOX_XX
1	61	XX_XO__OOO__O__X_XX
1	61	XX_XO__OOO__O_OX_XX
1	61	XX_XO__OOO__OO_X_XX
1	61	XX_XO__OOO__OOOX_XX
1	71	XX_XO__OOO_O___X_XX
1	71	XX_XO__OOO_O__OX_XX
1	71	XX_XO__OOO_O_O_X_XX
1	71	XX_XO__OOO_O_OOX_XX
1	71	XX_XO__OOO_OO__X_XX
1	71	XX_XO__OOO_OO_OX_XX
1	71	XX_XO__OOO_OOO_X_XX
1	71	XX_XO__OOO_OOOOX_XX
1	81	XX_XO__OOOO____X_XX
1	81	XX_XO__OOOO___OX_XX
1	81	XX_XO__OOOO__O_X_XX
1	81	XX_XO__OOOO__OOX_XX
1	81	XX_XO__OOOO_O__X_XX
1	81	XX_XO__OOOO_O_OX_XX
1	81	XX_XO__OOOO_OO_X_XX
1	81	XX_XO__OOOO_OOOX_XX
1	a1	XX_XO__OOOOO___X_XX
1	a1	XX_XO__OOOOO__OX_XX
1	a1	XX_XO__OOOOO_O_X_XX
1	a1	XX_XO__OOOOO_OOX_XX
1	a1	XX_XO__OOOOOO__X_XX
1	a1	XX_XO__OOOOOO_OX_XX
1	a1	XX_XO__OOOOOOO_X_XX
1	a1	XX_XO__OOOOOOOOX_XX
1	41	XX_XO_O__O_____X_XX
1	41	XX_XO_O__O____OX_XX
1	41	XX_XO_O__O___O_X_XX
1	41	XX_XO_O__O___OOX_XX
1	41	XX_XO_O__O__O__X_XX
1	41	XX_XO_O__O__O_OX_XX
1	51	XX_XO_O__O__OO_X_XX
1	51	XX_XO_O__O__OOOX_XX
1	41	XX_XO_O__O_O___X_XX
1	41	XX_XO_O__O_O__OX_XX
1	51	XX_XO_O__O_O_O_X_XX
1	51	XX_XO_O__O_O_OOX_XX
1	61	XX_XO_O__O_OO__X_XX
1	61	XX_XO_O__O_OO_OX_XX
1	71	XX_XO_O__O_OOO_X_XX
1	71	XX_XO_O__O_OOOOX_XX
1	51	XX_XO_O__OO____X_XX
1	51	XX_XO_O__OO___OX_XX
1	51	XX_XO_O__OO__O_X_XX
1	51	XX_XO_O__OO__OOX_XX
1	61	XX_XO_O__OO_O__X_XX
1	61	XX_XO_O__OO_O_OX_XX
1	71	XX_XO_O__OO_OO_X_XX
1	71	XX_XO_O__OO_OOOX_XX
1	61	XX_XO_O__OOO___X_XX
1	61	XX_XO_O__OOO__OX_XX
1	71	XX_XO_O__OOO_O_X_XX
1	71	XX_XO_O__OOO_OOX_XX
1	81	XX_XO_O__OOOO__X_XX
1	81	XX_XO_O__OOOO_OX_XX
1	a1	XX_XO_O__OOOOO_X_XX
1	a1	XX_XO_O__OOOOOOX_XX
1	61	XX_XO_O_OO_____X_XX
1	61	XX_XO_O_OO____OX_XX
1	61	XX_XO_O_OO___O_X_XX
1	61	XX_XO_O_OO___OOX_XX
1	61	XX_XO_O_OO__O__X_XX
1	61	XX_XO_O_OO__O_OX_XX
1	61	XX_XO_O_OO__OO_X_XX
1	61	XX_XO_O_OO__OOOX_XX
1	61	XX_XO_O_OO_O___X_XX
1	61	XX_XO_O_OO_O__OX_XX
1	61	XX_XO_O_OO_O_O_X_XX
1	61	XX_XO_O_OO_O_OOX_XX
1	71	XX_XO_O_OO_OO__X_XX
1	71	XX_XO_O_OO_OO_OX_XX
1	71	XX_XO_O_OO_OOO_X_XX
1	71	XX_XO_O_OO_OOOOX_XX
1	71	XX_XO_O_OOO____X_XX
1	71	XX_XO_O_OOO___OX_XX
1	71	XX_XO_O_OOO__O_X_XX
1	71	XX_XO_O_OOO__OOX_XX
1	72	XX_XO_O_OOO_O__X_XX
1	72	XX_XO_O_OOO_O_OX_XX
1	72	XX_XO_O_OOO_OO_X_XX
1	72	XX_XO_O_OOO_OOOX_XX
1	81	XX_XO_O_OOOO___X_XX
1	81	XX_XO_O_OOOO__OX_XX
1	81	XX_XO_O_OOOO_O_X_XX
1	81	XX_XO_O_OOOO_OOX_XX
1	a1	XX_XO_O_OOOOO__X_XX
1	a1	XX_XO_O_OOOOO_OX_XX
1	a1	XX_XO_O_OOOOOO_X_XX
1	a1	XX_XO_O_OOOOOOOX_XX
1	61	XX_XO_OO_O_____X_XX
1	61	XX_XO_OO_O____OX_XX
1	61	XX_XO_OO_O___O_X_XX
1	61	XX_XO_OO_O___OOX_XX
1	61	XX_XO_OO_O__O__X_XX
1	61	XX_XO_OO_O__O_OX_XX
1	61	XX_XO_OO_O__OO_X_XX
1	61	XX_XO_OO_O__OOOX_XX
1	61	XX_XO_OO_O_O___X_XX
1	61	XX_XO_OO_O_O__OX_XX
1	61	XX_XO_OO_O_O_O_X_XX
1	61	XX_XO_OO_O_O_OOX_XX
1	61	XX_XO_OO_O_OO__X_XX
1	61	XX_XO_OO_O_OO_OX_XX
1	71	XX_XO_OO_O_OOO_X_XX
1	71	XX_XO_OO_O_OOOOX_XX
1	71	XX_XO_OO_OO____X_XX
1	71	XX_XO_OO_OO___OX_XX
1	71	XX_XO_OO_OO__O_X_XX
1	71	XX_XO_OO_OO__OOX_XX
1	71	XX_XO_OO_OO_O__X_XX
1	71	XX_XO_OO_OO_O_OX_XX
1	72	XX_XO_OO_OO_OO_X_XX
1	72	XX_XO_OO_OO_OOOX_XX
1	71	XX_XO_OO_OOO___X_XX
1	71	XX_XO_OO_OOO__OX_XX
1	72	XX_XO_OO_OOO_O_X_XX
1	72	XX_XO_OO_OOO_OOX_XX
1	81	XX_XO_OO_OOOO__X_XX
1	81	XX_XO_OO_OOOO_OX_XX
1	a1	XX_XO_OO_OOOOO_X_XX
1	a1	XX_XO_OO_OOOOOOX_XX
1	81	XX_XO_OOOO_____X_XX
1	81	XX_XO_OOOO____OX_XX
1	81	XX_XO_OOOO___O_X_XX
1	81	XX_XO_OOOO___OOX_XX
1	81	XX_XO_OOOO__O__X_XX
1	81	XX_XO_OOOO__O_OX_XX
1	81	XX_XO_OOOO__OO_X_XX
1	81	XX_XO_OOOO__OOOX_XX
1	81	XX_XO_OOOO_O___X_XX
1	81	XX_XO_OOOO_O__OX_XX
1	81	XX_XO_OOOO_O_O_X_XX
1	81	XX_XO_OOOO_O_OOX_XX
1	81	XX_XO_OOOO_OO__X_XX
1	81	XX_XO_OOOO_OO_OX_XX
1	81	XX_XO_OOOO_OOO_X_XX
1	81	XX_XO_OOOO_OOOOX_XX
1	a1	XX_XO_OOOOO____X_XX
1	a1	XX_XO_OOOOO___OX_XX
1	a1	XX_XO_OOOOO__O_X_XX
1	a1	XX_XO_OOOOO__OOX_XX
1	a1	XX_XO_OOOOO_O__X_XX
1	a1	XX_XO_OOOOO_O_OX_XX
1	a1	XX_XO_OOOOO_OO_X_XX
1	a1	XX_XO_OOOOO_OOOX_XX
1	a1	XX_XO_OOOOOO___X_XX
1	a1	XX_XO_OOOOOO__OX_XX
1	a1	XX_XO_OOOOOO_O_X_XX
1	a1	XX_XO_OOOOOO_OOX_XX
1	a1	XX_XO_OOOOOOO__X_XX
1	a1	XX_XO_OOOOOOO_OX_XX
1	a1	XX_XO_OOOOOOOO_X_XX
1	a1	XX_XO_OOOOOOOOOX_XX
1	31	XX_XOO___O_____X_XX
1	31	XX_XOO___O____OX_XX
1	31	XX_XOO___O___O_X_XX
1	31	XX_XOO___O___OOX_XX
1	41	XX_XOO___O__O__X_XX
1	41	XX_XOO___O__O_OX_XX
1	51	XX_XOO___O__OO_X_XX
1	51	XX_XOO___O__OOOX_XX
1	41	XX_XOO___O_O___X_XX
1	41	XX_XOO___O_O__OX_XX
1	51	XX_XOO___O_O_O_X_XX
1	51	XX_XOO___O_O_OOX_XX
1	61	XX_XOO___O_OO__X_XX
1	61	XX_XOO___O_OO_OX_XX
1	71	XX_XOO___O_OOO_X_XX
1	71	XX_XOO___O_OOOOX_XX
1	41	XX_XOO___OO____X_XX
1	41	XX_XOO___OO___OX_XX
1	51	XX_XOO___OO__O_X_XX
1	51	XX_XOO___OO__OOX_XX
1	61	XX_XOO___OO_O__X_XX
1	61	XX_XOO___OO_O_OX_XX
1	71	XX_XOO___OO_OO_X_XX
1	71	XX_XOO___OO_OOOX_XX
1	61	XX_XOO___OOO___X_XX
1	61	XX_XOO___OOO__OX_XX
1	71	XX_XOO___OOO_O_X_XX
1	71	XX_XOO___OOO_OOX_XX
1	81	XX_XOO___OOOO__X_XX
1	81	XX_XOO___OOOO_OX_XX
1	a1	XX_XOO___OOOOO_X_XX
1	a1	XX_XOO___OOOOOOX_XX
1	51	XX_XOO__OO_____X_XX
1	51	XX_XOO__OO____OX_XX
1	51	XX_XOO__OO___O_X_XX
1	51	XX_XOO__OO___OOX_XX
1	51	XX_XOO__OO__O__X_XX
1	51	XX_XOO__OO__O_OX_XX
1	51	XX_XOO__OO__OO_X_XX
1	51	XX_XOO__OO__OOOX_XX
1	61	XX_XOO__OO_O___X_XX
1	61	XX_XOO__OO_O__OX_XX
1	61	XX_XOO__OO_O_O_X_XX
1	61	XX_XOO__OO_O_OOX_XX
1	71	XX_XOO__OO_OO__X_XX
1	71	XX_XOO__OO_OO_OX_XX
1	71	XX_XOO__OO_OOO_X_XX
1	71	XX_XOO__OO_OOOOX_XX
1	61	XX_XOO__OOO____X_XX
1	61	XX_XOO__OOO___OX_XX
1	61	XX_XOO__OOO__O_X_XX
1	61	XX_XOO__OOO__OOX_XX
1	71	XX_XOO__OOO_O__X_XX
1	71	XX_XOO__OOO_O_OX_XX
1	71	XX_XOO__OOO_OO_X_XX
1	71	XX_XOO__OOO_OOOX_XX
1	81	XX_XOO__OOOO___X_XX
1	81	XX_XOO__OOOO__OX_XX
1	81	XX_XOO__OOOO_O_X_XX
1	81	XX_XOO__OOOO_OOX_XX
1	a1	XX_XOO__OOOOO__X_XX
1	a1	XX_XOO__OOOOO_OX_XX
1	a1	XX_XOO__OOOOOO_X_XX
1	a1	XX_XOO__OOOOOOOX_XX
1	51	XX_XOO_O_O_____X_XX
1	51	XX_XOO_O_O____OX_XX
1	51	XX_XOO_O_O___O_X_XX
1	51	XX_XOO_O_O___OOX_XX
1	51	XX_XOO_O_O__O__X_XX
1	51	XX_XOO_O_O__O_OX_XX
1	51	XX_XOO_O_O__OO_X_XX
1	51	XX_XOO_O_O__OOOX_XX
1	51	XX_XOO_O_O_O___X_XX
1	51	XX_XOO_O_O_O__OX_XX
1	51	XX_XOO_O_O_O_O_X_XX
1	51	XX_XOO_O_O_O_OOX_XX
1	61	XX_XOO_O_O_OO__X_XX
1	61	XX_XOO_O_O_OO_OX_XX
1	71	XX_XOO_O_O_OOO_X_XX
1	71	XX_XOO_O_O_OOOOX_XX
1	61	XX_XOO_O_OO____X_XX
1	61	XX_XOO_O_OO___OX_XX
1	61	XX_XOO_O_OO__O_X_XX
1	61	XX_XOO_O_OO__OOX_XX
1	61	XX_XOO_O_OO_O__X_XX
1	61	XX_XOO_O_OO_O_OX_XX
1	71	XX_XOO_O_OO_OO_X_XX
1	71	XX_XOO_O_OO_OOOX_XX
1	71	XX_XOO_O_OOO___X_XX
1	71	XX_XOO_O_OOO__OX_XX
1	72	XX_XOO_O_OOO_O_X_XX
1	72	XX_XOO_O_OOO_OOX_XX
1	81	XX_XOO_O_OOOO__X_XX
1	81	XX_XOO_O_OOOO_OX_XX
1	a1	XX_XOO_O_OOOOO_X_XX
1	a1	XX_XOO_O_OOOOOOX_XX
1	71	XX_XOO_OOO_____X_XX
1	71	XX_XOO_OOO____OX_XX
1	71	XX_XOO_OOO___O_X_XX
1	71	XX_XOO_OOO___OOX_XX
1	71	XX_XOO_OOO__O__X_XX
1	71	XX_XOO_OOO__O_OX_XX
1	71	XX_XOO_OOO__OO_X_XX
1	71	XX_XOO_OOO__OOOX_XX
1	72	XX_XOO_OOO_O___X_XX
1	72	XX_XOO_OOO_O__OX_XX
1	72	XX_XOO_OOO_O_O_X_XX
1	72	XX_XOO_OOO_O_OOX_XX
1	72	XX_XOO_OOO_OO__X_XX
1	72	XX_XOO_OOO_OO_OX_XX
1	72	XX_XOO_OOO_OOO_X_XX
1	72	XX_XOO_OOO_OOOOX_XX
1	81	XX_XOO_OOOO____X_XX
1	81	XX_XOO_OOOO___OX_XX
1	81	XX_XOO_OOOO__O_X_XX
1	81	XX_XOO_OOOO__OOX_XX
1	81	XX_XOO_OOOO_O__X_XX
1	81	XX_XOO_OOOO_O_OX_XX
1	81	XX_XOO_OOOO_OO_X_XX
1	81	XX_XOO_OOOO_OOOX_XX
1	a1	XX_XOO_OOOOO___X_XX
1	a1	XX_XOO_OOOOO__OX_XX
1	a1	XX_XOO_OOOOO_O_X_XX
1	a1	XX_XOO_OOOOO_OOX_XX
1	a1	XX_XOO_OOOOOO__X_XX
1	a1	XX_XOO_OOOOOO_OX_XX
1	a1	XX_XOO_OOOOOOO_X_XX
1	a1	XX_XOO_OOOOOOOOX_XX
1	51	XX_XOOO__O_____X_XX
1	51	XX_XOOO__O____OX_XX
1	51	XX_XOOO__O___O_X_XX
1	51	XX_XOOO__O___OOX_XX
1	51	XX_XOOO__O__O__X_XX
1	51	XX_XOOO__O__O_OX_XX
1	51	XX_XOOO__O__OO_X_XX
1	51	XX_XOOO__O__OOOX_XX
1	51	XX_XOOO__O_O___X_XX
1	51	XX_XOOO__O_O__OX_XX
1	51	XX_XOOO__O_O_O_X_XX
1	51	XX_XOOO__O_O_OOX_XX
1	61	XX_XOOO__O_OO__X_XX
1	61	XX_XOOO__O_OO_OX_XX
1	71	XX_XOOO__O_OOO_X_XX
1	71	XX_XOOO__O_OOOOX_XX
1	51	XX_XOOO__OO____X_XX
1	51	XX_XOOO__OO___OX_XX
1	51	XX_XOOO__OO__O_X_XX
1	51	XX_XOOO__OO__OOX_XX
1	61	XX_XOOO__OO_O__X_XX
1	61	XX_XOOO__OO_O_OX_XX
1	71	XX_XOOO__OO_OO_X_XX
1	71	XX_XOOO__OO_OOOX_XX
1	61	XX_XOOO__OOO___X_XX
1	61	XX_XOOO__OOO__OX_XX
1	71	XX_XOOO__OOO_O_X_XX
1	71	XX_XOOO__OOO_OOX_XX
1	81	XX_XOOO__OOOO__X_XX
1	81	XX_XOOO__OOOO_OX_XX
1	a1	XX_XOOO__OOOOO_X_XX
1	a1	XX_XOOO__OOOOOOX_XX
1	71	XX_XOOO_OO_____X_XX
1	71	XX_XOOO_OO____OX_XX
1	71	XX_XOOO_OO___O_X_XX
1	71	XX_XOOO_OO___OOX_XX
1	71	XX_XOOO_OO__O__X_XX
1	71	XX_XOOO_OO__O_OX_XX
1	71	XX_XOOO_OO__OO_X_XX
1	71	XX_XOOO_OO__OOOX_XX
1	71	XX_XOOO_OO_O___X_XX
1	71	XX_XOOO_OO_O__OX_XX
1	71	XX_XOOO_OO_O_O_X_XX
1	71	XX_XOOO_OO_O_OOX_XX
1	72	XX_XOOO_OO_OO__X_XX
1	72	XX_XOOO_OO_OO_OX_XX
1	72	XX_XOOO_OO_OOO_X_XX
1	72	XX_XOOO_OO_OOOOX_XX
1	71	XX_XOOO_OOO____X_XX
1	71	XX_XOOO_OOO___OX_XX
1	71	XX_XOOO_OOO__O_X_XX
1	71	XX_XOOO_OOO__OOX_XX
1	72	XX_XOOO_OOO_O__X_XX
1	72	XX_XOOO_OOO_O_OX_XX
1	72	XX_XOOO_OOO_OO_X_XX
1	72	XX_XOOO_OOO_OOOX_XX
1	81	XX_XOOO_OOOO___X_XX
1	81	XX_XOOO_OOOO__OX_XX
1	81	XX_XOOO_OOOO_O_X_XX
1	81	XX_XOOO_OOOO_OOX_XX
1	a1	XX_XOOO_OOOOO__X_XX
1	a1	XX_XOOO_OOOOO_OX_XX
1	a1	XX_XOOO_OOOOOO_X_XX
1	a1	XX_XOOO_OOOOOOOX_XX
1	71	XX_XOOOO_O_____X_XX
1	71	XX_XOOOO_O____OX_XX
1	71	XX_XOOOO_O___O_X_XX
1	71	XX_XOOOO_O___OOX_XX
1	71	XX_XOOOO_O__O__X_XX
1	71	XX_XOOOO_O__O_OX_XX
1	71	XX_XOOOO_O__OO_X_XX
1	71	XX_XOOOO_O__OOOX_XX
1	71	XX_XOOOO_O_O___X_XX
1	71	XX_XOOOO_O_O__OX_XX
1	71	XX_XOOOO_O_O_O_X_XX
1	71	XX_XOOOO_O_O_OOX_XX
1	71	XX_XOOOO_O_OO__X_XX
1	71	XX_XOOOO_O_OO_OX_XX
1	72	XX_XOOOO_O_OOO_X_XX
1	72	XX_XOOOO_O_OOOOX_XX
1	71	XX_XOOOO_OO____X_XX
1	71	XX_XOOOO_OO___OX_XX
1	71	XX_XOOOO_OO__O_X_XX
1	71	XX_XOOOO_OO__OOX_XX
1	71	XX_XOOOO_OO_O__X_XX
1	71	XX_XOOOO_OO_O_OX_XX
1	72	XX_XOOOO_OO_OO_X_XX
1	72	XX_XOOOO_OO_OOOX_XX
1	71	XX_XOOOO_OOO___X_XX
1	71	XX_XOOOO_OOO__OX_XX
1	72	XX_XOOOO_OOO_O_X_XX
1	72	XX_XOOOO_OOO_OOX_XX
1	81	XX_XOOOO_OOOO__X_XX
1	81	XX_XOOOO_OOOO_OX_XX
1	a1	XX_XOOOO_OOOOO_X_XX
1	a1	XX_XOOOO_OOOOOOX_XX
1	a1	XX_XOOOOOO_____X_XX
1	a1	XX_XOOOOOO____OX_XX
1	a1	XX_XOOOOOO___O_X_XX
1	a1	XX_XOOOOOO___OOX_XX
1	a1	XX_XOOOOOO__O__X_XX
1	a1	XX_XOOOOOO__O_OX_XX
1	a1	XX_XOOOOOO__OO_X_XX
1	a1	XX_XOOOOOO__OOOX_XX
1	a1	XX_XOOOOOO_O___X_XX
1	a1	XX_XOOOOOO_O__OX_XX
1	a1	XX_XOOOOOO_O_O_X_XX
1	a1	XX_XOOOOOO_O_OOX_XX
1	a1	XX_XOOOOOO_OO__X_XX
1	a1	XX_XOOOOOO_OO_OX_XX
1	a1	XX_XOOOOOO_OOO_X_XX
1	a1	XX_XOOOOOO_OOOOX_XX
1	a1	XX_XOOOOOOO____X_XX
1	a1	XX_XOOOOOOO___OX_XX
1	a1	XX_XOOOOOOO__O_X_XX
1	a1	XX_XOOOOOOO__OOX_XX
1	a1	XX_XOOOOOOO_O__X_XX
1	a1	XX_XOOOOOOO_O_OX_XX
1	a1	XX_XOOOOOOO_OO_X_XX
1	a1	XX_XOOOOOOO_OOOX_XX
1	a1	XX_XOOOOOOOO___X_XX
1	a1	XX_XOOOOOOOO__OX_XX
1	a1	XX_XOOOOOOOO_O_X_XX
1	a1	XX_XOOOOOOOO_OOX_XX
1	a1	XX_XOOOOOOOOO__X_XX
1	a1	XX_XOOOOOOOOO_OX_XX
1	a1	XX_XOOOOOOOOOO_X_XX
1	a1	XX_XOOOOOOOOOOOX_XX`

var table = str.split("\n").map(function(d) {
  return d.split("\t").slice(1);
});

var map = {};

var r = /X[^O]*X/g;

for(var i=0;i<table.length;i++) {
  var row = table[i];
  var key = row[1].replace(r, "");
  map[key] = row[0];
}

module.exports = map;

},{}],13:[function(require,module,exports){
var flat = require("./flat.js");
var eRow = require("./evaluate-row.js");
var r = require("./role");
var S = require("./score.js");

module.exports = function(board) {
  var rows = flat(board);

  for(var i=0;i<rows.length;i++) {
    var value = eRow(rows[i], r.com);
    if(value >= S.FIVE) {
      return r.com;
    } 
    value = eRow(rows[i], r.hum);
    if (value >= S.FIVE) {
      return r.hum;
    }
  }
  return r.empty;
}

},{"./evaluate-row.js":4,"./flat.js":7,"./role":10,"./score.js":11}]},{},[1]);
