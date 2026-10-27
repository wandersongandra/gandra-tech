/** GLSL para a simulação de tinta (WebGL1, precision mediump).
 *  Velocity / pressure / divergence usam encode half-range (v*0.5+0.5)
 *  porque os FBOs são RGBA8 unsigned. Dye (densidade) fica em [0,1] puro.
 */

export const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

export const ADVECT = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_velocity;
uniform sampler2D u_source;
uniform vec2 u_texel;
uniform float u_dt;
uniform float u_dissipation;
uniform float u_signed; // 1.0 = source é velocity (encode); 0.0 = dye
void main(){
  vec2 vel = texture2D(u_velocity, v_uv).xy * 2.0 - 1.0;
  vec2 coord = v_uv - u_dt * vel * u_texel;
  vec4 src = texture2D(u_source, coord);
  if (u_signed > 0.5) {
    vec2 v = (src.xy * 2.0 - 1.0) * u_dissipation;
    gl_FragColor = vec4(v * 0.5 + 0.5, 0.0, 1.0);
  } else {
    gl_FragColor = u_dissipation * src;
  }
}`

export const DIVERGENCE = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_velocity;
uniform vec2 u_texel;
void main(){
  float L = texture2D(u_velocity, v_uv - vec2(u_texel.x, 0.0)).x * 2.0 - 1.0;
  float R = texture2D(u_velocity, v_uv + vec2(u_texel.x, 0.0)).x * 2.0 - 1.0;
  float B = texture2D(u_velocity, v_uv - vec2(0.0, u_texel.y)).y * 2.0 - 1.0;
  float T = texture2D(u_velocity, v_uv + vec2(0.0, u_texel.y)).y * 2.0 - 1.0;
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div * 0.5 + 0.5, 0.0, 0.0, 1.0);
}`

export const PRESSURE = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_pressure;
uniform sampler2D u_divergence;
uniform vec2 u_texel;
void main(){
  float L = texture2D(u_pressure, v_uv - vec2(u_texel.x, 0.0)).x * 2.0 - 1.0;
  float R = texture2D(u_pressure, v_uv + vec2(u_texel.x, 0.0)).x * 2.0 - 1.0;
  float B = texture2D(u_pressure, v_uv - vec2(0.0, u_texel.y)).x * 2.0 - 1.0;
  float T = texture2D(u_pressure, v_uv + vec2(0.0, u_texel.y)).x * 2.0 - 1.0;
  float C = texture2D(u_divergence, v_uv).x * 2.0 - 1.0;
  float p = (L + R + B + T - C) * 0.25;
  gl_FragColor = vec4(p * 0.5 + 0.5, 0.0, 0.0, 1.0);
}`

export const GRADIENT = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_pressure;
uniform sampler2D u_velocity;
uniform vec2 u_texel;
void main(){
  float L = texture2D(u_pressure, v_uv - vec2(u_texel.x, 0.0)).x * 2.0 - 1.0;
  float R = texture2D(u_pressure, v_uv + vec2(u_texel.x, 0.0)).x * 2.0 - 1.0;
  float B = texture2D(u_pressure, v_uv - vec2(0.0, u_texel.y)).x * 2.0 - 1.0;
  float T = texture2D(u_pressure, v_uv + vec2(0.0, u_texel.y)).x * 2.0 - 1.0;
  vec2 v = texture2D(u_velocity, v_uv).xy * 2.0 - 1.0;
  v -= vec2(R - L, T - B);
  gl_FragColor = vec4(v * 0.5 + 0.5, 0.0, 1.0);
}`

export const SPLAT = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_target;
uniform vec3 u_color;
uniform vec2 u_point;
uniform float u_radius;
uniform float u_aspect;
uniform float u_signed; // 1.0 = velocity (encode); 0.0 = dye
void main(){
  vec2 p = v_uv - u_point.xy;
  p.x *= u_aspect;
  float d = exp(-dot(p, p) / u_radius);
  vec3 base = texture2D(u_target, v_uv).xyz;
  if (u_signed > 0.5) {
    vec2 bv = base.xy * 2.0 - 1.0;
    vec2 add = u_color.xy * d;
    vec2 outv = bv + add;
    gl_FragColor = vec4(outv * 0.5 + 0.5, 0.0, 1.0);
  } else {
    gl_FragColor = vec4(base + d * u_color, 1.0);
  }
}`

export const DISPLAY = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_density;
uniform vec2 u_res;
uniform float u_time;
uniform float u_grain;
// paper #ece8df, ink #12110e, signal #e5401a
vec3 paper = vec3(0.925, 0.910, 0.875);
vec3 ink = vec3(0.071, 0.067, 0.055);
vec3 signal = vec3(0.898, 0.251, 0.102);

float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main(){
  vec4 d = texture2D(u_density, v_uv);
  float dens = clamp(d.r * 1.15 + d.g * 0.55 + d.b * 0.25, 0.0, 1.4);
  float accent = clamp(d.g * 1.4 - d.r * 0.2, 0.0, 1.0);
  // multiply-like soak into paper
  vec3 col = mix(paper, ink, smoothstep(0.02, 0.95, dens));
  col = mix(col, signal, smoothstep(0.05, 0.8, accent) * 0.85);
  // soft feather at edges of blot
  float edge = smoothstep(0.0, 0.12, dens) * (1.0 - smoothstep(0.75, 1.25, dens));
  col = mix(col, ink * 0.85 + signal * 0.15, edge * 0.08);
  // paper grain
  float g = (hash(v_uv * u_res + u_time * 0.02) - 0.5) * u_grain;
  col += g;
  float a = smoothstep(0.01, 0.22, dens + accent * 0.5);
  gl_FragColor = vec4(col, a * 0.92);
}`
