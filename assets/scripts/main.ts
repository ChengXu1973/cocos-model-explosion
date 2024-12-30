import { _decorator, clamp, Component, gfx, ImageAsset, MeshRenderer, Sprite, SpriteFrame, Texture2D } from 'cc';
import { TEX_HEIGHT, TEX_WIDTH } from './macro';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    @property(MeshRenderer)
    model: MeshRenderer = null;

    @property(Sprite)
    sprite: Sprite = null;

    onLoad() {
        if (this.model) {
            this._bake();
        }
    }

    private _bake() {
        const mesh = this.model.mesh;
        mesh.renderingSubMeshes[0].enableVertexIdChannel(gfx.deviceManager.gfxDevice);

        const positions = mesh.readAttribute(0, gfx.AttributeName.ATTR_POSITION) as Float32Array;
        const count = ~~(positions.length / 3);

        const max = mesh.struct.maxPosition.clone();
        const min = mesh.struct.minPosition.clone();
        const range = max.clone().subtract(min);

        const width = TEX_WIDTH;
        const height = TEX_HEIGHT;
        const _data = new Float32Array(width * height * 4);
        const _compressed = false;
        const format = Texture2D.PixelFormat.RGBA32F;

        for (let i = 0; i < count; i++) {
            const x = positions[i * 3 + 0];
            const y = positions[i * 3 + 1];
            const z = positions[i * 3 + 2];
            _data[i * 4 + 0] = clamp((x - min.x) / range.x, 0, 1);
            _data[i * 4 + 1] = clamp((y - min.y) / range.y, 0, 1);
            _data[i * 4 + 2] = clamp((z - min.z) / range.z, 0, 1);
            _data[i * 4 + 3] = 1;
        }

        const img = new ImageAsset({ _data, width, height, format, _compressed });
        const tex = new Texture2D();
        tex.setFilters(Texture2D.Filter.NONE, Texture2D.Filter.NONE);
        tex.image = img;
        this.sprite.spriteFrame = new SpriteFrame();
        this.sprite.spriteFrame.texture = tex;

        this.model.getSharedMaterial(0).setProperty("modelTexture", tex);
        this.model.getSharedMaterial(0).setProperty("size", range);
        this.model.getSharedMaterial(0).setProperty("min", min);
    }
}
