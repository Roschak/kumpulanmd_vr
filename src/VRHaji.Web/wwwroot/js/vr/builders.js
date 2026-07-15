/**
 * VR Education Haji & Umrah — Environment Builders
 * Semua lingkungan dibangun prosedural (PBR material + instancing)
 * agar tanpa dependensi asset eksternal namun tetap berkualitas tinggi.
 */
import { THREE, Tex } from './engine.js';

const DEG = Math.PI / 180;

function mesh(geo, mat, x = 0, y = 0, z = 0, { cast = true, receive = true, ry = 0 } = {}) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.castShadow = cast;
    m.receiveShadow = receive;
    return m;
}

/* ============ Elemen umum ============ */

export function palmTree(mats, scale = 1) {
    const g = new THREE.Group();
    const trunk = mesh(new THREE.CylinderGeometry(0.12 * scale, 0.2 * scale, 4 * scale, 7), mats.wood, 0, 2 * scale, 0);
    g.add(trunk);
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x2e7d3a, roughness: 0.85, side: THREE.DoubleSide });
    for (let i = 0; i < 7; i++) {
        const frond = mesh(new THREE.ConeGeometry(0.1 * scale, 2.4 * scale, 4), frondMat, 0, 4.1 * scale, 0, { cast: false });
        frond.rotation.z = 55 * DEG;
        frond.rotation.y = i * (Math.PI * 2 / 7);
        frond.geometry.translate(0, 1.1 * scale, 0);
        g.add(frond);
    }
    return g;
}

export function lampPost(mats, h = 6) {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.08, 0.12, h, 8), mats.darkGrey, 0, h / 2, 0));
    g.add(mesh(new THREE.SphereGeometry(0.28, 12, 10), mats.emissiveWarm, 0, h + 0.2, 0, { cast: false }));
    return g;
}

export function minaret(mats, h = 40, r = 1.6) {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(r * 0.75, r, h * 0.62, 12), mats.cream, 0, h * 0.31, 0));
    g.add(mesh(new THREE.CylinderGeometry(r * 0.95, r * 0.95, h * 0.05, 12), mats.white, 0, h * 0.64, 0)); // balkon
    g.add(mesh(new THREE.CylinderGeometry(r * 0.5, r * 0.62, h * 0.24, 12), mats.cream, 0, h * 0.78, 0));
    g.add(mesh(new THREE.ConeGeometry(r * 0.55, h * 0.14, 12), mats.gold, 0, h * 0.97, 0));
    g.add(mesh(new THREE.SphereGeometry(0.35, 10, 8), mats.gold, 0, h * 1.05, 0, { cast: false }));
    return g;
}

/** Deret lengkungan (arcade) sebagai InstancedMesh — gaya masjid. */
export function arcade(mats, { count, spacing = 6, height = 9, depth = 2.5 }) {
    const g = new THREE.Group();
    const colGeo = new THREE.CylinderGeometry(0.45, 0.5, height * 0.7, 10);
    const archGeo = new THREE.TorusGeometry(spacing * 0.32, 0.35, 8, 16, Math.PI);
    const cols = new THREE.InstancedMesh(colGeo, mats.marbleTile, count + 1);
    const arches = new THREE.InstancedMesh(archGeo, mats.cream, count);
    cols.castShadow = arches.castShadow = true;
    cols.receiveShadow = arches.receiveShadow = true;
    const m = new THREE.Matrix4();
    for (let i = 0; i <= count; i++) {
        m.makeTranslation(i * spacing - (count * spacing) / 2, height * 0.35, 0);
        cols.setMatrixAt(i, m);
        if (i < count) {
            m.makeTranslation(i * spacing - (count * spacing) / 2 + spacing / 2, height * 0.7, 0);
            arches.setMatrixAt(i, m);
        }
    }
    // atap balok di atas arcade
    const roof = mesh(new THREE.BoxGeometry(count * spacing + 2, 0.8, depth), mats.cream, 0, height * 0.7 + spacing * 0.32 + 0.5, 0);
    g.add(cols, arches, roof);
    return g;
}

/* ============ KA'BAH & MASJIDIL HARAM ============ */

export function kaaba(mats) {
    const g = new THREE.Group();
    const body = mesh(new THREE.BoxGeometry(12, 14, 10.5), mats.kiswah, 0, 7, 0);
    g.add(body);
    // Pintu emas
    const door = mesh(new THREE.BoxGeometry(2.6, 4, 0.15), mats.gold, 2.5, 4.2, 5.32, { cast: false });
    g.add(door);
    // Hajar Aswad — sudut timur (frame perak)
    const hajar = new THREE.Group();
    hajar.add(mesh(new THREE.TorusGeometry(0.45, 0.14, 10, 20), mats.steel, 0, 0, 0, { cast: false }));
    hajar.add(mesh(new THREE.SphereGeometry(0.26, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0x0c0c10, roughness: 0.3 }), 0, 0, 0, { cast: false }));
    hajar.position.set(6.05, 1.6, 5.3);
    g.add(hajar);
    g.userData.hajarAswad = hajar;
    // Talang emas (mizab)
    g.add(mesh(new THREE.BoxGeometry(0.6, 0.3, 2.4), mats.gold, 0, 14.2, -6.2, { cast: false }));
    // Hijr Ismail — dinding setengah lingkaran
    const hijr = mesh(new THREE.CylinderGeometry(4.6, 4.6, 1.32, 32, 1, true, 0, Math.PI), mats.marble, 0, 0.66, -9.5);
    hijr.rotation.y = Math.PI;
    g.add(hijr);
    // Shadharwan (alas miring)
    g.add(mesh(new THREE.BoxGeometry(12.8, 0.5, 11.3), mats.grey, 0, 0.25, 0));
    return g;
}

export function maqamIbrahim(mats) {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(1.1, 1.3, 0.5, 12), mats.gold, 0, 0.25, 0));
    const dome = mesh(new THREE.SphereGeometry(1.0, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshPhysicalMaterial({
            color: 0xf7e7b0, metalness: 0.6, roughness: 0.1,
            transmission: 0.5, transparent: true, opacity: 0.85
        }), 0, 0.5, 0, { cast: false });
    g.add(dome);
    g.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.4, 8), mats.gold, 0, 1.2, 0, { cast: false }));
    g.add(mesh(new THREE.SphereGeometry(0.22, 10, 8), mats.gold, 0, 2.0, 0, { cast: false }));
    return g;
}

/**
 * Masjidil Haram: lantai mataf, Ka'bah, arcade keliling, minaret, garis start tawaf.
 * @returns {object} referensi objek penting
 */
export function masjidilHaram(engine, { crowdInMataf = false } = {}) {
    const { scene, mats } = engine;
    // Lantai mataf marmer putih (dingin — sesuai marmer asli)
    const floor = engine.ground(220, mats.marble);
    floor.name = 'mataf-floor';

    const kb = kaaba(mats);
    scene.add(kb);

    // Garis coklat mulai tawaf — dari sudut Hajar Aswad ke arah luar
    const line = mesh(new THREE.BoxGeometry(0.5, 0.02, 34),
        new THREE.MeshStandardMaterial({ color: 0x6b4a1f, roughness: 0.9 }), 14, 0.02, 5.3, { cast: false });
    line.rotation.y = Math.PI / 2;
    line.position.set(24, 0.02, 5.3);
    scene.add(line);

    const maqam = maqamIbrahim(mats);
    maqam.position.set(11, 0, 8.5);
    scene.add(maqam);

    // Arcade dua lantai mengelilingi mataf (4 sisi)
    const R = 78;
    for (let side = 0; side < 4; side++) {
        for (let lvl = 0; lvl < 2; lvl++) {
            const a = arcade(mats, { count: 24, spacing: 6.6, height: 9 });
            a.position.y = lvl * 8.2;
            const ang = side * Math.PI / 2;
            a.rotation.y = ang;
            a.position.x += Math.sin(ang) * R * (side % 2 === 0 ? 0 : 1);
            // posisi per sisi
            if (side === 0) a.position.z = -R;
            if (side === 1) a.position.x = -R;
            if (side === 2) a.position.z = R;
            if (side === 3) a.position.x = R;
            scene.add(a);
        }
    }
    // Minaret di 4 sudut
    for (const [mx, mz] of [[-R, -R], [R, -R], [-R, R], [R, R]]) {
        const mn = minaret(mats, 52, 2);
        mn.position.set(mx, 0, mz);
        scene.add(mn);
    }
    // Menara jam (Abraj Al-Bait) siluet di kejauhan
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x8a7f6d, roughness: 0.8 });
    const tower = mesh(new THREE.BoxGeometry(34, 180, 34), towerMat, 40, 90, 190);
    scene.add(tower);
    const clock = mesh(new THREE.BoxGeometry(20, 20, 1.5), mats.emissiveWarm, 40, 150, 172.5, { cast: false });
    scene.add(clock);
    const spire = mesh(new THREE.ConeGeometry(6, 40, 6), towerMat, 40, 200, 190);
    scene.add(spire);

    // Lampu sorot mataf (malam)
    if (engine.envPreset === 'night' || engine.envPreset === 'dawn') {
        for (const [lx, lz] of [[-40, -40], [40, -40], [-40, 40], [40, 40]]) {
            engine.addPointLamp(lx, 18, lz, { intensity: 160, distance: 130 });
        }
        engine.addPointLamp(0, 22, 0, { color: 0xfff6dd, intensity: 200, distance: 90 });
    }

    // Area jalan: mataf berbentuk cincin di sekitar Ka'bah + pelataran
    engine.addWalkCircle(0, 0, 70, 0);
    engine.addBlocker(-7.4, -6.3, 7.4, 6.3);      // badan Ka'bah
    engine.addBlocker(9.6, 7.2, 12.4, 9.9);       // maqam ibrahim

    engine.configureMinimap({
        scale: 1.0, center: { x: 0, z: 0 },
        features: [
            { type: 'square', x: 0, z: 0, color: '#111111' },
            { type: 'point', x: 11, z: 8.5, color: '#e8c96a' },
            { type: 'point', x: 24, z: 5.3, color: '#8a5a2a' }
        ]
    });

    return { kaaba: kb, maqam, startLine: line, hajarAswad: kb.userData.hajarAswad };
}

/* ============ MAS'A (SHAFA–MARWAH) ============ */

export function masaa(engine) {
    const { scene, mats } = engine;
    const L = 120, W = 14; // panjang & lebar koridor (skala edukasi)
    engine.ground(400, mats.marbleTile);

    // Lantai koridor
    const floor = mesh(new THREE.BoxGeometry(L + 30, 0.1, W + 6), mats.marble, 0, 0.05, 0, { cast: false });
    scene.add(floor);

    // Dinding & atap koridor
    const wallH = 10;
    for (const s of [-1, 1]) {
        const wall = mesh(new THREE.BoxGeometry(L + 30, wallH, 0.6), mats.cream, 0, wallH / 2, s * (W / 2 + 3));
        scene.add(wall);
        // jendela lengkung emissive di dinding
        for (let i = -5; i <= 5; i++) {
            scene.add(mesh(new THREE.BoxGeometry(2.4, 3.2, 0.2), mats.emissiveWarm,
                i * 11, 5.6, s * (W / 2 + 2.8), { cast: false }));
        }
    }
    scene.add(mesh(new THREE.BoxGeometry(L + 30, 0.8, W + 8), mats.cream, 0, wallH + 0.4, 0));

    // Kolom tengah pemisah jalur
    const colGeo = new THREE.CylinderGeometry(0.4, 0.4, wallH, 10);
    const cols = new THREE.InstancedMesh(colGeo, mats.marbleTile, 12);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < 12; i++) {
        m4.makeTranslation(-L / 2 + 10 + i * (L - 20) / 11, wallH / 2, 0);
        cols.setMatrixAt(i, m4);
    }
    cols.castShadow = true;
    scene.add(cols);

    // Bukit Shafa & Marwah — gundukan batu di ujung
    const rockGeo = new THREE.IcosahedronGeometry(4.6, 1);
    const pos = rockGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        pos.setXYZ(i,
            pos.getX(i) * (0.9 + Math.random() * 0.25),
            Math.max(0, pos.getY(i)) * 0.55,
            pos.getZ(i) * (0.9 + Math.random() * 0.25));
    }
    rockGeo.computeVertexNormals();
    const shafa = mesh(rockGeo, mats.rock, -L / 2 - 6, 0.4, 0);
    const marwah = mesh(rockGeo.clone(), mats.rock, L / 2 + 6, 0.4, 0);
    scene.add(shafa, marwah);

    // Zona lampu hijau (area lari kecil) di tengah
    const greenMat = new THREE.MeshStandardMaterial({
        color: 0x1f8f4d, emissive: 0x27c96a, emissiveIntensity: 1.6, transparent: true, opacity: 0.9
    });
    for (const gx of [-14, 14]) {
        scene.add(mesh(new THREE.BoxGeometry(0.6, 6, W + 4), greenMat, gx, 5, 0, { cast: false }));
    }
    const greenFloor = mesh(new THREE.BoxGeometry(28, 0.02, W + 4),
        new THREE.MeshStandardMaterial({ color: 0x1a5c39, emissive: 0x114d2c, emissiveIntensity: 0.4 }),
        0, 0.11, 0, { cast: false });
    scene.add(greenFloor);

    // Lampu interior
    for (let i = -4; i <= 4; i++) {
        engine.addPointLamp(i * 14, wallH - 1, 0, { intensity: 60, distance: 26 });
    }

    engine.addWalkRect(-L / 2 - 9, -W / 2 - 1.5, L / 2 + 9, W / 2 + 1.5);
    engine.configureMinimap({
        scale: 1.1, center: { x: 0, z: 0 },
        features: [
            { type: 'point', x: -L / 2 - 5, z: 0, color: '#37c978' },
            { type: 'point', x: L / 2 + 5, z: 0, color: '#37c978' }
        ]
    });
    return { shafaX: -L / 2 - 2, marwahX: L / 2 + 2, length: L, shafa, marwah };
}

/* ============ BANDARA ============ */

export function airport(engine, { nameSign = 'BANDARA SOEKARNO-HATTA — TERMINAL 2U', arabic = false } = {}) {
    const { scene, mats } = engine;
    engine.ground(500, mats.tarmac, -0.02);

    // Lantai terminal — marmer mengkilap khas bandara
    const floorMat = mats.marble.clone();
    floorMat.roughness = 0.16;
    floorMat.metalness = 0.06;
    const floor = mesh(new THREE.BoxGeometry(90, 0.1, 60), floorMat, 0, 0.05, 0, { cast: false });
    scene.add(floor);

    const H = 12;
    // Dinding kaca keliling
    for (const [w, d, x, z, ry] of [
        [90, 0.4, 0, -30, 0], [90, 0.4, 0, 30, 0], [0.4, 60, -45, 0, 0], [0.4, 60, 45, 0, 0]
    ]) {
        const wall = mesh(new THREE.BoxGeometry(w || 0.4, H, d || 0.4), mats.glass, x, H / 2, z, { cast: false });
        scene.add(wall);
    }
    // Mullion (rangka vertikal) dinding kaca
    const mullGeo = new THREE.BoxGeometry(0.16, H, 0.16);
    const nMullX = 19, nMullZ = 13;
    const mulls = new THREE.InstancedMesh(mullGeo, mats.steel, nMullX * 2 + nMullZ * 2);
    const m4 = new THREE.Matrix4();
    const q4 = new THREE.Quaternion();
    const ONE = new THREE.Vector3(1, 1, 1);
    const UPV = new THREE.Vector3(0, 1, 0);
    const setInst = (im, idx, x, y, z, ry = 0) => {
        q4.setFromAxisAngle(UPV, ry);
        m4.compose(new THREE.Vector3(x, y, z), q4, ONE);
        im.setMatrixAt(idx, m4);
    };
    let mi = 0;
    for (let i = 0; i < nMullX; i++) {
        const x = -45 + i * 5;
        setInst(mulls, mi++, x, H / 2, -30);
        setInst(mulls, mi++, x, H / 2, 30);
    }
    for (let i = 0; i < nMullZ; i++) {
        const z = -30 + i * 5;
        setInst(mulls, mi++, -45, H / 2, z);
        setInst(mulls, mi++, 45, H / 2, z);
    }
    scene.add(mulls);

    // Kolom & plafon
    const colGeo = new THREE.CylinderGeometry(0.55, 0.55, H, 12);
    const cols = new THREE.InstancedMesh(colGeo, mats.steel, 10);
    let ci = 0;
    for (const cx of [-30, -10, 10, 30]) {
        for (const cz of [-15, 15]) {
            if (ci < 10) { m4.makeTranslation(cx, H / 2, cz); cols.setMatrixAt(ci++, m4); }
        }
    }
    while (ci < 10) { m4.makeTranslation(0, -50, 0); cols.setMatrixAt(ci++, m4); }
    cols.castShadow = true;
    scene.add(cols);
    scene.add(mesh(new THREE.BoxGeometry(92, 0.8, 62), mats.white, 0, H + 0.4, 0, { cast: false }));
    // Rangka atap (truss) melintang
    const trussGeo = new THREE.BoxGeometry(0.28, 0.55, 59);
    const trusses = new THREE.InstancedMesh(trussGeo, mats.steel, 9);
    for (let i = 0; i < 9; i++) setInst(trusses, i, -40 + i * 10, H - 0.45, 0);
    scene.add(trusses);
    // Skylight strip emissive
    for (let i = -3; i <= 3; i++) {
        scene.add(mesh(new THREE.BoxGeometry(86, 0.1, 2.2), mats.emissiveCool, 0, H - 0.1, i * 8, { cast: false }));
    }

    // Papan nama besar
    const signTex = Tex.sign(nameSign, { w: 2048, h: 160, bg: '#0d2b4d', font: 'bold 72px "Segoe UI", sans-serif' });
    const sign = mesh(new THREE.BoxGeometry(40, 3, 0.4),
        new THREE.MeshStandardMaterial({ map: signTex, emissive: 0xffffff, emissiveMap: signTex, emissiveIntensity: 0.8 }),
        0, 9, -29.5, { cast: false });
    scene.add(sign);

    // Papan jadwal penerbangan (FIDS) menggantung di tengah hall
    const fidsTex = Tex.fids(arabic ? 'DEPARTURES — المغادرة' : 'KEBERANGKATAN — DEPARTURES');
    const fids = mesh(new THREE.BoxGeometry(6.4, 4, 0.3),
        new THREE.MeshStandardMaterial({ map: fidsTex, emissive: 0xffffff, emissiveMap: fidsTex, emissiveIntensity: 1.1 }),
        0, 5.2, -6, { cast: false });
    scene.add(fids);
    for (const hx of [-2.6, 2.6]) {
        scene.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 4.8, 6), mats.steel, hx, 9.6, -6, { cast: false }));
    }

    // Signage arah menggantung
    const hangSign = (text, x, z, ry = 0, w = 5) => {
        const t = Tex.sign(text, { bg: '#13203a', fg: '#ffd75e', w: 1024, h: 128, font: 'bold 60px "Segoe UI", sans-serif' });
        const s = mesh(new THREE.BoxGeometry(w, 0.95, 0.14),
            new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 1.0 }),
            x, 4.6, z, { cast: false, ry });
        scene.add(s);
        const rod = mesh(new THREE.CylinderGeometry(0.03, 0.03, H - 5.1, 6), mats.steel, x, (H + 5.1) / 2, z, { cast: false });
        scene.add(rod);
    };
    hangSign('⬅ CHECK-IN A–D', -12, -12);
    hangSign(arabic ? 'الجوازات — PASSPORT ➡' : 'IMIGRASI ➡', 14, -12);
    hangSign('GATE 11–14 ➡', 26, 8, -0.5);
    hangSign('RUANG TUNGGU — WAITING', 0, 4, 0, 6);

    // Counter check-in (4 buah)
    const counters = new THREE.Group();
    for (let i = 0; i < 4; i++) {
        const c = new THREE.Group();
        c.add(mesh(new THREE.BoxGeometry(5, 1.15, 1.6), mats.wood, 0, 0.575, 0));
        c.add(mesh(new THREE.BoxGeometry(5, 0.08, 1.9), mats.steel, 0, 1.2, 0, { cast: false }));
        const scrTex = Tex.sign(`CHECK-IN ${String.fromCharCode(65 + i)}`, { bg: '#123c1e', fg: '#7dffa5', w: 512, h: 96 });
        c.add(mesh(new THREE.BoxGeometry(3.6, 0.9, 0.12),
            new THREE.MeshStandardMaterial({ map: scrTex, emissive: 0xffffff, emissiveMap: scrTex, emissiveIntensity: 1.4 }),
            0, 3.0, 0, { cast: false }));
        c.add(mesh(new THREE.BoxGeometry(0.15, 2.4, 0.15), mats.steel, -1.6, 1.8, 0));
        c.add(mesh(new THREE.BoxGeometry(0.15, 2.4, 0.15), mats.steel, 1.6, 1.8, 0));
        // timbangan bagasi di samping counter
        c.add(mesh(new THREE.BoxGeometry(0.9, 0.32, 1.2), mats.darkGrey, 3.0, 0.16, 0.2));
        c.position.set(-24 + i * 8.5, 0, -24);
        counters.add(c);
        engine.addBlocker(-24 + i * 8.5 - 2.6, -24.9, -24 + i * 8.5 + 2.6, -23.1);
    }
    scene.add(counters);
    // Conveyor bagasi
    scene.add(mesh(new THREE.BoxGeometry(26, 0.5, 2), mats.darkGrey, -12, 0.25, -27));
    engine.addBlocker(-25, -28.2, 1, -25.9);

    // Tiang antrian bertali (stanchion) di depan check-in
    const postGeo = new THREE.CylinderGeometry(0.045, 0.06, 0.95, 8);
    const ropeGeo = new THREE.BoxGeometry(2.16, 0.035, 0.035);
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0x7a1f2b, roughness: 0.6 });
    const posts = new THREE.InstancedMesh(postGeo, mats.steel, 14);
    const ropes = new THREE.InstancedMesh(ropeGeo, ropeMat, 12);
    let pi = 0, ri = 0;
    for (const qz of [-21.3, -19.2]) {
        for (let i = 0; i < 7; i++) {
            const qx = -30 + i * 2.2;
            setInst(posts, pi++, qx, 0.48, qz);
            if (i < 6) setInst(ropes, ri++, qx + 1.1, 0.82, qz);
        }
        engine.addBlocker(-30.2, qz - 0.18, -16.6, qz + 0.18);
    }
    posts.castShadow = true;
    scene.add(posts, ropes);

    /* --- Ruang tunggu: bangku sofa bandara (dudukan + sandaran + armrest + rangka) --- */
    const benchRows = [
        { z: 7, ry: Math.PI }, { z: 12, ry: 0 }, { z: 17, ry: Math.PI }
    ];
    const benchXs = [-13.5, -4.5, 4.5, 13.5];
    const nBench = benchRows.length * benchXs.length;
    const cushGeo = new THREE.BoxGeometry(0.58, 0.12, 0.54);
    const backGeo = new THREE.BoxGeometry(0.58, 0.56, 0.09);
    const armGeo2 = new THREE.BoxGeometry(0.07, 0.24, 0.5);
    const beamGeo = new THREE.BoxGeometry(3.34, 0.09, 0.16);
    const legGeo2 = new THREE.BoxGeometry(0.1, 0.3, 0.52);
    const fabricMat = new THREE.MeshStandardMaterial({ color: 0x2e5170, roughness: 0.62, metalness: 0.08 });
    const cush = new THREE.InstancedMesh(cushGeo, fabricMat, nBench * 5);
    const back = new THREE.InstancedMesh(backGeo, fabricMat, nBench * 5);
    const arms = new THREE.InstancedMesh(armGeo2, mats.steel, nBench * 6);
    const beams = new THREE.InstancedMesh(beamGeo, mats.steel, nBench);
    const legs = new THREE.InstancedMesh(legGeo2, mats.steel, nBench * 2);
    const qTilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.17);
    const qTmp = new THREE.Quaternion();
    const seatSpots = [];
    let bi = 0, cuI = 0, arI = 0, lgI = 0;
    for (const row of benchRows) {
        for (const bx of benchXs) {
            const c = Math.cos(row.ry), s = Math.sin(row.ry);
            const world = (lx, lz) => [bx + lx * c + lz * s, row.z - lx * s + lz * c];
            for (let k = 0; k < 5; k++) {
                const lx = (k - 2) * 0.62;
                let [wx, wz] = world(lx, 0);
                setInst(cush, cuI, wx, 0.42, wz, row.ry);
                // sandaran miring ke belakang
                [wx, wz] = world(lx, -0.28);
                q4.setFromAxisAngle(UPV, row.ry);
                qTmp.copy(q4).multiply(qTilt);
                m4.compose(new THREE.Vector3(wx, 0.74, wz), qTmp, ONE);
                back.setMatrixAt(cuI, m4);
                cuI++;
                const [sx2, sz2] = world(lx, -0.04);
                seatSpots.push({ x: sx2, z: sz2, ry: row.ry });
            }
            for (let k = 0; k < 6; k++) {
                const [wx, wz] = world((k - 2.5) * 0.62, 0);
                setInst(arms, arI++, wx, 0.56, wz, row.ry);
            }
            setInst(beams, bi, bx, 0.3, row.z, row.ry);
            for (const lxx of [-1.35, 1.35]) {
                const [wx, wz] = world(lxx, 0);
                setInst(legs, lgI++, wx, 0.15, wz, row.ry);
            }
            bi++;
            engine.addBlocker(bx - 1.75, row.z - 0.55, bx + 1.75, row.z + 0.55);
        }
    }
    cush.castShadow = back.castShadow = arms.castShadow = true;
    cush.receiveShadow = back.receiveShadow = true;
    scene.add(cush, back, arms, beams, legs);
    // acak urutan kursi agar penumpang duduk menyebar
    for (let i = seatSpots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [seatSpots[i], seatSpots[j]] = [seatSpots[j], seatSpots[i]];
    }

    // Troli bagasi
    const trolley = (x, z, ry, withBags = true) => {
        const g = new THREE.Group();
        g.add(mesh(new THREE.BoxGeometry(0.85, 0.06, 0.62), mats.steel, 0, 0.26, 0));
        g.add(mesh(new THREE.BoxGeometry(0.06, 0.95, 0.62), mats.steel, -0.42, 0.72, 0));
        const handle = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 6), mats.steel, -0.46, 1.18, 0);
        handle.rotation.x = Math.PI / 2;
        g.add(handle);
        for (const [wx2, wz2] of [[-0.34, -0.24], [-0.34, 0.24], [0.34, -0.24], [0.34, 0.24]]) {
            g.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8), mats.darkGrey, wx2, 0.07, wz2, { cast: false }));
        }
        if (withBags) {
            g.add(mesh(new THREE.BoxGeometry(0.62, 0.4, 0.42),
                new THREE.MeshStandardMaterial({ color: 0x7a3b2e, roughness: 0.8 }), 0.05, 0.5, 0));
            g.add(mesh(new THREE.BoxGeometry(0.5, 0.3, 0.36),
                new THREE.MeshStandardMaterial({ color: 0x33415c, roughness: 0.8 }), 0.05, 0.86, 0));
        }
        g.position.set(x, 0, z);
        g.rotation.y = ry;
        scene.add(g);
        engine.addBlocker(x - 0.55, z - 0.45, x + 0.55, z + 0.45);
    };
    trolley(-33, -14, 0.4);
    trolley(-9, -6, -1.1);
    trolley(11, 1, 2.3, false);
    trolley(30, 2, 0.9);

    // Koper penumpang di ruang tunggu
    const bagColors = [0x8a2f2f, 0x2f4d8a, 0x3d3d44, 0x76552e, 0x2e6650];
    for (const [bx2, bz2, bry] of [[-11.2, 9.1, 0.3], [-1.8, 13.2, -0.6], [6.6, 15.9, 1.2], [14.8, 8.2, 0.1], [-6.4, 18.3, 2.1]]) {
        const bag = new THREE.Group();
        const bc = bagColors[Math.floor(Math.random() * bagColors.length)];
        bag.add(mesh(new THREE.BoxGeometry(0.44, 0.66, 0.26), new THREE.MeshStandardMaterial({ color: bc, roughness: 0.75 }), 0, 0.33, 0));
        bag.add(mesh(new THREE.BoxGeometry(0.05, 0.24, 0.05), mats.steel, -0.1, 0.78, 0, { cast: false }));
        bag.add(mesh(new THREE.BoxGeometry(0.05, 0.24, 0.05), mats.steel, 0.1, 0.78, 0, { cast: false }));
        bag.add(mesh(new THREE.BoxGeometry(0.26, 0.05, 0.05), mats.steel, 0, 0.88, 0, { cast: false }));
        bag.position.set(bx2, 0, bz2);
        bag.rotation.y = bry;
        scene.add(bag);
    }

    // Kios kafe di sisi barat
    const kiosk = new THREE.Group();
    kiosk.add(mesh(new THREE.BoxGeometry(1.1, 1.1, 3.4), mats.wood, 0, 0.55, 0));
    kiosk.add(mesh(new THREE.BoxGeometry(1.3, 0.06, 3.6), mats.steel, 0, 1.13, 0, { cast: false }));
    kiosk.add(mesh(new THREE.BoxGeometry(0.5, 0.45, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x8a8f96, roughness: 0.3, metalness: 0.7 }), 0, 1.4, -0.9));
    const kioskBack = mesh(new THREE.BoxGeometry(0.5, 2.4, 3.4), mats.darkGrey, -1.6, 1.2, 0);
    kiosk.add(kioskBack);
    const kt = Tex.sign('☕ KAFE & SNACK', { bg: '#3b2413', fg: '#ffd9a0', w: 640, h: 100 });
    kiosk.add(mesh(new THREE.BoxGeometry(0.2, 0.7, 3.0),
        new THREE.MeshStandardMaterial({ map: kt, emissive: 0xffffff, emissiveMap: kt, emissiveIntensity: 1.2 }),
        -1.55, 2.75, 0, { cast: false }));
    kiosk.position.set(-41.5, 0, 8);
    scene.add(kiosk);
    engine.addBlocker(-43.5, 6, -40.6, 10);

    // Mesin penjual otomatis di dinding selatan
    for (const vx of [-3, -1.2]) {
        const vend = new THREE.Group();
        vend.add(mesh(new THREE.BoxGeometry(1.5, 2, 0.85), mats.darkGrey, 0, 1, 0));
        vend.add(mesh(new THREE.BoxGeometry(1.1, 1.5, 0.06), mats.emissiveCool, -0.08, 1.15, 0.44, { cast: false }));
        vend.position.set(vx * 3, 0, 28.9);
        scene.add(vend);
        engine.addBlocker(vx * 3 - 0.85, 28.4, vx * 3 + 0.85, 29.4);
    }

    // Booth imigrasi
    const imigrasi = new THREE.Group();
    for (let i = 0; i < 2; i++) {
        const b = new THREE.Group();
        b.add(mesh(new THREE.BoxGeometry(2.2, 1.2, 2.2), mats.wood, 0, 0.6, 0));
        b.add(mesh(new THREE.BoxGeometry(2.4, 0.1, 2.4), mats.steel, 0, 2.6, 0, { cast: false }));
        b.add(mesh(new THREE.BoxGeometry(0.12, 1.5, 0.12), mats.steel, -1.1, 1.85, -1.1));
        b.add(mesh(new THREE.BoxGeometry(0.12, 1.5, 0.12), mats.steel, 1.1, 1.85, 1.1));
        const it = Tex.sign(arabic ? 'الجوازات — PASSPORT' : 'IMIGRASI', { bg: '#4d130d', fg: '#ffd7a0', w: 512, h: 96 });
        b.add(mesh(new THREE.BoxGeometry(2.2, 0.6, 0.1),
            new THREE.MeshStandardMaterial({ map: it, emissive: 0xffffff, emissiveMap: it, emissiveIntensity: 1.2 }),
            0, 3.1, 0, { cast: false }));
        b.position.set(24, 0, -18 + i * 8);
        imigrasi.add(b);
        engine.addBlocker(24 - 1.3, -18 + i * 8 - 1.3, 24 + 1.3, -18 + i * 8 + 1.3);
    }
    scene.add(imigrasi);
    // Koridor antrian imigrasi (tali pembatas dua sisi)
    const posts2 = new THREE.InstancedMesh(postGeo, mats.steel, 10);
    const ropes2 = new THREE.InstancedMesh(ropeGeo, ropeMat, 8);
    let p2 = 0, r2 = 0;
    for (const qz of [-16.5, -11.5]) {
        for (let i = 0; i < 5; i++) {
            const qx = 18 + i * 2.2;
            setInst(posts2, p2++, qx, 0.48, qz);
            if (i < 4) setInst(ropes2, r2++, qx + 1.1, 0.82, qz);
        }
        engine.addBlocker(17.8, qz - 0.18, 26.8, qz + 0.18);
    }
    posts2.castShadow = true;
    scene.add(posts2, ropes2);

    // Gate
    const gate = new THREE.Group();
    const gateTex = Tex.sign(arabic ? 'BAGGAGE — EXIT' : 'GATE 12 — MADINAH', { bg: '#0d2b4d', fg: '#ffe9a8', w: 640, h: 110 });
    gate.add(mesh(new THREE.BoxGeometry(6, 1, 0.25),
        new THREE.MeshStandardMaterial({ map: gateTex, emissive: 0xffffff, emissiveMap: gateTex, emissiveIntensity: 1.3 }),
        0, 3.4, 0, { cast: false }));
    gate.add(mesh(new THREE.BoxGeometry(0.4, 3, 0.4), mats.steel, -2.6, 1.5, 0));
    gate.add(mesh(new THREE.BoxGeometry(0.4, 3, 0.4), mats.steel, 2.6, 1.5, 0));
    gate.add(mesh(new THREE.BoxGeometry(4.4, 2.6, 0.15), mats.glass, 0, 1.4, 0, { cast: false }));
    gate.position.set(36, 0, 18);
    gate.rotation.y = -Math.PI / 2;
    scene.add(gate);

    // Pesawat di luar kaca
    const plane = new THREE.Group();
    const fus = mesh(new THREE.CylinderGeometry(3.2, 3.2, 40, 18), mats.white, 0, 6, 0);
    fus.rotation.z = Math.PI / 2;
    plane.add(fus);
    plane.add(mesh(new THREE.SphereGeometry(3.2, 16, 12), mats.white, 20, 6, 0));
    const tail = mesh(new THREE.BoxGeometry(6, 8, 0.6), new THREE.MeshStandardMaterial({ color: 0xc22b2b, roughness: 0.4 }), -19, 10, 0);
    plane.add(tail);
    for (const s of [-1, 1]) {
        const wing = mesh(new THREE.BoxGeometry(9, 0.5, 16), mats.steel, 0, 5.4, s * 10);
        wing.rotation.x = s * 0.06;
        plane.add(wing);
        const eng = mesh(new THREE.CylinderGeometry(1.2, 1.4, 3.6, 12), mats.steel, 2, 4.2, s * 8);
        eng.rotation.z = Math.PI / 2;
        plane.add(eng);
    }
    plane.position.set(78, 0, 8);
    plane.rotation.y = 30 * DEG;
    scene.add(plane);

    // Tanaman pot (palem + pot tanah liat)
    const potMat = new THREE.MeshStandardMaterial({ color: 0x9a5b3c, roughness: 0.85 });
    for (const [px2, pz2] of [[-40, -24], [-40, 24], [40, 24], [-20, 26], [20, 26], [-30, 14], [-36, -2], [33, -6]]) {
        const pot = mesh(new THREE.CylinderGeometry(0.5, 0.64, 0.55, 12), potMat, px2, 0.275, pz2);
        scene.add(pot);
        const t = palmTree(mats, 0.55);
        t.position.set(px2, 0.45, pz2);
        scene.add(t);
        engine.addBlocker(px2 - 0.65, pz2 - 0.65, px2 + 0.65, pz2 + 0.65);
    }

    engine.addWalkRect(-42, -27, 42, 27);
    engine.addWalkRect(30, 10, 44, 26); // area gate
    engine.configureMinimap({
        scale: 1.6, center: { x: 0, z: 0 },
        features: [
            { type: 'square', x: -24, z: -24, color: '#57d987' },
            { type: 'square', x: 24, z: -14, color: '#d98a57' },
            { type: 'square', x: 36, z: 18, color: '#e8c96a' }
        ]
    });

    return { counters, imigrasi, gate, plane, seatSpots };
}

/** Kabin pesawat — area terpisah jauh dari terminal. */
export function airplaneCabin(engine, origin = { x: 0, z: 400 }) {
    const { scene, mats } = engine;
    const g = new THREE.Group();
    const L = 30, R = 2.9;
    const tube = mesh(new THREE.CylinderGeometry(R, R, L, 20, 1, true),
        new THREE.MeshStandardMaterial({ color: 0xe9ebee, roughness: 0.6, side: THREE.BackSide }), 0, R - 0.6, 0, { cast: false });
    tube.rotation.z = Math.PI / 2;
    g.add(tube);
    g.add(mesh(new THREE.BoxGeometry(L, 0.15, 3.4), new THREE.MeshStandardMaterial({ color: 0x35405a, roughness: 0.9 }), 0, 0.05, 0, { cast: false }));
    // Kursi 2-2
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x24408a, roughness: 0.7 });
    const cushion = new THREE.BoxGeometry(0.62, 0.5, 0.6);
    const back = new THREE.BoxGeometry(0.62, 0.85, 0.14);
    const nSeats = 4 * 12 * 2;
    const cush = new THREE.InstancedMesh(cushion, seatMat, nSeats);
    const bk = new THREE.InstancedMesh(back, seatMat, nSeats);
    const m4 = new THREE.Matrix4();
    let i = 0;
    for (let row = 0; row < 12; row++) {
        for (const sz of [-1.75, -1.05, 1.05, 1.75]) {
            const sx = -L / 2 + 3 + row * 2.1;
            m4.makeTranslation(sx, 0.45, sz); cush.setMatrixAt(i, m4);
            m4.makeTranslation(sx - 0.28, 1.0, sz); bk.setMatrixAt(i, m4);
            i++;
        }
    }
    g.add(cush, bk);
    // Jendela emissive
    for (let w = 0; w < 12; w++) {
        for (const s of [-1, 1]) {
            g.add(mesh(new THREE.BoxGeometry(0.5, 0.6, 0.1), mats.emissiveCool,
                -L / 2 + 3 + w * 2.1, 1.9, s * (R - 0.25), { cast: false }));
        }
    }
    // Lampu kabin
    g.position.set(origin.x, 0, origin.z);
    scene.add(g);
    engine.addPointLamp(origin.x, 2.4, origin.z, { intensity: 40, distance: 25 });
    engine.addPointLamp(origin.x - 10, 2.4, origin.z, { intensity: 30, distance: 18 });
    engine.addPointLamp(origin.x + 10, 2.4, origin.z, { intensity: 30, distance: 18 });
    engine.addWalkRect(origin.x - L / 2 + 1, origin.z - 0.55, origin.x + L / 2 - 1, origin.z + 0.55);
    return { origin, length: L };
}

/* ============ MASJID NABAWI ============ */

export function nabawi(engine) {
    const { scene, mats } = engine;
    engine.ground(500, mats.marbleTile);

    // Fasad utama dengan arcade
    const fas = arcade(mats, { count: 26, spacing: 7, height: 12 });
    fas.position.z = -46;
    scene.add(fas);
    const wall = mesh(new THREE.BoxGeometry(190, 16, 2), mats.cream, 0, 8, -49);
    scene.add(wall);
    // Gerbang utama
    const gateTex = Tex.sign('المسجد النبوي — MASJID NABAWI', { bg: '#0e3b26', fg: '#ffe9a8', w: 1024, h: 120 });
    scene.add(mesh(new THREE.BoxGeometry(16, 2, 0.4),
        new THREE.MeshStandardMaterial({ map: gateTex, emissive: 0xffffff, emissiveMap: gateTex, emissiveIntensity: 0.9 }),
        0, 13.4, -47.6, { cast: false }));
    const door = mesh(new THREE.BoxGeometry(9, 11, 1.2), mats.gold, 0, 5.5, -48.2);
    scene.add(door);

    // Kubah hijau ikonik
    const dome = mesh(new THREE.SphereGeometry(9, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2), mats.greenDome, -30, 16, -72, { cast: false });
    scene.add(dome);
    scene.add(mesh(new THREE.CylinderGeometry(9, 9, 6, 24), mats.cream, -30, 13, -72));
    scene.add(mesh(new THREE.SphereGeometry(0.7, 10, 8), mats.gold, -30, 25.6, -72, { cast: false }));

    // Minaret
    for (const [mx, mz] of [[-88, -50], [88, -50], [-50, -90], [50, -90]]) {
        const mn = minaret(mats, 58, 2.1);
        mn.position.set(mx, 0, mz);
        scene.add(mn);
    }

    // Payung raksasa ikonik di pelataran (canopy terbuka)
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0xf3efe4, roughness: 0.7, side: THREE.DoubleSide });
    for (let gx = -3; gx <= 3; gx++) {
        for (let gz = 0; gz < 2; gz++) {
            const u = new THREE.Group();
            const px = gx * 24, pz = -8 - gz * 24;
            u.add(mesh(new THREE.CylinderGeometry(0.35, 0.45, 14, 10), mats.steel, 0, 7, 0));
            const cone = mesh(new THREE.ConeGeometry(11, 3.2, 4), canopyMat, 0, 14.4, 0, { cast: true });
            cone.rotation.y = Math.PI / 4;
            cone.scale.y = -1; // payung terbalik khas Nabawi
            u.add(cone);
            u.position.set(px, 0, pz);
            scene.add(u);
            if (engine.envPreset !== 'day') {
                engine.addPointLamp(px, 12, pz, { intensity: 90, distance: 34 });
            }
        }
    }

    // Pot palem & lampu
    for (let i = -4; i <= 4; i++) {
        const t = palmTree(mats, 0.9);
        t.position.set(i * 20, 0, 26);
        scene.add(t);
        const lp = lampPost(mats, 7);
        lp.position.set(i * 20 + 8, 0, 20);
        scene.add(lp);
    }

    engine.addWalkRect(-95, -47, 95, 40);
    engine.configureMinimap({
        scale: 0.9, center: { x: 0, z: -10 },
        features: [
            { type: 'square', x: 0, z: -48, color: '#e8c96a' },
            { type: 'point', x: -30, z: -72, color: '#37c978' }
        ]
    });
    return { gatePos: { x: 0, z: -44 }, door, dome };
}

/* ============ MIQAT BIR ALI ============ */

export function miqat(engine) {
    const { scene, mats } = engine;
    engine.ground(500, mats.sand);

    // Masjid miqat putih sederhana + courtyard
    const wall = mesh(new THREE.BoxGeometry(60, 7, 1.2), mats.white, 0, 3.5, -30);
    scene.add(wall);
    for (const s of [-1, 1]) {
        scene.add(mesh(new THREE.BoxGeometry(1.2, 7, 40), mats.white, s * 30, 3.5, -10));
    }
    const arc = arcade(mats, { count: 8, spacing: 6, height: 8 });
    arc.position.z = -28;
    scene.add(arc);
    const mn = minaret(mats, 34, 1.5);
    mn.position.set(-26, 0, -27);
    scene.add(mn);
    const dome = mesh(new THREE.SphereGeometry(6, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), mats.white, 0, 7, -36, { cast: false });
    scene.add(dome);
    scene.add(mesh(new THREE.SphereGeometry(0.4, 10, 8), mats.gold, 0, 13.4, -36, { cast: false }));

    // Tempat wudhu/mandi (bilik)
    const bilik = new THREE.Group();
    bilik.add(mesh(new THREE.BoxGeometry(8, 3.4, 5), mats.cream, 0, 1.7, 0));
    const bt = Tex.sign('TEMPAT MANDI & WUDHU', { bg: '#0d3b4d', w: 640, h: 90 });
    bilik.add(mesh(new THREE.BoxGeometry(6, 0.8, 0.15),
        new THREE.MeshStandardMaterial({ map: bt, emissive: 0xffffff, emissiveMap: bt, emissiveIntensity: 1 }),
        0, 3.9, 2.55, { cast: false }));
    bilik.position.set(-18, 0, -8);
    scene.add(bilik);

    // Rak kain ihram
    const rak = new THREE.Group();
    rak.add(mesh(new THREE.BoxGeometry(4, 0.15, 1.4), mats.wood, 0, 1.2, 0));
    rak.add(mesh(new THREE.BoxGeometry(4, 0.15, 1.4), mats.wood, 0, 2.0, 0));
    for (let i = 0; i < 4; i++) {
        rak.add(mesh(new THREE.BoxGeometry(0.8, 0.5, 1.1),
            new THREE.MeshStandardMaterial({ color: 0xf8f6ef, roughness: 0.95 }), -1.5 + i, 1.5, 0, { cast: false }));
    }
    rak.add(mesh(new THREE.BoxGeometry(0.14, 2.2, 0.14), mats.wood, -1.9, 1.1, 0.6));
    rak.add(mesh(new THREE.BoxGeometry(0.14, 2.2, 0.14), mats.wood, 1.9, 1.1, 0.6));
    const rt = Tex.sign('KAIN IHRAM', { bg: '#3b2a0d', w: 512, h: 90 });
    rak.add(mesh(new THREE.BoxGeometry(3, 0.6, 0.12),
        new THREE.MeshStandardMaterial({ map: rt, emissive: 0xffffff, emissiveMap: rt, emissiveIntensity: 1 }),
        0, 2.7, 0, { cast: false }));
    rak.position.set(-6, 0, -12);
    scene.add(rak);

    // Sajadah sholat sunnah
    const sajadah = mesh(new THREE.BoxGeometry(1.2, 0.04, 2), mats.carpetGreen, 6, 0.02, -16, { cast: false });
    scene.add(sajadah);

    // Bus jamaah
    const bus = new THREE.Group();
    bus.add(mesh(new THREE.BoxGeometry(12, 3.4, 3), new THREE.MeshStandardMaterial({ color: 0xd8dee6, roughness: 0.4, metalness: 0.3 }), 0, 2.2, 0));
    bus.add(mesh(new THREE.BoxGeometry(11.5, 1.2, 3.05), mats.glass, 0, 3, 0, { cast: false }));
    for (const [wx, wz] of [[-4, -1.6], [4, -1.6], [-4, 1.6], [4, 1.6]]) {
        const wheel = mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.4, 14), mats.darkGrey, wx, 0.7, wz);
        wheel.rotation.x = Math.PI / 2;
        bus.add(wheel);
    }
    bus.position.set(20, 0, 14);
    bus.rotation.y = -20 * DEG;
    scene.add(bus);

    // Pohon
    for (const [tx, tz] of [[-24, 8], [24, -20], [14, -24], [-30, -18], [30, 6]]) {
        const t = palmTree(mats, 1.1);
        t.position.set(tx, 0, tz);
        scene.add(t);
    }
    for (let i = 0; i < 3; i++) {
        const lp = lampPost(mats, 6);
        lp.position.set(-10 + i * 12, 0, 4);
        scene.add(lp);
    }

    engine.addWalkRect(-28, -28, 28, 20);
    engine.configureMinimap({
        scale: 2.0, center: { x: 0, z: -6 },
        features: [
            { type: 'square', x: -18, z: -8, color: '#57a9d9' },
            { type: 'square', x: -6, z: -12, color: '#e8e2d2' },
            { type: 'point', x: 6, z: -16, color: '#37c978' },
            { type: 'square', x: 20, z: 14, color: '#d9d957' }
        ]
    });
    return { bilik, rak, sajadah, bus };
}

/* ============ MUZDALIFAH (MALAM) ============ */

export function muzdalifah(engine) {
    const { scene, mats } = engine;
    engine.ground(600, mats.rock);

    // Bukit-bukit gelap di kejauhan
    for (let i = 0; i < 10; i++) {
        const hillGeo = new THREE.ConeGeometry(30 + Math.random() * 40, 18 + Math.random() * 22, 7);
        const hill = mesh(hillGeo, mats.darkGrey,
            Math.cos(i / 10 * Math.PI * 2) * (150 + Math.random() * 60), 0,
            Math.sin(i / 10 * Math.PI * 2) * (150 + Math.random() * 60), { cast: false });
        hill.position.y = 5;
        scene.add(hill);
    }

    // Batu kerikil interaktif — kluster
    const pebbleGeo = new THREE.DodecahedronGeometry(0.09, 0);
    const pebbleMat = new THREE.MeshStandardMaterial({ color: 0xa89c8a, roughness: 0.95 });
    const clusters = [];
    for (let i = 0; i < 9; i++) {
        const grp = new THREE.Group();
        const n = 6 + Math.floor(Math.random() * 5);
        for (let k = 0; k < n; k++) {
            const p = mesh(pebbleGeo, pebbleMat,
                (Math.random() - 0.5) * 0.9, 0.07, (Math.random() - 0.5) * 0.9);
            p.scale.setScalar(0.8 + Math.random() * 0.9);
            grp.add(p);
        }
        const ang = (i / 9) * Math.PI * 2;
        grp.position.set(Math.cos(ang) * (6 + Math.random() * 10), 0, Math.sin(ang) * (6 + Math.random() * 10));
        scene.add(grp);
        clusters.push(grp);
    }

    // Kerikil dekoratif bertebaran (instanced)
    const deco = new THREE.InstancedMesh(pebbleGeo, pebbleMat, 600);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < 600; i++) {
        const s = 0.5 + Math.random();
        m4.makeScale(s, s, s);
        m4.setPosition((Math.random() - 0.5) * 120, 0.05, (Math.random() - 0.5) * 120);
        deco.setMatrixAt(i, m4);
    }
    deco.receiveShadow = true;
    scene.add(deco);

    // Lampu jalan jauh & bus
    for (let i = 0; i < 5; i++) {
        const lp = lampPost(mats, 8);
        lp.position.set(-50 + i * 25, 0, -46);
        scene.add(lp);
        engine.addPointLamp(-50 + i * 25, 8, -46, { intensity: 60, distance: 40 });
    }

    // Tikar jamaah beristirahat
    for (let i = 0; i < 6; i++) {
        const tikar = mesh(new THREE.BoxGeometry(2.4, 0.03, 1.6), mats.carpetGreen,
            -16 + (i % 3) * 6, 0.02, 14 + Math.floor(i / 3) * 4, { cast: false });
        scene.add(tikar);
    }

    engine.addWalkRect(-60, -50, 60, 40);
    engine.configureMinimap({
        scale: 1.4, center: { x: 0, z: 0 },
        features: clusters.map(c => ({ type: 'point', x: c.position.x, z: c.position.z, color: '#c9bda8' }))
    });
    return { clusters };
}

/* ============ MINA & JAMARAT ============ */

export function jamratPillar(mats, { height = 16 } = {}) {
    const g = new THREE.Group();
    // Dinding elips abu-abu (jamarat modern)
    const wallGeo = new THREE.CylinderGeometry(1.6, 2.2, height, 24);
    wallGeo.scale(2.6, 1, 1);
    const wall = mesh(wallGeo, mats.darkGrey, 0, height / 2, 0);
    g.add(wall);
    // Kolam penampung (basin)
    const basinGeo = new THREE.CylinderGeometry(6.5, 6.5, 1.4, 28, 1, true);
    basinGeo.scale(1.7, 1, 1);
    const basin = mesh(basinGeo, mats.grey, 0, 0.7, 0, { cast: false });
    g.add(basin);
    const basinFloor = mesh(new THREE.CylinderGeometry(6.5, 6.5, 0.1, 28), mats.rock, 0, 0.08, 0, { cast: false });
    basinFloor.scale.x = 1.7;
    g.add(basinFloor);
    g.userData.wall = wall;
    return g;
}

export function mina(engine, { withAllJamarat = false } = {}) {
    const { scene, mats } = engine;
    engine.ground(700, mats.sand);

    // Kota tenda putih ikonik — instanced
    const tentBody = new THREE.BoxGeometry(4, 2.2, 4);
    const tentRoof = new THREE.ConeGeometry(3.1, 1.6, 4);
    const tentMat = new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.85 });
    const count = 220;
    const bodies = new THREE.InstancedMesh(tentBody, tentMat, count);
    const roofs = new THREE.InstancedMesh(tentRoof, tentMat, count);
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);
    const s1 = new THREE.Vector3(1, 1, 1);
    let idx = 0;
    for (let row = 0; row < 11 && idx < count; row++) {
        for (let col = 0; col < 20 && idx < count; col++) {
            const x = -95 + col * 10 + (row % 2) * 3;
            const z = 26 + row * 9;
            m4.makeTranslation(x, 1.1, z);
            bodies.setMatrixAt(idx, m4);
            m4.compose(new THREE.Vector3(x, 3.0, z), q, s1);
            roofs.setMatrixAt(idx, m4);
            idx++;
        }
    }
    bodies.castShadow = roofs.castShadow = true;
    bodies.receiveShadow = true;
    scene.add(bodies, roofs);

    // Bukit di kejauhan
    for (let i = 0; i < 8; i++) {
        const hill = mesh(new THREE.ConeGeometry(40 + Math.random() * 50, 24 + Math.random() * 20, 7), mats.rock,
            -200 + i * 60, 8, -160 - Math.random() * 60, { cast: false });
        scene.add(hill);
    }

    // Jembatan jamarat (plat + tiang)
    scene.add(mesh(new THREE.BoxGeometry(150, 1.2, 34), mats.grey, 0, -0.65, -40, { cast: false }));

    const jamarat = {};
    if (withAllJamarat) {
        const positions = [
            ['ula', -50, -40], ['wustha', 0, -40], ['aqabah', 50, -40]
        ];
        for (const [name, jx, jz] of positions) {
            const p = jamratPillar(mats);
            p.position.set(jx, 0, jz);
            scene.add(p);
            jamarat[name] = p;
            const st = Tex.sign(
                name === 'ula' ? 'JUMRAH ULA' : name === 'wustha' ? 'JUMRAH WUSTHA' : 'JUMRAH AQABAH',
                { bg: '#333d33', fg: '#c8ffc8', w: 640, h: 100 });
            scene.add(mesh(new THREE.BoxGeometry(7, 1.1, 0.2),
                new THREE.MeshStandardMaterial({ map: st, emissive: 0xffffff, emissiveMap: st, emissiveIntensity: 1.1 }),
                jx, 9, jz + 12.6, { cast: false }));
        }
    } else {
        const p = jamratPillar(mats);
        p.position.set(0, 0, -40);
        scene.add(p);
        jamarat.aqabah = p;
        const st = Tex.sign('JUMRAH AQABAH', { bg: '#333d33', fg: '#c8ffc8', w: 640, h: 100 });
        scene.add(mesh(new THREE.BoxGeometry(7, 1.1, 0.2),
            new THREE.MeshStandardMaterial({ map: st, emissive: 0xffffff, emissiveMap: st, emissiveIntensity: 1.1 }),
            0, 9, -27.4, { cast: false }));
    }

    // Tenda fasilitas dekat jalan
    for (let i = 0; i < 4; i++) {
        const lp = lampPost(mats, 7);
        lp.position.set(-45 + i * 30, 0, -18);
        scene.add(lp);
    }

    engine.addWalkRect(-100, -58, 100, 130);
    const features = [{ type: 'square', x: 0, z: 60, color: '#f2f0ea' }];
    if (withAllJamarat) {
        features.push(
            { type: 'point', x: -50, z: -40, color: '#d95757' },
            { type: 'point', x: 0, z: -40, color: '#d99a57' },
            { type: 'point', x: 50, z: -40, color: '#d9d957' });
    } else {
        features.push({ type: 'point', x: 0, z: -40, color: '#d95757' });
    }
    engine.configureMinimap({ scale: 0.75, center: { x: 0, z: 10 }, features });
    return { jamarat };
}

/* ============ PROPERTI KECIL ============ */

export function barberChair(mats) {
    const g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(0.7, 0.5, 0.7), new THREE.MeshStandardMaterial({ color: 0x7c2d2d, roughness: 0.6 }), 0, 0.5, 0));
    g.add(mesh(new THREE.BoxGeometry(0.7, 0.8, 0.15), new THREE.MeshStandardMaterial({ color: 0x7c2d2d, roughness: 0.6 }), 0, 1.1, -0.28));
    g.add(mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.3, 10), mats.steel, 0, 0.15, 0));
    return g;
}

export function prayerMat(mats, x, z, ry = 0) {
    return mesh(new THREE.BoxGeometry(1.2, 0.04, 2), mats.carpetGreen, x, 0.02, z, { cast: false, ry });
}

export function slaughterArea(mats) {
    const g = new THREE.Group();
    g.add(mesh(new THREE.BoxGeometry(10, 3.2, 6), mats.cream, 0, 1.6, 0));
    const t = Tex.sign('RUMAH PEMOTONGAN HADYU (DAM)', { bg: '#4d2a0d', fg: '#ffe0b8', w: 1024, h: 100 });
    g.add(mesh(new THREE.BoxGeometry(8, 0.9, 0.16),
        new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 1 }),
        0, 3.8, 3.1, { cast: false }));
    return g;
}
