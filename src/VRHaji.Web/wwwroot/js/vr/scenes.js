/**
 * VR Education Haji & Umrah — Definisi 12 Scene (termasuk Wukuf Arafah)
 * Setiap scene: { env, ambient, build(engine), run(engine, ctx) }
 * ctx: { checkpoint(n), complete(), progress(pct) }
 * Alur mengikuti dokumen protokol 02..12 (Activity Flow).
 */
import { THREE, Crowd } from './engine.js';
import * as B from './builders.js';

const IHRAM = [0xffffff, 0xf6f3ea, 0xefece2];
const CASUAL = [0x8a6a4a, 0x4a6a8a, 0x6a8a5a, 0x8a4a5a, 0xd8d2c2, 0x5a5a6a, 0x3f5c46];

function marker(engine, x, z, color = 0x37c978, r = 0.8) {
    const m = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r, 0.06, 24),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, transparent: true, opacity: 0.85 }));
    m.position.set(x, 0.04, z);
    engine.scene.add(m);
    return m;
}

/* ---------- Mekanik bersama ---------- */

/** Tawaf: 7 putaran mengelilingi Ka'bah. */
async function tawafMechanic(engine, { namaTawaf = 'Tawaf', duas = [] }) {
    const startMk = marker(engine, 24, 5.3, 0x37c978, 1.2);
    await engine.goto(24, 5.3, { radius: 2.6, label: `Menuju garis sejajar Hajar Aswad (garis coklat)` });
    engine.scene.remove(startMk);

    await engine.narrate(
        'Angkat tangan kanan ke arah Hajar Aswad sambil mengucap Bismillahi Allahu Akbar. Inilah istilam, tanda dimulainya ' + namaTawaf + '.',
        { sub: '✋ Istilam: "Bismillahi Allahu Akbar" — ' + namaTawaf + ' dimulai' });

    engine.setObjective(`${namaTawaf}: kelilingi Ka'bah 7 putaran — Ka'bah selalu di sisi KIRI Anda`);
    engine.setHint('Berjalanlah berlawanan arah jarum jam mengikuti arus jamaah');

    let lap = 0, accum = 0;
    let prev = Math.atan2(engine.camera.position.z, engine.camera.position.x);
    engine.setCounter(`🕋 Putaran<br>0 / 7`);
    await new Promise(resolve => {
        engine.onUpdate((dt, t, self) => {
            const p = engine.camera.position;
            const a = Math.atan2(p.z, p.x);
            let d = a - prev;
            if (d > Math.PI) d -= Math.PI * 2;
            if (d < -Math.PI) d += Math.PI * 2;
            prev = a;
            const dist = Math.hypot(p.x, p.z);
            if (dist > 8 && dist < 66) accum += d;
            const done = Math.floor(Math.abs(accum) / (Math.PI * 2));
            if (done > lap) {
                lap = done;
                engine.audio.sfx('collect');
                engine.setCounter(`🕋 Putaran<br>${Math.min(lap, 7)} / 7`);
                const dua = duas[(lap - 1) % Math.max(duas.length, 1)];
                if (dua) engine.narrate(dua.t, { sub: dua.s });
                if (lap >= 7) { self.done = true; resolve(); }
            }
        });
    });
    engine.setCounter('');
    engine.setHint('');
    engine.audio.sfx('success');
    await engine.narrate('Alhamdulillah, tujuh putaran ' + namaTawaf.toLowerCase() + ' telah sempurna.',
        { sub: `✅ ${namaTawaf} selesai — 7 putaran sempurna` });
}

/** Sa'i: 7 perjalanan Shafa ↔ Marwah. */
async function saiMechanic(engine, refs, { namaSai = "Sa'i" } = {}) {
    await engine.goto(refs.shafaX + 6, 0, { radius: 3.5, label: 'Menuju Bukit Shafa — titik awal Sa\'i' });
    await engine.narrate(
        'Innash shafaa wal marwata min sya\'aairillah. Sesungguhnya Shafa dan Marwah adalah sebagian dari syiar Allah. Kita mulai dari Shafa.',
        { sub: '📖 "Innash-shafaa wal-marwata min sya\'aairillah" (QS 2:158)' });

    engine.setObjective(`${namaSai}: berjalan Shafa → Marwah → Shafa … total 7 perjalanan`);
    let trips = 0;
    let target = 'marwah';
    engine.setCounter(`🏃 Perjalanan<br>0 / 7`);
    engine.showWaypoint(refs.marwahX - 4, 0);
    await new Promise(resolve => {
        engine.onUpdate((dt, t, self) => {
            const x = engine.camera.position.x;
            engine.setHint(Math.abs(x) < 15 ? '💚 Area lampu hijau — laki-laki disunnahkan berlari-lari kecil' : '');
            if (target === 'marwah' && x > refs.marwahX - 6) {
                trips++;
                target = 'shafa';
                engine.audio.sfx('collect');
                engine.setCounter(`🏃 Perjalanan<br>${trips} / 7`);
                if (trips < 7) {
                    engine.showWaypoint(refs.shafaX + 4, 0);
                    engine.narrate('Anda tiba di Marwah. Berdoalah menghadap Ka\'bah, lalu lanjutkan menuju Shafa.',
                        { sub: `⛰ Marwah — perjalanan ke-${trips} selesai. Berdoa, lalu lanjut.` });
                }
            } else if (target === 'shafa' && x < refs.shafaX + 6) {
                trips++;
                target = 'marwah';
                engine.audio.sfx('collect');
                engine.setCounter(`🏃 Perjalanan<br>${trips} / 7`);
                if (trips < 7) {
                    engine.showWaypoint(refs.marwahX - 4, 0);
                    engine.narrate('Anda tiba di Shafa. Berdoalah, lalu lanjutkan menuju Marwah.',
                        { sub: `⛰ Shafa — perjalanan ke-${trips} selesai. Berdoa, lalu lanjut.` });
                }
            }
            if (trips >= 7) {
                engine.hideWaypoint();
                self.done = true;
                resolve();
            }
        });
    });
    engine.setCounter('');
    engine.setHint('');
    engine.audio.sfx('success');
    await engine.narrate('Alhamdulillah, tujuh perjalanan Sa\'i telah sempurna dan berakhir di Marwah.',
        { sub: '✅ Sa\'i selesai — 7 perjalanan, berakhir di Marwah' });
}

/** Melontar batu ke jumrah. */
async function throwStones(engine, pillarGroup, { need = 7, nama = 'Jumrah Aqabah', approach } = {}) {
    if (approach) {
        await engine.goto(approach.x, approach.z, { radius: 4, label: `Menuju ${nama}` });
    }
    engine.setObjective(`Lontar ${need} batu ke ${nama} — arahkan pandangan lalu klik`);
    engine.setCounter(`🪨 Lontaran<br>0 / ${need}`);
    let hits = 0;
    const stoneGeo = new THREE.SphereGeometry(0.06, 8, 6);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xb8ab96, roughness: 0.9 });
    await new Promise(resolve => {
        engine.addInteractable(pillarGroup, {
            label: `Lontar batu — "Bismillahi Allahu Akbar"`,
            once: false, radius: 30,
            onClick: () => {
                if (hits >= need) return;
                engine.audio.sfx('throw');
                const stone = new THREE.Mesh(stoneGeo, stoneMat);
                const from = engine.camera.position.clone();
                from.y -= 0.15;
                const to = pillarGroup.getWorldPosition(new THREE.Vector3());
                to.y = 4 + Math.random() * 3;
                stone.position.copy(from);
                engine.scene.add(stone);
                let tt = 0;
                engine.onUpdate((dt, _t, self) => {
                    tt += dt * 1.8;
                    if (tt >= 1) {
                        engine.scene.remove(stone);
                        self.done = true;
                        hits++;
                        engine.audio.sfx('collect');
                        engine.setCounter(`🪨 Lontaran<br>${hits} / ${need}`);
                        engine.subtitle(`"Bismillahi Allahu Akbar" — lontaran ke-${hits}`);
                        if (hits >= need) {
                            engine.removeInteractable(pillarGroup);
                            resolve();
                        }
                        return;
                    }
                    stone.position.lerpVectors(from, to, tt);
                    stone.position.y += Math.sin(tt * Math.PI) * 2.2;
                });
            }
        });
    });
    engine.setCounter('');
    engine.audio.sfx('success');
    await engine.narrate(`Alhamdulillah, ${need} lontaran ke ${nama} telah sempurna.`,
        { sub: `✅ ${nama} — ${need} lontaran selesai` });
}

/* ============================================================
 * SCENE 01 — BERANGKAT DARI INDONESIA
 * ============================================================ */
const scene01 = {
    env: 'day', ambient: 'airport',
    build(engine) {
        const refs = B.airport(engine);
        refs.cabin = B.airplaneCabin(engine);
        // penumpang berjalan-jalan di concourse tengah & sisi utara
        new Crowd(engine.scene, { count: 26, mode: 'wander', area: { x: -2, z: -1, w: 62, d: 12 }, colors: CASUAL });
        new Crowd(engine.scene, { count: 12, mode: 'wander', area: { x: 0, z: 22, w: 56, d: 8 }, colors: CASUAL });
        // arus penumpang melintasi hall
        new Crowd(engine.scene, { count: 10, mode: 'line', from: { x: -34, z: -4 }, to: { x: 34, z: 4 }, width: 5, colors: CASUAL });
        // penumpang duduk di bangku ruang tunggu
        new Crowd(engine.scene, { count: 26, mode: 'sit', spots: refs.seatSpots, sitY: 0.5, colors: CASUAL });
        // antrian di depan check-in
        new Crowd(engine.scene, { count: 6, mode: 'idle', area: { x: -26, z: -20.2, w: 8, d: 1 }, colors: CASUAL });
        engine.spawn(0, 20, 0);
        return refs;
    },
    async run(engine, ctx) {
        await engine.narrate(
            'Assalamualaikum. Selamat datang di simulasi VR Haji dan Umrah. Perjalanan suci Anda dimulai hari ini dari bandara di Indonesia. Pastikan dokumen penting berada di tas tangan: paspor, visa, dan tiket.',
            { sub: '🛫 Selamat datang! Perjalanan dimulai dari bandara Indonesia. Siapkan paspor, visa, dan tiket di tas tangan.' });
        ctx.progress(10);

        await engine.goto(-24, -20, { label: 'Menuju counter check-in' });
        await engine.interact(engine._sceneRefs.counters.children[0], {
            label: 'Check-in & serahkan bagasi', radius: 8
        });
        engine.audio.sfx('stamp');
        engine.notifyDotnet('Boarding pass diterima! Bagasi 25 kg diterima.', 'success');
        await engine.narrate(
            'Petugas memeriksa paspor dan tiket Anda. Bagasi ditimbang — pastikan tidak melebihi batas. Boarding pass sudah di tangan. Simpan baik-baik.',
            { sub: '🎫 Check-in selesai — boarding pass diterima, bagasi diserahkan.' });
        ctx.progress(30);

        await engine.goto(22, -14, { label: 'Menuju pemeriksaan imigrasi' });
        await engine.interact(engine._sceneRefs.imigrasi.children[0], {
            label: 'Serahkan paspor ke petugas imigrasi', radius: 8
        });
        engine.audio.sfx('stamp');
        await engine.narrate(
            'Petugas imigrasi memeriksa dan mencap paspor Anda. Proses keimigrasian selesai. Selanjutnya kita menuju checkpoint pemahaman pertama.',
            { sub: '🛂 Paspor dicap — pemeriksaan imigrasi selesai.' });
        ctx.progress(45);

        await ctx.checkpoint(1);
        ctx.progress(60);

        await engine.goto(36, 18, { label: 'Menuju Gate 12 untuk boarding' });
        await engine.interact(engine._sceneRefs.gate, { label: 'Boarding — masuk ke pesawat', radius: 8 });
        await engine.narrate('Silakan masuk, kita menuju kabin pesawat.', { sub: '✈ Boarding…' });
        await engine.teleport(-13, 400, 90);
        engine.audio.ambient('interior', 0.3);
        ctx.progress(75);

        await engine.goto(8, 400, { radius: 2, label: 'Berjalan ke kursi Anda (baris tengah)' });
        await engine.narrate(
            'Duduklah dengan tenang. Saat pesawat mulai bergerak, bacalah doa safar: Subhanalladzi sakhkhara lana hadza wama kunna lahu muqrinin. Wa inna ila rabbina lamunqalibun. Mahasuci Allah yang menundukkan kendaraan ini bagi kami.',
            { sub: '🤲 Doa safar: "Subhanalladzii sakhkhara lanaa haadzaa wamaa kunnaa lahuu muqriniin…"' });
        await engine.narrate(
            'Selama perjalanan sekitar sembilan jam, perbanyak dzikir, jaga kesehatan, minum air cukup, dan istirahat. Bersabarlah — perjalanan ini bagian dari ibadah.',
            { sub: '💡 Perbanyak dzikir, minum air cukup, dan istirahat selama penerbangan.' });
        ctx.progress(90);

        await ctx.checkpoint(2);
        ctx.progress(100);
        await ctx.complete();
    }
};

/* ============================================================
 * SCENE 02 — TIBA DI MADINAH
 * ============================================================ */
const scene02 = {
    env: 'goldenHour', ambient: 'airport',
    build(engine) {
        const refs = B.airport(engine, { nameSign: 'مطار الأمير محمد بن عبدالعزيز — MADINAH', arabic: true });
        refs.nabawiOrigin = { x: 0, z: 600 };
        // Masjid Nabawi dibangun di "dunia" terpisah — dibangun saat transisi
        new Crowd(engine.scene, { count: 20, mode: 'wander', area: { x: 4, z: -1, w: 50, d: 12 }, colors: CASUAL });
        new Crowd(engine.scene, { count: 14, mode: 'sit', spots: refs.seatSpots, sitY: 0.5, colors: CASUAL });
        engine.spawn(-30, 10, -120);
        return refs;
    },
    async run(engine, ctx) {
        await engine.narrate(
            'Alhamdulillah, setelah menempuh penerbangan panjang, Anda tiba di Bandara Pangeran Muhammad bin Abdul Aziz, Madinah. Kota ini disebut Madinah Al-Munawwarah — kota yang bercahaya.',
            { sub: '🕌 Selamat datang di Madinah Al-Munawwarah!' });
        ctx.progress(10);

        await engine.goto(22, -14, { label: 'Menuju booth imigrasi Arab Saudi' });
        await engine.interact(engine._sceneRefs.imigrasi.children[0], {
            label: 'Serahkan paspor & visa', radius: 8
        });
        engine.audio.sfx('stamp');
        await engine.narrate(
            'Petugas menyapa: Ahlan wa sahlan! Paspor dan visa diperiksa, sidik jari direkam. Petugas umumnya berbahasa Arab dan Inggris. Tetap tenang dan antri dengan tertib.',
            { sub: '🛂 "Ahlan wa sahlan!" — imigrasi selesai. Petugas berbahasa Arab & Inggris.' });
        ctx.progress(30);

        await ctx.checkpoint(1);
        ctx.progress(50);

        await engine.narrate(
            'Bus jamaah membawa Anda ke hotel untuk menyimpan bagasi. Menjelang maghrib, kita berjalan menuju Masjid Nabawi — masjid yang dibangun langsung oleh Rasulullah shallallahu alaihi wasallam.',
            { sub: '🚌 Perjalanan bus → hotel → Masjid Nabawi menjelang maghrib…' });

        // Transisi ke pelataran Masjid Nabawi
        await engine.fadeOut(1000);
        // bersihkan area jalan lama, bangun Nabawi
        engine.walkRects.length = 0;
        engine.blockers.length = 0;
        const nb = B.nabawi(engine);
        new Crowd(engine.scene, { count: 60, mode: 'idle', area: { x: 0, z: 0, w: 120, d: 60 }, colors: CASUAL });
        new Crowd(engine.scene, { count: 20, mode: 'line', from: { x: -40, z: 30 }, to: { x: 0, z: -40 }, width: 8, colors: CASUAL });
        engine.spawn(0, 30, 180);
        await engine.fadeIn(1000);
        engine.audio.ambient('crowd', 0.3);
        ctx.progress(65);

        await engine.narrate(
            'Subhanallah. Di hadapan Anda berdiri Masjid Nabawi dengan payung-payung raksasa dan Kubah Hijau yang menaungi makam Rasulullah. Sholat di masjid ini bernilai seribu kali lipat.',
            { sub: '💚 Masjid Nabawi — payung ikonik & Kubah Hijau. Sholat di sini bernilai 1000×.' });

        await engine.goto(nb.gatePos.x, nb.gatePos.z, { radius: 3.5, label: 'Berjalan menuju gerbang Masjid Nabawi' });
        await engine.narrate(
            'Sebelum masuk: dahulukan kaki kanan dan baca doa, Allahummaftah lii abwaaba rahmatik — Ya Allah bukakanlah untukku pintu-pintu rahmat-Mu. Di dalam, jaga ketenangan, dan bila memungkinkan sholatlah di Raudhah, taman surga.',
            { sub: '🚪 Masuk kaki kanan + doa: "Allahummaftah lii abwaaba rahmatik". Raudhah = taman surga.' });
        ctx.progress(85);

        await ctx.checkpoint(2);
        ctx.progress(100);
        await ctx.complete();
    }
};

/* ============================================================
 * SCENE 03 — MIQAT & NIAT UMRAH
 * ============================================================ */
const scene03 = {
    env: 'day', ambient: 'wind',
    build(engine) {
        const refs = B.miqat(engine);
        new Crowd(engine.scene, { count: 18, mode: 'idle', area: { x: 8, z: -6, w: 24, d: 16 }, colors: IHRAM });
        new Crowd(engine.scene, { count: 8, mode: 'idle', area: { x: -16, z: 6, w: 14, d: 8 }, colors: CASUAL });
        engine.spawn(16, 12, 58);
        return refs;
    },
    async run(engine, ctx) {
        await engine.narrate(
            'Inilah Bir Ali, atau Dzul Hulaifah — miqat bagi jamaah dari arah Madinah. Miqat adalah batas tempat dimulainya ihram. Terdapat lima miqat makani yang ditetapkan Rasulullah. Melewati miqat tanpa berihram dikenakan dam.',
            { sub: '📍 Bir Ali (Dzul Hulaifah) — miqat jamaah dari Madinah. Miqat makani ada 5 tempat.' });
        ctx.progress(10);

        await engine.goto(-18, -4, { label: 'Menuju tempat mandi & wudhu' });
        await engine.interact(engine._sceneRefs.bilik, { label: 'Mandi sunnah ihram & berwudhu', radius: 7 });
        engine.audio.sfx('chime');
        await engine.narrate(
            'Sebelum berihram disunnahkan mandi, memotong kuku, merapikan diri, dan memakai wangi-wangian di badan — ingat, wewangian hanya boleh sebelum niat ihram.',
            { sub: '🚿 Mandi sunnah, potong kuku, wangi-wangian di badan (sebelum niat).' });
        ctx.progress(25);

        await engine.goto(-6, -9, { label: 'Ambil kain ihram di rak' });
        await engine.interact(engine._sceneRefs.rak, { label: 'Kenakan dua helai kain ihram putih', radius: 6 });
        await engine.fadeOut(700);
        await engine.fadeIn(700);
        engine.notifyDotnet('Anda kini mengenakan kain ihram.', 'success');
        await engine.narrate(
            'Laki-laki mengenakan dua helai kain putih tanpa jahitan: izar di bawah dan rida di atas, tanpa penutup kepala. Perempuan berpakaian menutup aurat tanpa penutup wajah dan sarung tangan. Ihram melambangkan kesetaraan seluruh hamba di hadapan Allah.',
            { sub: '🤍 Ihram: 2 helai kain putih (laki-laki). Simbol kesetaraan di hadapan Allah.' });
        ctx.progress(45);

        await engine.goto(6, -14, { label: 'Menuju sajadah — sholat sunnah ihram 2 rakaat' });
        await engine.interact(engine._sceneRefs.sajadah, { label: 'Sholat sunnah ihram 2 rakaat', radius: 5 });
        await engine.narrate(
            'Kerjakan sholat sunnah dua rakaat. Setelah salam, bersiaplah mengucapkan niat umrah.',
            { sub: '🕌 Sholat sunnah ihram 2 rakaat.' });
        ctx.progress(55);

        await ctx.checkpoint(1);
        ctx.progress(70);

        await engine.narrate(
            'Sekarang ucapkan niat: Labbaika Allahumma umratan — aku penuhi panggilan-Mu ya Allah untuk berumrah. Niat diucapkan dengan hati dan lisan. Sejak saat ini seluruh larangan ihram berlaku.',
            { sub: '🤲 NIAT: "Labbaika Allahumma \'umratan" — larangan ihram mulai berlaku.' });
        await engine.narrate(
            'Mari lantunkan talbiyah: Labbaik Allahumma labbaik. Labbaika laa syariika laka labbaik. Innal hamda wan ni\'mata laka wal mulk. Laa syariika lak.',
            { sub: '📢 TALBIYAH: "Labbaik Allahumma labbaik, labbaika laa syariika laka labbaik…"' });

        await engine.goto(20, 11, { radius: 4, label: 'Naik bus menuju Makkah sambil bertalbiyah' });
        await engine.interact(engine._sceneRefs.bus, { label: 'Naik bus menuju Makkah', radius: 8 });
        ctx.progress(85);

        await ctx.checkpoint(2);
        ctx.progress(100);
        await ctx.complete();
    }
};

/* ============================================================
 * SCENE 04 — MASUK MASJIDIL HARAM
 * ============================================================ */
const scene04 = {
    env: 'goldenHour', ambient: 'crowd',
    build(engine) {
        const refs = B.masjidilHaram(engine);
        new Crowd(engine.scene, { count: 160, mode: 'orbit', center: { x: 0, z: 0 }, rMin: 11, rMax: 24, angularSpeed: 0.09, colors: IHRAM, scene: engine.scene });
        new Crowd(engine.scene, { count: 50, mode: 'idle', area: { x: 0, z: 52, w: 90, d: 24 }, colors: IHRAM });
        engine.spawn(0, 64, 180);
        return refs;
    },
    async run(engine, ctx) {
        await engine.narrate(
            'Anda tiba di kota suci Makkah Al-Mukarramah dalam keadaan berihram. Di hadapan Anda berdiri Masjidil Haram — masjid paling suci, kiblat umat Islam seluruh dunia.',
            { sub: '🕌 Makkah Al-Mukarramah — Masjidil Haram di hadapan Anda.' });
        ctx.progress(15);

        await engine.goto(0, 40, { radius: 3.5, label: 'Berjalan menuju pintu Masjidil Haram' });
        await engine.narrate(
            'Masuklah dengan kaki kanan sambil membaca: Allahummaftah lii abwaaba rahmatik. Jaga pandangan, jaga adab, dan rendahkan hati.',
            { sub: '🚪 Kaki kanan + doa: "Allahummaftah lii abwaaba rahmatik".' });
        ctx.progress(35);

        await engine.goto(0, 26, { radius: 3, label: 'Terus melangkah — sebentar lagi Anda melihat Ka\'bah' });
        await engine.narrate(
            'Subhanallah… Itulah Ka\'bah, Baitullah. Saat pertama memandangnya, angkat kedua tangan dan berdoalah — inilah salah satu waktu doa yang mustajab. Mintalah apa saja kebaikan dunia dan akhirat.',
            { sub: '🕋 PANDANGAN PERTAMA KE KA\'BAH — angkat tangan, berdoalah (waktu mustajab).' });
        engine.audio.sfx('chime');
        ctx.progress(55);

        await engine.goto(18, 10, { radius: 3, label: 'Mendekat ke tepi mataf' });
        await engine.narrate(
            'Perhatikan sudut Ka\'bah dengan bingkai perak — di sanalah Hajar Aswad, batu dari surga. Di dekatnya ada pintu Ka\'bah berlapis emas, dan area di antaranya disebut Multazam, tempat doa yang mustajab. Bangunan kecil berkubah emas itu adalah Maqam Ibrahim.',
            { sub: '👀 Kenali: Hajar Aswad (bingkai perak) · Pintu Ka\'bah · Multazam · Maqam Ibrahim.' });
        ctx.progress(75);

        await ctx.checkpoint(1);
        ctx.progress(100);
        await ctx.complete();
    }
};

/* ============================================================
 * SCENE 05 — TAWAF UMRAH
 * ============================================================ */
const scene05 = {
    env: 'night', ambient: 'crowd',
    build(engine) {
        const refs = B.masjidilHaram(engine);
        new Crowd(engine.scene, { count: 200, mode: 'orbit', center: { x: 0, z: 0 }, rMin: 10.5, rMax: 26, angularSpeed: 0.09, colors: IHRAM });
        new Crowd(engine.scene, { count: 30, mode: 'idle', area: { x: 0, z: 50, w: 80, d: 20 }, colors: IHRAM });
        engine.spawn(30, 22, 54);
        return refs;
    },
    async run(engine, ctx) {
        await engine.narrate(
            'Malam di Masjidil Haram. Kini saatnya melaksanakan Tawaf Umrah — mengelilingi Ka\'bah tujuh putaran berlawanan arah jarum jam, dengan Ka\'bah selalu di sisi kiri. Pastikan Anda dalam keadaan suci dari hadas.',
            { sub: '🌙 Tawaf Umrah: 7 putaran, Ka\'bah di sisi kiri, wajib suci dari hadas.' });
        ctx.progress(10);

        await tawafMechanic(engine, {
            namaTawaf: 'Tawaf Umrah',
            duas: [
                { t: 'Rabbana atina fid dunya hasanah wa fil akhirati hasanah wa qina adzaban nar.', s: '🤲 "Rabbanaa aatinaa fid-dunyaa hasanah, wa fil-aakhirati hasanah, wa qinaa \'adzaaban-naar"' },
                { t: 'Subhanallah walhamdulillah wa laa ilaha illallah wallahu akbar.', s: '📿 "Subhanallah, walhamdulillah, wa laa ilaaha illallah, wallahu akbar"' },
                { t: 'Perbanyak doa pribadi Anda — tawaf adalah sholat, berbicaralah hanya yang baik.', s: '💬 Perbanyak doa pribadi — tawaf adalah ibadah seperti sholat.' }
            ]
        });
        ctx.progress(60);

        await engine.goto(11, 8.5, { radius: 3, label: 'Menuju Maqam Ibrahim — sholat sunnah tawaf' });
        await engine.interact(engine._sceneRefs.maqam, { label: 'Sholat sunnah 2 rakaat di belakang Maqam Ibrahim', radius: 6 });
        await engine.narrate(
            'Kerjakan sholat sunnah dua rakaat di belakang Maqam Ibrahim: rakaat pertama Al-Kafirun, rakaat kedua Al-Ikhlas. Setelah itu minumlah air Zamzam sambil berdoa.',
            { sub: '🕌 Sholat 2 rakaat di Maqam Ibrahim, lalu minum air Zamzam.' });
        ctx.progress(80);

        await ctx.checkpoint(1);
        ctx.progress(100);
        await ctx.complete();
    }
};

/* ============================================================
 * SCENE 06 — SA'I UMRAH
 * ============================================================ */
const scene06 = {
    env: 'night', ambient: 'crowd',
    build(engine) {
        const refs = B.masaa(engine);
        new Crowd(engine.scene, { count: 70, mode: 'line', from: { x: refs.shafaX + 8, z: 0 }, to: { x: refs.marwahX - 8, z: 0 }, width: 9, colors: IHRAM });
        engine.spawn(refs.shafaX + 22, 4, -90);
        return refs;
    },
    async run(engine, ctx) {
        await engine.narrate(
            'Selamat datang di Mas\'a, lintasan Sa\'i antara bukit Shafa dan Marwah. Sa\'i mengenang perjuangan Siti Hajar yang berlari tujuh kali mencari air untuk putranya Ismail, hingga Allah memancarkan air Zamzam.',
            { sub: '⛰ Mas\'a — mengenang perjuangan Siti Hajar hingga terpancar air Zamzam.' });
        ctx.progress(10);

        await saiMechanic(engine, engine._sceneRefs);
        ctx.progress(70);

        await engine.narrate(
            'Kini tahap terakhir umrah: Tahallul — mencukur atau memotong rambut minimal tiga helai. Laki-laki lebih utama mencukur habis, perempuan cukup memotong seujung jari.',
            { sub: '✂ Tahallul: potong rambut min. 3 helai — laki-laki afdhal gundul.' });
        const chair = B.barberChair(engine.mats);
        chair.position.set(engine._sceneRefs.marwahX - 2, 0, 4);
        engine.scene.add(chair);
        await engine.interact(chair, { label: 'Tahallul — potong rambut', radius: 6 });
        engine.audio.sfx('chime');
        engine.notifyDotnet('Tahallul selesai — Umrah Anda sempurna!', 'success');
        await engine.narrate(
            'Alhamdulillah! Dengan tahallul, rangkaian umrah Anda telah sempurna dan larangan ihram telah gugur.',
            { sub: '🎉 Umrah sempurna — larangan ihram gugur.' });
        ctx.progress(85);

        await ctx.checkpoint(1);
        ctx.progress(100);
        await ctx.complete();
    }
};

/* ============================================================
 * SCENE 07 — WUKUF DI ARAFAH (puncak ibadah haji, 9 Dzulhijjah)
 * ============================================================ */
const sceneArafah = {
    env: 'goldenHour', ambient: 'crowd',
    build(engine) {
        const refs = B.arafah(engine);
        // Jamaah wukuf — berdiri berdoa & duduk berdzikir di padang (ihram)
        new Crowd(engine.scene, { count: 90, mode: 'idle', area: { x: 10, z: 10, w: 90, d: 60 }, colors: IHRAM });
        new Crowd(engine.scene, { count: 40, mode: 'sit', area: { x: -20, z: 30, w: 40, d: 30 }, colors: IHRAM });
        engine.spawn(14, 26, 38);
        return refs;
    },
    async run(engine, ctx) {
        await engine.narrate(
            'Inilah Padang Arafah pada sembilan Dzulhijjah — puncak dan rukun terbesar ibadah haji. Rasulullah bersabda: Al-hajju Arafah — haji itu (wukufnya di) Arafah. Barangsiapa tidak wukuf di Arafah, hajinya tidak sah.',
            { sub: '🌄 Padang Arafah, 9 Dzulhijjah — "Al-hajju Arafah". Wukuf = rukun terbesar haji.' });
        ctx.progress(15);

        await engine.narrate(
            'Wukuf dimulai setelah matahari tergelincir (zawal) hingga terbit fajar. Setelah khutbah dan sholat Dzuhur–Ashar dijama\' qashar di Masjid Namirah, jamaah memperbanyak doa, dzikir, dan istighfar menghadap kiblat.',
            { sub: '🕌 Masjid Namirah: khutbah + Dzuhur-Ashar jama\' qashar. Perbanyak doa hingga maghrib.' });
        ctx.progress(30);

        const jp = engine._sceneRefs.jabalPos;
        await engine.goto(jp.x + 20, jp.z + 20, { radius: 5, label: 'Menuju Jabal Rahmah — memperbanyak doa saat wukuf' });
        engine.setObjective('Wukuf: berdiri/duduk menghadap kiblat, perbanyak doa hingga terbenam matahari');
        engine.setHint('Inilah waktu doa paling mustajab sepanjang tahun — mintalah kebaikan dunia & akhirat');

        // Momen wukuf — untaian doa & dzikir berjalan otomatis (kontemplasi)
        const duas = [
            { t: 'Doa terbaik adalah doa pada hari Arafah. Sebaik-baik ucapan: Laa ilaaha illallah wahdahu laa syariika lah, lahul mulku wa lahul hamdu wa huwa \'alaa kulli syai\'in qadiir.', s: '🤲 "Laa ilaaha illallah wahdahu laa syariika lah, lahul mulku wa lahul hamd…"' },
            { t: 'Rabbana atina fid dunya hasanah wa fil akhirati hasanah wa qina adzaban nar.', s: '📿 "Rabbanaa aatinaa fid-dunyaa hasanah wa fil-aakhirati hasanah wa qinaa \'adzaaban-naar"' },
            { t: 'Perbanyak istighfar dan doa untuk diri, keluarga, dan seluruh kaum muslimin. Menangislah karena takut dan harap kepada Allah.', s: '💧 Perbanyak istighfar & doa untuk diri, keluarga, dan umat.' }
        ];
        for (let i = 0; i < duas.length; i++) {
            await engine.narrate(duas[i].t, { sub: duas[i].s });
            ctx.progress(40 + i * 12);
        }
        engine.setObjective('');
        engine.setHint('');
        engine.audio.sfx('chime');

        await ctx.checkpoint(1);
        ctx.progress(85);

        await engine.narrate(
            'Matahari mulai terbenam. Dengan terbenamnya matahari, wukuf sempurna. Setelah maghrib jamaah bergerak menuju Muzdalifah untuk mabit — tanpa sholat maghrib dulu, karena akan dijama\' di Muzdalifah.',
            { sub: '🌇 Matahari terbenam — wukuf sempurna. Bertolak ke Muzdalifah (maghrib dijama\' di sana).' });
        ctx.progress(100);
        await ctx.complete();
    }
};

/* ============================================================
 * SCENE 08 — MUZDALIFAH (MALAM)
 * ============================================================ */
const scene07 = {
    env: 'night', ambient: 'night',
    build(engine) {
        const refs = B.muzdalifah(engine);
        new Crowd(engine.scene, { count: 40, mode: 'sit', area: { x: -12, z: 16, w: 26, d: 12 }, colors: IHRAM });
        new Crowd(engine.scene, { count: 20, mode: 'idle', area: { x: 8, z: -8, w: 30, d: 20 }, colors: IHRAM });
        engine.spawn(0, 30, 180);
        return refs;
    },
    async run(engine, ctx) {
        await engine.narrate(
            'Malam sembilan Dzulhijjah. Setelah wukuf di Arafah, jamaah bergerak ke Muzdalifah untuk mabit — bermalam di bawah langit terbuka. Mabit di Muzdalifah hukumnya wajib haji. Di sini kita sholat Maghrib dan Isya dijama\'.',
            { sub: '🌌 Muzdalifah — mabit (wajib haji), sholat Maghrib+Isya dijama\', perbanyak dzikir.' });
        ctx.progress(10);

        engine.setObjective('Kumpulkan 7 batu kerikil untuk melontar Jumrah Aqabah besok pagi');
        engine.setCounter('🪨 Batu<br>0 / 7');
        let stones = 0;
        await new Promise(resolve => {
            for (const cluster of engine._sceneRefs.clusters) {
                engine.addInteractable(cluster, {
                    label: 'Ambil batu kerikil (sebesar biji kurma)', once: false, radius: 5,
                    onClick: () => {
                        if (stones >= 7) return;
                        stones++;
                        engine.audio.sfx('collect');
                        engine.setCounter(`🪨 Batu<br>${stones} / 7`);
                        engine.subtitle(`Batu ke-${stones} — pilih yang sebesar biji kurma`);
                        if (stones === 7) {
                            for (const c of engine._sceneRefs.clusters) engine.removeInteractable(c);
                            resolve();
                        }
                    }
                });
            }
        });
        engine.setCounter('');
        engine.audio.sfx('success');
        await engine.narrate(
            'Tujuh batu telah terkumpul untuk Jumrah Aqabah. Bila ingin melengkapi seluruh hari tasyrik, jamaah biasanya mengumpulkan hingga tujuh puluh butir. Simpan dalam kantong kecil.',
            { sub: '✅ 7 batu terkumpul (dianjurkan total 70 untuk seluruh hari tasyrik).' });
        ctx.progress(45);

        await ctx.checkpoint(1);
        ctx.progress(60);

        await engine.goto(-12, 16, { radius: 3.5, label: 'Menuju area istirahat — dzikir & doa' });
        await engine.narrate(
            'Berdzikirlah di Masy\'aril Haram sebagaimana firman Allah dalam surat Al-Baqarah ayat 198. Istirahatlah sejenak — menjelang subuh kita bergerak menuju Mina.',
            { sub: '📖 QS 2:198 — "Berdzikirlah kepada Allah di Masy\'aril Haram". Istirahat hingga menjelang subuh.' });
        ctx.progress(80);

        await ctx.checkpoint(2);
        ctx.progress(100);
        await ctx.complete();
    }
};

/* ============================================================
 * SCENE 08 — MINA: JUMRAH AQABAH
 * ============================================================ */
const scene08 = {
    env: 'day', ambient: 'crowd',
    build(engine) {
        const refs = B.mina(engine);
        new Crowd(engine.scene, { count: 60, mode: 'line', from: { x: 0, z: 30 }, to: { x: 0, z: -24 }, width: 14, colors: IHRAM });
        new Crowd(engine.scene, { count: 40, mode: 'idle', area: { x: 0, z: 60, w: 90, d: 40 }, colors: IHRAM });
        engine.spawn(0, 70, 180);
        return refs;
    },
    async run(engine, ctx) {
        await engine.narrate(
            'Pagi sepuluh Dzulhijjah — hari raya Idul Adha. Dari Muzdalifah jamaah tiba di Mina, kota tenda putih. Hari ini kita melontar Jumrah Aqabah tujuh kali, menyembelih hadyu, lalu tahallul awal.',
            { sub: '⛺ Mina, 10 Dzulhijjah: lontar Jumrah Aqabah 7× → hadyu → tahallul awal.' });
        ctx.progress(10);

        await throwStones(engine, engine._sceneRefs.jamarat.aqabah, {
            need: 7, nama: 'Jumrah Aqabah', approach: { x: 0, z: -22 }
        });
        await engine.narrate(
            'Melontar jumrah meneladani Nabi Ibrahim yang mengusir setan. Ini simbol tekad kita melawan segala godaan setan dalam hidup. Setelah Jumrah Aqabah, talbiyah dihentikan.',
            { sub: '🎯 Makna: melawan godaan setan, meneladani Nabi Ibrahim. Talbiyah dihentikan.' });
        ctx.progress(40);

        await ctx.checkpoint(1);
        ctx.progress(55);

        const rph = B.slaughterArea(engine.mats);
        rph.position.set(40, 0, 10);
        engine.scene.add(rph);
        await engine.goto(40, 18, { radius: 5, label: 'Menuju rumah pemotongan hadyu' });
        await engine.interact(rph, { label: 'Tunaikan hadyu (dam) — haji tamattu\'/qiran', radius: 10 });
        await engine.narrate(
            'Jamaah haji tamattu\' dan qiran wajib menyembelih hadyu — seekor kambing, atau sepertujuh sapi/unta. Dagingnya dibagikan kepada fakir miskin di tanah haram.',
            { sub: '🐐 Hadyu (dam) ditunaikan — daging untuk fakir miskin tanah haram.' });
        ctx.progress(70);

        const chair = B.barberChair(engine.mats);
        chair.position.set(28, 0, 24);
        engine.scene.add(chair);
        await engine.goto(28, 28, { radius: 4, label: 'Menuju tempat cukur — Tahallul Awal' });
        await engine.interact(chair, { label: 'Tahallul Awal — cukur rambut', radius: 6 });
        engine.audio.sfx('chime');
        engine.notifyDotnet('Tahallul Awal selesai — boleh berganti pakaian biasa.', 'success');
        await engine.narrate(
            'Tahallul awal selesai. Kini sebagian besar larangan ihram gugur — Anda boleh memakai pakaian biasa. Namun hubungan suami istri tetap terlarang hingga tahallul tsani.',
            { sub: '✂ Tahallul Awal — larangan ihram gugur KECUALI hubungan suami istri.' });
        ctx.progress(85);

        await ctx.checkpoint(2);
        ctx.progress(100);
        await ctx.complete();
    }
};

/* ============================================================
 * SCENE 09 — TAWAF IFADAH & SA'I HAJI
 * ============================================================ */
const scene09 = {
    env: 'day', ambient: 'crowd',
    build(engine) {
        const refs = B.masjidilHaram(engine);
        // Jamaah berpakaian bebas — sudah tahallul awal
        new Crowd(engine.scene, { count: 180, mode: 'orbit', center: { x: 0, z: 0 }, rMin: 10.5, rMax: 25, angularSpeed: 0.09, colors: CASUAL });
        new Crowd(engine.scene, { count: 30, mode: 'idle', area: { x: 0, z: 50, w: 80, d: 20 }, colors: CASUAL });
        engine.spawn(28, 26, 47);
        return refs;
    },
    async run(engine, ctx) {
        await engine.narrate(
            'Anda kembali ke Masjidil Haram — kali ini dengan pakaian biasa karena telah tahallul awal. Kita akan menunaikan Tawaf Ifadah, rukun haji yang tanpanya haji tidak sah, dilanjutkan Sa\'i haji.',
            { sub: '🕋 Tawaf Ifadah (RUKUN haji) + Sa\'i haji — pakaian bebas pasca tahallul awal.' });
        ctx.progress(10);

        await tawafMechanic(engine, {
            namaTawaf: 'Tawaf Ifadah',
            duas: [
                { t: 'Rabbana atina fid dunya hasanah wa fil akhirati hasanah wa qina adzaban nar.', s: '🤲 "Rabbanaa aatinaa fid-dunyaa hasanah wa fil-aakhirati hasanah…"' },
                { t: 'Tawaf Ifadah disebut juga tawaf ziarah — rukun haji yang menentukan sahnya haji.', s: '💡 Tawaf Ifadah = Tawaf Ziarah = Tawaf Rukun.' }
            ]
        });
        ctx.progress(50);

        await ctx.checkpoint(1);
        ctx.progress(60);

        await engine.narrate('Sekarang kita menuju Mas\'a untuk Sa\'i haji — tujuh perjalanan Shafa-Marwah.',
            { sub: '➡ Menuju Mas\'a untuk Sa\'i haji…' });
        await engine.fadeOut(900);
        engine.walkRects.length = 0;
        engine.walkCircles.length = 0;
        engine.blockers.length = 0;
        const refs = B.masaa(engine);
        engine._sceneRefs = refs;
        new Crowd(engine.scene, { count: 60, mode: 'line', from: { x: refs.shafaX + 8, z: 0 }, to: { x: refs.marwahX - 8, z: 0 }, width: 9, colors: CASUAL });
        engine.spawn(refs.shafaX + 18, 4, -90);
        await engine.fadeIn(900);

        await saiMechanic(engine, refs, { namaSai: "Sa'i Haji" });
        engine.notifyDotnet('Tahallul Tsani — seluruh larangan ihram gugur!', 'success');
        await engine.narrate(
            'Dengan sempurnanya Tawaf Ifadah dan Sa\'i, Anda mencapai Tahallul Tsani. Seluruh larangan ihram kini gugur sepenuhnya.',
            { sub: '🎉 TAHALLUL TSANI — seluruh larangan ihram gugur.' });
        ctx.progress(85);

        await ctx.checkpoint(2);
        ctx.progress(100);
        await ctx.complete();
    }
};

/* ============================================================
 * SCENE 10 — MABIT MINA & TIGA JUMRAH
 * ============================================================ */
const scene10 = {
    env: 'day', ambient: 'crowd',
    build(engine) {
        const refs = B.mina(engine, { withAllJamarat: true });
        new Crowd(engine.scene, { count: 60, mode: 'line', from: { x: -70, z: -40 }, to: { x: 70, z: -40 }, width: 12, colors: CASUAL });
        new Crowd(engine.scene, { count: 50, mode: 'idle', area: { x: 0, z: 60, w: 110, d: 50 }, colors: CASUAL });
        engine.spawn(0, 80, 180);
        return refs;
    },
    async run(engine, ctx) {
        await engine.narrate(
            'Hari-hari Tasyrik: sebelas, dua belas, dan tiga belas Dzulhijjah. Jamaah mabit di tenda-tenda Mina dan setiap hari melontar tiga jumrah secara berurutan: Ula, Wustha, lalu Aqabah — tujuh batu untuk masing-masing.',
            { sub: '⛺ Hari Tasyrik (11-13 Dzulhijjah): mabit di Mina + lontar 3 jumrah (21 batu/hari).' });
        ctx.progress(8);

        await engine.goto(0, 60, { radius: 5, label: 'Menuju tenda maktab — mabit di Mina' });
        await engine.narrate(
            'Inilah tenda maktab Anda. Mabit di Mina pada malam hari tasyrik hukumnya wajib haji. Siang harinya, setelah matahari tergelincir, kita berangkat melontar.',
            { sub: '🏕 Mabit di Mina = wajib haji. Melontar setelah zawal (matahari tergelincir).' });
        ctx.progress(20);

        await throwStones(engine, engine._sceneRefs.jamarat.ula, {
            need: 7, nama: 'Jumrah Ula', approach: { x: -50, z: -22 }
        });
        await engine.goto(-42, -30, { radius: 3.5, label: 'Menepi — berdoa menghadap kiblat setelah Jumrah Ula' });
        await engine.narrate('Setelah Jumrah Ula, disunnahkan menepi dan berdoa panjang menghadap kiblat.',
            { sub: '🤲 Doa panjang setelah Jumrah Ula (sunnah).' });
        ctx.progress(45);

        await throwStones(engine, engine._sceneRefs.jamarat.wustha, {
            need: 7, nama: 'Jumrah Wustha', approach: { x: 0, z: -22 }
        });
        await engine.goto(8, -30, { radius: 3.5, label: 'Menepi — berdoa setelah Jumrah Wustha' });
        await engine.narrate('Setelah Jumrah Wustha pun kita berdoa. Rasulullah berdiri lama berdoa di sini.',
            { sub: '🤲 Doa panjang setelah Jumrah Wustha (sunnah).' });
        ctx.progress(65);

        await throwStones(engine, engine._sceneRefs.jamarat.aqabah, {
            need: 7, nama: 'Jumrah Aqabah', approach: { x: 50, z: -22 }
        });
        await engine.narrate(
            'Setelah Jumrah Aqabah tidak ada doa — langsung kembali. Total dua puluh satu batu hari ini. Jamaah yang mengambil Nafar Awal meninggalkan Mina tanggal dua belas sebelum maghrib; Nafar Tsani hingga tanggal tiga belas — itu lebih utama.',
            { sub: '💡 Setelah Aqabah TIDAK berdoa. Nafar Awal = 12 Dzulhijjah, Nafar Tsani = 13 (lebih utama).' });
        ctx.progress(85);

        await ctx.checkpoint(1);
        ctx.progress(100);
        await ctx.complete();
    }
};

/* ============================================================
 * SCENE 11 — TAWAF WADA'
 * ============================================================ */
const scene11 = {
    env: 'dawn', ambient: 'crowd',
    build(engine) {
        const refs = B.masjidilHaram(engine);
        new Crowd(engine.scene, { count: 140, mode: 'orbit', center: { x: 0, z: 0 }, rMin: 10.5, rMax: 24, angularSpeed: 0.08, colors: CASUAL });
        engine.spawn(30, 24, 51);
        return refs;
    },
    async run(engine, ctx) {
        await engine.narrate(
            'Fajar terakhir di Makkah. Sebelum meninggalkan kota suci, jamaah wajib menunaikan Tawaf Wada\' — tawaf perpisahan. Inilah pamitan seorang hamba kepada Baitullah.',
            { sub: '🌅 Tawaf Wada\' — tawaf perpisahan (wajib haji) sebelum meninggalkan Makkah.' });
        ctx.progress(10);

        await tawafMechanic(engine, {
            namaTawaf: "Tawaf Wada'",
            duas: [
                { t: 'Perbanyak istighfar dan syukur — putaran-putaran terakhir di Baitullah.', s: '📿 Istighfar & syukur — putaran terakhir di Baitullah…' },
                { t: 'Ya Allah, jangan jadikan ini kunjungan terakhir kami ke rumah-Mu.', s: '🤲 "Ya Allah, jangan jadikan ini kunjungan terakhir kami…"' }
            ]
        });
        ctx.progress(60);

        await engine.goto(8, 7, { radius: 3, label: 'Berdoa perpisahan menghadap Multazam' });
        await engine.narrate(
            'Menghadaplah ke Multazam dan panjatkan doa perpisahan: Ya Allah, terimalah seluruh amal kami, jadikanlah haji kami haji yang mabrur — dan haji mabrur tidak ada balasan baginya kecuali surga. Setelah ini jamaah tidak boleh berlama-lama menetap di Makkah.',
            { sub: '🤲 Doa perpisahan di Multazam — "Haji mabrur balasannya surga." Setelah ini langsung pulang.' });
        ctx.progress(80);

        await ctx.checkpoint(1);
        ctx.progress(100);
        await ctx.complete();
    }
};

// Urutan kronologis haji tamattu' (§7). Wukuf Arafah disisipkan sebagai scene 7,
// menggeser Muzdalifah..Tawaf Wada' ke 8..12. (Nama variabel scene07..scene11 tetap
// merujuk isi lamanya: Muzdalifah, Mina Aqabah, Tawaf Ifadah, Mabit Mina, Tawaf Wada'.)
export const SCENES = {
    1: scene01, 2: scene02, 3: scene03, 4: scene04, 5: scene05, 6: scene06,
    7: sceneArafah, 8: scene07, 9: scene08, 10: scene09, 11: scene10, 12: scene11
};
