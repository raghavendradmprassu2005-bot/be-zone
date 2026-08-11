import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const ROTATION_SECONDS = 80;
const FLOAT_AMPLITUDE = 0.08;
const FLOAT_SPEED = 0.5;

/* ============================================================
   ATMOSPHERE SHADER
   ============================================================ */

const atmosphereVertex = `
  varying vec3 vNormal;
  varying vec3 vPositionNormal;

  void main() {
    vNormal = normalize(normalMatrix * normal);

    vPositionNormal =
      normalize((modelViewMatrix * vec4(position, 1.0)).xyz);

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
`;

const atmosphereFragment = `
  varying vec3 vNormal;
  varying vec3 vPositionNormal;

  uniform vec3 glowColorA;
  uniform vec3 glowColorB;

  void main() {

    float intensity =
      pow(
        max(0.0, 0.62 - dot(vNormal, vPositionNormal)),
        3.0
      );

    vec3 glow =
      mix(
        glowColorB,
        glowColorA,
        intensity
      );

    gl_FragColor =
      vec4(
        glow,
        intensity * 0.85
      );
  }
`;

/* ============================================================
   ATMOSPHERE
   ============================================================ */

function Atmosphere({
  radius,
}: {
  radius: number;
}) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: atmosphereVertex,
      fragmentShader: atmosphereFragment,

      uniforms: {
        glowColorA: {
          value: new THREE.Color("#e8c26f"),
        },

        glowColorB: {
          value: new THREE.Color("#4d6fd1"),
        },
      },

      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh
      scale={1.045}
      material={material}
    >
      <sphereGeometry
        args={[
          radius,
          64,
          64,
        ]}
      />
    </mesh>
  );
}

/* ============================================================
   EARTH MODEL
   ============================================================ */

function EarthModel() {
  const group = useRef<THREE.Group>(null);

  const { scene } = useGLTF(
    "/models/earth.glb"
  );

  /*
   * Normalize the downloaded Earth model.
   */

  const { normalizedScale, radius } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(
      scene
    );

    const sphere = box.getBoundingSphere(
      new THREE.Sphere()
    );

    const originalRadius = sphere.radius;

    /*
     * Keep the same Earth size used by
     * your current desktop version.
     */

    const TARGET_RADIUS = 3.4;

    const scale =
      originalRadius > 0
        ? TARGET_RADIUS / originalRadius
        : 1;

    return {
      normalizedScale: scale,
      radius: TARGET_RADIUS,
    };
  }, [scene]);

  /* ==========================================================
     EARTH MATERIAL
     ========================================================== */

  useMemo(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const materials = Array.isArray(
          child.material
        )
          ? child.material
          : [child.material];

        materials.forEach((material) => {
          if (
            material instanceof
            THREE.MeshStandardMaterial
          ) {
            material.roughness = 0.72;
            material.metalness = 0.02;

            material.envMapIntensity = 0.8;

            material.emissive =
              new THREE.Color("#16100a");

            material.emissiveIntensity = 0.08;
          }
        });

        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
  }, [scene]);

  /* ==========================================================
     EARTH MOTION
     ========================================================== */

  useFrame((state, delta) => {
    if (!group.current) return;

    /*
     * Slow realistic rotation.
     */

    group.current.rotation.y +=
      (Math.PI * 2 * delta) /
      ROTATION_SECONDS;

    /*
     * Very subtle floating motion.
     */

    group.current.position.y =
      Math.sin(
        state.clock.elapsedTime *
          FLOAT_SPEED
      ) * FLOAT_AMPLITUDE;
  });

  return (
    <group ref={group}>
      <group
        scale={[
          normalizedScale,
          normalizedScale,
          normalizedScale,
        ]}
      >
        <primitive
          object={scene}
          position={[
            0,
            0,
            0,
          ]}
        />

        <Atmosphere
          radius={radius}
        />
      </group>
    </group>
  );
}

/* ============================================================
   PRELOAD EARTH
   ============================================================ */

useGLTF.preload(
  "/models/earth.glb"
);

/* ============================================================
   EARTH SCENE
   ============================================================ */

export default function EarthScene() {
  return (
    <div
      aria-hidden="true"

      /*
       * IMPORTANT:
       *
       * MOBILE:
       *   centered horizontally
       *   larger
       *   positioned toward bottom
       *
       * DESKTOP (sm and above):
       *   EXACTLY your previous positioning
       *
       * Desktop:
       *   bottom: -12%
       *   left: -5%
       *   width: clamp(320px, 46vw, 620px)
       *
       * Nothing about the desktop alignment
       * is changed.
       */

      className="
        pointer-events-none
        absolute
        z-[2]

        /* ==========================
           MOBILE ONLY
           ========================== */

        left-1/2
        bottom-[-13%]
        -translate-x-1/2

        w-[430px]
        h-[430px]

        /* ==========================
           DESKTOP
           RESTORE ORIGINAL VALUES
           ========================== */

        sm:left-[-5%]
        sm:bottom-[-12%]
        sm:translate-x-0

        sm:w-[clamp(320px,46vw,620px)]
        sm:h-[clamp(320px,46vw,620px)]
      "
      style={{
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{
          position: [
            0,
            0,
            7.5,
          ],

          fov: 42,

          near: 0.1,

          far: 100,
        }}

        dpr={[
          1,
          1.5,
        ]}

        gl={{
          antialias: true,

          alpha: true,

          toneMapping:
            THREE.ACESFilmicToneMapping,

          toneMappingExposure: 1.15,

          powerPreference:
            "high-performance",
        }}

        onCreated={({ gl }) => {
          gl.outputColorSpace =
            THREE.SRGBColorSpace;
        }}
      >
        <Suspense fallback={null}>

          {/* ==================================================
              BASIC LIGHT
             ================================================== */}

          <ambientLight
            intensity={0.28}
          />

          {/* ==================================================
              MAIN SUN LIGHT
             ================================================== */}

          <directionalLight
            position={[
              4,
              5,
              6,
            ]}
            intensity={1.5}
            color="#fff4dc"
          />

          {/* ==================================================
              GOLD RIM LIGHT
             ================================================== */}

          <pointLight
            position={[
              -3,
              -2,
              4,
            ]}
            intensity={2.4}
            color="#d4a94e"
            distance={14}
          />

          {/* ==================================================
              BLUE SPACE LIGHT
             ================================================== */}

          <pointLight
            position={[
              3,
              2,
              -4,
            ]}
            intensity={1.2}
            color="#5675c8"
            distance={16}
          />

          {/* ==================================================
              SUBTLE SPACE STARS
             ================================================== */}

          <Stars
            radius={50}
            depth={30}
            count={700}
            factor={1.8}
            saturation={0}
            fade
            speed={0.2}
          />

          {/* ==================================================
              EARTH
             ================================================== */}

          <EarthModel />

          {/* ==================================================
              BLOOM
             ================================================== */}

          <EffectComposer>
            <Bloom
              intensity={0.55}
              luminanceThreshold={0.35}
              luminanceSmoothing={0.4}
              mipmapBlur
            />
          </EffectComposer>

        </Suspense>
      </Canvas>
    </div>
  );
}