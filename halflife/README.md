# webXash

<img width="1544" alt="image" src="https://user-images.githubusercontent.com/15372551/220869033-a199aaeb-5ec4-4e59-aed5-a449f0eafa2f.png">

### https://x8bitrain.github.io/webXash/

WIP slightly Improved version of xash3d emscripten in the browser, written in Vue and Typescript

emscripten port by mittorn [https://github.com/FWGS/xash3d/blob/master/ports/README.emscripten.md](https://github.com/FWGS/xash3d/blob/master/ports/README.emscripten.md)

Assets from [hl-engine-js](https://github.com/steren/hl-engine-js)

UI CSS from [vgui.css](https://github.com/xVenti/vgui.css/)

### Improvements
- Better resolution support with resizable window (wip)
- Proper HUD scaling
- Nicer UI

### Todo:
- Rewrite to be compatible with newer BrowserFS versions. 
- Better mouse pointer translation for UI

## Project Setup

### Install dependancies

```sh
pnpm install
```

### Pull in submodules
```sh
git submodule update --init
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```
