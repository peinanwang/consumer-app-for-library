import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * THE ONE IMPORT PEOPLE FORGET.
 *
 * The library extracts its CSS into a separate file rather than injecting it
 * from JavaScript, so importing the components alone gets you unstyled markup.
 * Import it once, at the app entry, before your own styles - so your rules win
 * where they overlap.
 */
import '@peinanwang/common-ui-library/styles.css';
import './index.css';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
