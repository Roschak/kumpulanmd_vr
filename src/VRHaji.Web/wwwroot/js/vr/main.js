/**
 * VR Education Haji & Umrah — Entry point / JavaScript Interop
 * Dipanggil dari SceneView.razor (Blazor Server).
 */
import { Engine } from './engine.js';
import { SCENES } from './scenes.js';

let engine = null;
let sceneDef = null;
let started = false;

/** Muat scene (tanpa memulai alur) agar 3D siap saat intro tampil. */
export function preload(containerId, sceneNo, dotnetRef) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error('Container tidak ditemukan: ' + containerId);
    dispose();
    engine = new Engine(container);
    engine.dotnet = dotnetRef;
    sceneDef = SCENES[sceneNo];
    if (!sceneDef) throw new Error('Scene tidak dikenal: ' + sceneNo);
    engine.setEnvironment(sceneDef.env);
    engine._sceneRefs = sceneDef.build(engine);
    engine.setProgress(0);
    started = false;
}

/** Mulai alur scene (dipanggil dari tombol "Mulai Simulasi"). */
export async function start() {
    if (!engine || started) return;
    started = true;
    engine.audio.ensure();
    if (sceneDef.ambient) engine.audio.ambient(sceneDef.ambient, 0.32);
    await engine.fadeIn(1400);
    engine.setHint('Tahan klik + geser untuk melihat sekeliling · WASD berjalan · klik objek untuk interaksi');

    const ctx = {
        // Sistem kuis pilihan ganda (ABCD) dihapus — checkpoint kini lanjut
        // otomatis tanpa interupsi (alur netral). Lihat protokol §4.
        checkpoint(_n) {
            return Promise.resolve();
        },
        async complete() {
            engine.narrator.stop();
            engine.setObjective('');
            await engine.dotnet.invokeMethodAsync('OnSceneCompleted');
        },
        progress(pct) { engine.setProgress(pct); }
    };

    try {
        await sceneDef.run(engine, ctx);
    } catch (e) {
        if (engine) console.error('Scene runner error:', e);
    }
}

/** Buka/tutup UI Blazor — pause input & pointer lock. */
export function setUiOpen(open) {
    engine?.setUiOpen(open);
}

export function dispose() {
    if (engine) {
        try { engine.dispose(); } catch { }
        engine = null;
    }
    sceneDef = null;
    started = false;
}
