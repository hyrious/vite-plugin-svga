// https://github.com/Adamwu1992/svga-loader/blob/master/src/index.js

import fs from "fs";
import pako from "pako";
import protobuf from "protobufjs/light";
import desc from "./desc.json";

export function parse(input: Uint8Array) {
  const root = protobuf.Root.fromJSON(desc);
  const svga = root.lookupType("com.opensource.svga.MovieEntity");
  const data = svga.decode(input) as protobuf.Message & { images: any };
  const images: Record<string, string> = {};
  for (const key in data.images) {
    images[key] = Buffer.from(data.images[key]).toString("base64");
  }
  data.images = images;
  return data;
}

declare var wx: any;

interface VideoEntitySpec {
  version?: any;
  images?: any;
  params?: {
    viewBoxWidth?: number;
    viewBoxHeight?: number;
    fps?: number;
    frames?: number;
  };
  audios?: any;
  sprites?: SpriteEntitySpec[];
}

class VideoEntity {
  version?: any;
  images: Record<string, string>;
  videoSize: { width?: number; height?: number };
  FPS?: number;
  frames?: number;
  audios?: any;
  sprites: SpriteEntity[];

  constructor(spec: VideoEntitySpec) {
    this.images = {};
    const { images } = spec;
    if (images) {
      for (const [key, value] of Object.entries(images)) {
        if (value instanceof Uint8Array) {
          this.images[key] = wx.arrayBufferToBase64(value);
        } else {
          this.images[key] = value as string;
        }
      }
    }

    this.videoSize = {};
    if (typeof spec.params === "object") {
      this.version = spec.version;
      this.videoSize.width = spec.params.viewBoxWidth || 0.0;
      this.videoSize.height = spec.params.viewBoxHeight || 0.0;
      this.FPS = spec.params.fps || 20;
      this.frames = spec.params.frames || 0;
    }

    this.audios = spec.audios;

    this.sprites = [];
    if (Array.isArray(spec.sprites)) {
      this.sprites = spec.sprites.map((obj) => new SpriteEntity(obj));
    }
  }
}

interface SpriteEntitySpec {
  matteKey: any;
  imageKey: any;
  frames: FrameEntitySpec[];
}

class SpriteEntity {
  matteKey: any;
  imageKey: any;
  frames: FrameEntity[];
  constructor(spec: SpriteEntitySpec) {
    this.matteKey = spec.matteKey;
    this.imageKey = spec.imageKey;
    this.frames = [];
    if (spec.frames) {
      this.frames = spec.frames.map((obj) => new FrameEntity(obj));
    }
  }
}

interface FrameEntitySpec {
  alpha: any;
  layout?: Record<"x" | "y" | "width" | "height", any>;
  transform?: Record<"a" | "b" | "c" | "d" | "tx" | "ty", any>;
  clipPath?: any[];
  shapes?: any;
}

class FrameEntity {
  static lastShapes: any;
  alpha: number;
  layout: Partial<Required<FrameEntitySpec["layout"]>>;
  transform: Partial<Required<FrameEntitySpec["transform"]>>;
  maskPath?: BezierPath;
  shapes: any;
  nx?: number;
  ny?: number;

  constructor(spec: FrameEntitySpec) {
    this.alpha = +spec.alpha;

    this.layout = {};
    if (spec.layout) {
      this.layout.x = +spec.layout.x || 0.0;
      this.layout.y = +spec.layout.y || 0.0;
      this.layout.width = +spec.layout.width || 0.0;
      this.layout.height = +spec.layout.height || 0.0;
    }

    this.transform = {};
    if (spec.transform) {
      this.transform.a = +spec.transform.a || 1.0;
      this.transform.b = +spec.transform.b || 0.0;
      this.transform.c = +spec.transform.c || 0.0;
      this.transform.d = +spec.transform.d || 1.0;
      this.transform.tx = +spec.transform.tx || 0.0;
      this.transform.ty = +spec.transform.ty || 0.0;
    }

    if (spec.clipPath && spec.clipPath.length > 0) {
      this.maskPath = new BezierPath(spec.clipPath, undefined, { fill: "#000000" });
    }

    if (spec.shapes) {
      if (Array.isArray(spec.shapes)) {
        spec.shapes.forEach((shape) => {
          shape.pathArgs = shape.args;
          switch (shape.type) {
            case 0:
              shape.type = "shape";
              shape.pathArgs = shape.shape;
              break;
            case 1:
              shape.type = "rect";
              shape.pathArgs = shape.rect;
              break;
            case 2:
              shape.type = "ellipse";
              shape.pathArgs = shape.ellipse;
              break;
            case 3:
              shape.type = "keep";
              break;
          }
          if (shape.styles) {
            if (shape.styles.fill) {
              if (typeof shape.styles.fill["r"] === "number")
                shape.styles.fill[0] = shape.styles.fill["r"];
              if (typeof shape.styles.fill["g"] === "number")
                shape.styles.fill[1] = shape.styles.fill["g"];
              if (typeof shape.styles.fill["b"] === "number")
                shape.styles.fill[2] = shape.styles.fill["b"];
              if (typeof shape.styles.fill["a"] === "number")
                shape.styles.fill[3] = shape.styles.fill["a"];
            }
            if (shape.styles.stroke) {
              if (typeof shape.styles.stroke["r"] === "number")
                shape.styles.stroke[0] = shape.styles.stroke["r"];
              if (typeof shape.styles.stroke["g"] === "number")
                shape.styles.stroke[1] = shape.styles.stroke["g"];
              if (typeof shape.styles.stroke["b"] === "number")
                shape.styles.stroke[2] = shape.styles.stroke["b"];
              if (typeof shape.styles.stroke["a"] === "number")
                shape.styles.stroke[3] = shape.styles.stroke["a"];
            }
            let lineDash = shape.styles.lineDash || [];
            if (shape.styles.lineDashI > 0) {
              lineDash.push(shape.styles.lineDashI);
            }
            if (shape.styles.lineDashII > 0) {
              if (lineDash.length < 1) {
                lineDash.push(0);
              }
              lineDash.push(shape.styles.lineDashII);
              lineDash.push(0);
            }
            if (shape.styles.lineDashIII > 0) {
              if (lineDash.length < 2) {
                lineDash.push(0);
                lineDash.push(0);
              }
              lineDash[2] = shape.styles.lineDashIII;
            }
            shape.styles.lineDash = lineDash;

            switch (shape.styles.lineJoin) {
              case 0:
                shape.styles.lineJoin = "miter";
                break;
              case 1:
                shape.styles.lineJoin = "round";
                break;
              case 2:
                shape.styles.lineJoin = "bevel";
                break;
            }

            switch (shape.styles.lineCap) {
              case 0:
                shape.styles.lineCap = "butt";
                break;
              case 1:
                shape.styles.lineCap = "round";
                break;
              case 2:
                shape.styles.lineCap = "square";
                break;
            }
          }
        });
      }
      if (spec.shapes[0] && spec.shapes[0].type === "keep") {
        this.shapes = FrameEntity.lastShapes;
      } else {
        this.shapes = spec.shapes;
        FrameEntity.lastShapes = spec.shapes;
      }
    }

    let llx =
      this.transform.a * this.layout.x + this.transform.c * this.layout.y + this.transform.tx;
    let lrx =
      this.transform.a * (this.layout.x + this.layout.width) +
      this.transform.c * this.layout.y +
      this.transform.tx;
    let lbx =
      this.transform.a * this.layout.x +
      this.transform.c * (this.layout.y + this.layout.height) +
      this.transform.tx;
    let rbx =
      this.transform.a * (this.layout.x + this.layout.width) +
      this.transform.c * (this.layout.y + this.layout.height) +
      this.transform.tx;
    let lly =
      this.transform.b * this.layout.x + this.transform.d * this.layout.y + this.transform.ty;
    let lry =
      this.transform.b * (this.layout.x + this.layout.width) +
      this.transform.d * this.layout.y +
      this.transform.ty;
    let lby =
      this.transform.b * this.layout.x +
      this.transform.d * (this.layout.y + this.layout.height) +
      this.transform.ty;
    let rby =
      this.transform.b * (this.layout.x + this.layout.width) +
      this.transform.d * (this.layout.y + this.layout.height) +
      this.transform.ty;
    this.nx = Math.min(Math.min(lbx, rbx), Math.min(llx, lrx));
    this.ny = Math.min(Math.min(lby, rby), Math.min(lly, lry));
  }
}

class BezierPath {
  constructor(public _d?: any, public _transform?: any, public _styles?: any) {}
}

export function svgaToJSON(id: string, _source: string) {
  // ignore _source because we need raw binary data
  const data = parse(pako.inflate(fs.readFileSync(id)));
  if (!data) return "export default undefined";
  const entity = new VideoEntity(data);
  return `export default ${JSON.stringify(entity)}`;
}
