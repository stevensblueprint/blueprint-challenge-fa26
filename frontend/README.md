# LibraryConnect frontend

React and TypeScript app for the library catalog and checkout history.

Use Node.js 22 and start the backend before submitting forms.

```bash
npm ci
npm run dev
```

Open http://localhost:5173. The API defaults to http://localhost:8000.

The reading-room entrance is at `#/` (also the default when no hash is set).
Select **Approach bookshelf** (or scroll down once), then select the highlighted
green catalog volume. GSAP moves the camera, brings the book forward, and expands
its cover into the existing catalog. The catalog is mounted during the cover
handoff, not placed below the room. **Esc** cancels before the handoff; **Skip to
catalog** is always available.

`scene/libraryScene.ts` builds the Three.js room from instanced block geometry and
original procedural pixel textures. No Minecraft assets or external texture requests
are used. The scene is lazy-loaded only on the reading-room route and renders on
camera/book changes and resize rather than running continuously while idle. GPU
resources, timelines, observers, and listeners are disposed on exit. The separate
scene bundle is approximately 161 KB gzip; Vite reports its uncompressed chunk
above the default 500 KB advisory threshold.

Reduced motion removes camera travel and cover expansion while retaining explicit
book selection. Keyboard focus follows each stage and lands in the catalog after
entry. WebGL failure preserves a static fallback and direct catalog links. The
previous SVG room is used only for that fallback.

The catalog remains directly accessible at `#/books`, book creation at `#/books/new`, and individual
books at `#/books/{id}`. Select **Record checkout** from a book to open
`#/books/{id}/checkout`. Forms appear only on their own pages, and checkout is
restricted to the selected book. These links support refresh and browser navigation.
Catalog rows show descriptions, authors, publisher contacts, and shelf locations.
The genre overview filters the catalog and shows counts for the full collection.

To change the API URL, set `VITE_API_BASE_URL` when starting or building the frontend:

```bash
VITE_API_BASE_URL=http://localhost:8000 npm run dev
```

```bash
npm test
npm run lint
npm run build
```

Motion (`motion/react`) provides page entrances, row/filter transitions, navigation
indicators, and button feedback. Reicon supplies the SVG icons through individual
`reicon-react/icons/*` imports. Animations respect the operating system’s reduced-motion
preference; decorative icons are hidden from assistive technology.

Jest transforms Reicon’s ESM files and provides a `matchMedia` shim for Motion.

The production output is in `dist/`. See the root README for PostgreSQL and Docker setup.
