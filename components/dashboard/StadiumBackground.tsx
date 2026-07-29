'use client';

import {
  memo,
  useMemo,
  useRef,
} from 'react';
import {
  Canvas,
  useFrame,
  useThree,
} from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uMotion;
  uniform vec2 uResolution;

  float hash21(vec2 point) {
    point = fract(point * vec2(123.34, 456.21));
    point += dot(point, point + 45.32);
    return fract(point.x * point.y);
  }

  float noise21(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);

    float a = hash21(cell);
    float b = hash21(cell + vec2(1.0, 0.0));
    float c = hash21(cell + vec2(0.0, 1.0));
    float d = hash21(cell + vec2(1.0, 1.0));

    return mix(
      mix(a, b, local.x),
      mix(c, d, local.x),
      local.y
    );
  }

  float softCircle(
    vec2 point,
    vec2 center,
    float radius,
    float softness
  ) {
    float distanceToCenter = length(point - center);
    return 1.0 - smoothstep(
      radius - softness,
      radius + softness,
      distanceToCenter
    );
  }

  float starLayer(
    vec2 uv,
    float scale,
    float time,
    float threshold
  ) {
    vec2 grid = uv * scale;
    vec2 cell = floor(grid);
    vec2 local = fract(grid) - 0.5;

    float randomValue = hash21(cell);
    float visibility = step(threshold, randomValue);

    vec2 drift = vec2(
      sin(time * 0.31 + randomValue * 6.2831),
      cos(time * 0.23 + randomValue * 5.17)
    ) * 0.055;

    float radius = mix(0.035, 0.11, randomValue);
    float point = 1.0 - smoothstep(
      radius * 0.18,
      radius,
      length(local + drift)
    );

    float twinkle =
      0.56 +
      0.44 *
      sin(time * mix(0.65, 1.45, randomValue) + randomValue * 18.0);

    return point * visibility * twinkle;
  }

  float perspectiveGrid(vec2 uv, float time) {
    float bottomFade = smoothstep(0.02, 0.78, 1.0 - uv.y);
    float horizonFade = smoothstep(0.12, 0.46, uv.y);

    float depth = max(0.08, uv.y + 0.08);

    vec2 projected;
    projected.x = (uv.x - 0.5) / depth;
    projected.y = 1.0 / depth + time * 0.035;

    float verticalLines =
      1.0 -
      smoothstep(
        0.018,
        0.044,
        abs(fract(projected.x * 4.2) - 0.5)
      );

    float horizontalLines =
      1.0 -
      smoothstep(
        0.018,
        0.052,
        abs(fract(projected.y * 0.82) - 0.5)
      );

    return
      max(verticalLines, horizontalLines) *
      bottomFade *
      horizonFade;
  }

  float spotlight(
    vec2 uv,
    vec2 origin,
    vec2 direction,
    float width
  ) {
    vec2 relative = uv - origin;
    float along = dot(relative, direction);
    float side = abs(
      dot(relative, vec2(-direction.y, direction.x))
    );

    float beam =
      smoothstep(width, 0.0, side - along * 0.2) *
      smoothstep(-0.05, 0.18, along) *
      (1.0 - smoothstep(0.25, 1.35, along));

    return beam;
  }

  void main() {
    vec2 uv = vUv;

    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 centered = uv - 0.5;
    centered.x *= aspect;

    float time = uTime * uMotion;

    vec3 dark = vec3(0.006, 0.018, 0.012);
    vec3 color = dark;

    float upperGlow = softCircle(
      centered,
      vec2(0.0, 0.38),
      0.82,
      0.62
    );

    color += vec3(0.015, 0.065, 0.028) * upperGlow;

    float greenAurora = softCircle(
      centered,
      vec2(-0.56, 0.16),
      0.64,
      0.5
    );

    float cyanAurora = softCircle(
      centered,
      vec2(0.58, 0.12),
      0.68,
      0.52
    );

    float auroraNoise =
      noise21(
        centered * vec2(2.1, 3.4) +
        vec2(time * 0.025, -time * 0.012)
      );

    color +=
      vec3(0.20, 0.55, 0.055) *
      greenAurora *
      (0.26 + auroraNoise * 0.16);

    color +=
      vec3(0.02, 0.38, 0.48) *
      cyanAurora *
      (0.20 + auroraNoise * 0.13);

    float leftBeam = spotlight(
      uv,
      vec2(-0.05, 1.05),
      normalize(vec2(0.48, -1.0)),
      0.23
    );

    float rightBeam = spotlight(
      uv,
      vec2(1.05, 1.04),
      normalize(vec2(-0.46, -1.0)),
      0.23
    );

    color += vec3(0.28, 0.92, 0.20) * leftBeam * 0.075;
    color += vec3(0.08, 0.68, 0.88) * rightBeam * 0.065;

    float greenStars = starLayer(
      uv + vec2(time * 0.0025, -time * 0.006),
      34.0,
      time,
      0.77
    );

    float cyanStars = starLayer(
      uv + vec2(-time * 0.0018, time * 0.004),
      52.0,
      time + 3.7,
      0.86
    );

    color += vec3(0.62, 1.0, 0.28) * greenStars * 0.78;
    color += vec3(0.22, 0.86, 1.0) * cyanStars * 0.55;

    float grid = perspectiveGrid(uv, time);
    color += vec3(0.31, 0.88, 0.18) * grid * 0.17;

    float centerLine =
      1.0 -
      smoothstep(
        0.0015,
        0.0055,
        abs(uv.x - 0.5)
      );

    centerLine *= smoothstep(0.0, 0.34, 1.0 - uv.y);
    centerLine *= smoothstep(0.0, 0.24, uv.y);

    color += vec3(0.18, 0.48, 0.14) * centerLine * 0.11;

    float vignette =
      smoothstep(
        1.04,
        0.22,
        length(centered * vec2(0.82, 1.04))
      );

    color *= 0.46 + vignette * 0.72;

    float lowerShade = smoothstep(0.0, 0.42, uv.y);
    color *= mix(0.72, 1.0, lowerShade);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function ShaderScene() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const reducedMotion = useReducedMotion();
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMotion: { value: reducedMotion ? 0.18 : 1 },
      uResolution: {
        value: new THREE.Vector2(size.width, size.height),
      },
    }),
    [reducedMotion, size.height, size.width]
  );

  useFrame((state) => {
    const material = materialRef.current;

    if (!material) {
      return;
    }

    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uMotion.value = reducedMotion ? 0.18 : 1;
    material.uniforms.uResolution.value.set(
      state.size.width,
      state.size.height
    );
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />

      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export const StadiumBackground = memo(function StadiumBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#030605]"
    >
      <Canvas
        orthographic
        camera={{
          position: [0, 0, 1],
          zoom: 1,
        }}
        dpr={[1, 1.35]}
        gl={{
          alpha: false,
          antialias: false,
          depth: false,
          stencil: false,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#030605', 1);
        }}
      >
        <ShaderScene />
      </Canvas>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,transparent_0%,rgba(0,0,0,.08)_52%,rgba(0,0,0,.52)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/65" />
    </div>
  );
});
