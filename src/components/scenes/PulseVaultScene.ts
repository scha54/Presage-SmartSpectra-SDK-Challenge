import * as THREE from 'three';
import { Room2VaultState } from '../../types/game';
import { SmartSpectraMetrics } from '../../types/smartspectra';

export class PulseVaultScene {
  public group = new THREE.Group();
  private outerRing: THREE.Mesh;
  private middleRing: THREE.Mesh;
  private innerRing: THREE.Mesh;
  private biometricCore: THREE.Mesh;
  private coreLight: THREE.PointLight;
  private tumblerPins: THREE.Mesh[] = [];
  private vaultDoorGroup = new THREE.Group();

  constructor() {
    this.group.position.set(0, 0, -2);

    // Vault wall frame
    const wallGeo = new THREE.BoxGeometry(9, 6, 0.8);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x09101d,
      roughness: 0.35,
      metalness: 0.85
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 2.5, 0);
    this.group.add(wall);

    // Group for door opening rotation
    this.vaultDoorGroup.position.set(-2.5, 2.5, 0.4);
    this.group.add(this.vaultDoorGroup);

    // Center offset inside door group
    const doorInner = new THREE.Group();
    doorInner.position.set(2.5, 0, 0);
    this.vaultDoorGroup.add(doorInner);

    // Main circular vault door
    const doorGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.5, 48);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x121e2e,
      roughness: 0.25,
      metalness: 0.95
    });
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.rotation.x = Math.PI / 2;
    doorInner.add(doorMesh);

    // Outer Rotating Ring
    const outerGeo = new THREE.TorusGeometry(2.1, 0.08, 16, 64);
    const outerMat = new THREE.MeshStandardMaterial({ color: 0x00f2fe, emissive: 0x00f2fe, emissiveIntensity: 0.4 });
    this.outerRing = new THREE.Mesh(outerGeo, outerMat);
    this.outerRing.position.z = 0.28;
    doorInner.add(this.outerRing);

    // Middle Rotating Ring
    const middleGeo = new THREE.TorusGeometry(1.5, 0.07, 16, 48);
    const middleMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 0.4 });
    this.middleRing = new THREE.Mesh(middleGeo, middleMat);
    this.middleRing.position.z = 0.32;
    doorInner.add(this.middleRing);

    // Inner Glyph Ring
    const innerGeo = new THREE.TorusGeometry(0.9, 0.06, 16, 36);
    const innerMat = new THREE.MeshStandardMaterial({ color: 0x00f2fe, emissive: 0x00f2fe, emissiveIntensity: 0.5 });
    this.innerRing = new THREE.Mesh(innerGeo, innerMat);
    this.innerRing.position.z = 0.36;
    doorInner.add(this.innerRing);

    // Central Biometric Heart Core
    const coreGeo = new THREE.IcosahedronGeometry(0.42, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xff3366,
      emissive: 0xff3366,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    this.biometricCore = new THREE.Mesh(coreGeo, coreMat);
    this.biometricCore.position.z = 0.42;
    doorInner.add(this.biometricCore);

    this.coreLight = new THREE.PointLight(0xff3366, 2.5, 8);
    this.coreLight.position.set(0, 0, 0.8);
    doorInner.add(this.coreLight);

    // 3 Biometric Tumbler Bolts (at 12 o'clock, 4 o'clock, 8 o'clock)
    const angles = [Math.PI / 2, Math.PI / 2 + (2 * Math.PI) / 3, Math.PI / 2 + (4 * Math.PI) / 3];
    angles.forEach((angle) => {
      const pinGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);
      const pinMat = new THREE.MeshStandardMaterial({ color: 0xff3366, emissive: 0xff3366, emissiveIntensity: 0.3 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, 0.3);
      pin.rotation.z = angle + Math.PI / 2;
      doorInner.add(pin);
      this.tumblerPins.push(pin);
    });
  }

  public update(time: number, metrics: SmartSpectraMetrics, state: Room2VaultState): void {
    // Pulse frequency from player's BPM (e.g. 72 BPM = 1.2 Hz)
    const bpm = Math.max(50, Math.min(150, metrics.pulseRate));
    const pulseFreq = (bpm / 60) * Math.PI * 2;
    const heartbeatWave = Math.pow(Math.max(0, Math.sin(time * pulseFreq)), 4);

    // Pulse Biometric Core in exact sync with player's heart
    const coreScale = 1.0 + heartbeatWave * 0.32;
    this.biometricCore.scale.set(coreScale, coreScale, coreScale);

    // Color shift based on resonance match
    const isResonant = state.resonanceSync >= 75;
    const coreColor = isResonant ? new THREE.Color(0x00f2fe) : new THREE.Color(0xff3366);
    (this.biometricCore.material as THREE.MeshStandardMaterial).color.lerp(coreColor, 0.1);
    (this.biometricCore.material as THREE.MeshStandardMaterial).emissive.lerp(coreColor, 0.1);
    this.coreLight.color.lerp(coreColor, 0.1);
    this.coreLight.intensity = 1.5 + heartbeatWave * 2.0;

    // Rotate concentric rings at speeds proportional to pulse
    const ringSpeed = (bpm / 60) * 0.03;
    this.outerRing.rotation.z += ringSpeed;
    this.middleRing.rotation.z -= ringSpeed * 1.4;
    this.innerRing.rotation.z += ringSpeed * 2.0;

    // Update tumbler pins
    this.tumblerPins.forEach((pin, idx) => {
      const tumbler = state.tumblers[idx];
      const mat = pin.material as THREE.MeshStandardMaterial;
      if (tumbler && !tumbler.isLocked) {
        // Unlocked tumbler: retracted and glowing cyan/green
        mat.color.setHex(0x00ff88);
        mat.emissive.setHex(0x00ff88);
        pin.scale.y = 0.5;
      } else if (state.activeTumblerIndex === idx) {
        // Active targeting tumbler: pulses in amber
        mat.color.setHex(0xffaa00);
        mat.emissive.setHex(0xffaa00);
        pin.scale.y = 1.0 + Math.sin(time * 8) * 0.1;
      } else {
        // Locked tumbler: solid red
        mat.color.setHex(0xff3366);
        mat.emissive.setHex(0xff3366);
        pin.scale.y = 1.0;
      }
    });

    // Vault door open swing animation
    if (state.isVaultUnlocked) {
      const targetAngle = -Math.PI * 0.65; // swing open 115 degrees
      this.vaultDoorGroup.rotation.y = THREE.MathUtils.lerp(this.vaultDoorGroup.rotation.y, targetAngle, 0.05);
    }
  }
}
