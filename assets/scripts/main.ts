import { _decorator, Component, MeshRenderer, RenderTexture } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    @property(RenderTexture)
    rt: RenderTexture = null;

    @property(MeshRenderer)
    model: MeshRenderer = null;

    onLoad() {
        if (this.rt && this.model) {
            this._bake();
        }
    }

    private _bake() {
        
    }
}
