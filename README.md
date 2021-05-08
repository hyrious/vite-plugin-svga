# vite-plugin-svga

> A vite plugin to load [svga](https://github.com/svga/SVGAPlayer-Web) file. Based on [svga-loader](https://github.com/Adamwu1992/svga-loader).

## Todo

- [x] copy code from [svga-loader](https://github.com/Adamwu1992/svga-loader)
- [ ] refactor `transform` &rarr; `load`
- [ ] why do we need parse `VideoEntity` by hand? can we use svga itself?
- [ ] vite-plugin-svga.lite

## Usage

```
npm i -D @hyrious/vite-plugin-svga
```

vite.config.ts

```ts
import svga from "@hyrious/vite-plugin-svga";

export default {
  plugins: [svga()],
};
```

main.ts

```ts
import { Player } from "svgaplayerweb";
import PinJump from "./assets/PinJump.svga";

const player = new Player("#app");

player.setVideoItem(PinJump);
player.startAnimation();
```

**Recommend**: shim.d.ts

```ts
declare module "*.svga" {
  const content: import("svgaplayerweb").VideoEntity;
  export default content;
}
```

## License

MIT @ [hyrious](https://github.com/hyrious)
