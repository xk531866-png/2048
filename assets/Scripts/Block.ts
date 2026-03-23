import { _decorator, Component, Label, Sprite, Color, Vec3, tween } from 'cc';
const { ccclass, property } = _decorator;

const colors: { [key: number]: Color } = {
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
    2048: new Color(237, 194, 46),
};

@ccclass('Block')
export class Block extends Component {
    @property(Label)
    numberLabel: Label | null = null;

    private _value: number = 0;

    public get value() { return this._value; }
    public set value(v: number) {
        this._value = v;
        if (this.numberLabel) {
            this.numberLabel.string = v > 0 ? v.toString() : '';
            this.numberLabel.color = v < 8 ? new Color(119, 110, 101) : new Color(249, 246, 242);
        }
        const sprite = this.getComponent(Sprite);
        if (sprite) {
            sprite.color = colors[v] || new Color(60, 58, 50);
        }
    }

    init(val: number) {
        this.value = val;
    }

    moveTo(pos: Vec3, callback?: Function) {
        tween(this.node)
            .to(0.1, { position: pos })
            .call(() => { if (callback) callback(); })
            .start();
    }
}