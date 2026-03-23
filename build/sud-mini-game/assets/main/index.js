System.register("chunks:///_virtual/Block.js", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inherits, _createClass, _classCallCheck, _callSuper, _initializerDefineProperty, _defineProperty, cclegacy, _decorator, Color, Label, Sprite, tween, Component;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inherits = module.inherits;
      _createClass = module.createClass;
      _classCallCheck = module.classCallCheck;
      _callSuper = module.callSuper;
      _initializerDefineProperty = module.initializerDefineProperty;
      _defineProperty = module.defineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Color = module.Color;
      Label = module.Label;
      Sprite = module.Sprite;
      tween = module.tween;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _class, _class2, _descriptor;
      cclegacy._RF.push({}, "dfc43mO+D1Ge4/GT/0XcsY1", "Block", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var colors = {
        2: new Color(238, 228, 218),
        4: new Color(237, 224, 200),
        8: new Color(242, 177, 121),
        16: new Color(245, 149, 99),
        32: new Color(246, 124, 95),
        64: new Color(246, 94, 59),
        128: new Color(237, 207, 114),
        256: new Color(237, 204, 97),
        512: new Color(237, 200, 80),
        1024: new Color(237, 197, 63),
        2048: new Color(237, 194, 46)
      };
      var Block = exports('Block', (_dec = ccclass('Block'), _dec2 = property(Label), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        function Block() {
          var _this;
          _classCallCheck(this, Block);
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _callSuper(this, Block, [].concat(args));
          _initializerDefineProperty(_this, "numberLabel", _descriptor, _this);
          _defineProperty(_this, "_value", 0);
          return _this;
        }
        _inherits(Block, _Component);
        return _createClass(Block, [{
          key: "value",
          get: function get() {
            return this._value;
          },
          set: function set(v) {
            this._value = v;
            if (this.numberLabel) {
              this.numberLabel.string = v > 0 ? v.toString() : '';
              this.numberLabel.color = v < 8 ? new Color(119, 110, 101) : new Color(249, 246, 242);
            }
            var sprite = this.getComponent(Sprite);
            if (sprite) {
              sprite.color = colors[v] || new Color(60, 58, 50);
            }
          }
        }, {
          key: "init",
          value: function init(val) {
            this.value = val;
          }
        }, {
          key: "moveTo",
          value: function moveTo(pos, callback) {
            tween(this.node).to(0.1, {
              position: pos
            }).call(function () {
              if (callback) callback();
            }).start();
          }
        }]);
      }(Component), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "numberLabel", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GameManager.js", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Block.js'], function (exports) {
  var _applyDecoratedDescriptor, _inherits, _createClass, _classCallCheck, _callSuper, _initializerDefineProperty, _defineProperty, cclegacy, _decorator, Prefab, Node, Label, SpriteFrame, input, Input, Button, UITransform, Sprite, Color, Vec3, instantiate, tween, KeyCode, Component, Block;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inherits = module.inherits;
      _createClass = module.createClass;
      _classCallCheck = module.classCallCheck;
      _callSuper = module.callSuper;
      _initializerDefineProperty = module.initializerDefineProperty;
      _defineProperty = module.defineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Prefab = module.Prefab;
      Node = module.Node;
      Label = module.Label;
      SpriteFrame = module.SpriteFrame;
      input = module.input;
      Input = module.Input;
      Button = module.Button;
      UITransform = module.UITransform;
      Sprite = module.Sprite;
      Color = module.Color;
      Vec3 = module.Vec3;
      instantiate = module.instantiate;
      tween = module.tween;
      KeyCode = module.KeyCode;
      Component = module.Component;
    }, function (module) {
      Block = module.Block;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
      cclegacy._RF.push({}, "705afJNKaNIKYm0JDxksvtk", "GameManager", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var GameManager = exports('GameManager', (_dec = ccclass('GameManager'), _dec2 = property(Prefab), _dec3 = property(Node), _dec4 = property(Label), _dec5 = property(Node), _dec6 = property(SpriteFrame), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        function GameManager() {
          var _this;
          _classCallCheck(this, GameManager);
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _callSuper(this, GameManager, [].concat(args));
          _initializerDefineProperty(_this, "blockPrefab", _descriptor, _this);
          _initializerDefineProperty(_this, "boardNode", _descriptor2, _this);
          _initializerDefineProperty(_this, "scoreLabel", _descriptor3, _this);
          _initializerDefineProperty(_this, "gameOverPanel", _descriptor4, _this);
          _initializerDefineProperty(_this, "cellSpriteFrame", _descriptor5, _this);
          _defineProperty(_this, "blocks", []);
          _defineProperty(_this, "score", 0);
          _defineProperty(_this, "isMoving", false);
          _defineProperty(_this, "touchStartPos", new Vec3());
          return _this;
        }
        _inherits(GameManager, _Component);
        return _createClass(GameManager, [{
          key: "start",
          value: function start() {
            input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
            input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
            input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
            if (this.gameOverPanel) {
              var restartBtn = this.gameOverPanel.getChildByName('RestartButton');
              if (restartBtn) {
                restartBtn.on(Button.EventType.CLICK, this.onRestartClick, this);
              }
            }
            this.initGame();
          }
        }, {
          key: "onDestroy",
          value: function onDestroy() {
            input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
            input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
            input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
          }
        }, {
          key: "initGame",
          value: function initGame() {
            this.score = 0;
            this.updateScore();
            if (this.gameOverPanel) this.gameOverPanel.active = false;
            if (this.boardNode) {
              this.boardNode.removeAllChildren();
              // Create background cells
              for (var r = 0; r < 4; r++) {
                for (var c = 0; c < 4; c++) {
                  var bgCell = new Node('BgCell');
                  bgCell.addComponent(UITransform).setContentSize(90, 90);
                  var sp = bgCell.addComponent(Sprite);
                  sp.spriteFrame = this.cellSpriteFrame;
                  sp.sizeMode = 0; // CUSTOM size mode
                  sp.color = new Color(205, 193, 180);
                  bgCell.setPosition(this.getPosition(r, c));
                  this.boardNode.addChild(bgCell);
                }
              }
            }
            this.blocks = [];
            for (var i = 0; i < 4; i++) {
              this.blocks[i] = [null, null, null, null];
            }
            this.spawnBlock();
            this.spawnBlock();
          }
        }, {
          key: "getPosition",
          value: function getPosition(row, col) {
            var x = (col - 1.5) * 100;
            var y = (1.5 - row) * 100;
            return new Vec3(x, y, 0);
          }
        }, {
          key: "spawnBlock",
          value: function spawnBlock() {
            var emptyCells = [];
            for (var r = 0; r < 4; r++) {
              for (var c = 0; c < 4; c++) {
                if (this.blocks[r][c] === null) {
                  emptyCells.push({
                    r: r,
                    c: c
                  });
                }
              }
            }
            if (emptyCells.length === 0) return;
            var randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            var val = Math.random() < 0.9 ? 2 : 4;
            var blockNode = instantiate(this.blockPrefab);
            blockNode.setPosition(this.getPosition(randomCell.r, randomCell.c));
            this.boardNode.addChild(blockNode);
            var block = blockNode.getComponent(Block);
            block.init(val);
            this.blocks[randomCell.r][randomCell.c] = block;
            blockNode.setScale(new Vec3(0, 0, 0));
            tween(blockNode).to(0.1, {
              scale: new Vec3(1, 1, 1)
            }).start();
          }
        }, {
          key: "onKeyDown",
          value: function onKeyDown(event) {
            if (this.isMoving || this.gameOverPanel && this.gameOverPanel.active) return;
            switch (event.keyCode) {
              case KeyCode.ARROW_UP:
                this.move(0, -1);
                break;
              case KeyCode.ARROW_DOWN:
                this.move(0, 1);
                break;
              case KeyCode.ARROW_LEFT:
                this.move(-1, 0);
                break;
              case KeyCode.ARROW_RIGHT:
                this.move(1, 0);
                break;
            }
          }
        }, {
          key: "onTouchStart",
          value: function onTouchStart(event) {
            var pos = event.getLocation();
            this.touchStartPos.set(pos.x, pos.y, 0);
          }
        }, {
          key: "onTouchEnd",
          value: function onTouchEnd(event) {
            if (this.isMoving || this.gameOverPanel && this.gameOverPanel.active) return;
            var pos = event.getLocation();
            var dx = pos.x - this.touchStartPos.x;
            var dy = pos.y - this.touchStartPos.y;
            if (Math.abs(dx) > Math.abs(dy)) {
              // Horizontal swipe
              if (Math.abs(dx) > 50) {
                if (dx > 0) {
                  this.move(1, 0); // Right
                } else {
                  this.move(-1, 0); // Left
                }
              }
            } else {
              // Vertical swipe
              if (Math.abs(dy) > 50) {
                if (dy > 0) {
                  this.move(0, -1); // Up (Cocos y is up, but our grid row 0 is top, so dy>0 means swipe up -> move to row 0 -> dirY=-1)
                } else {
                  this.move(0, 1); // Down
                }
              }
            }
          }
        }, {
          key: "move",
          value: function move(dirX, dirY) {
            var _this2 = this;
            var moved = false;
            this.isMoving = true;
            var moveCount = 0;
            var completedCount = 0;
            var checkCompletion = function checkCompletion() {
              completedCount++;
              if (completedCount === moveCount) {
                if (moved) {
                  _this2.spawnBlock();
                  _this2.updateScore();
                  if (_this2.checkGameOver()) {
                    if (_this2.gameOverPanel) _this2.gameOverPanel.active = true;
                  }
                }
                _this2.isMoving = false;
              }
            };
            var startRow = dirY === 1 ? 2 : dirY === -1 ? 1 : 0;
            var endRow = dirY === 1 ? -1 : dirY === -1 ? 4 : 4;
            var stepRow = dirY === 1 ? -1 : 1;
            var startCol = dirX === 1 ? 2 : dirX === -1 ? 1 : 0;
            var endCol = dirX === 1 ? -1 : dirX === -1 ? 4 : 4;
            var stepCol = dirX === 1 ? -1 : 1;
            var merged = [];
            for (var i = 0; i < 4; i++) merged[i] = [false, false, false, false];
            for (var r = startRow; r !== endRow; r += stepRow) {
              var _loop = function _loop() {
                if (_this2.blocks[r][c] !== null) {
                  var currR = r;
                  var currC = c;
                  var nextR = r + dirY;
                  var nextC = c + dirX;
                  while (nextR >= 0 && nextR < 4 && nextC >= 0 && nextC < 4) {
                    if (_this2.blocks[nextR][nextC] === null) {
                      currR = nextR;
                      currC = nextC;
                      nextR += dirY;
                      nextC += dirX;
                    } else if (_this2.blocks[nextR][nextC].value === _this2.blocks[r][c].value && !merged[nextR][nextC]) {
                      currR = nextR;
                      currC = nextC;
                      break;
                    } else {
                      break;
                    }
                  }
                  if (currR !== r || currC !== c) {
                    moved = true;
                    moveCount++;
                    var block = _this2.blocks[r][c];
                    _this2.blocks[r][c] = null;
                    var targetBlock = _this2.blocks[currR][currC];
                    if (targetBlock !== null) {
                      merged[currR][currC] = true;
                      _this2.blocks[currR][currC] = block;
                      block.moveTo(_this2.getPosition(currR, currC), function () {
                        block.value *= 2;
                        _this2.score += block.value;
                        targetBlock.node.destroy();
                        checkCompletion();
                      });
                    } else {
                      _this2.blocks[currR][currC] = block;
                      block.moveTo(_this2.getPosition(currR, currC), function () {
                        checkCompletion();
                      });
                    }
                  }
                }
              };
              for (var c = startCol; c !== endCol; c += stepCol) {
                _loop();
              }
            }
            if (moveCount === 0) {
              this.isMoving = false;
            }
          }
        }, {
          key: "updateScore",
          value: function updateScore() {
            if (this.scoreLabel) {
              this.scoreLabel.string = 'Score: ' + this.score;
            }
          }
        }, {
          key: "checkGameOver",
          value: function checkGameOver() {
            for (var r = 0; r < 4; r++) {
              for (var c = 0; c < 4; c++) {
                if (this.blocks[r][c] === null) return false;
              }
            }
            for (var _r = 0; _r < 4; _r++) {
              for (var _c = 0; _c < 4; _c++) {
                if (_r < 3 && this.blocks[_r][_c].value === this.blocks[_r + 1][_c].value) return false;
                if (_c < 3 && this.blocks[_r][_c].value === this.blocks[_r][_c + 1].value) return false;
              }
            }
            return true;
          }
        }, {
          key: "onRestartClick",
          value: function onRestartClick() {
            this.initGame();
          }
        }]);
      }(Component), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "blockPrefab", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "boardNode", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "scoreLabel", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "gameOverPanel", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "cellSpriteFrame", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main.js", ['./Block.js', './GameManager.js'], function () {
  return {
    setters: [null, null],
    execute: function () {}
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main.js'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2ZpbGU6L0M6L3JlcG8vMjA0OC9hc3NldHMvU2NyaXB0cy9maWxlOi9DOi9yZXBvLzIwNDgvYXNzZXRzL1NjcmlwdHMvQmxvY2sudHMiLCIuLi9maWxlOi9DOi9yZXBvLzIwNDgvYXNzZXRzL1NjcmlwdHMvZmlsZTovQzovcmVwby8yMDQ4L2Fzc2V0cy9TY3JpcHRzL0dhbWVNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbImNjY2xhc3MiLCJfZGVjb3JhdG9yIiwicHJvcGVydHkiLCJjb2xvcnMiLCJDb2xvciIsIkJsb2NrIiwiX2RlYyIsIl9kZWMyIiwiTGFiZWwiLCJfY2xhc3MiLCJfY2xhc3MyIiwiX0NvbXBvbmVudCIsIl90aGlzIiwiX2NsYXNzQ2FsbENoZWNrIiwiX2xlbiIsImFyZ3VtZW50cyIsImxlbmd0aCIsImFyZ3MiLCJBcnJheSIsIl9rZXkiLCJfY2FsbFN1cGVyIiwiY29uY2F0IiwiX2luaXRpYWxpemVyRGVmaW5lUHJvcGVydHkiLCJfZGVzY3JpcHRvciIsIl9kZWZpbmVQcm9wZXJ0eSIsIl9pbmhlcml0cyIsIl9jcmVhdGVDbGFzcyIsImtleSIsImdldCIsIl92YWx1ZSIsInNldCIsInYiLCJudW1iZXJMYWJlbCIsInN0cmluZyIsInRvU3RyaW5nIiwiY29sb3IiLCJzcHJpdGUiLCJnZXRDb21wb25lbnQiLCJTcHJpdGUiLCJ2YWx1ZSIsImluaXQiLCJ2YWwiLCJtb3ZlVG8iLCJwb3MiLCJjYWxsYmFjayIsInR3ZWVuIiwibm9kZSIsInRvIiwicG9zaXRpb24iLCJjYWxsIiwic3RhcnQiLCJDb21wb25lbnQiLCJfYXBwbHlEZWNvcmF0ZWREZXNjcmlwdG9yIiwicHJvdG90eXBlIiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIndyaXRhYmxlIiwiaW5pdGlhbGl6ZXIiLCJfY2NsZWdhY3kiLCJfUkYiLCJwb3AiLCJHYW1lTWFuYWdlciIsIlByZWZhYiIsIl9kZWMzIiwiTm9kZSIsIl9kZWM0IiwiX2RlYzUiLCJfZGVjNiIsIlNwcml0ZUZyYW1lIiwiX2Rlc2NyaXB0b3IyIiwiX2Rlc2NyaXB0b3IzIiwiX2Rlc2NyaXB0b3I0IiwiX2Rlc2NyaXB0b3I1IiwiVmVjMyIsImlucHV0Iiwib24iLCJJbnB1dCIsIkV2ZW50VHlwZSIsIktFWV9ET1dOIiwib25LZXlEb3duIiwiVE9VQ0hfU1RBUlQiLCJvblRvdWNoU3RhcnQiLCJUT1VDSF9FTkQiLCJvblRvdWNoRW5kIiwiZ2FtZU92ZXJQYW5lbCIsInJlc3RhcnRCdG4iLCJnZXRDaGlsZEJ5TmFtZSIsIkJ1dHRvbiIsIkNMSUNLIiwib25SZXN0YXJ0Q2xpY2siLCJpbml0R2FtZSIsIm9uRGVzdHJveSIsIm9mZiIsInNjb3JlIiwidXBkYXRlU2NvcmUiLCJhY3RpdmUiLCJib2FyZE5vZGUiLCJyZW1vdmVBbGxDaGlsZHJlbiIsInIiLCJjIiwiYmdDZWxsIiwiYWRkQ29tcG9uZW50IiwiVUlUcmFuc2Zvcm0iLCJzZXRDb250ZW50U2l6ZSIsInNwIiwic3ByaXRlRnJhbWUiLCJjZWxsU3ByaXRlRnJhbWUiLCJzaXplTW9kZSIsInNldFBvc2l0aW9uIiwiZ2V0UG9zaXRpb24iLCJhZGRDaGlsZCIsImJsb2NrcyIsImkiLCJzcGF3bkJsb2NrIiwicm93IiwiY29sIiwieCIsInkiLCJlbXB0eUNlbGxzIiwicHVzaCIsInJhbmRvbUNlbGwiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJibG9ja05vZGUiLCJpbnN0YW50aWF0ZSIsImJsb2NrUHJlZmFiIiwiYmxvY2siLCJzZXRTY2FsZSIsInNjYWxlIiwiZXZlbnQiLCJpc01vdmluZyIsImtleUNvZGUiLCJLZXlDb2RlIiwiQVJST1dfVVAiLCJtb3ZlIiwiQVJST1dfRE9XTiIsIkFSUk9XX0xFRlQiLCJBUlJPV19SSUdIVCIsImdldExvY2F0aW9uIiwidG91Y2hTdGFydFBvcyIsImR4IiwiZHkiLCJhYnMiLCJkaXJYIiwiZGlyWSIsIl90aGlzMiIsIm1vdmVkIiwibW92ZUNvdW50IiwiY29tcGxldGVkQ291bnQiLCJjaGVja0NvbXBsZXRpb24iLCJjaGVja0dhbWVPdmVyIiwic3RhcnRSb3ciLCJlbmRSb3ciLCJzdGVwUm93Iiwic3RhcnRDb2wiLCJlbmRDb2wiLCJzdGVwQ29sIiwibWVyZ2VkIiwiX2xvb3AiLCJjdXJyUiIsImN1cnJDIiwibmV4dFIiLCJuZXh0QyIsInRhcmdldEJsb2NrIiwiZGVzdHJveSIsInNjb3JlTGFiZWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BQ0EsSUFBUUEsT0FBTyxHQUFlQyxVQUFVLENBQWhDRCxPQUFPO1FBQUVFLFFBQVEsR0FBS0QsVUFBVSxDQUF2QkMsUUFBUTtNQUV6QixJQUFNQyxNQUFnQyxHQUFHO1FBQ3JDLENBQUMsRUFBRSxJQUFJQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7UUFDM0IsQ0FBQyxFQUFFLElBQUlBLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztRQUMzQixDQUFDLEVBQUUsSUFBSUEsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1FBQzNCLEVBQUUsRUFBRSxJQUFJQSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUM7UUFDM0IsRUFBRSxFQUFFLElBQUlBLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztRQUMzQixFQUFFLEVBQUUsSUFBSUEsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQzFCLEdBQUcsRUFBRSxJQUFJQSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7UUFDN0IsR0FBRyxFQUFFLElBQUlBLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztRQUM1QixHQUFHLEVBQUUsSUFBSUEsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO1FBQzVCLElBQUksRUFBRSxJQUFJQSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFB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QUEsSUFBQTtRQUFBQyxVQUFBLEVBQUEsSUFBQTtRQUFBQyxRQUFBLEVBQUEsSUFBQTtRQUFBQyxXQUFBLFdBQUFBLFdBQUFBLENBQUEsRUFBQTtVQUFBLE9BQ0gsSUFBSTtRQUFBO01BQUEsQ0FBQWUsQ0FBQUEsRUFBQUEsWUFBQSxHQUFBcEIseUJBQUEsQ0FBQTFDLE9BQUEsQ0FBQTJDLFNBQUEsc0JBQUFjLEtBQUEsQ0FBQSxFQUFBO1FBQUFiLFlBQUEsRUFBQSxJQUFBO1FBQUFDLFVBQUEsRUFBQSxJQUFBO1FBQUFDLFFBQUEsRUFBQSxJQUFBO1FBQUFDLFdBQUEsV0FBQUEsV0FBQUEsQ0FBQSxFQUFBO1VBQUEsT0FDWSxJQUFJO1FBQUE7TUFBQSxDQUFBL0MsQ0FBQUEsRUFBQUEsT0FBQSxNQUFBRCxNQUFBLENBQUEsQ0FBQTtNQW1QcEVpRCxRQUFBLENBQUFDLEdBQUEsQ0FBQUMsR0FBQSxDQUFBLENBQUEiLCJmaWxlIjoiYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgX2RlY29yYXRvciwgQ29tcG9uZW50LCBMYWJlbCwgU3ByaXRlLCBDb2xvciwgVmVjMywgdHdlZW4gfSBmcm9tICdjYyc7XHJcbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IF9kZWNvcmF0b3I7XHJcblxyXG5jb25zdCBjb2xvcnM6IHsgW2tleTogbnVtYmVyXTogQ29sb3IgfSA9IHtcclxuICAgIDI6IG5ldyBDb2xvcigyMzgsIDIyOCwgMjE4KSxcclxuICAgIDQ6IG5ldyBDb2xvcigyMzcsIDIyNCwgMjAwKSxcclxuICAgIDg6IG5ldyBDb2xvcigyNDIsIDE3NywgMTIxKSxcclxuICAgIDE2OiBuZXcgQ29sb3IoMjQ1LCAxNDksIDk5KSxcclxuICAgIDMyOiBuZXcgQ29sb3IoMjQ2LCAxMjQsIDk1KSxcclxuICAgIDY0OiBuZXcgQ29sb3IoMjQ2LCA5NCwgNTkpLFxyXG4gICAgMTI4OiBuZXcgQ29sb3IoMjM3LCAyMDcsIDExNCksXHJcbiAgICAyNTY6IG5ldyBDb2xvcigyMzcsIDIwNCwgOTcpLFxyXG4gICAgNTEyOiBuZXcgQ29sb3IoMjM3LCAyMDAsIDgwKSxcclxuICAgIDEwMjQ6IG5ldyBDb2xvcigyMzcsIDE5NywgNjMpLFxyXG4gICAgMjA0ODogbmV3IENvbG9yKDIzNywgMTk0LCA0NiksXHJcbn07XHJcblxyXG5AY2NjbGFzcygnQmxvY2snKVxyXG5leHBvcnQgY2xhc3MgQmxvY2sgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgQHByb3BlcnR5KExhYmVsKVxyXG4gICAgbnVtYmVyTGFiZWw6IExhYmVsIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgcHJpdmF0ZSBfdmFsdWU6IG51bWJlciA9IDA7XHJcblxyXG4gICAgcHVibGljIGdldCB2YWx1ZSgpIHsgcmV0dXJuIHRoaXMuX3ZhbHVlOyB9XHJcbiAgICBwdWJsaWMgc2V0IHZhbHVlKHY6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX3ZhbHVlID0gdjtcclxuICAgICAgICBpZiAodGhpcy5udW1iZXJMYWJlbCkge1xyXG4gICAgICAgICAgICB0aGlzLm51bWJlckxhYmVsLnN0cmluZyA9IHYgPiAwID8gdi50b1N0cmluZygpIDogJyc7XHJcbiAgICAgICAgICAgIHRoaXMubnVtYmVyTGFiZWwuY29sb3IgPSB2IDwgOCA/IG5ldyBDb2xvcigxMTksIDExMCwgMTAxKSA6IG5ldyBDb2xvcigyNDksIDI0NiwgMjQyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgc3ByaXRlID0gdGhpcy5nZXRDb21wb25lbnQoU3ByaXRlKTtcclxuICAgICAgICBpZiAoc3ByaXRlKSB7XHJcbiAgICAgICAgICAgIHNwcml0ZS5jb2xvciA9IGNvbG9yc1t2XSB8fCBuZXcgQ29sb3IoNjAsIDU4LCA1MCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGluaXQodmFsOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdmFsO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVUbyhwb3M6IFZlYzMsIGNhbGxiYWNrPzogRnVuY3Rpb24pIHtcclxuICAgICAgICB0d2Vlbih0aGlzLm5vZGUpXHJcbiAgICAgICAgICAgIC50bygwLjEsIHsgcG9zaXRpb246IHBvcyB9KVxyXG4gICAgICAgICAgICAuY2FsbCgoKSA9PiB7IGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTsgfSlcclxuICAgICAgICAgICAgLnN0YXJ0KCk7XHJcbiAgICB9XHJcbn0iLCJpbXBvcnQgeyBfZGVjb3JhdG9yLCBDb21wb25lbnQsIE5vZGUsIFByZWZhYiwgaW5zdGFudGlhdGUsIExhYmVsLCBWZWMzLCBpbnB1dCwgSW5wdXQsIEV2ZW50S2V5Ym9hcmQsIEtleUNvZGUsIHR3ZWVuLCBTcHJpdGUsIFVJVHJhbnNmb3JtLCBDb2xvciwgQnV0dG9uLCBTcHJpdGVGcmFtZSwgRXZlbnRUb3VjaCB9IGZyb20gJ2NjJztcclxuaW1wb3J0IHsgQmxvY2sgfSBmcm9tICcuL0Jsb2NrJztcclxuY29uc3QgeyBjY2NsYXNzLCBwcm9wZXJ0eSB9ID0gX2RlY29yYXRvcjtcclxuXHJcbkBjY2NsYXNzKCdHYW1lTWFuYWdlcicpXHJcbmV4cG9ydCBjbGFzcyBHYW1lTWFuYWdlciBleHRlbmRzIENvbXBvbmVudCB7XHJcbiAgICBAcHJvcGVydHkoUHJlZmFiKSBibG9ja1ByZWZhYjogUHJlZmFiIHwgbnVsbCA9IG51bGw7XHJcbiAgICBAcHJvcGVydHkoTm9kZSkgYm9hcmROb2RlOiBOb2RlIHwgbnVsbCA9IG51bGw7XHJcbiAgICBAcHJvcGVydHkoTGFiZWwpIHNjb3JlTGFiZWw6IExhYmVsIHwgbnVsbCA9IG51bGw7XHJcbiAgICBAcHJvcGVydHkoTm9kZSkgZ2FtZU92ZXJQYW5lbDogTm9kZSB8IG51bGwgPSBudWxsO1xyXG4gICAgQHByb3BlcnR5KFNwcml0ZUZyYW1lKSBjZWxsU3ByaXRlRnJhbWU6IFNwcml0ZUZyYW1lIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgcHJpdmF0ZSBibG9ja3M6IChCbG9jayB8IG51bGwpW11bXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBzY29yZTogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgaXNNb3Zpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgIHByaXZhdGUgdG91Y2hTdGFydFBvczogVmVjMyA9IG5ldyBWZWMzKCk7XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgaW5wdXQub24oSW5wdXQuRXZlbnRUeXBlLktFWV9ET1dOLCB0aGlzLm9uS2V5RG93biwgdGhpcyk7XHJcbiAgICAgICAgaW5wdXQub24oSW5wdXQuRXZlbnRUeXBlLlRPVUNIX1NUQVJULCB0aGlzLm9uVG91Y2hTdGFydCwgdGhpcyk7XHJcbiAgICAgICAgaW5wdXQub24oSW5wdXQuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5vblRvdWNoRW5kLCB0aGlzKTtcclxuICAgICAgICBpZiAodGhpcy5nYW1lT3ZlclBhbmVsKSB7XHJcbiAgICAgICAgICAgIGxldCByZXN0YXJ0QnRuID0gdGhpcy5nYW1lT3ZlclBhbmVsLmdldENoaWxkQnlOYW1lKCdSZXN0YXJ0QnV0dG9uJyk7XHJcbiAgICAgICAgICAgIGlmIChyZXN0YXJ0QnRuKSB7XHJcbiAgICAgICAgICAgICAgICByZXN0YXJ0QnRuLm9uKEJ1dHRvbi5FdmVudFR5cGUuQ0xJQ0ssIHRoaXMub25SZXN0YXJ0Q2xpY2ssIHRoaXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW5pdEdhbWUoKTtcclxuICAgIH1cclxuXHJcbiAgICBvbkRlc3Ryb3koKSB7XHJcbiAgICAgICAgaW5wdXQub2ZmKElucHV0LkV2ZW50VHlwZS5LRVlfRE9XTiwgdGhpcy5vbktleURvd24sIHRoaXMpO1xyXG4gICAgICAgIGlucHV0Lm9mZihJbnB1dC5FdmVudFR5cGUuVE9VQ0hfU1RBUlQsIHRoaXMub25Ub3VjaFN0YXJ0LCB0aGlzKTtcclxuICAgICAgICBpbnB1dC5vZmYoSW5wdXQuRXZlbnRUeXBlLlRPVUNIX0VORCwgdGhpcy5vblRvdWNoRW5kLCB0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0R2FtZSgpIHtcclxuICAgICAgICB0aGlzLnNjb3JlID0gMDtcclxuICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2FtZU92ZXJQYW5lbCkgdGhpcy5nYW1lT3ZlclBhbmVsLmFjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5ib2FyZE5vZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5ib2FyZE5vZGUucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcclxuICAgICAgICAgICAgLy8gQ3JlYXRlIGJhY2tncm91bmQgY2VsbHNcclxuICAgICAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCA0OyByKyspIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgNDsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJnQ2VsbCA9IG5ldyBOb2RlKCdCZ0NlbGwnKTtcclxuICAgICAgICAgICAgICAgICAgICBiZ0NlbGwuYWRkQ29tcG9uZW50KFVJVHJhbnNmb3JtKS5zZXRDb250ZW50U2l6ZSg5MCwgOTApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzcCA9IGJnQ2VsbC5hZGRDb21wb25lbnQoU3ByaXRlKTtcclxuICAgICAgICAgICAgICAgICAgICBzcC5zcHJpdGVGcmFtZSA9IHRoaXMuY2VsbFNwcml0ZUZyYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIHNwLnNpemVNb2RlID0gMDsgLy8gQ1VTVE9NIHNpemUgbW9kZVxyXG4gICAgICAgICAgICAgICAgICAgIHNwLmNvbG9yID0gbmV3IENvbG9yKDIwNSwgMTkzLCAxODApO1xyXG4gICAgICAgICAgICAgICAgICAgIGJnQ2VsbC5zZXRQb3NpdGlvbih0aGlzLmdldFBvc2l0aW9uKHIsIGMpKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJvYXJkTm9kZSEuYWRkQ2hpbGQoYmdDZWxsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ibG9ja3MgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLmJsb2Nrc1tpXSA9IFtudWxsLCBudWxsLCBudWxsLCBudWxsXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc3Bhd25CbG9jaygpO1xyXG4gICAgICAgIHRoaXMuc3Bhd25CbG9jaygpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFBvc2l0aW9uKHJvdzogbnVtYmVyLCBjb2w6IG51bWJlcik6IFZlYzMge1xyXG4gICAgICAgIGxldCB4ID0gKGNvbCAtIDEuNSkgKiAxMDA7XHJcbiAgICAgICAgbGV0IHkgPSAoMS41IC0gcm93KSAqIDEwMDtcclxuICAgICAgICByZXR1cm4gbmV3IFZlYzMoeCwgeSwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3Bhd25CbG9jaygpIHtcclxuICAgICAgICBsZXQgZW1wdHlDZWxscyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgNDsgcisrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgNDsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ibG9ja3Nbcl1bY10gPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbXB0eUNlbGxzLnB1c2goeyByLCBjIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlbXB0eUNlbGxzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgcmFuZG9tQ2VsbCA9IGVtcHR5Q2VsbHNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZW1wdHlDZWxscy5sZW5ndGgpXTtcclxuICAgICAgICBsZXQgdmFsID0gTWF0aC5yYW5kb20oKSA8IDAuOSA/IDIgOiA0O1xyXG5cclxuICAgICAgICBsZXQgYmxvY2tOb2RlID0gaW5zdGFudGlhdGUodGhpcy5ibG9ja1ByZWZhYiEpO1xyXG4gICAgICAgIGJsb2NrTm9kZS5zZXRQb3NpdGlvbih0aGlzLmdldFBvc2l0aW9uKHJhbmRvbUNlbGwuciwgcmFuZG9tQ2VsbC5jKSk7XHJcbiAgICAgICAgdGhpcy5ib2FyZE5vZGUhLmFkZENoaWxkKGJsb2NrTm9kZSk7XHJcblxyXG4gICAgICAgIGxldCBibG9jayA9IGJsb2NrTm9kZS5nZXRDb21wb25lbnQoQmxvY2spITtcclxuICAgICAgICBibG9jay5pbml0KHZhbCk7XHJcbiAgICAgICAgdGhpcy5ibG9ja3NbcmFuZG9tQ2VsbC5yXVtyYW5kb21DZWxsLmNdID0gYmxvY2s7XHJcbiAgICAgICAgXHJcbiAgICAgICAgYmxvY2tOb2RlLnNldFNjYWxlKG5ldyBWZWMzKDAsIDAsIDApKTtcclxuICAgICAgICB0d2VlbihibG9ja05vZGUpLnRvKDAuMSwgeyBzY2FsZTogbmV3IFZlYzMoMSwgMSwgMSkgfSkuc3RhcnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBvbktleURvd24oZXZlbnQ6IEV2ZW50S2V5Ym9hcmQpIHtcclxuICAgICAgICBpZiAodGhpcy5pc01vdmluZyB8fCAodGhpcy5nYW1lT3ZlclBhbmVsICYmIHRoaXMuZ2FtZU92ZXJQYW5lbC5hY3RpdmUpKSByZXR1cm47XHJcblxyXG4gICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xyXG4gICAgICAgICAgICBjYXNlIEtleUNvZGUuQVJST1dfVVA6IHRoaXMubW92ZSgwLCAtMSk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEtleUNvZGUuQVJST1dfRE9XTjogdGhpcy5tb3ZlKDAsIDEpOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBLZXlDb2RlLkFSUk9XX0xFRlQ6IHRoaXMubW92ZSgtMSwgMCk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEtleUNvZGUuQVJST1dfUklHSFQ6IHRoaXMubW92ZSgxLCAwKTsgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uVG91Y2hTdGFydChldmVudDogRXZlbnRUb3VjaCkge1xyXG4gICAgICAgIGxldCBwb3MgPSBldmVudC5nZXRMb2NhdGlvbigpO1xyXG4gICAgICAgIHRoaXMudG91Y2hTdGFydFBvcy5zZXQocG9zLngsIHBvcy55LCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBvblRvdWNoRW5kKGV2ZW50OiBFdmVudFRvdWNoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNNb3ZpbmcgfHwgKHRoaXMuZ2FtZU92ZXJQYW5lbCAmJiB0aGlzLmdhbWVPdmVyUGFuZWwuYWN0aXZlKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgcG9zID0gZXZlbnQuZ2V0TG9jYXRpb24oKTtcclxuICAgICAgICBsZXQgZHggPSBwb3MueCAtIHRoaXMudG91Y2hTdGFydFBvcy54O1xyXG4gICAgICAgIGxldCBkeSA9IHBvcy55IC0gdGhpcy50b3VjaFN0YXJ0UG9zLnk7XHJcblxyXG4gICAgICAgIGlmIChNYXRoLmFicyhkeCkgPiBNYXRoLmFicyhkeSkpIHtcclxuICAgICAgICAgICAgLy8gSG9yaXpvbnRhbCBzd2lwZVxyXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoZHgpID4gNTApIHtcclxuICAgICAgICAgICAgICAgIGlmIChkeCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmUoMSwgMCk7IC8vIFJpZ2h0XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZSgtMSwgMCk7IC8vIExlZnRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIFZlcnRpY2FsIHN3aXBlXHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhkeSkgPiA1MCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGR5ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZSgwLCAtMSk7IC8vIFVwIChDb2NvcyB5IGlzIHVwLCBidXQgb3VyIGdyaWQgcm93IDAgaXMgdG9wLCBzbyBkeT4wIG1lYW5zIHN3aXBlIHVwIC0+IG1vdmUgdG8gcm93IDAgLT4gZGlyWT0tMSlcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlKDAsIDEpOyAvLyBEb3duXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZShkaXJYOiBudW1iZXIsIGRpclk6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBtb3ZlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNNb3ZpbmcgPSB0cnVlO1xyXG4gICAgICAgIGxldCBtb3ZlQ291bnQgPSAwO1xyXG4gICAgICAgIGxldCBjb21wbGV0ZWRDb3VudCA9IDA7XHJcblxyXG4gICAgICAgIGxldCBjaGVja0NvbXBsZXRpb24gPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbXBsZXRlZENvdW50Kys7XHJcbiAgICAgICAgICAgIGlmIChjb21wbGV0ZWRDb3VudCA9PT0gbW92ZUNvdW50KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobW92ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNwYXduQmxvY2soKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNjb3JlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tHYW1lT3ZlcigpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmdhbWVPdmVyUGFuZWwpIHRoaXMuZ2FtZU92ZXJQYW5lbC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuaXNNb3ZpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBzdGFydFJvdyA9IGRpclkgPT09IDEgPyAyIDogKGRpclkgPT09IC0xID8gMSA6IDApO1xyXG4gICAgICAgIGxldCBlbmRSb3cgPSBkaXJZID09PSAxID8gLTEgOiAoZGlyWSA9PT0gLTEgPyA0IDogNCk7XHJcbiAgICAgICAgbGV0IHN0ZXBSb3cgPSBkaXJZID09PSAxID8gLTEgOiAxO1xyXG5cclxuICAgICAgICBsZXQgc3RhcnRDb2wgPSBkaXJYID09PSAxID8gMiA6IChkaXJYID09PSAtMSA/IDEgOiAwKTtcclxuICAgICAgICBsZXQgZW5kQ29sID0gZGlyWCA9PT0gMSA/IC0xIDogKGRpclggPT09IC0xID8gNCA6IDQpO1xyXG4gICAgICAgIGxldCBzdGVwQ29sID0gZGlyWCA9PT0gMSA/IC0xIDogMTtcclxuXHJcbiAgICAgICAgbGV0IG1lcmdlZDogYm9vbGVhbltdW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykgbWVyZ2VkW2ldID0gW2ZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgciA9IHN0YXJ0Um93OyByICE9PSBlbmRSb3c7IHIgKz0gc3RlcFJvdykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjID0gc3RhcnRDb2w7IGMgIT09IGVuZENvbDsgYyArPSBzdGVwQ29sKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ibG9ja3Nbcl1bY10gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgY3VyclIgPSByO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjdXJyQyA9IGM7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5leHRSID0gciArIGRpclk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5leHRDID0gYyArIGRpclg7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChuZXh0UiA+PSAwICYmIG5leHRSIDwgNCAmJiBuZXh0QyA+PSAwICYmIG5leHRDIDwgNCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5ibG9ja3NbbmV4dFJdW25leHRDXSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyclIgPSBuZXh0UjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJDID0gbmV4dEM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0UiArPSBkaXJZO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dEMgKz0gZGlyWDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmJsb2Nrc1tuZXh0Ul1bbmV4dENdIS52YWx1ZSA9PT0gdGhpcy5ibG9ja3Nbcl1bY10hLnZhbHVlICYmICFtZXJnZWRbbmV4dFJdW25leHRDXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyclIgPSBuZXh0UjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJDID0gbmV4dEM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY3VyclIgIT09IHIgfHwgY3VyckMgIT09IGMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW92ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb3ZlQ291bnQrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGJsb2NrID0gdGhpcy5ibG9ja3Nbcl1bY10hO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJsb2Nrc1tyXVtjXSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0QmxvY2sgPSB0aGlzLmJsb2Nrc1tjdXJyUl1bY3VyckNdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0QmxvY2sgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lcmdlZFtjdXJyUl1bY3VyckNdID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tzW2N1cnJSXVtjdXJyQ10gPSBibG9jaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJsb2NrLm1vdmVUbyh0aGlzLmdldFBvc2l0aW9uKGN1cnJSLCBjdXJyQyksICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBibG9jay52YWx1ZSAqPSAyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcmUgKz0gYmxvY2sudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QmxvY2shLm5vZGUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrQ29tcGxldGlvbigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJsb2Nrc1tjdXJyUl1bY3VyckNdID0gYmxvY2s7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBibG9jay5tb3ZlVG8odGhpcy5nZXRQb3NpdGlvbihjdXJyUiwgY3VyckMpLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tDb21wbGV0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG1vdmVDb3VudCA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmlzTW92aW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVNjb3JlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNjb3JlTGFiZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5zY29yZUxhYmVsLnN0cmluZyA9ICdTY29yZTogJyArIHRoaXMuc2NvcmU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNoZWNrR2FtZU92ZXIoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCA0OyByKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCA0OyBjKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJsb2Nrc1tyXVtjXSA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgNDsgcisrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGMgPSAwOyBjIDwgNDsgYysrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAociA8IDMgJiYgdGhpcy5ibG9ja3Nbcl1bY10hLnZhbHVlID09PSB0aGlzLmJsb2Nrc1tyICsgMV1bY10hLnZhbHVlKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoYyA8IDMgJiYgdGhpcy5ibG9ja3Nbcl1bY10hLnZhbHVlID09PSB0aGlzLmJsb2Nrc1tyXVtjICsgMV0hLnZhbHVlKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgb25SZXN0YXJ0Q2xpY2soKSB7XHJcbiAgICAgICAgdGhpcy5pbml0R2FtZSgpO1xyXG4gICAgfVxyXG59Il19