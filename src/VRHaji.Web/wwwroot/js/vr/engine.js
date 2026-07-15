/**
 * VR Education Haji & Umrah — Core Engine (Three.js, WebGL 2.0)
 * Renderer HD: ACES Filmic tone mapping, PBR + PMREM environment,
 * PCF soft shadows, UnrealBloom, physical Sky, instanced crowds.
 */
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export { THREE };

/* ============================================================
 * Texture prosedural (canvas) — marmer, pasir, kiswah, papan teks
 * ============================================================ */
export const Tex = {
    _canvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        return c;
    },
    marble(tint = '#f4f1ea', vein = '#d9d2c0') {
        const c = this._canvas(512, 512), g = c.getContext('2d');
        g.fillStyle = tint; g.fillRect(0, 0, 512, 512);
        g.strokeStyle = vein; g.globalAlpha = 0.5;
        for (let i = 0; i < 40; i++) {
            g.lineWidth = 0.5 + Math.random() * 1.5;
            g.beginPath();
            let x = Math.random() * 512, y = Math.random() * 512;
            g.moveTo(x, y);
            for (let s = 0; s < 6; s++) {
                x += (Math.random() - 0.5) * 160; y += (Math.random() - 0.5) * 160;
                g.lineTo(x, y);
            }
            g.stroke();
        }
        // nat ubin
        g.globalAlpha = 0.35; g.strokeStyle = '#b9b2a2'; g.lineWidth = 2;
        for (let i = 0; i <= 4; i++) {
            g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 512); g.stroke();
            g.beginPath(); g.moveTo(0, i * 128); g.lineTo(512, i * 128); g.stroke();
        }
        const t = new THREE.CanvasTexture(c);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
    },
    noise(base = '#c9b18a', dots = '#a8916b', n = 4000) {
        const c = this._canvas(512, 512), g = c.getContext('2d');
        g.fillStyle = base; g.fillRect(0, 0, 512, 512);
        g.fillStyle = dots;
        for (let i = 0; i < n; i++) {
            g.globalAlpha = 0.15 + Math.random() * 0.4;
            const r = 0.6 + Math.random() * 2.2;
            g.beginPath();
            g.arc(Math.random() * 512, Math.random() * 512, r, 0, 7);
            g.fill();
        }
        const t = new THREE.CanvasTexture(c);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
    },
    kiswah() {
        // Kain hitam Ka'bah dengan pita kaligrafi emas (hizam)
        const c = this._canvas(1024, 1024), g = c.getContext('2d');
        g.fillStyle = '#0a0a0c'; g.fillRect(0, 0, 1024, 1024);
        g.globalAlpha = 0.12; g.strokeStyle = '#2c2c30'; g.lineWidth = 3;
        for (let i = 0; i < 64; i++) { // tenunan halus
            g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, 1024); g.stroke();
        }
        g.globalAlpha = 1;
        const bandY = 200, bandH = 130;
        const grad = g.createLinearGradient(0, bandY, 0, bandY + bandH);
        grad.addColorStop(0, '#8a6a14'); grad.addColorStop(0.5, '#e9c96a'); grad.addColorStop(1, '#8a6a14');
        g.fillStyle = grad; g.fillRect(0, bandY, 1024, bandH);
        g.fillStyle = '#171310';
        for (let x = 0; x < 1024; x += 16) { // motif kaligrafi tersamar
            const h = 26 + Math.sin(x * 0.13) * 16 + Math.random() * 22;
            g.fillRect(x + 3, bandY + bandH / 2 - h / 2, 9, h);
        }
        g.strokeStyle = '#f3dd9a'; g.lineWidth = 6;
        g.strokeRect(0, bandY + 4, 1024, bandH - 8);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
    },
    sign(text, { bg = '#0d2b4d', fg = '#ffffff', w = 512, h = 128, font = 'bold 56px "Segoe UI", sans-serif' } = {}) {
        const c = this._canvas(w, h), g = c.getContext('2d');
        g.fillStyle = bg; g.fillRect(0, 0, w, h);
        g.fillStyle = fg; g.font = font;
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(text, w / 2, h / 2);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
    },
    fids(title = 'KEBERANGKATAN — DEPARTURES') {
        // Papan jadwal penerbangan (Flight Information Display)
        const c = this._canvas(1024, 640), g = c.getContext('2d');
        g.fillStyle = '#0a0f16'; g.fillRect(0, 0, 1024, 640);
        g.fillStyle = '#122b45'; g.fillRect(0, 0, 1024, 88);
        g.fillStyle = '#ffd75e'; g.font = 'bold 44px "Segoe UI", sans-serif';
        g.textBaseline = 'middle';
        g.fillText('🛫  ' + title, 28, 46);
        const rows = [
            ['07:45', 'GA 980', 'JEDDAH', 'BOARDING', '#57d987'],
            ['08:10', 'SV 819', 'MADINAH', 'ON TIME', '#e8eef4'],
            ['08:40', 'GA 142', 'SURABAYA', 'ON TIME', '#e8eef4'],
            ['09:05', 'QR 955', 'DOHA', 'GATE OPEN', '#57d987'],
            ['09:30', 'EK 357', 'DUBAI', 'DELAYED', '#e8b64f'],
            ['10:00', 'GA 972', 'JEDDAH', 'ON TIME', '#e8eef4'],
            ['10:25', 'MH 720', 'KUALA LUMPUR', 'ON TIME', '#e8eef4'],
            ['11:15', 'TK 057', 'ISTANBUL', 'ON TIME', '#e8eef4']
        ];
        g.font = 'bold 30px "Consolas", monospace';
        rows.forEach((r, i) => {
            const y = 130 + i * 62;
            if (i % 2 === 0) { g.fillStyle = 'rgba(255,255,255,0.04)'; g.fillRect(0, y - 26, 1024, 52); }
            g.fillStyle = '#ffd75e'; g.fillText(r[0], 28, y);
            g.fillStyle = '#e8eef4'; g.fillText(r[1], 170, y);
            g.fillStyle = '#e8eef4'; g.fillText(r[2], 340, y);
            g.fillStyle = r[4]; g.fillText(r[3], 760, y);
        });
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
    },
    carpet(color = '#7a1f1f', line = '#d8b24a') {
        const c = this._canvas(512, 512), g = c.getContext('2d');
        g.fillStyle = color; g.fillRect(0, 0, 512, 512);
        g.strokeStyle = line; g.lineWidth = 4; g.globalAlpha = 0.85;
        for (let i = 0; i < 8; i++) {
            g.strokeRect(24 + i * 4, 24 + i * 60, 464 - i * 8, 40);
        }
        const t = new THREE.CanvasTexture(c);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
    }
};

/* ============================================================
 * Material pustaka PBR
 * ============================================================ */
export function makeMaterials() {
    const marbleTex = Tex.marble();
    marbleTex.repeat.set(24, 24);
    const marbleDark = Tex.marble('#e8e2d2', '#c4baa2');
    marbleDark.repeat.set(10, 10);
    const sandTex = Tex.noise();
    sandTex.repeat.set(40, 40);
    const rockTex = Tex.noise('#8d8377', '#6e6357', 5000);
    rockTex.repeat.set(30, 30);
    const carpetG = Tex.carpet('#14442f', '#cdae5a');
    carpetG.repeat.set(8, 8);
    return {
        marble: new THREE.MeshStandardMaterial({ map: marbleTex, roughness: 0.55, metalness: 0.02 }),
        marbleTile: new THREE.MeshStandardMaterial({ map: marbleDark, roughness: 0.3, metalness: 0.04 }),
        sand: new THREE.MeshStandardMaterial({ map: sandTex, roughness: 1, metalness: 0 }),
        rock: new THREE.MeshStandardMaterial({ map: rockTex, roughness: 1, metalness: 0 }),
        white: new THREE.MeshStandardMaterial({ color: 0xf5f2ea, roughness: 0.7 }),
        cream: new THREE.MeshStandardMaterial({ color: 0xe8dfc8, roughness: 0.8 }),
        gold: new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.9 }),
        grey: new THREE.MeshStandardMaterial({ color: 0x9a9a98, roughness: 0.9 }),
        darkGrey: new THREE.MeshStandardMaterial({ color: 0x55565a, roughness: 0.95 }),
        glass: new THREE.MeshPhysicalMaterial({
            color: 0xaaccee, roughness: 0.08, metalness: 0, transmission: 0.85,
            transparent: true, opacity: 0.55, side: THREE.DoubleSide
        }),
        kiswah: new THREE.MeshStandardMaterial({ map: Tex.kiswah(), roughness: 0.85, metalness: 0.12 }),
        greenDome: new THREE.MeshStandardMaterial({ color: 0x1f7a4d, roughness: 0.35, metalness: 0.15 }),
        carpetGreen: new THREE.MeshStandardMaterial({ map: carpetG, roughness: 0.95 }),
        wood: new THREE.MeshStandardMaterial({ color: 0x7a5a34, roughness: 0.8 }),
        steel: new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.35, metalness: 0.85 }),
        tarmac: new THREE.MeshStandardMaterial({ color: 0x3c3f44, roughness: 0.98 }),
        emissiveWarm: new THREE.MeshStandardMaterial({ color: 0xfff2cc, emissive: 0xffdf9e, emissiveIntensity: 2.2 }),
        emissiveCool: new THREE.MeshStandardMaterial({ color: 0xeaf4ff, emissive: 0xcfe6ff, emissiveIntensity: 1.8 })
    };
}

/* ============================================================
 * Audio prosedural (WebAudio): ambient bed + efek
 * ============================================================ */
class AudioBed {
    constructor() {
        this.ctx = null;
        this.master = null;
        this.bedGain = null;
        this.bedNodes = [];
    }
    ensure() {
        if (this.ctx) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.9;
        this.master.connect(this.ctx.destination);
        this.bedGain = this.ctx.createGain();
        this.bedGain.gain.value = 0;
        this.bedGain.connect(this.master);
    }
    _noiseBuffer(seconds = 2) {
        const rate = this.ctx.sampleRate;
        const buf = this.ctx.createBuffer(1, rate * seconds, rate);
        const d = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < d.length; i++) {
            const w = Math.random() * 2 - 1;
            last = (last + 0.02 * w) / 1.02; // brown-ish
            d[i] = last * 3.2;
        }
        return buf;
    }
    /** preset: 'airport' | 'crowd' | 'night' | 'wind' | 'interior' */
    ambient(preset, volume = 0.35) {
        this.ensure();
        if (!this.ctx) return;
        this.bedNodes.forEach(n => { try { n.stop(); } catch { } });
        this.bedNodes = [];
        const src = this.ctx.createBufferSource();
        src.buffer = this._noiseBuffer(3);
        src.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        const presets = {
            airport: { f: 420, q: 0.5, v: volume },
            crowd: { f: 560, q: 0.6, v: volume * 1.15 },
            night: { f: 180, q: 0.7, v: volume * 0.5 },
            wind: { f: 300, q: 0.3, v: volume * 0.8 },
            interior: { f: 240, q: 0.4, v: volume * 0.6 }
        };
        const p = presets[preset] || presets.wind;
        filter.frequency.value = p.f; filter.Q.value = p.q;
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.13; lfoGain.gain.value = p.f * 0.25;
        lfo.connect(lfoGain); lfoGain.connect(filter.frequency);
        src.connect(filter); filter.connect(this.bedGain);
        this.bedGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.bedGain.gain.linearRampToValueAtTime(p.v, this.ctx.currentTime + 1.5);
        src.start(); lfo.start();
        this.bedNodes.push(src, lfo);
    }
    sfx(kind) {
        this.ensure();
        if (!this.ctx) return;
        const t0 = this.ctx.currentTime;
        const tone = (freq, dur, type = 'sine', vol = 0.25, delay = 0) => {
            const o = this.ctx.createOscillator(), g = this.ctx.createGain();
            o.type = type; o.frequency.value = freq;
            g.gain.setValueAtTime(0, t0 + delay);
            g.gain.linearRampToValueAtTime(vol, t0 + delay + 0.015);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + dur);
            o.connect(g); g.connect(this.master);
            o.start(t0 + delay); o.stop(t0 + delay + dur + 0.05);
        };
        switch (kind) {
            case 'click': tone(880, 0.08, 'triangle', 0.18); break;
            case 'hover': tone(520, 0.05, 'sine', 0.06); break;
            case 'success': tone(523, 0.14, 'sine', 0.22); tone(659, 0.14, 'sine', 0.22, 0.12); tone(784, 0.3, 'sine', 0.25, 0.24); break;
            case 'fail': tone(220, 0.25, 'sawtooth', 0.12); tone(180, 0.3, 'sawtooth', 0.12, 0.18); break;
            case 'collect': tone(700, 0.07, 'triangle', 0.2); tone(1050, 0.1, 'triangle', 0.16, 0.06); break;
            case 'throw': tone(320, 0.18, 'triangle', 0.14); break;
            case 'stamp': tone(140, 0.12, 'square', 0.2); break;
            case 'step': tone(90, 0.05, 'triangle', 0.05); break;
            case 'chime': tone(988, 0.4, 'sine', 0.14); tone(740, 0.5, 'sine', 0.12, 0.3); break;
        }
    }
}

/* ============================================================
 * Narasi: Web Speech API + subtitle
 * ============================================================ */
class Narrator {
    constructor(subtitleEl) {
        this.el = subtitleEl;
        this.voice = null;
        this.enabled = 'speechSynthesis' in window;
        if (this.enabled) {
            const pick = () => {
                const vs = speechSynthesis.getVoices();
                this.voice = vs.find(v => v.lang?.toLowerCase().startsWith('id'))
                    || vs.find(v => v.lang?.toLowerCase().startsWith('ms'))
                    || null;
            };
            pick();
            speechSynthesis.onvoiceschanged = pick;
        }
    }
    stop() {
        if (this.enabled) speechSynthesis.cancel();
        if (this.el) this.el.textContent = '';
    }
    say(text, { sub = null, rate = 1.02 } = {}) {
        const subtitle = sub ?? text;
        if (this.el) this.el.textContent = subtitle;
        const minMs = Math.max(2200, subtitle.length * 62);
        return new Promise(resolve => {
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                if (this.el && this.el.textContent === subtitle) this.el.textContent = '';
                resolve();
            };
            if (this.enabled) {
                try {
                    const u = new SpeechSynthesisUtterance(text);
                    u.lang = 'id-ID';
                    if (this.voice) u.voice = this.voice;
                    u.rate = rate;
                    u.onend = finish;
                    u.onerror = finish;
                    speechSynthesis.speak(u);
                    setTimeout(finish, minMs + 14000); // pengaman
                } catch { setTimeout(finish, minMs); }
            } else {
                setTimeout(finish, minMs);
            }
        });
    }
}

/* ============================================================
 * Kerumunan jamaah — figur manusia instanced (kepala, torso,
 * dua kaki berporos pinggul, dua lengan berporos bahu) dengan
 * animasi berjalan. Terdaftar otomatis agar di-update engine.
 * ============================================================ */
export const ACTIVE_CROWDS = [];
const SKIN_TONES = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac, 0xa5673f];

export class Crowd {
    /**
     * @param {object} opts { count, mode:'orbit'|'line'|'idle'|'sit'|'wander',
     *                        center, rMin, rMax, from, to, area:{x,z,w,d},
     *                        spots:[{x,z,ry}], sitY, colors:[hex...] }
     */
    constructor(scene, opts) {
        this.opts = opts;
        if (opts.mode === 'sit' && opts.spots) {
            opts.count = Math.min(opts.count, opts.spots.length);
        }
        const count = opts.count;
        // Pivot kaki di pinggul & lengan di bahu (geometri digeser) agar bisa diayun
        const torsoGeo = new THREE.CapsuleGeometry(0.165, 0.4, 4, 10);
        const headGeo = new THREE.SphereGeometry(0.115, 12, 10);
        const legGeo = new THREE.CapsuleGeometry(0.07, 0.5, 3, 8);
        legGeo.translate(0, -0.32, 0);
        const armGeo = new THREE.CapsuleGeometry(0.048, 0.44, 3, 8);
        armGeo.translate(0, -0.27, 0);
        const clothMat = new THREE.MeshStandardMaterial({ roughness: 0.92 });
        const pantsMat = new THREE.MeshStandardMaterial({ roughness: 0.95 });
        const skinMat = new THREE.MeshStandardMaterial({ roughness: 0.65 });
        this.torsos = new THREE.InstancedMesh(torsoGeo, clothMat, count);
        this.heads = new THREE.InstancedMesh(headGeo, skinMat, count);
        this.legL = new THREE.InstancedMesh(legGeo, pantsMat, count);
        this.legR = new THREE.InstancedMesh(legGeo.clone(), pantsMat, count);
        this.armL = new THREE.InstancedMesh(armGeo, clothMat, count);
        this.armR = new THREE.InstancedMesh(armGeo.clone(), clothMat, count);
        this.parts = [this.torsos, this.heads, this.legL, this.legR, this.armL, this.armR];
        for (const p of this.parts) {
            p.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            p.castShadow = true;
        }
        this.agents = [];
        const colors = opts.colors || [0xffffff];
        const cOutfit = new THREE.Color(), cPants = new THREE.Color(), cSkin = new THREE.Color();
        for (let i = 0; i < count; i++) {
            const a = {
                phase: Math.random() * Math.PI * 2,
                speed: 0.7 + Math.random() * 0.5,
                s: 0.92 + Math.random() * 0.14
            };
            if (opts.mode === 'orbit') {
                a.r = opts.rMin + Math.random() * (opts.rMax - opts.rMin);
                a.angle = Math.random() * Math.PI * 2;
                a.w = (opts.angularSpeed ?? 0.1) * (opts.rMin / a.r) * (0.8 + Math.random() * 0.4);
            } else if (opts.mode === 'line') {
                a.t = Math.random();
                a.dir = Math.random() > 0.5 ? 1 : -1;
                a.lane = (Math.random() - 0.5) * (opts.width ?? 6);
                a.v = 0.02 + Math.random() * 0.02;
            } else if (opts.mode === 'wander') {
                a.x = opts.area.x + (Math.random() - 0.5) * opts.area.w;
                a.z = opts.area.z + (Math.random() - 0.5) * opts.area.d;
                a.tx = a.x; a.tz = a.z;
                a.heading = Math.random() * Math.PI * 2;
                a.v = 0.55 + Math.random() * 0.5;
                a.dwell = Math.random() * 3;
            } else if (opts.mode === 'sit' && opts.spots) {
                const sp = opts.spots[i];
                a.x = sp.x; a.z = sp.z;
                a.heading = sp.ry ?? 0;
                a.sit = true;
            } else {
                a.x = opts.area ? opts.area.x + (Math.random() - 0.5) * opts.area.w : (Math.random() - 0.5) * 20;
                a.z = opts.area ? opts.area.z + (Math.random() - 0.5) * opts.area.d : (Math.random() - 0.5) * 20;
                a.heading = Math.random() * Math.PI * 2;
                a.sit = opts.mode === 'sit';
            }
            this.agents.push(a);
            cOutfit.setHex(colors[Math.floor(Math.random() * colors.length)]);
            // pakaian terang (ihram) = jubah sewarna; pakaian gelap = celana lebih gelap
            const lum = cOutfit.r * 0.3 + cOutfit.g * 0.6 + cOutfit.b * 0.1;
            if (lum > 0.72) cPants.copy(cOutfit).multiplyScalar(0.93);
            else cPants.copy(cOutfit).multiplyScalar(0.35 + Math.random() * 0.2);
            cSkin.setHex(SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)]);
            this.torsos.setColorAt(i, cOutfit);
            this.armL.setColorAt(i, cOutfit);
            this.armR.setColorAt(i, cOutfit);
            this.legL.setColorAt(i, cPants);
            this.legR.setColorAt(i, cPants);
            this.heads.setColorAt(i, cSkin);
        }
        for (const p of this.parts) {
            if (p.instanceColor) p.instanceColor.needsUpdate = true;
        }
        scene.add(...this.parts);
        this._m = new THREE.Matrix4();
        this._p = new THREE.Vector3();
        this._q = new THREE.Quaternion();
        this._qSwing = new THREE.Quaternion();
        this._s = new THREE.Vector3(1, 1, 1);
        this._up = new THREE.Vector3(0, 1, 0);
        this._right = new THREE.Vector3(1, 0, 0);
        ACTIVE_CROWDS.push(this);
        this.update(0, 0);
    }
    /** Tempatkan satu bagian tubuh: offset lokal diputar sesuai heading. */
    _place(mesh, i, x, y, z, ox, oy, oz, qYaw, swing, sc) {
        this._p.set(ox * sc, 0, oz * sc).applyQuaternion(qYaw);
        if (swing !== 0) {
            this._qSwing.setFromAxisAngle(this._right, swing);
            this._q.copy(qYaw).multiply(this._qSwing);
        } else {
            this._q.copy(qYaw);
        }
        this._s.setScalar(sc);
        this._m.compose(this._p.set(x + this._p.x, y + oy * sc, z + this._p.z), this._q, this._s);
        mesh.setMatrixAt(i, this._m);
    }
    update(dt, time) {
        const o = this.opts;
        const qYaw = new THREE.Quaternion();
        for (let i = 0; i < this.agents.length; i++) {
            const a = this.agents[i];
            let x, z, heading = a.heading ?? 0, moving = false;
            if (o.mode === 'orbit') {
                a.angle -= a.w * dt; // berlawanan arah jarum jam
                x = o.center.x + Math.cos(a.angle) * a.r;
                z = o.center.z + Math.sin(a.angle) * a.r;
                heading = -a.angle - Math.PI;
                moving = true;
            } else if (o.mode === 'line') {
                a.t += a.v * dt * a.dir;
                if (a.t > 1) { a.t = 1; a.dir = -1; }
                if (a.t < 0) { a.t = 0; a.dir = 1; }
                x = o.from.x + (o.to.x - o.from.x) * a.t;
                z = o.from.z + (o.to.z - o.from.z) * a.t;
                const px = o.to.z - o.from.z, pz = -(o.to.x - o.from.x);
                const pl = Math.hypot(px, pz) || 1;
                x += (px / pl) * a.lane; z += (pz / pl) * a.lane;
                heading = Math.atan2((o.to.x - o.from.x) * a.dir, (o.to.z - o.from.z) * a.dir);
                moving = true;
            } else if (o.mode === 'wander') {
                const dx = a.tx - a.x, dz = a.tz - a.z;
                const d = Math.hypot(dx, dz);
                if (d < 0.35) {
                    if (a.dwell > 0) {
                        a.dwell -= dt;
                    } else {
                        a.tx = o.area.x + (Math.random() - 0.5) * o.area.w;
                        a.tz = o.area.z + (Math.random() - 0.5) * o.area.d;
                        a.dwell = 0.8 + Math.random() * 4;
                    }
                } else {
                    const target = Math.atan2(dx, dz);
                    // belok halus ke arah tujuan
                    let dh = target - a.heading;
                    if (dh > Math.PI) dh -= Math.PI * 2;
                    if (dh < -Math.PI) dh += Math.PI * 2;
                    a.heading += dh * Math.min(1, dt * 4);
                    a.x += Math.sin(a.heading) * a.v * dt;
                    a.z += Math.cos(a.heading) * a.v * dt;
                    moving = true;
                }
                x = a.x; z = a.z; heading = a.heading;
            } else {
                x = a.x; z = a.z;
            }
            const sc = a.s;
            const wp = time * 5.5 * a.speed + a.phase;
            const bob = moving ? Math.abs(Math.sin(wp)) * 0.045 : Math.sin(time * 1.4 + a.phase) * 0.008;
            const legSwing = moving ? Math.sin(wp) * 0.55 : 0;
            const armSwing = moving ? -Math.sin(wp) * 0.4 : Math.sin(time * 1.4 + a.phase) * 0.03;
            qYaw.setFromAxisAngle(this._up, heading);
            if (a.sit) {
                // duduk: paha horizontal ke depan, badan rendah
                const hip = (o.sitY ?? 0.28) * sc;
                this._place(this.legL, i, x, hip, z, -0.09, 0, 0.06, qYaw, 1.35, sc);
                this._place(this.legR, i, x, hip, z, 0.09, 0, 0.06, qYaw, 1.35, sc);
                this._place(this.torsos, i, x, hip + 0.31 * sc, z, 0, 0, 0, qYaw, 0, sc);
                this._place(this.heads, i, x, hip + 0.81 * sc, z, 0, 0, 0, qYaw, 0, sc);
                this._place(this.armL, i, x, hip + 0.62 * sc, z, -0.225, 0, 0, qYaw, 0.55, sc);
                this._place(this.armR, i, x, hip + 0.62 * sc, z, 0.225, 0, 0, qYaw, 0.55, sc);
            } else {
                const hip = (0.66 + bob) * sc;
                this._place(this.legL, i, x, hip, z, -0.09, 0, 0, qYaw, legSwing, sc);
                this._place(this.legR, i, x, hip, z, 0.09, 0, 0, qYaw, -legSwing, sc);
                this._place(this.torsos, i, x, hip + 0.31 * sc, z, 0, 0, 0, qYaw, 0, sc);
                this._place(this.heads, i, x, hip + 0.81 * sc, z, 0, 0, 0, qYaw, 0, sc);
                this._place(this.armL, i, x, hip + 0.62 * sc, z, -0.225, 0, 0, qYaw, armSwing, sc);
                this._place(this.armR, i, x, hip + 0.62 * sc, z, 0.225, 0, 0, qYaw, -armSwing, sc);
            }
        }
        for (const p of this.parts) p.instanceMatrix.needsUpdate = true;
    }
}

/* ============================================================
 * ENGINE UTAMA
 * ============================================================ */
const _NDC_CENTER = new THREE.Vector2(0, 0);

export class Engine {
    constructor(container) {
        this.container = container;
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        // Supersampling ringan: minimal 1.5× agar tetap tajam di monitor ber-DPR 1
        this.renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1.5), 2));
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.85;
        container.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            60, container.clientWidth / container.clientHeight, 0.1, 1200);
        this.camera.position.set(0, 1.7, 5);

        // Post-processing: bloom halus agar lampu & emissive bercahaya
        this.composer = new EffectComposer(this.renderer);
        this.composer.setPixelRatio(this.renderer.getPixelRatio());
        // MSAA pada render target composer — tanpa ini post-processing menghilangkan antialias
        if (this.renderer.capabilities.isWebGL2) {
            this.composer.renderTarget1.samples = 4;
            this.composer.renderTarget2.samples = 4;
        }
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.bloom = new UnrealBloomPass(
            new THREE.Vector2(container.clientWidth, container.clientHeight), 0.32, 0.5, 0.88);
        this.composer.addPass(this.bloom);
        this.composer.addPass(new OutputPass());

        this.pmrem = new THREE.PMREMGenerator(this.renderer);
        this._roomEnv = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

        this.clock = new THREE.Clock();
        this.keys = {};
        this.updaters = [];
        this.interactables = [];
        this.walkRects = [];
        this.walkCircles = [];
        this.blockers = [];
        this.uiOpen = false;
        this.paused = false;
        this._hover = null;
        this._pendingResolve = null;
        this.audio = new AudioBed();
        this.mats = makeMaterials();
        this.playerSpeed = 3.2;
        this.runSpeed = 6.4;
        this.minimapCfg = null;
        this.waypoint = null;
        this._raycaster = new THREE.Raycaster();
        this._pointerNDC = new THREE.Vector2(0, 0);
        this._dragging = false;
        this._dragMoved = 0;

        this.hud = {
            subtitle: document.getElementById('vr-subtitle'),
            hint: document.getElementById('vr-hint'),
            objective: document.getElementById('vr-objective'),
            counter: document.getElementById('vr-counter'),
            progress: document.getElementById('vr-progressbar'),
            compass: document.getElementById('vr-compass-dial'),
            interactLabel: document.getElementById('vr-interact-label'),
            minimap: document.getElementById('vr-minimap')
        };
        this.narrator = new Narrator(this.hud.subtitle);

        // Fade overlay
        this.fadeEl = document.createElement('div');
        Object.assign(this.fadeEl.style, {
            position: 'absolute', inset: '0', background: '#000', opacity: '1',
            transition: 'opacity 1.2s ease', pointerEvents: 'none', zIndex: '4'
        });
        container.appendChild(this.fadeEl);

        this._onKeyDown = e => { this.keys[e.code] = true; };
        this._onKeyUp = e => { this.keys[e.code] = false; };
        this._onResize = () => this.resize();
        // Kontrol "tahan & geser": tahan klik/touchpad untuk melihat sekeliling,
        // lepas tombol = kursor bebas otomatis (tanpa Esc).
        // Klik tanpa geser = interaksi objek langsung.
        this._onMouseDown = e => {
            if (this.uiOpen || e.button !== 0) return;
            this._dragging = true;
            this._dragMoved = 0;
            this._lastCX = e.clientX;
            this._lastCY = e.clientY;
        };
        this._onMouseMove = e => {
            const r = this.renderer.domElement.getBoundingClientRect();
            this._pointerNDC.set(
                ((e.clientX - r.left) / r.width) * 2 - 1,
                -((e.clientY - r.top) / r.height) * 2 + 1);
            if (!this._dragging || this.uiOpen || this.paused) return;
            // movementX hanya andal saat pointer terkunci; selain itu pakai delta clientX
            let mx, my;
            if (document.pointerLockElement === this.renderer.domElement) {
                mx = e.movementX ?? 0; my = e.movementY ?? 0;
            } else {
                mx = e.clientX - this._lastCX;
                my = e.clientY - this._lastCY;
            }
            this._lastCX = e.clientX;
            this._lastCY = e.clientY;
            this._dragMoved += Math.abs(mx) + Math.abs(my);
            // kunci pointer hanya SELAMA drag agar gerakan tak terbatas tepi layar
            if (this._dragMoved > 5 && document.pointerLockElement !== this.renderer.domElement) {
                try { this.renderer.domElement.requestPointerLock(); } catch { }
            }
            const eul = new THREE.Euler().setFromQuaternion(this.camera.quaternion, 'YXZ');
            eul.y -= mx * 0.0028;
            eul.x = Math.max(-1.45, Math.min(1.45, eul.x - my * 0.0028));
            eul.z = 0;
            this.camera.quaternion.setFromEuler(eul);
        };
        this._onMouseUp = e => {
            if (e.button !== 0 || !this._dragging) return;
            const wasDrag = this._dragMoved > 6;
            this._dragging = false;
            if (document.pointerLockElement) {
                try { document.exitPointerLock(); } catch { }
            }
            if (!wasDrag) this._handleClick();
        };
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);
        window.addEventListener('resize', this._onResize);
        this.renderer.domElement.addEventListener('mousedown', this._onMouseDown);
        document.addEventListener('mousemove', this._onMouseMove);
        document.addEventListener('mouseup', this._onMouseUp);
        this.renderer.domElement.style.cursor = 'crosshair';
        this.renderer.setAnimationLoop(() => this._tick());
    }

    /* ------------ Lingkungan & pencahayaan ------------ */

    /** preset waktu: 'day' | 'goldenHour' | 'night' | 'dawn' */
    setEnvironment(preset, { fog = true } = {}) {
        const cfg = {
            day: { elev: 55, azim: 140, turb: 6, rayl: 1.2, expo: 0.55, sun: 1.9, sunColor: 0xfff3df, hemi: 0.35, fogC: 0xcfd9e4, envI: 0.38, bloom: 0.1 },
            goldenHour: { elev: 8, azim: 250, turb: 7, rayl: 2.6, expo: 0.55, sun: 1.7, sunColor: 0xffc37a, hemi: 0.28, fogC: 0xe8c9a0, envI: 0.35, bloom: 0.18 },
            dawn: { elev: 3, azim: 95, turb: 8, rayl: 3.2, expo: 0.6, sun: 1.1, sunColor: 0xa8bfe8, hemi: 0.24, fogC: 0x9fb2cd, envI: 0.32, bloom: 0.25 },
            night: { elev: -12, azim: 0, turb: 4, rayl: 1, expo: 0.75, sun: 0.35, sunColor: 0xa9c3ff, hemi: 0.12, fogC: 0x0a1120, envI: 0.22, bloom: 0.35 }
        }[preset] || {};
        this.envPreset = preset;
        this.renderer.toneMappingExposure = cfg.expo;
        this.bloom.strength = cfg.bloom;

        if (preset === 'night') {
            this.scene.background = new THREE.Color(0x060b18);
            this._addStars();
            this._addMoon();
        } else {
            const sky = new Sky();
            sky.scale.setScalar(45000);
            const u = sky.material.uniforms;
            u.turbidity.value = cfg.turb;
            u.rayleigh.value = cfg.rayl;
            u.mieCoefficient.value = 0.004;
            u.mieDirectionalG.value = 0.8;
            const sun = new THREE.Vector3();
            const phi = THREE.MathUtils.degToRad(90 - cfg.elev);
            const theta = THREE.MathUtils.degToRad(cfg.azim);
            sun.setFromSphericalCoords(1, phi, theta);
            u.sunPosition.value.copy(sun);
            this.scene.add(sky);
            this.sunDir = sun.clone();
            if (preset === 'dawn') this._addStars(600, 0.35);
        }
        this.scene.environment = this._roomEnv;
        this.scene.environmentIntensity = cfg.envI;

        // Cahaya
        const hemi = new THREE.HemisphereLight(0xdfeaff, 0x8a7a5c, cfg.hemi);
        this.scene.add(hemi);
        const dir = new THREE.DirectionalLight(cfg.sunColor, cfg.sun);
        const sd = this.sunDir || new THREE.Vector3(-0.4, 0.8, 0.3);
        dir.position.copy(sd.clone().multiplyScalar(140));
        dir.castShadow = true;
        dir.shadow.mapSize.set(4096, 4096);
        dir.shadow.camera.left = -90; dir.shadow.camera.right = 90;
        dir.shadow.camera.top = 90; dir.shadow.camera.bottom = -90;
        dir.shadow.camera.far = 420;
        dir.shadow.bias = -0.0004;
        this.scene.add(dir);
        this.sunLight = dir;

        if (fog) {
            const density = preset === 'night' ? 0.006 : 0.0012;
            this.scene.fog = new THREE.FogExp2(cfg.fogC, density);
        }
    }

    _addStars(count = 1600, opacity = 0.9) {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const v = new THREE.Vector3().randomDirection();
            v.y = Math.abs(v.y) * 0.9 + 0.08;
            v.normalize().multiplyScalar(900);
            pos.set([v.x, v.y, v.z], i * 3);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            color: 0xffffff, size: 1.6, sizeAttenuation: false,
            transparent: true, opacity
        });
        this.scene.add(new THREE.Points(geo, mat));
    }

    _addMoon() {
        const moon = new THREE.Mesh(
            new THREE.SphereGeometry(14, 24, 18),
            new THREE.MeshBasicMaterial({ color: 0xf4f1e0 }));
        moon.position.set(-260, 320, -520);
        this.scene.add(moon);
        const glow = new THREE.PointLight(0xbcd0ff, 0.6, 0, 0);
        glow.position.copy(moon.position);
        this.scene.add(glow);
    }

    addPointLamp(x, y, z, { color = 0xffdf9e, intensity = 22, distance = 30 } = {}) {
        const l = new THREE.PointLight(color, intensity, distance, 2);
        l.position.set(x, y, z);
        this.scene.add(l);
        return l;
    }

    ground(size, material, y = 0) {
        const g = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
        g.rotation.x = -Math.PI / 2;
        g.position.y = y;
        g.receiveShadow = true;
        this.scene.add(g);
        return g;
    }

    /* ------------ Player, navigasi, collision ------------ */

    spawn(x, z, yawDeg = 0, y = 1.7) {
        this.camera.position.set(x, y, z);
        this.camera.rotation.set(0, THREE.MathUtils.degToRad(yawDeg), 0, 'YXZ');
    }

    addWalkRect(x1, z1, x2, z2) {
        this.walkRects.push({ x1: Math.min(x1, x2), z1: Math.min(z1, z2), x2: Math.max(x1, x2), z2: Math.max(z1, z2) });
    }
    addWalkCircle(x, z, rOuter, rInner = 0) {
        this.walkCircles.push({ x, z, rOuter, rInner });
    }
    addBlocker(x1, z1, x2, z2) {
        this.blockers.push({ x1: Math.min(x1, x2), z1: Math.min(z1, z2), x2: Math.max(x1, x2), z2: Math.max(z1, z2) });
    }
    _walkable(x, z) {
        for (const b of this.blockers) {
            if (x > b.x1 && x < b.x2 && z > b.z1 && z < b.z2) return false;
        }
        if (this.walkRects.length === 0 && this.walkCircles.length === 0) return true;
        for (const r of this.walkRects) {
            if (x >= r.x1 && x <= r.x2 && z >= r.z1 && z <= r.z2) return true;
        }
        for (const c of this.walkCircles) {
            const d = Math.hypot(x - c.x, z - c.z);
            if (d <= c.rOuter && d >= c.rInner) return true;
        }
        return false;
    }

    _movePlayer(dt) {
        if (this.uiOpen) return;
        const speed = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) ? this.runSpeed : this.playerSpeed;
        let f = 0, s = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) f += 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) f -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) s += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) s -= 1;
        if (!f && !s) return;
        const len = Math.hypot(f, s);
        f /= len; s /= len;
        const prev = this.camera.position.clone();
        // maju/samping relatif arah pandang (yaw): yaw 0 menghadap -Z
        const eul = new THREE.Euler().setFromQuaternion(this.camera.quaternion, 'YXZ');
        const sinY = Math.sin(eul.y), cosY = Math.cos(eul.y);
        const p = this.camera.position;
        p.x += (f * -sinY + s * cosY) * speed * dt;
        p.z += (f * -cosY + s * -sinY) * speed * dt;
        if (!this._walkable(p.x, p.z)) {
            // coba per-sumbu agar bisa menyusur dinding
            if (this._walkable(p.x, prev.z)) p.z = prev.z;
            else if (this._walkable(prev.x, p.z)) p.x = prev.x;
            else p.copy(prev);
        }
        p.y = 1.7;
    }

    /* ------------ Interaksi (hover + klik) ------------ */

    addInteractable(object3d, { label, onClick, once = true, radius = 14 } = {}) {
        object3d.traverse(o => { o.userData.interactRoot = object3d; });
        object3d.userData.interact = { label, onClick, once, radius, enabled: true };
        this.interactables.push(object3d);
        return object3d;
    }
    removeInteractable(object3d) {
        const i = this.interactables.indexOf(object3d);
        if (i >= 0) this.interactables.splice(i, 1);
        if (object3d.userData.interact) object3d.userData.interact.enabled = false;
    }

    _raycastInteract() {
        if (this.interactables.length === 0) return null;
        // saat drag pakai tengah layar, selain itu ikuti posisi kursor
        const ndc = this._dragging ? _NDC_CENTER : this._pointerNDC;
        this._raycaster.setFromCamera(ndc, this.camera);
        this._raycaster.far = 30;
        const hits = this._raycaster.intersectObjects(this.interactables, true);
        for (const h of hits) {
            const root = h.object.userData.interactRoot;
            if (!root || !root.userData.interact?.enabled) continue;
            const d = this.camera.position.distanceTo(
                root.getWorldPosition(new THREE.Vector3()));
            if (d <= root.userData.interact.radius) return root;
        }
        return null;
    }

    _setHover(obj) {
        if (this._hover === obj) return;
        if (this._hover) this._applyHighlight(this._hover, false);
        this._hover = obj;
        if (obj) {
            this._applyHighlight(obj, true);
            this.hud.interactLabel.textContent = '🖱 ' + (obj.userData.interact.label || 'Interaksi');
            this.audio.sfx('hover');
        } else {
            this.hud.interactLabel.textContent = '';
        }
    }
    _applyHighlight(obj, on) {
        obj.traverse(o => {
            if (o.isMesh && o.material && o.material.emissive !== undefined) {
                if (on) {
                    if (o.userData._origEmissive === undefined) {
                        o.userData._origEmissive = o.material.emissive.getHex();
                        o.userData._origEmissiveI = o.material.emissiveIntensity;
                        o.material = o.material.clone();
                        o.material.emissive.setHex(0xc9a227);
                        o.material.emissiveIntensity = 0.45;
                    }
                } else if (o.userData._origEmissive !== undefined) {
                    o.material.emissive.setHex(o.userData._origEmissive);
                    o.material.emissiveIntensity = o.userData._origEmissiveI;
                    delete o.userData._origEmissive;
                }
            }
        });
    }

    _handleClick() {
        if (this.uiOpen) return;
        const obj = this._hover || this._raycastInteract();
        if (!obj) return;
        const it = obj.userData.interact;
        if (!it?.enabled) return;
        this.audio.sfx('click');
        if (it.once) {
            it.enabled = false;
            this._setHover(null);
        }
        it.onClick?.(obj);
    }

    /* ------------ Waypoint / beacon tujuan ------------ */

    showWaypoint(x, z, color = 0x37c978) {
        this.hideWaypoint();
        const grp = new THREE.Group();
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.9, 0.07, 10, 40),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.08;
        const beam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.28, 0.42, 7, 14, 1, true),
            new THREE.MeshBasicMaterial({
                color, transparent: true, opacity: 0.22,
                side: THREE.DoubleSide, depthWrite: false
            }));
        beam.position.y = 3.5;
        grp.add(ring, beam);
        grp.position.set(x, 0, z);
        this.scene.add(grp);
        this.waypoint = grp;
        this._waypointRing = ring;
        // Jalur cahaya dari pemain menuju waypoint (titik mengalir di lantai)
        const dotGeo = new THREE.SphereGeometry(0.15, 8, 6);
        const dotMat = new THREE.MeshBasicMaterial({
            color, transparent: true, opacity: 0.95, depthWrite: false
        });
        this._guide = new THREE.InstancedMesh(dotGeo, dotMat, 36);
        this._guide.frustumCulled = false;
        this.scene.add(this._guide);
        this._guideM = this._guideM || new THREE.Matrix4();
    }
    hideWaypoint() {
        if (this.waypoint) {
            this.scene.remove(this.waypoint);
            this.waypoint = null;
        }
        if (this._guide) {
            this.scene.remove(this._guide);
            this._guide.geometry.dispose();
            this._guide.material.dispose();
            this._guide = null;
        }
    }

    /** Titik cahaya mengalir dari posisi pemain ke waypoint aktif. */
    _updateGuide(t) {
        if (!this._guide || !this.waypoint) return;
        const p = this.camera.position, w = this.waypoint.position;
        const dx = w.x - p.x, dz = w.z - p.z;
        const dist = Math.hypot(dx, dz);
        const n = this._guide.count;
        const flow = (t * 0.35) % (1 / n);
        for (let i = 0; i < n; i++) {
            const u = i / n + flow;
            const d = u * dist;
            // sembunyikan titik yang terlalu dekat pemain / sudah sampai target
            if (d < 1.4 || d > dist - 0.9 || dist < 3) {
                this._guideM.makeScale(0, 0, 0);
            } else {
                const pulse = 0.75 + 0.45 * Math.sin(t * 5 - u * 14);
                this._guideM.makeScale(pulse, pulse, pulse);
                this._guideM.setPosition(p.x + dx * u, 0.18 + Math.sin(u * Math.PI) * 0.1, p.z + dz * u);
            }
            this._guide.setMatrixAt(i, this._guideM);
        }
        this._guide.instanceMatrix.needsUpdate = true;
    }

    /** Menunggu player tiba di titik (x,z). */
    goto(x, z, { radius = 2.2, label = null } = {}) {
        if (label) this.setObjective(label);
        this.showWaypoint(x, z);
        return new Promise(resolve => {
            const check = () => {
                const p = this.camera.position;
                if (Math.hypot(p.x - x, p.z - z) < radius) {
                    this.hideWaypoint();
                    this.audio.sfx('chime');
                    return true;
                }
                return false;
            };
            this.updaters.push({ done: false, fn: (dt, t, self) => { if (check()) { self.done = true; resolve(); } } });
        });
    }

    /** Menunggu klik pada objek interaktif tertentu. */
    interact(object3d, { label, radius = 10, highlightBeacon = true } = {}) {
        return new Promise(resolve => {
            if (highlightBeacon) {
                const p = object3d.getWorldPosition(new THREE.Vector3());
                this.showWaypoint(p.x, p.z, 0xc9a227);
            }
            this.addInteractable(object3d, {
                label, radius,
                onClick: () => { this.hideWaypoint(); resolve(); }
            });
        });
    }

    /* ------------ HUD ------------ */

    setObjective(t) { if (this.hud.objective) this.hud.objective.textContent = t ? '🎯 ' + t : ''; }
    setHint(t) { if (this.hud.hint) this.hud.hint.textContent = t || ''; }
    setCounter(t) { if (this.hud.counter) this.hud.counter.innerHTML = t || ''; }
    setProgress(pct) { if (this.hud.progress) this.hud.progress.style.width = Math.round(pct) + '%'; }

    narrate(text, opts) { return this.narrator.say(text, opts); }
    subtitle(t) { if (this.hud.subtitle) this.hud.subtitle.textContent = t || ''; }

    notifyDotnet(msg, type = 'info') {
        this.dotnet?.invokeMethodAsync('OnNotify', msg, type);
    }

    configureMinimap(cfg) { this.minimapCfg = cfg; }

    _drawMinimap() {
        const c = this.hud.minimap;
        if (!c || !this.minimapCfg) return;
        const g = c.getContext('2d');
        const { scale = 1.2, center = { x: 0, z: 0 } } = this.minimapCfg;
        const W = c.width, H = c.height;
        g.clearRect(0, 0, W, H);
        g.fillStyle = 'rgba(8,12,20,0.85)';
        g.fillRect(0, 0, W, H);
        const px = (x, z) => [
            W / 2 + (x - center.x) * scale,
            H / 2 + (z - center.z) * scale
        ];
        // area jalan
        g.strokeStyle = 'rgba(201,162,39,0.5)'; g.lineWidth = 1;
        g.fillStyle = 'rgba(60,80,110,0.35)';
        for (const r of this.walkRects) {
            const [ax, az] = px(r.x1, r.z1), [bx, bz] = px(r.x2, r.z2);
            g.fillRect(ax, az, bx - ax, bz - az);
            g.strokeRect(ax, az, bx - ax, bz - az);
        }
        for (const ci of this.walkCircles) {
            const [cx, cz] = px(ci.x, ci.z);
            g.beginPath(); g.arc(cx, cz, ci.rOuter * scale, 0, 7); g.fill(); g.stroke();
            if (ci.rInner > 0) {
                g.fillStyle = 'rgba(8,12,20,0.9)';
                g.beginPath(); g.arc(cx, cz, ci.rInner * scale, 0, 7); g.fill();
                g.fillStyle = 'rgba(60,80,110,0.35)';
            }
        }
        // fitur khusus
        for (const f of (this.minimapCfg.features || [])) {
            const [fx, fz] = px(f.x, f.z);
            g.fillStyle = f.color || '#e8c96a';
            if (f.type === 'square') g.fillRect(fx - 4, fz - 4, 8, 8);
            else { g.beginPath(); g.arc(fx, fz, 3.5, 0, 7); g.fill(); }
        }
        // waypoint
        if (this.waypoint) {
            const [wx, wz] = px(this.waypoint.position.x, this.waypoint.position.z);
            g.fillStyle = '#37c978';
            g.beginPath(); g.arc(wx, wz, 5, 0, 7); g.fill();
        }
        // player
        const p = this.camera.position;
        const [pxx, pzz] = px(p.x, p.z);
        const e = new THREE.Euler().setFromQuaternion(this.camera.quaternion, 'YXZ');
        g.save();
        g.translate(pxx, pzz);
        g.rotate(-e.y);
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.moveTo(0, -7); g.lineTo(5, 6); g.lineTo(-5, 6);
        g.closePath(); g.fill();
        g.restore();
    }

    /* ------------ Transisi ------------ */

    async fadeIn(ms = 1200) {
        this.fadeEl.style.transitionDuration = ms + 'ms';
        this.fadeEl.style.opacity = '0';
        await new Promise(r => setTimeout(r, ms));
    }
    async fadeOut(ms = 800) {
        this.fadeEl.style.transitionDuration = ms + 'ms';
        this.fadeEl.style.opacity = '1';
        await new Promise(r => setTimeout(r, ms));
    }
    async teleport(x, z, yawDeg, ms = 900) {
        await this.fadeOut(ms);
        this.spawn(x, z, yawDeg);
        await this.fadeIn(ms);
    }

    wait(ms) { return new Promise(r => setTimeout(r, ms)); }

    /* ------------ Loop ------------ */

    onUpdate(fn) { this.updaters.push({ done: false, fn }); }

    _tick() {
        const dt = Math.min(this.clock.getDelta(), 0.05);
        const t = this.clock.elapsedTime;
        if (!this.paused) {
            this._movePlayer(dt);
            for (const c of ACTIVE_CROWDS) c.update(dt, t);
            for (let i = this.updaters.length - 1; i >= 0; i--) {
                const u = this.updaters[i];
                u.fn(dt, t, u);
                if (u.done) this.updaters.splice(i, 1);
            }
            if (this.waypoint && this._waypointRing) {
                const s = 1 + Math.sin(t * 4) * 0.18;
                this._waypointRing.scale.setScalar(s);
                this.waypoint.rotation.y = t * 0.8;
                this._updateGuide(t);
            }
            if (!this.uiOpen) this._setHover(this._raycastInteract());
            // kompas
            if (this.hud.compass) {
                const e = new THREE.Euler().setFromQuaternion(this.camera.quaternion, 'YXZ');
                this.hud.compass.style.transform = `rotate(${e.y}rad)`;
            }
            this._drawMinimap();
        }
        this.composer.render();
    }

    resize() {
        const w = this.container.clientWidth, h = this.container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
        this.composer.setSize(w, h);
    }

    setUiOpen(open) {
        this.uiOpen = open;
        if (open) {
            this._dragging = false;
            if (document.pointerLockElement) {
                try { document.exitPointerLock(); } catch { }
            }
        }
    }

    dispose() {
        this.renderer.setAnimationLoop(null);
        ACTIVE_CROWDS.length = 0;
        this.narrator.stop();
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('keyup', this._onKeyUp);
        window.removeEventListener('resize', this._onResize);
        this.renderer.domElement.removeEventListener('mousedown', this._onMouseDown);
        document.removeEventListener('mousemove', this._onMouseMove);
        document.removeEventListener('mouseup', this._onMouseUp);
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch { }
        }
        this.scene.traverse(o => {
            o.geometry?.dispose?.();
            if (o.material) {
                (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose?.());
            }
        });
        this.pmrem.dispose();
        this.renderer.dispose();
        this.renderer.domElement.remove();
        this.fadeEl.remove();
    }
}
