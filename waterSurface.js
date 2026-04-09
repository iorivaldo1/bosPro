const vertexShader = `
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            varying float vHeight;
            uniform float u_time;
            
            #define MOD3 vec3(.1031,.11369,.13787)
            
            vec3 hash33(vec3 p3) {
                p3 = fract(p3 * MOD3);
                p3 += dot(p3, p3.yxz + 19.19);
                return -1.0 + 2.0 * fract(vec3((p3.x+p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
            }

            float PerlinNoise(vec3 p){
                vec3 i = floor(p);
                vec3 f = p - i;
                vec3 w = f * f * (3.0 - 2.0 * f);

                return mix(
                    mix(
                        mix(dot(f - vec3(0,0,0), hash33(i + vec3(0,0,0))),
                            dot(f - vec3(1,0,0), hash33(i + vec3(1,0,0))), w.x),
                        mix(dot(f - vec3(0,0,1), hash33(i + vec3(0,0,1))),
                            dot(f - vec3(1,0,1), hash33(i + vec3(1,0,1))), w.x),
                        w.z),
                    mix(
                        mix(dot(f - vec3(0,1,0), hash33(i + vec3(0,1,0))),
                            dot(f - vec3(1,1,0), hash33(i + vec3(1,1,0))), w.x),
                        mix(dot(f - vec3(0,1,1), hash33(i + vec3(0,1,1))),
                            dot(f - vec3(1,1,1), hash33(i + vec3(1,1,1))), w.x),
                        w.z),
                    w.y);                
            }
            
            // [1] FBM for wave displacement - 4 octaves as suggested
            float fbm(vec3 p) {
                float f = 0.0;
                f += 0.5000 * PerlinNoise(p); p *= 2.01;
                f += 0.2500 * PerlinNoise(p); p *= 2.02;
                f += 0.1250 * PerlinNoise(p); p *= 2.03;
                f += 0.0625 * PerlinNoise(p);
                return f / 0.9375;
            }
            
            void main() {
                vUv = uv;
                
                vec3 pos = position;
                
                // [1] Vertical displacement with animated perlin noise
                float windDirection = 0.3;
                vec3 windOffset = vec3(cos(windDirection), 0.0, sin(windDirection)) * u_time * 0.5;
                
                float height = fbm(vec3(pos.x * 0.3, pos.y * 0.3, 0.0) + windOffset) * 2.5;
                
                // [1] Horizontal displacement proportional to height for choppy waves
                float horizontalScale = 0.3;
                pos.x += height * horizontalScale * cos(windDirection);
                pos.y += height * horizontalScale * sin(windDirection);
                
                // Apply vertical displacement
                pos.z += height;
                
                vHeight = height;
                vPosition = pos;
                vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
                
                // Calculate normals using partial derivatives
                float eps = 0.05;
                float hL = fbm(vec3((position.x - eps) * 0.3, position.y * 0.3, 0.0) + windOffset) * 2.5;
                float hR = fbm(vec3((position.x + eps) * 0.3, position.y * 0.3, 0.0) + windOffset) * 2.5;
                float hD = fbm(vec3(position.x * 0.3, (position.y - eps) * 0.3, 0.0) + windOffset) * 2.5;
                float hU = fbm(vec3(position.x * 0.3, (position.y + eps) * 0.3, 0.0) + windOffset) * 2.5;
                
                vec3 tangent = normalize(vec3(2.0 * eps, 0.0, hR - hL));
                vec3 bitangent = normalize(vec3(0.0, 2.0 * eps, hU - hD));
                vNormal = normalize(cross(tangent, bitangent));
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `;

const fs1 = `
            #define MOD3 vec3(.1031,.11369,.13787)
            
            varying vec2 vUv;
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            varying float vHeight;
            
            uniform vec2 u_mouse;
            uniform float u_time;

            vec3 hash33(vec3 p3) {
                p3 = fract(p3 * MOD3);
                p3 += dot(p3, p3.yxz + 19.19);
                return -1.0 + 2.0 * fract(vec3((p3.x+p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
            }

            float PerlinNoise(vec3 p){
                vec3 i = floor(p);
                vec3 f = p - i;
                vec3 w = f * f * (3.0 - 2.0 * f);

                return mix(
                    mix(
                        mix(dot(f - vec3(0,0,0), hash33(i + vec3(0,0,0))),
                            dot(f - vec3(1,0,0), hash33(i + vec3(1,0,0))), w.x),
                        mix(dot(f - vec3(0,0,1), hash33(i + vec3(0,0,1))),
                            dot(f - vec3(1,0,1), hash33(i + vec3(1,0,1))), w.x),
                        w.z),
                    mix(
                        mix(dot(f - vec3(0,1,0), hash33(i + vec3(0,1,0))),
                            dot(f - vec3(1,1,0), hash33(i + vec3(1,1,0))), w.x),
                        mix(dot(f - vec3(0,1,1), hash33(i + vec3(0,1,1))),
                            dot(f - vec3(1,1,1), hash33(i + vec3(1,1,1))), w.x),
                        w.z),
                    w.y);                
            }
            
            // [2] Animated FBM for normal map detail - 4 octaves
            float fbm(vec3 p) {
                float f = 0.0;
                f += 0.5000 * PerlinNoise(p); p *= 2.01;
                f += 0.2500 * PerlinNoise(p); p *= 2.02;
                f += 0.1250 * PerlinNoise(p); p *= 2.03;
                f += 0.0625 * PerlinNoise(p);
                return f / 0.9375;
            }
            
            // [6] Calculate normal from fbm for extra detail
            vec3 calcNormal(vec3 p, float eps) {
                float h = fbm(p);
                float hx = fbm(p + vec3(eps, 0.0, 0.0));
                float hy = fbm(p + vec3(0.0, eps, 0.0));
                return normalize(vec3(h - hx, h - hy, eps));
            }
            
            // [3] Simple sky cubemap approximation
            vec3 getSkyColor(vec3 rd) {
                float sun = max(dot(rd, normalize(vec3(0.8, 0.4, 0.2))), 0.0);
                vec3 sky = mix(vec3(0.3, 0.5, 0.8), vec3(0.7, 0.8, 0.95), rd.z * 0.5 + 0.5);
                sky += vec3(1.0, 0.8, 0.5) * pow(sun, 32.0);
                sky += vec3(1.0, 0.9, 0.7) * pow(sun, 256.0);
                return sky;
            }

            void main(){
                vec3 pos = vPosition;
                vec3 normal = normalize(vNormal);
                
                // Camera/eye position (above water, looking at it)
                vec3 camPos = vec3(0.0, 0.0, 60.0);
                vec3 E = normalize(camPos - vWorldPosition); // Eye vector
                
                // [6] Add animated fbm detail to normal map
                float windDirection = 0.3;
                vec3 windOffset = vec3(cos(windDirection), sin(windDirection), 0.0) * u_time * 0.5;
                vec3 detailNormal = calcNormal(vec3(pos.x * 2.0, pos.y * 2.0, u_time * 0.3) + windOffset, 0.01);
                
                // Blend mesh normal with detail normal
                vec3 N = normalize(normal + detailNormal * 0.5);
                
                // [7] Diffuse lighting - N·L
                vec3 sunDir = normalize(vec3(0.8, 0.4, 0.6));
                float NdotL = max(dot(N, sunDir), 0.0);
                float diffuse = NdotL;
                
                // [8] Base water color - blue/green blend based on N·E (subsurface scattering)
                float NdotE = max(dot(N, E), 0.0);
                vec3 deepBlue = vec3(0.0, 0.05, 0.2);
                vec3 shallowGreen = vec3(0.0, 0.3, 0.3);
                vec3 waterColor = mix(shallowGreen, deepBlue, NdotE);
                waterColor *= (0.5 + 0.5 * diffuse);
                
                // [9] Fresnel term - more reflection at grazing angles
                float fresnel = pow(1.0 - NdotE, 4.0);
                fresnel = mix(0.04, 1.0, fresnel); // F0 for water ~0.04
                
                // Add white color modulated by fresnel (foam-like highlights)
                waterColor += vec3(1.0) * fresnel * 0.1;
                
                // [9] Reflection from sky cubemap
                vec3 R = reflect(-E, N);
                vec3 skyReflection = getSkyColor(R);
                waterColor = mix(waterColor, skyReflection, fresnel * 0.8);
                
                // [10] Sun specular reflection
                vec3 H = normalize(sunDir + E);
                float spec = pow(max(dot(N, H), 0.0), 256.0);
                vec3 sunColor = vec3(1.0, 0.95, 0.8);
                waterColor += sunColor * spec * 2.0;
                
                // [13] Foam on wave tops based on height and slope
                float slope = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));
                float foamFactor = smoothstep(0.5, 1.5, vHeight) * smoothstep(0.2, 0.8, slope);
                
                // Animated foam texture
                float foamNoise = fbm(vec3(pos.x * 3.0, pos.y * 3.0, u_time * 0.5) + windOffset * 2.0);
                foamNoise = smoothstep(0.3, 0.8, foamNoise);
                vec3 foamColor = vec3(0.9, 0.95, 1.0);
                waterColor = mix(waterColor, foamColor, foamFactor * foamNoise * 0.6);
                
                // [14] Rain drop splashes (optional, subtle effect)
                float rain = PerlinNoise(vec3(pos.x * 10.0, pos.y * 10.0, u_time * 5.0));
                rain = smoothstep(0.7, 0.8, rain);
                // waterColor += vec3(1.0) * rain * 0.05;
                
                // Add some depth fog for distant areas
                float dist = length(vWorldPosition.xy);
                float fog = 1.0 - exp(-dist * 0.02);
                vec3 fogColor = vec3(0.5, 0.6, 0.7);
                // waterColor = mix(waterColor, fogColor, fog * 0.3);
                
                // Tone mapping and gamma correction
                // waterColor = waterColor / (waterColor + vec3(1.0));
                // waterColor = pow(waterColor, vec3(1.0 / 2.2));

                gl_FragColor = vec4(waterColor, 1.0);
            }
        `;


