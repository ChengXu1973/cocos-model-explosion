import { _decorator, clamp, Component, EPSILON, gfx, ImageAsset, math, MeshRenderer, Sprite, SpriteFrame, Texture2D, utils, v4 } from "cc";
const { ccclass, property } = _decorator;

const animParam = v4();

@ccclass("Main")
export class Main extends Component {
    @property(MeshRenderer)
    model: MeshRenderer = null;

    @property(Sprite)
    sprite: Sprite = null;

    onLoad() {
        if (!this.model) {
            return;
        }
        this._bake();
    }

    private _bake() {
        // aabb
        const max = this.model.mesh.struct.maxPosition.clone();
        const min = this.model.mesh.struct.minPosition.clone();
        const range = max.clone().subtract(min);
        range.x = Math.max(range.x, EPSILON);
        range.y = Math.max(range.y, EPSILON);
        range.z = Math.max(range.z, EPSILON);
        this.model.getSharedMaterial(0).setProperty("minPos", v4(min.x, min.y, min.z));
        this.model.getSharedMaterial(0).setProperty("modelSize", v4(range.x, range.y, range.z));
        // bake
        const positions = this._reCreateMesh();
        const posTex = this._bakeVertexTexture(positions, min, range);
        this.model.getSharedMaterial(0).setProperty("vertexTexture", posTex);
        this.model.getSharedMaterial(0).setProperty("textureSize", v4(posTex.width, posTex.height));
        // gl_VertexIndex
        this.model.mesh.renderingSubMeshes[0].enableVertexIdChannel(
            gfx.deviceManager.gfxDevice
        );
        // debug
        if (!this.sprite) {
            return;
        }
        this.sprite.spriteFrame = new SpriteFrame();
        this.sprite.spriteFrame.texture = posTex;
    }

    private _reCreateMesh() {
        const attrPositions = this.model.mesh.readAttribute(0, gfx.AttributeName.ATTR_POSITION) as Float32Array;
        const attrNormals = this.model.mesh.readAttribute(0, gfx.AttributeName.ATTR_NORMAL) as Float32Array;
        const attrTexCoord = this.model.mesh.readAttribute(0, gfx.AttributeName.ATTR_TEX_COORD) as Float32Array;
        const indices = this.model.mesh.readIndices(0) as Uint32Array;
        // recreate mesh
        const count = indices.length;
        const positions = Array<number>(count * 3).fill(0);
        const normals = Array<number>(count * 3).fill(0);
        const uvs = Array<number>(count * 2).fill(0);
        indices.forEach((index, count) => {
            // pos
            positions[count * 3 + 0] = attrPositions[index * 3 + 0];
            positions[count * 3 + 1] = attrPositions[index * 3 + 1];
            positions[count * 3 + 2] = attrPositions[index * 3 + 2];
            // normal
            normals[count * 3 + 0] = attrNormals[index * 3 + 0];
            normals[count * 3 + 1] = attrNormals[index * 3 + 1];
            normals[count * 3 + 2] = attrNormals[index * 3 + 2];
            // uv
            uvs[count * 2 + 0] = attrTexCoord[index * 2 + 0];
            uvs[count * 2 + 1] = attrTexCoord[index * 2 + 1];
        });
        this.model.mesh = utils.MeshUtils.createMesh({ positions, normals, uvs });
        this.model.onGeometryChanged();
        return positions;
    }

    private _bakeVertexTexture(positions: number[], min: math.Vec3, range: math.Vec3) {
        const len = positions.length / 3;
        const offset = Math.ceil(Math.log2(Math.sqrt(len)));
        const width = 1 << offset;
        const height = 1 << offset;
        const _compressed = false;
        const format = Texture2D.PixelFormat.RGBA32F;
        const _data = new Float32Array(width * height * 4);
        for (let i = 0; i < len; i++) {
            const x = positions[i * 3 + 0];
            const y = positions[i * 3 + 1];
            const z = positions[i * 3 + 2];
            _data[i * 4 + 0] = clamp((x - min.x) / range.x, 0, 1);
            _data[i * 4 + 1] = clamp((y - min.y) / range.y, 0, 1);
            _data[i * 4 + 2] = clamp((z - min.z) / range.z, 0, 1);
            _data[i * 4 + 3] = 1;
        }
        const tex = new Texture2D();
        tex.setFilters(Texture2D.Filter.NONE, Texture2D.Filter.NONE);
        tex.image = new ImageAsset({ _data, width, height, format, _compressed });
        return tex;
    }

    private _setAnim() {
        const pass0 = this.model.getSharedMaterial(0).passes[0];
        pass0.setUniform(pass0.getHandle("animParam"), animParam);
    }
}
