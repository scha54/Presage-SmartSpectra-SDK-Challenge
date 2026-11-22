import * as THREE from 'three';
import { Room3BridgeState } from '../../types/game';
import { SmartSpectraMetrics } from '../../types/smartspectra';

export class BreathBridgeScene {
  public group = new THREE.Group();
  private bridgeSegments: THREE.Mesh[] = [];
  private segmentGlows: THREE.PointLight[] = [];
  private abyssFog: THREE.Points;
  private exitPortal: THREE.Mesh;
  private bridgeEnergyBeam: THREE.Mesh;

  constructor() {
    this.group.position.set(0, 0, 0);

    // Starting ledge (platform where player stands)
    const ledgeGeo = new THREE.BoxGeometry(4.5, 0.6, 3);
    const ledgeMat = new THREE.MeshStandardMaterial({
      color: 0x0a1424,
      roughness: 0.3,
      metalness: 0.9
    });
    const startLedge = new THREE.Mesh(ledgeGeo, ledgeMat);
    startLedge.position.set(0, 0, 1.5);
    this.group.add(startLedge);

    // Far destination ledge with exit portal
    const endLedge = new THREE.Mesh(ledgeGeo, ledgeMat);
    endLedge.position.set(0, 0, -18.5);
    this.group.add(endLedge);

    // Glowing Sci-Fi Exit Portal
    const portalGeo = new THREE.TorusGeometry(1.8, 0.15, 16, 48);
    const portalMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    this.exitPortal = new THREE.Mesh(portalGeo, portalMat);
    this.exitPortal.position.set(0, 1.8, -19.5);
    this.group.add(this.exitPortal);

    // 5 Holographic Floating Bridge Segments spanning from Z = -1 to Z = -16
    const segmentWidth = 2.4;
    const segmentDepth = 2.6;
    const zSpacing = 3.2;

    for (let i = 0; i < 5; i++) {
      const zPos = -1.5 - (i * zSpacing);

      // Quantum crystal platform
      const segGeo = new THREE.BoxGeometry(segmentWidth, 0.2, segmentDepth);
      const segMat = new THREE.MeshStandardMaterial({
        color: 0x00f2fe,
        emissive: 0x00f2fe,
        emissiveIntensity: 0.15,
        transparent: true,
        opacity: 0.2,
        roughness: 0.1,
        metalness: 0.9
      });

      const segment = new THREE.Mesh(segGeo, segMat);
      segment.position.set(0, 0, zPos);
      this.group.add(segment);
      this.bridgeSegments.push(segment);

      // Segment local crystal beacon light
      const light = new THREE.PointLight(0x00f2fe, 0, 5);
      light.position.set(0, 0.5, zPos);
      this.group.add(light);
      this.segmentGlows.push(light);
    }

    // Continuous energy beam running under the bridge
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, 16, 12);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.15 });
    this.bridgeEnergyBeam = new THREE.Mesh(beamGeo, beamMat);
    this.bridgeEnergyBeam.position.set(0, -0.4, -8.5);
    this.bridgeEnergyBeam.rotation.x = Math.PI / 2;
    this.group.add(this.bridgeEnergyBeam);

    // Abyss particle fog below the bridge
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 18;
      positions[i + 1] = -1.5 - Math.random() * 8; // Underneath bridge
      positions[i + 2] = (Math.random() - 0.5) * 24 - 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x0088aa,
      size: 0.18,
      transparent: true,
      opacity: 0.45
    });
    this.abyssFog = new THREE.Points(particleGeo, particleMat);
    this.group.add(this.abyssFog);
  }

  public update(time: number, metrics: SmartSpectraMetrics, state: Room3BridgeState): void {
    // Swirl abyss fog particles
    const positions = this.abyssFog.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(time + positions[i]) * 0.005;
      positions[i] += Math.cos(time + positions[i + 2]) * 0.003;
    }
    this.abyssFog.geometry.attributes.position.needsUpdate = true;

    // Rotate exit portal
    this.exitPortal.rotation.z = time * 0.4;

    // Breath synchronization effect:
    // phase: -1.0 (exhale) to +1.0 (inhale)
    const breathPulse = 0.5 + 0.5 * metrics.respiratoryPhase;

    // Update each bridge segment
    this.bridgeSegments.forEach((segment, idx) => {
      const segState = state.segments[idx];
      const mat = segment.material as THREE.MeshStandardMaterial;
      const light = this.segmentGlows[idx];

      if (segState && segState.isCrystallized) {
        // Fully crystallized platform: solid glowing cyan/white
        mat.opacity = 0.95;
        mat.color.setHex(0x00f2fe);
        mat.emissive.setHex(0x00f2fe);
        mat.emissiveIntensity = 0.7 + Math.sin(time * 3 + idx) * 0.2;
        segment.position.y = Math.sin(time * 2 + idx) * 0.03;
        light.intensity = 1.6;
      } else if (state.currentSegmentIndex === idx) {
        // Currently crystallizing platform: pulses in rhythm with inhalation/exhalation
        const progress = segState ? segState.energyLevel / 100 : 0;
        mat.opacity = 0.25 + progress * 0.55 + breathPulse * 0.2;
        mat.color.setHex(0x00f2fe);
        mat.emissive.setHex(0x00f2fe);
        mat.emissiveIntensity = 0.2 + progress * 0.5;
        segment.position.y = -0.15 * (1 - progress) + Math.sin(time * 4) * 0.04;
        light.intensity = 0.3 + progress * 0.8;
      } else {
        // Unformed future segment: faint ghost blueprint
        mat.opacity = 0.08;
        mat.color.setHex(0x004466);
        mat.emissive.setHex(0x002233);
        mat.emissiveIntensity = 0.05;
        segment.position.y = -0.3;
        light.intensity = 0;
      }
    });

    // When bridge is fully completed, light up continuous energy beam
    if (state.isBridgeCrossable) {
      (this.bridgeEnergyBeam.material as THREE.MeshBasicMaterial).opacity = 0.7 + Math.sin(time * 6) * 0.2;
    }
  }
}
