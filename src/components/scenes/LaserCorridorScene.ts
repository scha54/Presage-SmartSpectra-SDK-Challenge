import * as THREE from 'three';
import { Room1LaserState } from '../../types/game';
import { SmartSpectraMetrics } from '../../types/smartspectra';

export class LaserCorridorScene {
  public group = new THREE.Group();
  private laserBeams: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; gateIdx: number; baseColor: THREE.Color }[] = [];
  private gateNodes: THREE.Mesh[] = [];
  private alertLight: THREE.PointLight;

  constructor() {
    this.alertLight = new THREE.PointLight(0x00f2fe, 1.5, 12);
    this.alertLight.position.set(0, 3, 0);
    this.group.add(this.alertLight);

    this.buildCorridorStructure();
    this.buildLaserGates();
  }

  private buildCorridorStructure(): void {
    // Corridor walls (dark metallic panels with emissive trim)
    const wallGeo = new THREE.BoxGeometry(0.4, 4.5, 30);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x080f1a,
      roughness: 0.4,
      metalness: 0.8
    });

    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.position.set(-3.5, 2.25, 0);
    this.group.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.position.set(3.5, 2.25, 0);
    this.group.add(rightWall);

    // Glowing wall base trim lines
    const trimGeo = new THREE.BoxGeometry(0.1, 0.1, 30);
    const trimMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });

    const leftTrim = new THREE.Mesh(trimGeo, trimMat);
    leftTrim.position.set(-3.25, 0.1, 0);
    this.group.add(leftTrim);

    const rightTrim = new THREE.Mesh(trimGeo, trimMat);
    rightTrim.position.set(3.25, 0.1, 0);
    this.group.add(rightTrim);
  }

  private buildLaserGates(): void {
    // 3 Laser Gates spaced at Z = -4, Z = -10, Z = -16
    const gateZPositions = [-4, -10, -16];

    gateZPositions.forEach((z, gateIdx) => {
      // Gate Archway Pillars
      const pillarGeo = new THREE.BoxGeometry(0.6, 4.2, 0.6);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0x121b29,
        metalness: 0.9,
        roughness: 0.3
      });

      const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
      leftPillar.position.set(-3.2, 2.1, z);
      this.group.add(leftPillar);

      const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
      rightPillar.position.set(3.2, 2.1, z);
      this.group.add(rightPillar);

      // Emitter Node Indicator
      const nodeGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0xff3366 });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(0, 4.0, z);
      this.group.add(node);
      this.gateNodes.push(node);

      // Multiple intersecting horizontal and diagonal laser beams
      const beamConfigs = [
        { y1: 0.8, y2: 0.8, x1: -3.2, x2: 3.2 },
        { y1: 1.8, y2: 1.8, x1: -3.2, x2: 3.2 },
        { y1: 2.8, y2: 2.8, x1: -3.2, x2: 3.2 },
        { y1: 0.9, y2: 2.7, x1: -3.2, x2: 3.2 },
        { y1: 2.7, y2: 0.9, x1: -3.2, x2: 3.2 }
      ];

      beamConfigs.forEach((cfg) => {
        const p1 = new THREE.Vector3(cfg.x1, cfg.y1, z);
        const p2 = new THREE.Vector3(cfg.x2, cfg.y2, z);
        const dist = p1.distanceTo(p2);

        const beamGeo = new THREE.CylinderGeometry(0.025, 0.025, dist, 8);
        const beamMat = new THREE.MeshBasicMaterial({
          color: 0xff2255,
          transparent: true,
          opacity: 0.95
        });

        const beamMesh = new THREE.Mesh(beamGeo, beamMat);
        beamMesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
        
        // Orient beam along line from p1 to p2
        const dir = p2.clone().sub(p1).normalize();
        const axis = new THREE.Vector3(0, 1, 0);
        beamMesh.quaternion.setFromUnitVectors(axis, dir);

        this.group.add(beamMesh);
        this.laserBeams.push({
          mesh: beamMesh,
          mat: beamMat,
          gateIdx,
          baseColor: new THREE.Color(0xff2255)
        });
      });
    });
  }

  public update(time: number, metrics: SmartSpectraMetrics, state: Room1LaserState): void {
    const isCalm = metrics.stabilityScore >= 70;
    
    // Alert light color
    if (state.alarmTriggered) {
      this.alertLight.color.setHex(0xff0044);
      this.alertLight.intensity = 2.0 + Math.sin(time * 12) * 1.5;
    } else {
      this.alertLight.color.setHex(isCalm ? 0x00f2fe : 0xffaa00);
      this.alertLight.intensity = 1.2 + Math.sin(time * 3) * 0.4;
    }

    // Update laser beams according to gate state
    this.laserBeams.forEach(laser => {
      const gate = state.gates[laser.gateIdx];
      if (!gate) return;

      if (gate.isDisarmed) {
        // Disarmed gate: laser powered down completely
        laser.mat.opacity = 0;
        laser.mesh.visible = false;
      } else {
        laser.mesh.visible = true;
        if (state.currentGateIndex === laser.gateIdx) {
          // Active gate: color shifts from red towards cyan as breathing stabilizes
          const progress = gate.disarmProgress / 100;
          const targetColor = new THREE.Color(0xff2255).lerp(new THREE.Color(0x00f2fe), progress);
          laser.mat.color.copy(targetColor);

          // Flicker effect based on breathing phase
          const flicker = 0.75 + Math.sin(time * 25 + laser.mesh.id) * 0.25;
          laser.mat.opacity = Math.max(0.15, (1 - progress * 0.7) * flicker);
        } else {
          // Inactive future gate: steady red
          laser.mat.color.setHex(0xff2255);
          laser.mat.opacity = 0.9;
        }
      }
    });

    // Update gate indicator nodes
    this.gateNodes.forEach((node, idx) => {
      const gate = state.gates[idx];
      const mat = node.material as THREE.MeshBasicMaterial;
      if (gate.isDisarmed) {
        mat.color.setHex(0x00ff88); // Green for disarmed
      } else if (state.currentGateIndex === idx) {
        mat.color.setHex(0x00f2fe); // Cyan for current target
      } else {
        mat.color.setHex(0xff3366); // Red for locked
      }
    });
  }
}
