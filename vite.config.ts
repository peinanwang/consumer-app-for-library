import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],

  resolve: {
    /**
     * INSURANCE AGAINST TWO COPIES OF REACT.
     *
     * `npm link` symlinks the library into node_modules, and the library has
     * its OWN node_modules containing its own React (a devDependency it needs
     * for Storybook and tests). Node's resolution genuinely finds two different
     * files:
     *
     *   library -> common-ui-library/node_modules/react/index.js
     *   app     -> consumer-app-for-library/node_modules/react/index.js
     *
     * Two React instances means hooks break: React keeps its hook state in
     * module-level variables, so a component rendered by one copy calling hooks
     * from the other throws "Invalid hook call". It is the classic npm-link
     * failure, and historically the first thing that bites you here.
     *
     * HONEST NOTE: it did NOT bite us. Vite's dependency optimizer pre-bundles
     * `react` once from the project root and rewrites the linked library's bare
     * imports to that single copy - we verified only one React reached the
     * browser in dev, and only one is inlined in the production bundle. Modern
     * tooling has largely solved this.
     *
     * `dedupe` stays anyway because it is cheap and the guarantee is explicit
     * rather than emergent. It still matters when the two copies are DIFFERENT
     * versions, and when a bundler without Vite's optimizer is used.
     *
     * The library's side of the bargain is `peerDependencies` + `external` in
     * its Vite config, so its published build never bundles React at all.
     */
    dedupe: ['react', 'react-dom'],
  },
});
