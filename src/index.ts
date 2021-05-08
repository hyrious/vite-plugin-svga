import type { Plugin } from "vite";
import { svgaToJSON } from "./parser";

function svga(): Plugin {
  return {
    name: "vite-plugin-svga",
    // TODO: don't use transform, use resolveId and load
    transform(code, id) {
      if (id.endsWith(".svga")) {
        try {
          return svgaToJSON(id, code);
        } catch (e) {
          this.error(e);
        }
      }
    },
    async handleHotUpdate(ctx) {
      if (ctx.file.endsWith(".svga")) {
        const defaultRead = ctx.read;
        ctx.read = async function () {
          return svgaToJSON(ctx.file, await defaultRead());
        };
      }
    },
  };
}

export default svga;
