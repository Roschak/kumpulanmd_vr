---
name: verify
description: Build, run, and drive the VRHaji Blazor + Three.js app in a browser to observe a change working. Use when verifying scene/engine/builder changes under wwwroot/js/vr.
---

# Verify VRHaji (Blazor Server + Three.js)

The surface is **pixels in a browser**. Scene geometry and crowds are built in
JS at page load — reaching them means loading a scene page, not running tests.

## Build & run

```bash
dotnet build src/VRHaji.Web/VRHaji.Web.csproj -v q --nologo
```

Port 5101 is often already taken by the user's own instance — **don't kill it**.
Run your own on a spare port:

```bash
ASPNETCORE_URLS="http://127.0.0.1:5199" ASPNETCORE_ENVIRONMENT=Development \
  dotnet run --project src/VRHaji.Web/VRHaji.Web.csproj --no-build --no-launch-profile
```

In Development, static files are served straight from `src/VRHaji.Web/wwwroot`,
so **JS edits need no rebuild** — just reload. Confirm the server has your edit:
`curl -s http://127.0.0.1:5199/js/vr/engine.js | grep -c "<your marker>"`

Stop it with TaskStop on the background task id (`pkill -f 5199` does not work here).

## Drive it

Scenes are at `/scene/{N}` (N = 1..11; 1 = Jakarta airport, 2 = Madinah airport).
`main.js#preload` builds the scene on page load — that alone executes builder and
`Crowd` code. Click **"▶ Mulai Simulasi"** to dismiss the intro overlay.

Playwright + chromium, launched with software WebGL:

```js
chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader',
                         '--enable-unsafe-swiftshader'] })
```

### Gotchas that will cost you an hour

- **`page.screenshot()` times out.** The engine runs a permanent rAF loop, so
  Playwright never sees a stable frame. Use CDP instead:
  ```js
  const cdp = await page.context().newCDPSession(page);
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(p, Buffer.from(data, 'base64'));
  ```
- **SwiftShader is slow** — roughly 2 minutes per captured frame for the airport
  scene. Budget for it; run the capture as a background task and poll.
- **Reading live scene state** beats guessing. `engine.js` exports `ACTIVE_CROWDS`,
  and a dynamic `import('/js/vr/engine.js')` in page context returns the *same*
  module instance the app uses:
  ```js
  const m = await import('/js/vr/engine.js');
  m.ACTIVE_CROWDS.map(c => `${c.opts.mode}:${c.agents.length}`);
  ```
  The `engine` object itself is not exported, but the scene graph is reachable via
  `ACTIVE_CROWDS[0].parts[0].parent`; traverse it for `o.isPerspectiveCamera` to
  aim the camera at whatever you need to photograph.
- **Camera stays where you put it** only because `_camTargetYaw` is `undefined`
  until the first mouse drag. Set `cam.position` / `cam.lookAt(...)` and don't
  send mouse events, or `_tick()` will take the rotation back.

## Expected console noise (not your bug)

- `THREE.Clock: This module has been deprecated` — pre-existing.
- `THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated` — pre-existing.
- Blazor SignalR `Connection disconnected ... Server returned an error on close`
  followed by an immediate reconnect — the circuit dropping while the headless
  page renders slowly. Environmental.

Real JS failures surface as `JS Error in preload:` or `Scene runner error:`
(both logged by `main.js`) — grep for those.
