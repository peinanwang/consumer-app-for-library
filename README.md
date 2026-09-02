# consumer-app-for-library

A sample React app that consumes [`@peinanwang/common-ui-library`](https://github.com/peinanwang/common-ui-library).

Its job is to answer the questions you only find out by *using* a library from the outside:
how you install it, what its public API actually feels like, and what state it will and won't
let you see.

---

## Run it

```bash
nvm use          # reads .nvmrc -> Node 22.23.1
npm install
npm run dev      # http://localhost:5173
```

| Script | Does |
|---|---|
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Type-check (`tsc -b`) then production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Oxlint |

---

## The two Node versions

This app runs **Node 22**; the library is built on **Node 20**. That is deliberate, and it
works because:

> **Node runs the build tools. It never runs the library.**

What the library ships is compiled JavaScript plus `.d.ts` files. This app's bundler reads
those files. The two Node versions never meet — the header at the top of the page states both,
as a live demonstration.

---

## Installing the library

### Option A — from a GitHub release tag (what a real consumer does)

```bash
npm install 'github:peinanwang/common-ui-library#v0.1.0'
```

Quote it in zsh: `#` is a glob operator with `extendedglob`, so an unquoted spec fails with
`zsh: no matches found` before npm sees it.

`dist/` is not committed to the library repo. npm clones it, installs its devDependencies and
runs its `prepare` script, which builds `dist/` on the fly.

### Option B — `npm link` (what you use while developing both at once)

```bash
npm link ../common-ui-library
```

This symlinks the library's source folder into `node_modules`, so a change there shows up here
immediately — no rebuild, no reinstall.

**Use the path form, not the two-step global form.** `npm link` registered globally is scoped
to the *current Node version*: running `npm link` in the library on Node 20 and then
`npm link @peinanwang/common-ui-library` here on Node 22 fails with a 404, because nvm gives
each Node version its own global folder.

To undo it and go back to a real install:

```bash
npm unlink --no-save @peinanwang/common-ui-library
npm install 'github:peinanwang/common-ui-library#v0.1.0'
```

### About two copies of React

While linked, two Reacts exist on disk — this app's, and the one in the library's own
`node_modules` (it needs React for Storybook and tests). Historically that breaks hooks with
`Invalid hook call`, because React keeps hook state in module-level variables.

In practice it did **not** break here: Vite's dependency optimizer pre-bundles `react` once and
rewrites the linked library's bare imports to that single copy. We verified only one React
reaches the browser in dev, and only one is inlined in the production bundle.

`vite.config.ts` still sets `resolve.dedupe: ['react', 'react-dom']` — cheap insurance that
makes the guarantee explicit rather than emergent, and still necessary if the two copies are
ever *different* versions.

---

## What this app demonstrates

| Section | Shows |
|---|---|
| **Buttons** | Variants, colours, sizes and slots — all through props. The app defines no button styles. |
| **Form controls** | `TextField` and `Button` line up exactly, because both read the same `--cui-control-height-*` tokens. |
| **DataTable** | Column metadata + rows, and the **empty / loading / error** states behind toggle buttons. |
| **Utility functions** | `sortRows` called directly — `"item 2"` before `"item 10"`, `"ábel"` beside `"alice"`. |
| **ChatWidget** | A complex component whose internal state stays internal. |

### Two state-management patterns, side by side

This is the most interesting thing in the repo:

```
This app  (src/appStore.ts)  -> create()      at module scope -> ONE global store
Library   (ChatWidget)       -> createStore() per instance    -> one store PER WIDGET
```

Both are Zustand. The app has one theme and one list of snapshots, so a global singleton is
right. A library component cannot do that: two `<ChatWidget>`s on a page would share a message
list and interleave conversations.

**This app installs Zustand for its own state only.** The library bundles its own copy for the
widget, and never asks the consumer to provide one or to wrap anything in a Provider.

### Reading state out of ChatWidget

The widget's store holds messages, per-message delivery status, draft text and a typing flag.
This app sees **none** of it — only a seven-field `ChatStats` object, two ways:

```tsx
// PUSH - the widget notifies on change
<ChatWidget onStatsChange={setLiveStats} ref={chatRef} apiUrl="..." />

// PULL - a plain synchronous call, no subscription, no re-render
const stats = chatRef.current?.getStats();
```

"Save snapshot" uses the pull model and stores the result in this app's own Zustand store —
the library has no opinion about what you do with the numbers.

### Theming

The app never passes a theme prop. It sets one attribute:

```ts
document.documentElement.setAttribute('data-cui-theme', theme);
```

Every component re-skins, because they are all styled from `--cui-*` custom properties.

---

## Requirements

Node `>=22.12.0`, pinned to 22.23.1 in `.nvmrc`. npm only — no yarn or pnpm.
