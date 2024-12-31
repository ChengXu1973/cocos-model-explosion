import { _decorator, CCFloat, Component, EventTouch, Input, input, misc, Node, NodeSpace, Quat, quat, v2, Vec3 } from "cc";
const { ccclass, property } = _decorator;

const start = v2();
const current = v2();
const rotate = quat();
const rx = quat();
const ry = quat();

@ccclass("Spin")
export class Spin extends Component {
    @property(Node)
    target: Node;

    @property(Node)
    camera: Node;

    @property(CCFloat)
    speed = 0.01;

    onEnable() {
        input.on(Input.EventType.TOUCH_MOVE, this._move, this);
    }

    onDisable() {
        input.off(Input.EventType.TOUCH_MOVE, this._move, this);
    }

    private _move(evt: EventTouch) {
        evt.getPreviousLocation(start);
        evt.getLocation(current);

        const moveX = current.x - start.x;
        const moveY = current.y - start.y;

        rotate.set(Quat.IDENTITY);
        Quat.fromAxisAngle(ry, Vec3.UNIT_Y, misc.degreesToRadians(moveX * this.speed));
        Quat.fromAxisAngle(rx, Vec3.UNIT_X, misc.degreesToRadians(-moveY * this.speed));
        Quat.multiply(rotate, rotate, ry);
        Quat.multiply(rotate, rotate, rx);

        this.target.rotate(rotate, NodeSpace.WORLD);
    }
}
