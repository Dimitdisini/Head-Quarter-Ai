#!/usr/bin/env python3
import sys

viewer_path = "dist/booth-viewer.html"

with open(viewer_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Toolbar Button
old_btn = '<button class="btn" onclick="setView(\'chitato\')">🟠 Fokus Chitato × TREASURE</button>'
new_btn = '''<button class="btn" onclick="setView('chitato')">🟠 Fokus Chitato × TREASURE</button>
      <button class="btn" style="border:1px solid #f59e0b; color:#fbbf24; font-weight:700; background:rgba(245,158,11,0.15);" onclick="setView('hero_chitato')">🌟 Hero Chitato (Render Match)</button>'''

if old_btn in content:
    content = content.replace(old_btn, new_btn, 1)
    print("-> Toolbar button added")

# 2. Add setView('hero_chitato')
old_view = "      } else if (viewType === 'chitato') {\n        gsapAnimateCamera(-7.5, 3.5, 12, -7.5, 1.2, 0);"
new_view = """      } else if (viewType === 'hero_chitato') {
        // MATCH PERSPEKTIF RENDER HERO CHITATO (CANOPY, LIGHTBOX & TERRAZZO REFLECTION)
        gsapAnimateCamera(-2.8, 2.05, 9.2, -7.8, 1.35, -0.6);
      } else if (viewType === 'chitato') {
        gsapAnimateCamera(-7.5, 3.5, 12, -7.5, 1.2, 0);"""

if old_view in content:
    content = content.replace(old_view, new_view, 1)
    print("-> setView('hero_chitato') added")

# 3. Add createChitatoTreasureZoneHero() implementation
hero_function = '''
    // =========================================================================
    // 6.5 BUILDER KHUSUS: HERO CHITATO × TREASURE ZONE (CANOPY & LIGHTBOXES)
    // =========================================================================
    function createChitatoTreasureZoneHero() {
      const group = new THREE.Group();

      // 1. CANOPY SOFFIT (PLAFON PUTIH GANTUNG)
      const canopyMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.25,
        metalness: 0.05
      });
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(14.8, 0.22, 4.0), canopyMat);
      canopy.position.set(-7.5, 2.34, 0);
      canopy.castShadow = true;
      group.add(canopy);

      const fasciaLip = new THREE.Mesh(
        new THREE.BoxGeometry(14.84, 0.04, 4.04),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2 })
      );
      fasciaLip.position.set(-7.5, 2.44, 0);
      group.add(fasciaLip);

      // 2. BLACK TRACK LIGHT RAILS & SPOTLIGHTS
      const railMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 });
      const spotBodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
      const lensEmissiveMat = new THREE.MeshStandardMaterial({
        color: 0xfffaed,
        emissive: 0xfffaed,
        emissiveIntensity: 1.5,
        roughness: 0.1
      });

      [-0.9, 0.9].forEach(rz => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.035, 0.04), railMat);
        rail.position.set(-7.5, 2.21, rz);
        group.add(rail);

        const spotCount = 6;
        for (let s = 0; s < spotCount; s++) {
          const sx = -13.6 + s * (12.2 / (spotCount - 1));
          const spotGroup = new THREE.Group();
          spotGroup.position.set(sx, 2.19, rz);

          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 8), railMat);
          stem.position.y = -0.02;
          spotGroup.add(stem);

          const head = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.09, 16), spotBodyMat);
          head.rotation.x = rz < 0 ? -0.35 : 0.35;
          head.position.y = -0.06;
          spotGroup.add(head);

          const lens = new THREE.Mesh(new THREE.CircleGeometry(0.032, 16), lensEmissiveMat);
          lens.rotation.x = rz < 0 ? -0.35 + Math.PI/2 : 0.35 + Math.PI/2;
          lens.position.set(0, -0.10, rz < 0 ? -0.015 : 0.015);
          spotGroup.add(lens);

          group.add(spotGroup);
        }
      });

      // Spotlight illumination
      const chitatoSpot1 = new THREE.SpotLight(0xfffaed, 2.0, 14, Math.PI / 4, 0.4, 1.2);
      chitatoSpot1.position.set(-11, 2.2, 1.2);
      chitatoSpot1.target.position.set(-11, 1.0, -1.8);
      group.add(chitatoSpot1);
      group.add(chitatoSpot1.target);

      const chitatoSpot2 = new THREE.SpotLight(0xfffaed, 2.0, 14, Math.PI / 4, 0.4, 1.2);
      chitatoSpot2.position.set(-5, 2.2, 1.2);
      chitatoSpot2.target.position.set(-5, 1.0, -1.8);
      group.add(chitatoSpot2);
      group.add(chitatoSpot2.target);

      // 3. RAISED STAGE FLOOR & GLOSSY POLISHED TERRAZZO
      const stageFloorMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.20,
        metalness: 0.12
      });
      const stageMesh = new THREE.Mesh(new THREE.BoxGeometry(14.6, 0.08, 3.8), stageFloorMat);
      stageMesh.position.set(-7.5, 0.04, 0);
      stageMesh.receiveShadow = true;
      group.add(stageMesh);

      const stageRim = new THREE.Mesh(
        new THREE.BoxGeometry(14.62, 0.04, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3 })
      );
      stageRim.position.set(-7.5, 0.06, 1.91);
      group.add(stageRim);

      // 4. BACKDROP SEGMENTATION (3 COLOR ZONES)
      // Zone 1: Yellow Arch Wall
      const yellowWallMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
      const yellowWall = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.3, 0.12), yellowWallMat);
      yellowWall.position.set(-12.9, 1.23, -1.85);
      yellowWall.receiveShadow = true;
      group.add(yellowWall);

      const archRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.04, 16, 32, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 1.6, roughness: 0.2 })
      );
      archRing.rotation.z = Math.PI;
      archRing.position.set(-12.8, 1.35, -1.78);
      group.add(archRing);

      [-0.85, 0.85].forEach(apx => {
        const col = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 1.35, 16),
          new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 1.4 })
        );
        col.position.set(-12.8 + apx, 0.675, -1.78);
        group.add(col);
      });

      const digiScreen = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 1.45, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.6, roughness: 0.1 })
      );
      digiScreen.position.set(-12.8, 1.15, -1.80);
      digiScreen.userData = { name: "Digital Game Screen (Touch Kiosk)", tag: "A-SCREEN", desc: "Kiosk layar sentuh interaktif game Chitato x TREASURE" };
      group.add(digiScreen);

      // Zone 2: Deep Green Wall (Chitato Lite Seaweed)
      const greenWallMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 });
      const greenWall = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.3, 0.12), greenWallMat);
      greenWall.position.set(-8.85, 1.23, -1.85);
      greenWall.receiveShadow = true;
      group.add(greenWall);

      const liteHeader = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.18, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfef08a, emissiveIntensity: 0.4 })
      );
      liteHeader.position.set(-8.85, 2.15, -1.77);
      group.add(liteHeader);

      for (let b = 0; b < 4; b++) {
        const bx = -10.5 + b * 1.1;
        const boxFrame = new THREE.Mesh(
          new THREE.BoxGeometry(0.82, 1.25, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x22c55e, emissiveIntensity: 1.0, roughness: 0.2 })
        );
        boxFrame.position.set(bx, 1.35, -1.77);
        group.add(boxFrame);

        const posterFace = new THREE.Mesh(
          new THREE.PlaneGeometry(0.74, 1.17),
          new THREE.MeshStandardMaterial({ color: 0xdcfce7, emissive: 0xbbf7d0, emissiveIntensity: 0.5, roughness: 0.3 })
        );
        posterFace.position.set(bx, 1.35, -1.74);
        group.add(posterFace);
      }

      // Zone 3: Warm Ochre Wall (Chitato Beef BBQ)
      const ochreWallMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
      const ochreWall = new THREE.Mesh(new THREE.BoxGeometry(6.4, 2.3, 0.12), ochreWallMat);
      ochreWall.position.set(-3.4, 1.23, -1.85);
      ochreWall.receiveShadow = true;
      group.add(ochreWall);

      const beefHeader = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.18, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfde047, emissiveIntensity: 0.4 })
      );
      beefHeader.position.set(-3.4, 2.15, -1.77);
      group.add(beefHeader);

      for (let b = 0; b < 5; b++) {
        const bx = -5.6 + b * 1.1;
        const boxFrame = new THREE.Mesh(
          new THREE.BoxGeometry(0.82, 1.25, 0.05),
          new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xf59e0b, emissiveIntensity: 1.0, roughness: 0.2 })
        );
        boxFrame.position.set(bx, 1.35, -1.77);
        group.add(boxFrame);

        const posterFace = new THREE.Mesh(
          new THREE.PlaneGeometry(0.74, 1.17),
          new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0xfde68a, emissiveIntensity: 0.5, roughness: 0.3 })
        );
        posterFace.position.set(bx, 1.35, -1.74);
        group.add(posterFace);
      }

      // 5. TOP ILLUMINATED PILL SIGNAGE
      const pillBoxMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.3,
        roughness: 0.2
      });
      const pillBox = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.45, 0.10), pillBoxMat);
      pillBox.position.set(-6.5, 2.45, -1.72);
      group.add(pillBox);

      // 6. PERABOT: DRUM POUF ROUND OTTOMANS
      const poufConfigs = [
        { x: -13.8, z: 0.8, r: 0.26, h: 0.42, color: 0xfacc15 },
        { x: -12.4, z: 0.3, r: 0.28, h: 0.42, color: 0xea580c },
        { x: -9.8,  z: 0.4, r: 0.30, h: 0.42, color: 0x16a34a },
        { x: -4.0,  z: 0.7, r: 0.32, h: 0.42, color: 0xfacc15 }
      ];

      poufConfigs.forEach(p => {
        const pouf = new THREE.Mesh(
          new THREE.CylinderGeometry(p.r, p.r, p.h, 32),
          new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.65 })
        );
        pouf.position.set(p.x, p.h / 2 + 0.08, p.z);
        pouf.castShadow = true;
        pouf.receiveShadow = true;
        pouf.userData = { name: "Drum Pouf Kursi Santai", tag: "A05", desc: "Dudukan busa silinder ergonomis empuk" };
        group.add(pouf);
      });

      // 7. SLAT TREE SCULPTURES
      const createSlatTree = (cx, cz, colorHex) => {
        const treeGroup = new THREE.Group();
        const baseCyl = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.16, 0.45, 24),
          new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.15 })
        );
        baseCyl.position.set(cx, 0.225 + 0.08, cz);
        baseCyl.castShadow = true;
        treeGroup.add(baseCyl);

        const slatMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35, metalness: 0.1 });
        const slatHeights = [0.4, 0.6, 0.8, 0.95, 1.1, 0.95, 0.8, 0.6, 0.4];
        slatHeights.forEach((sh, i) => {
          const sx = cx - 0.36 + i * 0.09;
          const slat = new THREE.Mesh(new THREE.BoxGeometry(0.065, sh, 0.28), slatMat);
          slat.position.set(sx, 0.45 + sh / 2 + 0.08, cz);
          slat.castShadow = true;
          treeGroup.add(slat);
        });
        return treeGroup;
      };

      group.add(createSlatTree(-11.2, 0.2, 0x15803d));
      group.add(createSlatTree(-2.0, 0.2, 0xd97706));

      // 8. SAMPLING BAR COUNTERS & PLINTHS
      const plinth1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.95, 0.55),
        new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.3 })
      );
      plinth1.position.set(-14.3, 0.475 + 0.08, -0.6);
      plinth1.castShadow = true;
      group.add(plinth1);

      const plinth2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 1.10, 0.55),
        new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.3 })
      );
      plinth2.position.set(-13.5, 0.55 + 0.08, -0.4);
      plinth2.castShadow = true;
      group.add(plinth2);

      const barMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.25 });
      const barCounter = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.90, 0.60), barMat);
      barCounter.position.set(-12.4, 0.45 + 0.08, -0.7);
      barCounter.castShadow = true;
      group.add(barCounter);

      const barFront = new THREE.Mesh(
        new THREE.BoxGeometry(0.60, 0.88, 0.62),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 })
      );
      barFront.position.set(-11.75, 0.44 + 0.08, -0.7);
      group.add(barFront);

      return group;
    }
'''

# Insert hero_function before "7. SETUP SCENE & LIGHTING"
anchor = "    // =========================================================================\n    // 7. SETUP SCENE & LIGHTING"
if anchor in content:
    content = content.replace(anchor, hero_function + "\n" + anchor, 1)
    print("-> hero_function injected before Section 7")

# 4. Instantiate chitatoHeroZone in scene
scene_anchor = "    const interactiveObjects = [];\n    const standeeGroup = new THREE.Group();\n    scene.add(standeeGroup);"
scene_inject = """    const interactiveObjects = [];
    const standeeGroup = new THREE.Group();
    scene.add(standeeGroup);

    // SUNTIKKAN ZONA HERO CHITATO (CANOPY, LIGHTBOXES, & REFLECTION)
    const chitatoHeroZone = createChitatoTreasureZoneHero();
    scene.add(chitatoHeroZone);
    chitatoHeroZone.traverse(c => { if (c.isMesh && c.userData && c.userData.tag) interactiveObjects.push(c); });"""

if scene_anchor in content:
    content = content.replace(scene_anchor, scene_inject, 1)
    print("-> chitatoHeroZone instantiated in scene")

with open(viewer_path, "w", encoding="utf-8") as f:
    f.write(content)

print("-> booth-viewer.html updated successfully!")
