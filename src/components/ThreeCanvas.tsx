import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GameStage, Room1LaserState, Room2VaultState, Room3BridgeState } from '../types/game';
import { SmartSpectraMetrics } from '../types/smartspectra';
import { LaserCorridorScene } from './scenes/LaserCorridorScene';
import { PulseVaultScene } from './scenes/PulseVaultScene';
import { BreathBridgeScene } from './scenes/BreathBridgeScene';

interface ThreeCanvasProps {
  stage: GameStage;
  metrics: SmartSpectraMetrics;
  room1State: Room1LaserState;
  room2State: Room2VaultState;
  room3State: Room3BridgeState;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  stage,
  metrics,
  room1State,
  room2State,
  room3State
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // References to keep across re-renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const laserSceneRef = useRef<LaserCorridorScene | null>(null);
  const vaultSceneRef = useRef<PulseVaultScene | null>(null);
  const bridgeSceneRef = useRef<BreathBridgeScene | null>(null);

  const ambientParticlesRef = useRef<THREE.Points | null>(null);
  const targetCameraPos = useRef(new THREE.Vector3(0, 1.8, 4));
  const targetLookAt = useRef(new THREE.Vector3(0, 1.8, -4));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03070f);
    scene.fog = new THREE.FogExp2(0x03070f, 0.035);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.8, 5);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Global Lighting & Grid Floor
    const hemiLight = new THREE.HemisphereLight(0x4facfe, 0x050a14, 0.6);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Reflective Cyberpunk Grid Floor
    const gridHelper = new THREE.GridHelper(60, 60, 0x00f2fe, 0x0e2238);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Ambient floating dust particles
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 20;
      pPos[i + 1] = Math.random() * 5;
      pPos[i + 2] = (Math.random() - 0.5) * 30;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00f2fe,
      size: 0.04,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);
    ambientParticlesRef.current = particles;

    // 5. Instantiate Room Scenes
    const laserScene = new LaserCorridorScene();
    const vaultScene = new PulseVaultScene();
    const bridgeScene = new BreathBridgeScene();

    laserSceneRef.current = laserScene;
    vaultSceneRef.current = vaultScene;
    bridgeSceneRef.current = bridgeScene;

    scene.add(laserScene.group);
    scene.add(vaultScene.group);
    scene.add(bridgeScene.group);

    // 6. Handle Window Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 7. Render Loop
    let animId: number;
    let clock = new THREE.Clock();

    const currentLookAt = new THREE.Vector3(0, 1.8, -4);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation
      camera.position.lerp(targetCameraPos.current, 0.04);
      currentLookAt.lerp(targetLookAt.current, 0.04);
      camera.lookAt(currentLookAt);

      // Float ambient particles
      if (ambientParticlesRef.current) {
        const positions = ambientParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.003;
          if (positions[i] < 0) positions[i] = 5;
        }
        ambientParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update room visibility and camera target according to active stage
  useEffect(() => {
    if (!laserSceneRef.current || !vaultSceneRef.current || !bridgeSceneRef.current) return;

    const laser = laserSceneRef.current.group;
    const vault = vaultSceneRef.current.group;
    const bridge = bridgeSceneRef.current.group;

    switch (stage) {
      case 'TITLE':
      case 'CONSENT_CALIBRATION':
        laser.visible = true;
        vault.visible = false;
        bridge.visible = false;
        targetCameraPos.current.set(0, 2.5, 7);
        targetLookAt.current.set(0, 2.0, -5);
        break;

      case 'ROOM1_LASER':
        laser.visible = true;
        vault.visible = false;
        bridge.visible = false;
        // Camera moves down corridor with disarmed gates
        const gateZ = [-2, -8, -14][Math.min(2, room1State.currentGateIndex)] + 3;
        targetCameraPos.current.set(0, 1.8, gateZ);
        targetLookAt.current.set(0, 1.8, gateZ - 6);
        break;

      case 'ROOM2_VAULT':
        laser.visible = false;
        vault.visible = true;
        bridge.visible = false;
        targetCameraPos.current.set(0, 2.5, 4.5);
        targetLookAt.current.set(0, 2.5, -2);
        break;

      case 'ROOM3_BRIDGE':
        laser.visible = false;
        vault.visible = false;
        bridge.visible = true;
        // Camera advances across the bridge as segments materialize
        const segIdx = Math.min(4, room3State.completedBreathCycles);
        const bridgeZ = 2.5 - segIdx * 3.0;
        targetCameraPos.current.set(0, 2.2, bridgeZ);
        targetLookAt.current.set(0, 1.6, bridgeZ - 8);
        break;

      case 'VICTORY':
        laser.visible = false;
        vault.visible = false;
        bridge.visible = true;
        targetCameraPos.current.set(0, 2.0, -17);
        targetLookAt.current.set(0, 1.8, -20);
        break;
    }
  }, [stage, room1State.currentGateIndex, room3State.completedBreathCycles]);

  // Push per-frame updates to the active room scene
  useEffect(() => {
    const time = performance.now() * 0.001;
    if (stage === 'ROOM1_LASER' && laserSceneRef.current) {
      laserSceneRef.current.update(time, metrics, room1State);
    } else if (stage === 'ROOM2_VAULT' && vaultSceneRef.current) {
      vaultSceneRef.current.update(time, metrics, room2State);
    } else if (stage === 'ROOM3_BRIDGE' && bridgeSceneRef.current) {
      bridgeSceneRef.current.update(time, metrics, room3State);
    }
  }, [metrics, stage, room1State, room2State, room3State]);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-auto" />;
};
