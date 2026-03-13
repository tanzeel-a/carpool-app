'use client';

/**
 * PageLoader Component
 *
 * WebGL-based lighting wave animation for page loading
 * Inspired by Framer's Lighting Cursor effect
 */

import { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import loadingDotsAnimation from '../../public/assets/Loading Dots In Yellow.json';
import styles from './PageLoader.module.css';

interface PageLoaderProps {
  /** Minimum display time in ms */
  minDisplayTime?: number;
}

// Vertex shader
const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// Fragment shader - creates the lighting wave effect
const fragmentShaderSource = `
  precision highp float;

  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_speed;
  uniform float u_intensity;
  uniform float u_wave_scale;
  uniform vec3 u_base_color;
  uniform vec3 u_accent_color;

  // Rotation matrix
  mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  // Wave shape function
  float neuro_shape(vec2 uv, float time, float scale) {
    float result = 0.0;
    vec2 p = uv * scale;

    for (int i = 0; i < 12; i++) {
      p = rotate2d(0.4) * p;
      p += vec2(
        sin(p.y + time * 0.3 + float(i) * 0.5),
        cos(p.x + time * 0.2 + float(i) * 0.3)
      );
      result += sin(p.x + p.y + time * 0.1) * 0.5;
    }

    return result / 12.0;
  }

  void main() {
    vec2 uv = v_uv;
    vec2 center = vec2(0.5, 0.5);

    // Animate from center
    float time = u_time * u_speed;

    // Create wave pattern
    float wave = neuro_shape(uv, time, u_wave_scale);

    // Radial gradient from center
    float dist = length(uv - center);
    float radial = 1.0 - smoothstep(0.0, 0.8, dist);

    // Pulsing effect
    float pulse = 0.5 + 0.5 * sin(time * 2.0);

    // Color mixing
    vec3 color = mix(u_accent_color, u_base_color, wave * 0.5 + 0.5);
    color = mix(color, u_base_color * 1.5, pulse * 0.3);

    // Apply intensity and radial falloff
    float brightness = (wave * 0.5 + 0.5) * u_intensity * radial;
    brightness += pulse * 0.2 * radial;

    // Add glow effect
    float glow = exp(-dist * 3.0) * pulse * 0.5;
    color += u_base_color * glow;

    gl_FragColor = vec4(color * brightness, 1.0);
  }
`;

export default function PageLoader({ minDisplayTime = 800 }: PageLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });

    if (!gl) {
      console.warn('WebGL not supported, using fallback');
      return;
    }

    // Compile shaders
    const compileShader = (source: string, type: number): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Set up geometry (full screen quad)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const uniforms = {
      time: gl.getUniformLocation(program, 'u_time'),
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      speed: gl.getUniformLocation(program, 'u_speed'),
      intensity: gl.getUniformLocation(program, 'u_intensity'),
      waveScale: gl.getUniformLocation(program, 'u_wave_scale'),
      baseColor: gl.getUniformLocation(program, 'u_base_color'),
      accentColor: gl.getUniformLocation(program, 'u_accent_color'),
    };

    // Set static uniforms - golden theme matching the app
    gl.uniform1f(uniforms.speed, 1.2);
    gl.uniform1f(uniforms.intensity, 1.5);
    gl.uniform1f(uniforms.waveScale, 6.0);
    // Golden colors
    gl.uniform3f(uniforms.baseColor, 0.83, 0.69, 0.22); // #d4af37
    gl.uniform3f(uniforms.accentColor, 0.67, 0.54, 0.18); // #aa8a2e

    // Handle resize
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    // Animation loop
    const startTime = performance.now();
    const render = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      gl.uniform1f(uniforms.time, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  // Handle page load completion
  useEffect(() => {
    const handleLoad = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 500); // Match CSS transition duration
      }, remaining);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [minDisplayTime]);

  if (!isLoading) return null;

  return (
    <div className={`${styles.loader} ${isFading ? styles.fading : ''}`}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.content}>
        <div className={styles.logo}>CARPOOL</div>
        <div className={styles.tagline}>Quiet Commutes</div>
        <div className={styles.lottieContainer}>
          <Lottie
            animationData={loadingDotsAnimation}
            loop={true}
            className={styles.lottieAnimation}
          />
        </div>
      </div>
    </div>
  );
}
