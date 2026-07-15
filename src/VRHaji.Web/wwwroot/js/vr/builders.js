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

export function neemTree(mats, scale = 1) {
    const g = new THREE.Group();
    // Batang pohon cokelat tua bertekstur
    const trunkGeo = new THREE.CylinderGeometry(0.25 * scale, 0.4 * scale, 3.5 * scale, 9);
    const trunk = mesh(trunkGeo, mats.wood, 0, 1.75 * scale, 0);
    g.add(trunk);
    
    // Tajuk daun lebat khas pohon mimba/Soekarno di Arafah (hijau gelap, spherical cluster)
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x1f5c35, roughness: 0.95 });
    const leafBase = mesh(new THREE.DodecahedronGeometry(1.8 * scale, 1), leafMat, 0, 4.2 * scale, 0);
    g.add(leafBase);
    
    // Tambahkan beberapa gumpalan daun di sekitar tajuk utama agar lebih organik
    for(let i=0; i<4; i++) {
        const ang = i * (Math.PI/2);
        const cluster = mesh(new THREE.DodecahedronGeometry(1.2 * scale, 1), leafMat, 
            Math.cos(ang) * 0.9 * scale, 
            3.8 * scale + Math.random() * 0.6 * scale, 
            Math.sin(ang) * 0.9 * scale);
        g.add(cluster);
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
    // Skala nyata (§6): tinggi 13.1 m; sisi 12.86 m (sumbu X, sisi Hajar Aswad & pintu)
    // dan 11.03 m (sumbu Z). Sumber: Wikipedia "Kaaba" & data resmi Masjidil Haram.
    const W = 12.86, D = 11.03, H = 13.1;
    const hw = W / 2, hd = D / 2;
    const g = new THREE.Group();
    const body = mesh(new THREE.BoxGeometry(W, H, D), mats.kiswah, 0, H / 2, 0);
    g.add(body);
    // Pintu emas (Bab) — tinggi ± 3.3 m, terangkat ± 2.2 m dari lantai, dekat sudut timur
    const door = mesh(new THREE.BoxGeometry(1.9, 3.3, 0.15), mats.gold, 2.2, 2.2 + 1.65, hd + 0.08, { cast: false });
    g.add(door);
    // Hajar Aswad — sudut timur (frame perak), ± 1.5 m di atas lantai
    const hajar = new THREE.Group();
    hajar.add(mesh(new THREE.TorusGeometry(0.45, 0.14, 10, 20), mats.steel, 0, 0, 0, { cast: false }));
    hajar.add(mesh(new THREE.SphereGeometry(0.26, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0x0c0c10, roughness: 0.3 }), 0, 0, 0, { cast: false }));
    hajar.position.set(hw - 0.1, 1.5, hd - 0.1);
    g.add(hajar);
    g.userData.hajarAswad = hajar;
    // Talang emas (mizab) di puncak dinding barat laut
    g.add(mesh(new THREE.BoxGeometry(0.6, 0.3, 2.4), mats.gold, 0, H + 0.2, -hd - 0.6, { cast: false }));
    // Hijr Ismail — dinding setengah lingkaran (Hatim) di sisi barat laut
    const hijr = mesh(new THREE.CylinderGeometry(4.6, 4.6, 1.32, 32, 1, true, 0, Math.PI), mats.marble, 0, 0.66, -hd - 4, { cast: false });
    hijr.rotation.y = Math.PI;
    g.add(hijr);
    // Shadharwan (alas miring) sedikit lebih lebar dari denah Ka'bah
    g.add(mesh(new THREE.BoxGeometry(W + 0.9, 0.5, D + 0.9), mats.grey, 0, 0.25, 0));
    g.userData.footprint = { hw, hd };
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

    // Penambahan Detail: Karpet Merah, Rak Mushaf Al-Qur'an, dan Dispenser Zamzam
    const quranRack = new THREE.Group();
    quranRack.add(mesh(new THREE.BoxGeometry(0.8, 1.2, 0.4), mats.wood, 0, 0.6, 0));
    quranRack.add(mesh(new THREE.BoxGeometry(0.7, 0.05, 0.35), mats.steel, 0, 0.4, 0, {cast: false}));
    quranRack.add(mesh(new THREE.BoxGeometry(0.7, 0.05, 0.35), mats.steel, 0, 0.8, 0, {cast: false}));
    
    const zamzam = new THREE.Group();
    zamzam.add(mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.9, 12), mats.cream, 0, 0.45, 0));
    zamzam.add(mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.1, 12), mats.grey, 0, 0.95, 0));
    zamzam.add(mesh(new THREE.BoxGeometry(0.05, 0.05, 0.1), mats.steel, 0, 0.3, 0.28));
    
    const carpetMat = new THREE.MeshStandardMaterial({ color: 0x8a2424, roughness: 0.9 });
    for (let side = 0; side < 4; side++) {
        const ang = side * Math.PI / 2;
        // Karpet sholat membentang di bawah arcade
        const carpet = mesh(new THREE.BoxGeometry(140, 0.02, 12), carpetMat, 0, 0.01, 0, { cast: false });
        carpet.rotation.y = ang;
        if (side === 0) carpet.position.z = -R + 6;
        if (side === 1) carpet.position.x = -R + 6;
        if (side === 2) carpet.position.z = R - 6;
        if (side === 3) carpet.position.x = R - 6;
        scene.add(carpet);
        
        // Letakkan deretan rak Qur'an dan Zamzam
        for (let i = -7; i <= 7; i += 2.5) {
            if (Math.abs(i) < 2) continue; // Area tengah kosong untuk gerbang masuk
            const px = i * 8;
            const pz = -R + 2;
            const v1 = new THREE.Vector3(px, 0, pz).applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
            const v2 = new THREE.Vector3(px + 1.2, 0, pz).applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
            
            const r1 = quranRack.clone();
            r1.position.copy(v1); r1.rotation.y = ang;
            const z1 = zamzam.clone();
            z1.position.copy(v2); z1.rotation.y = ang;
            
            scene.add(r1, z1);
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
    // badan Ka'bah (skala nyata 12.86 × 11.03 m) + sedikit margin shadharwan
    engine.addBlocker(-7.0, -6.1, 7.0, 6.1);
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
    const L = 140, W = 18; // Diperpanjang & diperlebar agar proporsional
    engine.ground(400, mats.marbleTile);

    const masaaGroup = new THREE.Group();

    // Lantai koridor marmer putih mengkilap
    const floor = mesh(new THREE.BoxGeometry(L + 34, 0.1, W + 6), mats.marbleTile, 0, 0.05, 0, { cast: false });
    masaaGroup.add(floor);
    
    // Garis lantai pembatas jalur (hitam/gelap)
    masaaGroup.add(mesh(new THREE.BoxGeometry(L + 20, 0.12, 0.4), mats.darkGrey, 0, 0.05, 2, { cast: false }));
    masaaGroup.add(mesh(new THREE.BoxGeometry(L + 20, 0.12, 0.4), mats.darkGrey, 0, 0.05, -2, { cast: false }));

    const wallH = 12;
    // Atap utama dengan dekorasi
    masaaGroup.add(mesh(new THREE.BoxGeometry(L + 34, 0.8, W + 8), mats.cream, 0, wallH + 0.4, 0));
    
    // Panel dekorasi atap (coffered ceiling ilusi)
    for (let i = -L/2; i <= L/2; i += 8) {
        masaaGroup.add(mesh(new THREE.BoxGeometry(7, 0.2, W + 4), mats.white, i, wallH - 0.1, 0, { cast: false }));
    }

    // Dinding samping & Jendela lengkung
    for (const s of [-1, 1]) {
        const wall = mesh(new THREE.BoxGeometry(L + 34, wallH, 0.8), mats.cream, 0, wallH / 2, s * (W / 2 + 3.4));
        masaaGroup.add(wall);
        
        // Dekorasi pilar tempel di dinding
        for (let i = -L/2; i <= L/2; i += 8) {
            masaaGroup.add(mesh(new THREE.BoxGeometry(0.8, wallH, 1.0), mats.marble, i, wallH/2, s * (W / 2 + 3.2)));
            // Jendela emissive lengkung
            masaaGroup.add(mesh(new THREE.BoxGeometry(2.8, 4.0, 0.2), mats.emissiveWarm, i + 4, 6.0, s * (W / 2 + 3.0), { cast: false }));
        }
    }

    // Kolom/Pilar tengah tebal bergaya Masjidil Haram (Marmer kotak + Emas)
    const colGroup = new THREE.Group();
    colGroup.add(mesh(new THREE.BoxGeometry(1.2, wallH, 1.2), mats.marble, 0, wallH/2, 0)); // Badan pilar
    colGroup.add(mesh(new THREE.BoxGeometry(1.3, 0.4, 1.3), mats.gold, 0, 0.2, 0, {cast: false})); // Basis emas
    colGroup.add(mesh(new THREE.BoxGeometry(1.25, 0.3, 1.25), mats.gold, 0, wallH/2, 0, {cast: false})); // Pita emas tengah
    colGroup.add(mesh(new THREE.BoxGeometry(1.4, 0.6, 1.4), mats.gold, 0, wallH - 0.3, 0, {cast: false})); // Mahkota atas
    
    // Pagar pemisah jalur di tengah (Tinggi sepinggang)
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.5, metalness: 0.8 });
    masaaGroup.add(mesh(new THREE.BoxGeometry(L - 10, 1.2, 0.6), mats.marble, 0, 0.6, 0)); // Tembok bawah pagar
    masaaGroup.add(mesh(new THREE.BoxGeometry(L - 10, 0.1, 0.8), mats.gold, 0, 1.25, 0)); // List emas
    
    // Teralis pagar
    for(let i = -L/2 + 6; i <= L/2 - 6; i += 2) {
        masaaGroup.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8), fenceMat, i, 1.6, 0));
    }
    masaaGroup.add(mesh(new THREE.BoxGeometry(L - 10, 0.1, 0.1), fenceMat, 0, 1.9, 0)); // Pegangan atas

    for (let i = 0; i < 16; i++) {
        const px = -L / 2 + 10 + i * (L - 20) / 15;
        const col = colGroup.clone();
        col.position.set(px, 0, 0);
        masaaGroup.add(col);
        // Blocker untuk pilar dan pagar tengah
        engine.addBlocker(px - 0.7, -0.7, px + 0.7, 0.7);
    }
    // Blocker pemisah lintasan memanjang
    engine.addBlocker(-L/2 + 5, -0.4, L/2 - 5, 0.4);

    // Bukit Shafa & Marwah — bongkahan batu granit berlapis yang kasar
    const buildHill = (cx, cz) => {
        const hill = new THREE.Group();
        // Base landai agar terlihat menyatu dengan lantai
        const baseGeo = new THREE.IcosahedronGeometry(7, 1);
        const bp = baseGeo.attributes.position;
        for (let i = 0; i < bp.count; i++) {
            bp.setXYZ(i, bp.getX(i), Math.max(0, bp.getY(i)) * 0.35, bp.getZ(i));
        }
        baseGeo.computeVertexNormals();
        hill.add(mesh(baseGeo, mats.rock, 0, -0.2, 0));
        
        // Tumpukan bongkahan batu bergerigi di atasnya
        for(let i=0; i<18; i++) {
            const r = 1.2 + Math.random() * 2.8;
            const hx = (Math.random() - 0.5) * 9;
            const hz = (Math.random() - 0.5) * 9;
            const dist = Math.hypot(hx, hz);
            if (dist > 5) continue; // Fokuskan ke tengah
            const hy = (1 - (dist / 5)) * 4.5 + Math.random() * 1.5;
            const boulder = mesh(new THREE.DodecahedronGeometry(r, 0), mats.rock, hx, Math.max(0.2, hy), hz);
            boulder.rotation.set(Math.random(), Math.random(), Math.random());
            hill.add(boulder);
        }
        hill.position.set(cx, 0, cz);
        return hill;
    };
    const shafa = buildHill(-L / 2 - 8, 0);
    const marwah = buildHill(L / 2 + 8, 0);
    
    // Pagar kaca dengan rangka besi (Stainless Steel Handrail) mengelilingi batu
    const glassFenceGroup = new THREE.Group();
    const rF = 7.5; // Radius pagar
    
    const buildFence = (cx, ryOffset) => {
        const fGrp = new THREE.Group();
        // Kaca tebal melengkung
        const glassGeo = new THREE.CylinderGeometry(rF, rF, 1.2, 32, 1, true, 0, Math.PI);
        fGrp.add(mesh(glassGeo, mats.glass, 0, 0.7, 0, { cast: false }));
        // Tiang besi vertikal (Stanchion)
        for(let a=0; a<=Math.PI; a+=Math.PI/10) {
            fGrp.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8), mats.steel, Math.cos(a)*rF, 0.7, Math.sin(a)*rF));
        }
        // Pegangan atas melengkung (Handrail)
        const railGeo = new THREE.TorusGeometry(rF, 0.08, 8, 32, Math.PI);
        const rail = mesh(railGeo, mats.steel, 0, 1.4, 0);
        rail.rotation.x = Math.PI/2;
        fGrp.add(rail);
        
        fGrp.position.set(cx, 0, 0);
        fGrp.rotation.y = ryOffset;
        glassFenceGroup.add(fGrp);
    };
    buildFence(-L / 2 - 8, Math.PI/2); // Menghadap timur
    buildFence(L / 2 + 8, -Math.PI/2); // Menghadap barat
    masaaGroup.add(shafa, marwah, glassFenceGroup);

    // Zona lampu hijau (Milain Akhdharain - area lari kecil)
    const greenLightMat = new THREE.MeshStandardMaterial({
        color: 0x27c96a, emissive: 0x27c96a, emissiveIntensity: 2.5
    });
    const greenFloorMat = new THREE.MeshStandardMaterial({ color: 0x1a5c39, emissive: 0x114d2c, emissiveIntensity: 0.4 });
    
    for (const gx of [-16, 16]) {
        // Lampu neon hijau memanjang di plafon
        masaaGroup.add(mesh(new THREE.BoxGeometry(6, 0.2, W + 6), greenLightMat, gx, wallH - 0.2, 0, { cast: false }));
        // Lampu vertikal di dinding
        masaaGroup.add(mesh(new THREE.BoxGeometry(6, wallH - 4, 0.2), greenLightMat, gx, wallH/2, -(W / 2 + 3.2), { cast: false }));
        masaaGroup.add(mesh(new THREE.BoxGeometry(6, wallH - 4, 0.2), greenLightMat, gx, wallH/2, (W / 2 + 3.2), { cast: false }));
        // Ambient light hijau
        engine.addPointLamp(gx, wallH - 2, 0, { color: 0x27c96a, intensity: 100, distance: 30 });
    }
    
    // Lantai hijau
    const greenFloor = mesh(new THREE.BoxGeometry(38, 0.02, W + 6), greenFloorMat, 0, 0.11, 0, { cast: false });
    masaaGroup.add(greenFloor);

    // Detail Tambahan: Galon Zamzam & Rak Al-Qur'an di sisi dinding
    const zamzam = new THREE.Group();
    zamzam.add(mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.9, 12), mats.cream, 0, 0.45, 0));
    zamzam.add(mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.1, 12), mats.grey, 0, 0.95, 0));
    zamzam.add(mesh(new THREE.BoxGeometry(0.05, 0.05, 0.1), mats.steel, 0, 0.3, 0.28));
    
    for (const zSide of [-1, 1]) {
        for (let i = -L/2 + 15; i <= L/2 - 15; i += 12) {
            const zz = zamzam.clone();
            zz.position.set(i, 0, zSide * (W/2 + 2.5));
            zz.rotation.y = zSide > 0 ? Math.PI : 0;
            masaaGroup.add(zz);
        }
    }

    // Lampu interior reguler
    for (let i = -4; i <= 4; i++) {
        engine.addPointLamp(i * 18, wallH - 1, W/4, { intensity: 70, distance: 30 });
        engine.addPointLamp(i * 18, wallH - 1, -W/4, { intensity: 70, distance: 30 });
    }

    scene.add(masaaGroup);

    engine.addWalkRect(-L / 2 - 11, -W / 2 - 3, L / 2 + 11, W / 2 + 3);
    engine.configureMinimap({
        scale: 0.9, center: { x: 0, z: 0 },
        features: [
            { type: 'point', x: -L / 2 - 8, z: 0, color: '#37c978' },
            { type: 'point', x: L / 2 + 8, z: 0, color: '#37c978' }
        ]
    });
    return { shafaX: -L / 2 - 4, marwahX: L / 2 + 4, length: L, shafa, marwah };
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
    const L = 30, R = 3.6; // Diperlebar agar ruang jalan lebih luas
    
    // Badan pesawat
    const tubeGeo = new THREE.CylinderGeometry(R, R, L, 24, 1, false);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0xefefef, roughness: 0.6, side: THREE.BackSide });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.rotation.z = Math.PI / 2;
    tube.position.y = R - 0.6;
    g.add(tube);
    
    // Lantai
    const floor = new THREE.Mesh(new THREE.BoxGeometry(L, 0.15, R * 1.8), new THREE.MeshStandardMaterial({ color: 0x222a3a, roughness: 0.9 }));
    floor.position.y = 0.05;
    g.add(floor);
    
    // Kursi pesawat yang lebih nyata (dengan sandaran tangan & kepala)
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x1c3a63, roughness: 0.7 });
    const armMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
    
    // Instanced meshes for better performance
    // Dimensi: X (lebar/tebal depan-belakang), Y (tinggi), Z (lebar kiri-kanan)
    const nSeats = 12 * 4;
    const cush = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.15, 0.5), seatMat, nSeats);
    const bk = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.85, 0.5), seatMat, nSeats);
    const hd = new THREE.InstancedMesh(new THREE.BoxGeometry(0.15, 0.2, 0.5), new THREE.MeshStandardMaterial({ color: 0xdedede }), nSeats); // headrest
    const arm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.45, 0.04, 0.06), armMat, nSeats * 2); // 2 arms per seat
    const leg = new THREE.InstancedMesh(new THREE.BoxGeometry(0.25, 0.4, 0.35), armMat, nSeats); // Seat base

    const m4 = new THREE.Matrix4();
    let i = 0, j = 0;
    const seatSpots = [];
    
    for (let row = 0; row < 12; row++) {
        for (const sz of [-1.5, -0.85, 0.85, 1.5]) { // Jarak sz diperlebar
            const sx = -L / 2 + 5 + row * 1.8; // Spacing antar baris
            
            // Jadikan kursi berwujud padat (solid) agar tidak bisa ditembus
            engine.addBlocker(
                origin.x + sx - 0.35, origin.z + sz - 0.35,
                origin.x + sx + 0.35, origin.z + sz + 0.35
            );
            
            // Cushion
            m4.makeTranslation(sx, 0.45, sz); cush.setMatrixAt(i, m4);
            // Leg/Base
            m4.makeTranslation(sx, 0.2, sz); leg.setMatrixAt(i, m4);
            // Backrest (tilt back)
            m4.makeRotationZ(-0.15); // tilt back relative to +X facing
            m4.setPosition(sx - 0.25, 0.9, sz); bk.setMatrixAt(i, m4);
            // Headrest
            m4.setPosition(sx - 0.35, 1.3, sz); hd.setMatrixAt(i, m4);
            
            // Armrests
            m4.makeTranslation(sx + 0.05, 0.65, sz - 0.28); arm.setMatrixAt(j++, m4);
            m4.makeTranslation(sx + 0.05, 0.65, sz + 0.28); arm.setMatrixAt(j++, m4);
            
            // Save spot for crowd (ry: Math.PI / 2 means facing +X)
            seatSpots.push({ x: sx + origin.x, z: sz + origin.z, ry: Math.PI / 2 });
            i++;
        }
    }
    g.add(cush, bk, hd, arm, leg);
    
    // Jendela emissive
    for (let w = 0; w < 12; w++) {
        for (const s of [-1, 1]) {
            g.add(mesh(new THREE.BoxGeometry(0.4, 0.55, 0.05), mats.emissiveCool,
                -L / 2 + 5 + w * 1.8, 1.3, s * (R - 0.2), { cast: false }));
        }
    }
    
    g.position.set(origin.x, 0, origin.z);
    scene.add(g);
    
    engine.addPointLamp(origin.x, 2.4, origin.z, { intensity: 40, distance: 25 });
    engine.addPointLamp(origin.x - 10, 2.4, origin.z, { intensity: 30, distance: 18 });
    engine.addPointLamp(origin.x + 10, 2.4, origin.z, { intensity: 30, distance: 18 });
    
    // Area bebas berjalan di seluruh kabin (dibatasi blocker kursi)
    engine.addWalkRect(origin.x - L / 2 + 1, origin.z - R + 0.5, origin.x + L / 2 - 1, origin.z + R - 0.5);
    
    return { origin, length: L, seatSpots };
}

/* ============ MASJID NABAWI ============ */

export function nabawi(engine, origin = { x: 0, z: 0 }) {
    const { scene, mats } = engine;
    const g = new THREE.Group();
    
    const grnd = mesh(new THREE.BoxGeometry(500, 0.2, 500), mats.marbleTile, 0, -0.1, 0, { cast: false });
    g.add(grnd);

    // Fasad utama dengan arcade
    const fas = arcade(mats, { count: 26, spacing: 7, height: 12 });
    fas.position.z = -46;
    g.add(fas);
    const wall = mesh(new THREE.BoxGeometry(190, 16, 2), mats.cream, 0, 8, -49);
    g.add(wall);
    // Gerbang utama
    const gateTex = Tex.sign('المسجد النبوي — MASJID NABAWI', { bg: '#0e3b26', fg: '#ffe9a8', w: 1024, h: 120 });
    g.add(mesh(new THREE.BoxGeometry(16, 2, 0.4),
        new THREE.MeshStandardMaterial({ map: gateTex, emissive: 0xffffff, emissiveMap: gateTex, emissiveIntensity: 0.9 }),
        0, 13.4, -47.6, { cast: false }));
    const door = mesh(new THREE.BoxGeometry(9, 11, 1.2), mats.gold, 0, 5.5, -48.2);
    g.add(door);

    // Kubah hijau ikonik
    const dome = mesh(new THREE.SphereGeometry(9, 24, 18, 0, Math.PI * 2, 0, Math.PI / 2), mats.greenDome, -30, 16, -72, { cast: false });
    g.add(dome);
    g.add(mesh(new THREE.CylinderGeometry(9, 9, 6, 24), mats.cream, -30, 13, -72));
    g.add(mesh(new THREE.SphereGeometry(0.7, 10, 8), mats.gold, -30, 25.6, -72, { cast: false }));

    // Minaret
    for (const [mx, mz] of [[-88, -50], [88, -50], [-50, -90], [50, -90]]) {
        const mn = minaret(mats, 58, 2.1);
        mn.position.set(mx, 0, mz);
        g.add(mn);
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
            g.add(u);
            if (engine.envPreset !== 'day') {
                engine.addPointLamp(origin.x + px, 12, origin.z + pz, { intensity: 90, distance: 34 });
            }
        }
    }

    // Pot palem & lampu
    for (let i = -4; i <= 4; i++) {
        const t = palmTree(mats, 0.9);
        t.position.set(i * 20, 0, 26);
        g.add(t);
        const lp = lampPost(mats, 7);
        lp.position.set(i * 20 + 8, 0, 20);
        g.add(lp);
    }

    g.position.set(origin.x, 0, origin.z);
    scene.add(g);

    engine.addWalkRect(origin.x - 95, origin.z - 47, origin.x + 95, origin.z + 40);
    engine.configureMinimap({
        scale: 0.9, center: { x: origin.x, z: origin.z - 10 },
        features: [
            { type: 'square', x: origin.x, z: origin.z - 48, color: '#e8c96a' },
            { type: 'point', x: origin.x - 30, z: origin.z - 72, color: '#37c978' }
        ]
    });
    return { origin, gatePos: { x: origin.x, z: origin.z - 44 }, door, dome };
}

export function busModel(mats) {
    const bus = new THREE.Group();
    const busMat = new THREE.MeshStandardMaterial({ color: 0xd8dee6, roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide });
    const intMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
    
    // Lantai
    bus.add(mesh(new THREE.BoxGeometry(12, 0.2, 3), intMat, 0, 0.6, 0));
    // Atap
    bus.add(mesh(new THREE.BoxGeometry(12, 0.2, 3), busMat, 0, 3.9, 0));
    // Dinding Depan & Belakang
    bus.add(mesh(new THREE.BoxGeometry(0.2, 3.1, 3), busMat, -5.9, 2.25, 0));
    bus.add(mesh(new THREE.BoxGeometry(0.2, 3.1, 3), busMat, 5.9, 2.25, 0));
    // Dinding Samping Bawah
    bus.add(mesh(new THREE.BoxGeometry(11.6, 1.1, 0.2), busMat, 0, 1.25, -1.4));
    bus.add(mesh(new THREE.BoxGeometry(9.6, 1.1, 0.2), busMat, -1.0, 1.25, 1.4));
    bus.add(mesh(new THREE.BoxGeometry(0.8, 1.1, 0.2), busMat, 5.4, 1.25, 1.4));
    // Dinding Samping Atas
    bus.add(mesh(new THREE.BoxGeometry(11.6, 1.0, 0.2), busMat, 0, 3.3, -1.4));
    bus.add(mesh(new THREE.BoxGeometry(11.6, 1.0, 0.2), busMat, 0, 3.3, 1.4));
    // Pilar Jendela
    for (let x = -5.5; x <= 5.5; x += 1.4) {
        bus.add(mesh(new THREE.BoxGeometry(0.2, 1.0, 0.2), busMat, x, 2.3, -1.4));
        bus.add(mesh(new THREE.BoxGeometry(0.2, 1.0, 0.2), busMat, x, 2.3, 1.4));
    }
    // Kusen pintu
    bus.add(mesh(new THREE.BoxGeometry(0.2, 2.2, 0.3), busMat, 3.8, 1.8, 1.4));
    bus.add(mesh(new THREE.BoxGeometry(0.2, 2.2, 0.3), busMat, 5.0, 1.8, 1.4));
    // Kaca Jendela
    bus.add(mesh(new THREE.BoxGeometry(11.6, 1.0, 3.05), mats.glass, 0, 2.3, 0, { cast: false }));
    
    // Roda
    for (const [wx, wz] of [[-4, -1.6], [4, -1.6], [-4, 1.6], [4, 1.6]]) {
        const wheel = mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.4, 14), mats.darkGrey, wx, 0.7, wz);
        wheel.rotation.x = Math.PI / 2;
        bus.add(wheel);
    }
    
    // Pintu
    const busDoor = mesh(new THREE.BoxGeometry(1.2, 2.2, 0.2), mats.glass, 4.4, 1.8, 1.5);
    bus.add(busDoor);
    
    // Kursi
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x224466, roughness: 0.7 });
    for (let r = -4; r <= 4; r++) {
        for (const sx of [-1, 1]) {
            if (r === 4 && sx === 1) continue; 
            bus.add(mesh(new THREE.BoxGeometry(0.6, 0.3, 0.8), seatMat, r * 1.1, 0.85, sx * 0.9));
            bus.add(mesh(new THREE.BoxGeometry(0.15, 0.8, 0.8), seatMat, r * 1.1 - 0.25, 1.3, sx * 0.9));
            bus.add(mesh(new THREE.BoxGeometry(0.12, 0.25, 0.5), seatMat, r * 1.1 - 0.28, 1.75, sx * 0.9));
            bus.add(mesh(new THREE.BoxGeometry(0.5, 0.05, 0.1), mats.darkGrey, r * 1.1, 1.1, sx * 0.9 - 0.45));
            bus.add(mesh(new THREE.BoxGeometry(0.5, 0.05, 0.1), mats.darkGrey, r * 1.1, 1.1, sx * 0.9 + 0.45));
        }
    }
    
    return { bus, busDoor };
}

/* ============ MIQAT BIR ALI ============ */

export function miqat(engine) {
    const { scene, mats } = engine;
    engine.ground(500, mats.sand);

    // Masjid miqat (Bir Ali / Dzul Hulaifah) - Bergaya benteng batu yang megah
    // Dinding utama masjid (Batu beige / cream)
    const wall = mesh(new THREE.BoxGeometry(60, 8, 1.2), mats.cream, 0, 4, -30);
    scene.add(wall);
    engine.addBlocker(-30, -31, 30, -29); // Blocker dinding belakang
    
    for (const s of [-1, 1]) {
        scene.add(mesh(new THREE.BoxGeometry(1.2, 8, 40), mats.cream, s * 30, 4, -10));
        engine.addBlocker(s * 30 - 0.6, -30, s * 30 + 0.6, 10); // Blocker dinding samping
    }
    const arc = arcade(mats, { count: 8, spacing: 6, height: 8 });
    arc.position.z = -28;
    scene.add(arc);
    const mn = minaret(mats, 40, 1.8); // Menara diperbesar
    mn.position.set(-26, 0, -27);
    scene.add(mn);
    engine.addBlocker(-28, -29, -24, -25); // Blocker menara
    
    const dome = mesh(new THREE.SphereGeometry(6, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), mats.white, 0, 8, -36, { cast: false });
    scene.add(dome);
    scene.add(mesh(new THREE.SphereGeometry(0.4, 10, 8), mats.gold, 0, 14.4, -36, { cast: false }));

    // Tempat wudhu/mandi (bilik)
    const bilik = new THREE.Group();
    bilik.add(mesh(new THREE.BoxGeometry(10, 4, 6), mats.cream, 0, 2, 0));
    const bt = Tex.sign('TEMPAT MANDI & WUDHU', { bg: '#0d3b4d', fg: '#ffffff', w: 800, h: 100, font: 'bold 44px sans-serif' });
    bilik.add(mesh(new THREE.BoxGeometry(7, 1.0, 0.15),
        new THREE.MeshStandardMaterial({ map: bt, emissive: 0xffffff, emissiveMap: bt, emissiveIntensity: 1 }),
        0, 4.6, 3.05, { cast: false }));
    bilik.position.set(-18, 0, -8);
    scene.add(bilik);
    engine.addBlocker(-23, -11, -13, -5); // Blocker solid bilik wudhu

    // Rak kain ihram (Lebih rapi)
    const rak = new THREE.Group();
    rak.add(mesh(new THREE.BoxGeometry(4.5, 0.15, 1.4), mats.wood, 0, 1.2, 0));
    rak.add(mesh(new THREE.BoxGeometry(4.5, 0.15, 1.4), mats.wood, 0, 2.0, 0));
    for (let i = 0; i < 5; i++) {
        rak.add(mesh(new THREE.BoxGeometry(0.8, 0.5, 1.1),
            new THREE.MeshStandardMaterial({ color: 0xf8f6ef, roughness: 0.95 }), -1.8 + i*0.9, 1.5, 0, { cast: false }));
    }
    rak.add(mesh(new THREE.BoxGeometry(0.14, 2.2, 0.14), mats.wood, -2.1, 1.1, 0.6));
    rak.add(mesh(new THREE.BoxGeometry(0.14, 2.2, 0.14), mats.wood, 2.1, 1.1, 0.6));
    const rt = Tex.sign('KAIN IHRAM', { bg: '#3b2a0d', fg: '#ffe9a8', w: 512, h: 100, font: 'bold 44px sans-serif' });
    rak.add(mesh(new THREE.BoxGeometry(3.5, 0.7, 0.12),
        new THREE.MeshStandardMaterial({ map: rt, emissive: 0xffffff, emissiveMap: rt, emissiveIntensity: 1 }),
        0, 2.8, 0, { cast: false }));
    rak.position.set(-6, 0, -12);
    scene.add(rak);
    engine.addBlocker(-8.5, -12.8, -3.5, -11.2); // Blocker solid rak ihram

    // Sajadah sholat sunnah
    const sajadah = mesh(new THREE.BoxGeometry(1.2, 0.04, 2), mats.carpetGreen, 6, 0.02, -16, { cast: false });
    scene.add(sajadah);

    // Bus jamaah
    const { bus, busDoor } = busModel(mats);
    const busM4 = new THREE.Matrix4().makeRotationY(-20 * DEG);
    busM4.setPosition(20, 0, 14);
    bus.position.set(20, 0, 14);
    bus.rotation.y = -20 * DEG;
    scene.add(bus);

    const seatSpots = [];
    const tmpV = new THREE.Vector3();
    for (let r = -4; r <= 4; r++) {
        for (const sx of [-1, 1]) {
            if (r === 4 && sx === 1) continue; 
            tmpV.set(r * 1.1, 0, sx * 0.9).applyMatrix4(busM4);
            seatSpots.push({ x: tmpV.x, z: tmpV.z, ry: Math.PI / 2 - 20 * DEG });
        }
    }
    
    // Solid Colliders untuk bus
    const addB = (cx, cz, rx, rz) => {
        let v = new THREE.Vector3(cx, 0, cz).applyMatrix4(busM4);
        engine.blockers.push({ x1: v.x - rx, z1: v.z - rz, x2: v.x + rx, z2: v.z + rz });
    };
    for (let x = -5.5; x <= 5.5; x += 1.5) {
        addB(x, -1.6, 0.8, 0.8);
        addB(x, 1.6, 0.8, 0.8);
    }
    for (let z = -1.5; z <= 1.5; z += 1.5) {
        addB(-6, z, 0.8, 0.8);
        addB(6, z, 0.8, 0.8);
    }
    bus.rotation.y = -20 * DEG;
    scene.add(bus);

    // Pohon kurma/kurma di courtyard Miqat (lebih rindang dan tertata)
    const palmPositions = [
        [-24, 8], [24, -20], [14, -24], [-30, -18], [30, 6], 
        [-15, 12], [-5, 12], [5, 12], [15, 12], [25, 12], // barisan depan
        [-20, -2], [-10, -2], [0, -2], [10, -2] // barisan tengah
    ];
    for (const [tx, tz] of palmPositions) {
        const t = palmTree(mats, 1.1 + Math.random() * 0.3);
        t.position.set(tx, 0, tz);
        scene.add(t);
        engine.addBlocker(tx - 0.5, tz - 0.5, tx + 0.5, tz + 0.5); // Pohon solid
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
    return { bilik, rak, sajadah, bus, busDoor, seatSpots };
}

/* ============ ARAFAH (WUKUF) ============ */

/**
 * Padang Arafah: dataran luas, Jabal Rahmah dengan tugu putih, Masjid Namirah,
 * tenda-tenda putih, dan pepohonan. Puncak ibadah haji (9 Dzulhijjah).
 */
export function arafah(engine) {
    const { scene, mats } = engine;
    engine.ground(800, mats.sand);

    // Bukit-bukit kecoklatan di cakrawala (Vast Desert Feel)
    for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        const hill = mesh(new THREE.ConeGeometry(34 + Math.random() * 50, 15 + Math.random() * 25, 8), mats.rock,
            Math.cos(ang) * (220 + Math.random() * 80), 5, Math.sin(ang) * (220 + Math.random() * 80), { cast: false });
        scene.add(hill);
    }

    // Jabal Rahmah — Tumpukan bongkahan granit besar
    const jabalPos = { x: -58, z: -66 };
    const jabal = new THREE.Group();
    
    // Base gundukan besar
    const baseGeo = new THREE.IcosahedronGeometry(18, 1);
    const bp = baseGeo.attributes.position;
    for (let i = 0; i < bp.count; i++) {
        bp.setXYZ(i, bp.getX(i), Math.max(0, bp.getY(i)) * 0.7, bp.getZ(i));
    }
    baseGeo.computeVertexNormals();
    jabal.add(mesh(baseGeo, mats.rock, 0, 0, 0));
    
    // Batu-batu raksasa menumpuk di atas base
    for(let i=0; i<15; i++) {
        const r = 3 + Math.random() * 5;
        const hx = (Math.random() - 0.5) * 16;
        const hz = (Math.random() - 0.5) * 16;
        const hy = 4 + (1 - (Math.hypot(hx, hz) / 12)) * 10 + Math.random() * 3;
        const rGeo = new THREE.DodecahedronGeometry(r, 0);
        const boulder = mesh(rGeo, mats.rock, hx, hy, hz);
        boulder.rotation.set(Math.random(), Math.random(), Math.random());
        jabal.add(boulder);
    }
    jabal.position.set(jabalPos.x, 0, jabalPos.z);
    scene.add(jabal);

    // Tugu putih (Monumen Jabal Rahmah) di puncak tertinggi
    const pillar = mesh(new THREE.BoxGeometry(2.0, 7.5, 2.0), mats.white, jabalPos.x, 18.5, jabalPos.z);
    scene.add(pillar);
    // Plat pelataran di bawah tugu
    scene.add(mesh(new THREE.BoxGeometry(4.0, 0.4, 4.0), mats.cream, jabalPos.x, 14.8, jabalPos.z, { cast: false }));
    // Pagar keliling plat tugu
    const platFenceGeo = new THREE.BoxGeometry(4.0, 1.2, 0.1);
    scene.add(mesh(platFenceGeo, mats.white, jabalPos.x, 15.4, jabalPos.z - 2.0));
    scene.add(mesh(platFenceGeo, mats.white, jabalPos.x, 15.4, jabalPos.z + 2.0));
    const platFenceZ = new THREE.BoxGeometry(0.1, 1.2, 4.0);
    scene.add(mesh(platFenceZ, mats.white, jabalPos.x - 2.0, 15.4, jabalPos.z));
    scene.add(mesh(platFenceZ, mats.white, jabalPos.x + 2.0, 15.4, jabalPos.z));

    // Masjid Namirah — Fasade khas bercat kuning gading / krem terang
    const namirahMat = new THREE.MeshStandardMaterial({ color: 0xebd9a2, roughness: 0.95 });
    const wall = mesh(new THREE.BoxGeometry(120, 14, 4), namirahMat, 40, 7, -96);
    scene.add(wall);
    
    // Lengkungan khas masjid namirah
    const arc = arcade(mats, { count: 16, spacing: 6.5, height: 11, depth: 4.2 });
    // Override material arcade ke warna namirah
    arc.children.forEach(c => c.material = namirahMat);
    arc.position.set(40, 0, -94);
    scene.add(arc);
    
    const dome = mesh(new THREE.SphereGeometry(9, 22, 16, 0, Math.PI * 2, 0, Math.PI / 2), mats.white, 40, 14, -98, { cast: false });
    scene.add(dome);
    for (const mx of [-14, 94]) {
        const mn = minaret(mats, 44, 1.8);
        mn.position.set(mx, 0, -98);
        scene.add(mn);
    }
    const nt = Tex.sign('مسجد نمرة — MASJID NAMIRAH', { bg: '#0b2b1a', fg: '#ffe9a8', w: 1024, h: 110 });
    scene.add(mesh(new THREE.BoxGeometry(18, 2, 0.4),
        new THREE.MeshStandardMaterial({ map: nt, emissive: 0xffffff, emissiveMap: nt, emissiveIntensity: 0.6 }),
        40, 12.5, -93.8, { cast: false }));

    // Tenda-tenda Arafah (Kotak putih besar khas wukuf)
    const tentBodyGeo = new THREE.BoxGeometry(6.4, 3.2, 6.4);
    // Atap piramida
    const tentRoofGeo = new THREE.ConeGeometry(4.8, 1.8, 4);
    const tentMat = new THREE.MeshStandardMaterial({ color: 0xf9f7f1, roughness: 0.9, side: THREE.DoubleSide });
    const tentFrameMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.6, metalness: 0.5 });
    
    const tents = new THREE.Group();
    // Tiang penyangga teras tenda
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.2, 6);
    
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 11; col++) {
            // Beri sedikit celah tak beraturan agar terlihat alami
            if (Math.random() > 0.85) continue;
            
            const tx = 25 + col * 9 + (row % 2) * 2;
            const tz = 25 + row * 9;
            
            const tBody = mesh(tentBodyGeo, tentMat, tx, 1.6, tz);
            const tRoof = mesh(tentRoofGeo, tentMat, tx, 4.1, tz);
            tRoof.rotation.y = Math.PI/4;
            
            // Tambah teras/kanopi kecil di depan tenda
            const canopy = mesh(new THREE.PlaneGeometry(3, 2), tentMat, tx, 3.2, tz - 3.6, { ry: Math.PI });
            canopy.rotation.x = -Math.PI / 4;
            const p1 = mesh(poleGeo, tentFrameMat, tx - 1.4, 1.6, tz - 4.2);
            const p2 = mesh(poleGeo, tentFrameMat, tx + 1.4, 1.6, tz - 4.2);
            
            tents.add(tBody, tRoof, canopy, p1, p2);
            engine.addBlocker(tx - 3.2, tz - 3.2, tx + 3.2, tz + 3.2); // Tenda Arafah solid
        }
    }
    scene.add(tents);

    // Area tempat duduk dengan karpet (sebelumnya ada pepohonan di sini)
    for (const [tx, tz] of [[-30, 6], [-14, -14], [10, 10], [-40, -30], [24, -8], [-6, 20], [16, 26], [-20, 25], [12, -22], [-5, -35]]) {
        // Gelar ambal / karpet di bawah pohon untuk tempat duduk wukuf
        const carpet = mesh(new THREE.BoxGeometry(4.5, 0.05, 3.5), mats.carpetGreen, tx + (Math.random()-0.5)*2, 0.02, tz + (Math.random()-0.5)*2, { ry: Math.random() * 2 });
        scene.add(carpet);
    }
    
    // Gelar tikar/karpet di sekitar jamaah NPC duduk (dekat titik start)
    for (const cx of [-22, -18, -14]) {
        for (const cz of [26, 30, 34]) {
            scene.add(mesh(new THREE.BoxGeometry(3, 0.04, 3.5), mats.carpetGreen, cx + Math.random(), 0.02, cz + Math.random(), { ry: Math.random()*0.2 }));
        }
    }

    for (let i = 0; i < 4; i++) {
        const lp = lampPost(mats, 7.5);
        lp.position.set(-40 + i * 26, 0, -6);
        scene.add(lp);
    }
    
    // Bus-bus pengangkut jamaah parkir di tepi area wukuf
    for (let i = 0; i < 3; i++) {
        const b = busModel(mats).bus;
        b.position.set(-20 + i * 16, 0, -110);
        scene.add(b);
        engine.addBlocker(-26 + i * 16, -112, -14 + i * 16, -108);
    }

    // Solid Colliders
    engine.addBlocker(jabalPos.x - 18, jabalPos.z - 18, jabalPos.x + 18, jabalPos.z + 18);
    engine.addWalkRect(-70, -60, 90, 80);
    engine.configureMinimap({
        scale: 0.7, center: { x: 0, z: 0 },
        features: [
            { type: 'point', x: jabalPos.x, z: jabalPos.z, color: '#e8e2d2' },
            { type: 'square', x: 40, z: -96, color: '#ebd9a2' },
            { type: 'square', x: 70, z: 55, color: '#f9f7f1' }
        ]
    });
    return { jabal, pillar, jabalPos };
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

    // Lampu Sorot Jalan Raya (Ciri khas Muzdalifah: lampu kuning terang di malam hari)
    for (const lx of [-40, 40]) {
        for (const lz of [-50, 0, 50]) {
            const lp = lampPost(mats, 12);
            lp.position.set(lx, 0, lz);
            scene.add(lp);
            engine.addPointLamp(lx, 11.5, lz, { intensity: 100, distance: 70, color: 0xffd78a });
        }
    }

    // Karpet/Tikar tempat jamaah mabit (tidur/istirahat di tanah)
    const matColors = [mats.carpetGreen, mats.carpetRed, mats.darkGrey, mats.cream];
    for (let i = 0; i < 30; i++) {
        const matMesh = mesh(new THREE.BoxGeometry(2.2, 0.04, 1.2), 
            matColors[Math.floor(Math.random() * matColors.length)], 
            (Math.random() - 0.5) * 60, 0.02, (Math.random() - 0.5) * 40, 
            { ry: Math.random() * Math.PI, cast: false });
        scene.add(matMesh);
    }

    // Bus Parkir di pinggir jalan
    for (let i = 0; i < 4; i++) {
        const b = busModel(mats).bus;
        b.position.set(-50, 0, -40 + i * 25);
        b.rotation.y = Math.PI / 2;
        scene.add(b);
        engine.addBlocker(-52, -45 + i * 25, -48, -35 + i * 25);
    }

    // Batu kerikil interaktif — tersebar secara tunggal maupun mengelompok
    const pebbleGeo = new THREE.DodecahedronGeometry(0.09, 0);
    const pebbleMat = new THREE.MeshStandardMaterial({ color: 0xa89c8a, roughness: 0.95, emissive: 0x333333 }); 
    const clusters = [];
    
    // Buat 250 titik kerikil murni interaktif (TIDAK ADA batu palsu/dekoratif lagi)
    for (let i = 0; i < 250; i++) {
        const grp = new THREE.Group();
        // 85% peluang hanya 1 batu tunggal, 15% peluang mengelompok 2-4 batu
        const n = Math.random() > 0.15 ? 1 : 2 + Math.floor(Math.random() * 3);
        grp.userData.stoneCount = n; // Simpan jumlah batu untuk logika pengambilan
        
        for (let k = 0; k < n; k++) {
            const p = mesh(pebbleGeo, pebbleMat,
                (Math.random() - 0.5) * 0.4, 0.07, (Math.random() - 0.5) * 0.4);
            p.scale.setScalar(0.7 + Math.random() * 1.0);
            grp.add(p);
        }
        
        const r = 2 + Math.random() * 60; // Tersebar luas hingga radius 60 meter
        const ang = Math.random() * Math.PI * 2;
        grp.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
        scene.add(grp);
        clusters.push(grp);
    }

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
            engine.addBlocker(x - 2, z - 2, x + 2, z + 2); // Tenda solid
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

    // Jembatan Jamarat Megah (Struktur Bangunan Modern bertingkat)
    // Lantai Pelataran Jamarat (Marmer/Beton)
    scene.add(mesh(new THREE.BoxGeometry(220, 1.2, 100), mats.marbleTile, 0, -0.55, -30, { cast: false }));
    
    // Atap Beton Jembatan (menandakan kita berada di salah satu lantai)
    scene.add(mesh(new THREE.BoxGeometry(220, 2.5, 100), mats.cream, 0, 18, -30, { cast: false }));
    
    // Pilar-Pilar Raksasa Penyangga Jembatan
    for (let px = -90; px <= 90; px += 30) {
        for (let pz = -70; pz <= 10; pz += 25) {
            // Kosongkan area tengah agar tiang Jumrah dan arus jamaah tidak terhalang
            if (Math.abs(px) < 25 && Math.abs(pz + 40) < 20) continue; 
            scene.add(mesh(new THREE.CylinderGeometry(2, 2, 18, 16), mats.grey, px, 9, pz));
            engine.addBlocker(px - 2, pz - 2, px + 2, pz + 2); // Pilar jembatan solid
        }
    }

    // Lampu Neon Terang di Langit-Langit (Ciri khas pencahayaan Jamarat yang sangat terang)
    for (let lx = -80; lx <= 80; lx += 40) {
        for (let lz = -60; lz <= 0; lz += 30) {
            scene.add(mesh(new THREE.BoxGeometry(14, 0.3, 2.5), mats.emissiveCool, lx, 16.7, lz));
            engine.addPointLamp(lx, 15, lz, { intensity: 120, distance: 60 });
        }
    }

    const jamarat = {};
    if (withAllJamarat) {
        const positions = [
            ['ula', -50, -40], ['wustha', 0, -40], ['aqabah', 50, -40]
        ];
        for (const [name, jx, jz] of positions) {
            const p = jamratPillar(mats);
            p.position.set(jx, 0, jz);
            scene.add(p);
            engine.addBlocker(jx - 3, jz - 3, jx + 3, jz + 3); // Tiang Jamrah solid
            jamarat[name] = p;
            const st = Tex.sign(
                name === 'ula' ? 'JUMRAH ULA' : name === 'wustha' ? 'JUMRAH WUSTHA' : 'JUMRAH AQABAH',
                { bg: '#333d33', fg: '#c8ffc8', w: 640, h: 100 });
            scene.add(mesh(new THREE.BoxGeometry(7, 1.1, 0.2),
                new THREE.MeshStandardMaterial({ map: st, emissive: 0xffffff, emissiveMap: st, emissiveIntensity: 1.1 }),
                jx, 12, jz + 14, { cast: false }));
        }
    } else {
        const p = jamratPillar(mats);
        p.position.set(0, 0, -40);
        scene.add(p);
        engine.addBlocker(-3, -43, 3, -37); // Tiang Jamrah solid
        jamarat.aqabah = p;
        const st = Tex.sign('JUMRAH AQABAH', { bg: '#0e3b26', fg: '#c8ffc8', w: 640, h: 100, font: 'bold 48px sans-serif' });
        scene.add(mesh(new THREE.BoxGeometry(8, 1.4, 0.2),
            new THREE.MeshStandardMaterial({ map: st, emissive: 0xffffff, emissiveMap: st, emissiveIntensity: 1.2 }),
            0, 12, -26, { cast: false }));
    }

    // Papan Petunjuk Jalan Imersif (Immersive UI)
    const signEntry = Tex.sign('⬇ JALUR MELONTAR (TO JAMARAT) ⬇', { bg: '#0e3b26', fg: '#ffe9a8', w: 1024, h: 120 });
    scene.add(mesh(new THREE.BoxGeometry(16, 2.5, 0.4),
        new THREE.MeshStandardMaterial({ map: signEntry, emissive: 0xffffff, emissiveMap: signEntry, emissiveIntensity: 1.1 }),
        0, 15, 18, { cast: false }));
        
    const signExit = Tex.sign('KELUAR / EXIT ⬅', { bg: '#8b1c1c', fg: '#ffffff', w: 600, h: 120 });
    scene.add(mesh(new THREE.BoxGeometry(10, 2, 0.4),
        new THREE.MeshStandardMaterial({ map: signExit, emissive: 0xffffff, emissiveMap: signExit, emissiveIntensity: 1.1 }),
        -35, 10, -40, { cast: false }));

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
