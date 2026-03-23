import { _decorator, Component, Node, Prefab, instantiate, Label, Vec3, input, Input, EventKeyboard, KeyCode, tween, Sprite, UITransform, Color, Button, SpriteFrame, EventTouch } from 'cc';
import { Block } from './Block';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Prefab) blockPrefab: Prefab | null = null;
    @property(Node) boardNode: Node | null = null;
    @property(Label) scoreLabel: Label | null = null;
    @property(Node) gameOverPanel: Node | null = null;
    @property(SpriteFrame) cellSpriteFrame: SpriteFrame | null = null;

    private blocks: (Block | null)[][] = [];
    private score: number = 0;
    private isMoving: boolean = false;
    private touchStartPos: Vec3 = new Vec3();

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        if (this.gameOverPanel) {
            let restartBtn = this.gameOverPanel.getChildByName('RestartButton');
            if (restartBtn) {
                restartBtn.on(Button.EventType.CLICK, this.onRestartClick, this);
            }
        }
        this.initGame();
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    initGame() {
        this.score = 0;
        this.updateScore();
        if (this.gameOverPanel) this.gameOverPanel.active = false;

        if (this.boardNode) {
            this.boardNode.removeAllChildren();
            // Create background cells
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    let bgCell = new Node('BgCell');
                    bgCell.addComponent(UITransform).setContentSize(90, 90);
                    let sp = bgCell.addComponent(Sprite);
                    sp.spriteFrame = this.cellSpriteFrame;
                    sp.sizeMode = 0; // CUSTOM size mode
                    sp.color = new Color(205, 193, 180);
                    bgCell.setPosition(this.getPosition(r, c));
                    this.boardNode!.addChild(bgCell);
                }
            }
        }

        this.blocks = [];
        for (let i = 0; i < 4; i++) {
            this.blocks[i] = [null, null, null, null];
        }

        this.spawnBlock();
        this.spawnBlock();
    }

    getPosition(row: number, col: number): Vec3 {
        let x = (col - 1.5) * 100;
        let y = (1.5 - row) * 100;
        return new Vec3(x, y, 0);
    }

    spawnBlock() {
        let emptyCells = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.blocks[r][c] === null) {
                    emptyCells.push({ r, c });
                }
            }
        }
        if (emptyCells.length === 0) return;

        let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        let val = Math.random() < 0.9 ? 2 : 4;

        let blockNode = instantiate(this.blockPrefab!);
        blockNode.setPosition(this.getPosition(randomCell.r, randomCell.c));
        this.boardNode!.addChild(blockNode);

        let block = blockNode.getComponent(Block)!;
        block.init(val);
        this.blocks[randomCell.r][randomCell.c] = block;
        
        blockNode.setScale(new Vec3(0, 0, 0));
        tween(blockNode).to(0.1, { scale: new Vec3(1, 1, 1) }).start();
    }

    onKeyDown(event: EventKeyboard) {
        if (this.isMoving || (this.gameOverPanel && this.gameOverPanel.active)) return;

        switch (event.keyCode) {
            case KeyCode.ARROW_UP: this.move(0, -1); break;
            case KeyCode.ARROW_DOWN: this.move(0, 1); break;
            case KeyCode.ARROW_LEFT: this.move(-1, 0); break;
            case KeyCode.ARROW_RIGHT: this.move(1, 0); break;
        }
    }

    onTouchStart(event: EventTouch) {
        let pos = event.getLocation();
        this.touchStartPos.set(pos.x, pos.y, 0);
    }

    onTouchEnd(event: EventTouch) {
        if (this.isMoving || (this.gameOverPanel && this.gameOverPanel.active)) return;

        let pos = event.getLocation();
        let dx = pos.x - this.touchStartPos.x;
        let dy = pos.y - this.touchStartPos.y;

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

    move(dirX: number, dirY: number) {
        let moved = false;
        this.isMoving = true;
        let moveCount = 0;
        let completedCount = 0;

        let checkCompletion = () => {
            completedCount++;
            if (completedCount === moveCount) {
                if (moved) {
                    this.spawnBlock();
                    this.updateScore();
                    if (this.checkGameOver()) {
                        if (this.gameOverPanel) this.gameOverPanel.active = true;
                    }
                }
                this.isMoving = false;
            }
        };

        let startRow = dirY === 1 ? 2 : (dirY === -1 ? 1 : 0);
        let endRow = dirY === 1 ? -1 : (dirY === -1 ? 4 : 4);
        let stepRow = dirY === 1 ? -1 : 1;

        let startCol = dirX === 1 ? 2 : (dirX === -1 ? 1 : 0);
        let endCol = dirX === 1 ? -1 : (dirX === -1 ? 4 : 4);
        let stepCol = dirX === 1 ? -1 : 1;

        let merged: boolean[][] = [];
        for (let i = 0; i < 4; i++) merged[i] = [false, false, false, false];

        for (let r = startRow; r !== endRow; r += stepRow) {
            for (let c = startCol; c !== endCol; c += stepCol) {
                if (this.blocks[r][c] !== null) {
                    let currR = r;
                    let currC = c;
                    let nextR = r + dirY;
                    let nextC = c + dirX;

                    while (nextR >= 0 && nextR < 4 && nextC >= 0 && nextC < 4) {
                        if (this.blocks[nextR][nextC] === null) {
                            currR = nextR;
                            currC = nextC;
                            nextR += dirY;
                            nextC += dirX;
                        } else if (this.blocks[nextR][nextC]!.value === this.blocks[r][c]!.value && !merged[nextR][nextC]) {
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
                        let block = this.blocks[r][c]!;
                        this.blocks[r][c] = null;

                        let targetBlock = this.blocks[currR][currC];
                        if (targetBlock !== null) {
                            merged[currR][currC] = true;
                            this.blocks[currR][currC] = block;
                            block.moveTo(this.getPosition(currR, currC), () => {
                                block.value *= 2;
                                this.score += block.value;
                                targetBlock!.node.destroy();
                                checkCompletion();
                            });
                        } else {
                            this.blocks[currR][currC] = block;
                            block.moveTo(this.getPosition(currR, currC), () => {
                                checkCompletion();
                            });
                        }
                    }
                }
            }
        }

        if (moveCount === 0) {
            this.isMoving = false;
        }
    }

    updateScore() {
        if (this.scoreLabel) {
            this.scoreLabel.string = 'Score: ' + this.score;
        }
    }

    checkGameOver(): boolean {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.blocks[r][c] === null) return false;
            }
        }
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (r < 3 && this.blocks[r][c]!.value === this.blocks[r + 1][c]!.value) return false;
                if (c < 3 && this.blocks[r][c]!.value === this.blocks[r][c + 1]!.value) return false;
            }
        }
        return true;
    }

    onRestartClick() {
        this.initGame();
    }
}