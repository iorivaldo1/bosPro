const vs1 = `
            varying vec2 vUv;
            varying vec3 vPosition;
            void main() {
                vUv = uv;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;


const vs2 = `
            varying vec2 vUv;
            varying vec3 vPosition;
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

                // 添加时间参数让水面随时间波动
                float height = fbm(vec3(pos.x * 0.3, pos.y * 0.3, u_time * 0.1 )) * 2.5;
                pos.z += height;
                
                vPosition = pos; // 传递变形后的位置

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `;

const vs3 = `
            varying vec2 vUv;
            varying vec3 vPosition;
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
            
            void main() {
                vUv = uv;
                vec3 pos = position;

                // 参照 fs3 的方式手动叠加不同频率的 Perlin 噪声
                vec3 p = vec3(uv, u_time * 0.05) * 8.0;
                float n = 1.0 + PerlinNoise(p);
                
                // 叠加不同频率的噪声，类似 fs3 的 Worley 叠加方式
                n += 0.5 * PerlinNoise(p * 2.0);
                n += 0.25 * PerlinNoise(p * 4.0);
                
                float height = n * 0.1;
                pos.z += height;
                
                vPosition = pos; // 传递变形后的位置

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `;


const fs1 = `
            #define MOD3 vec3(.1031,.11369,.13787)
            varying vec2 vUv;
            varying vec3 vPosition;
            uniform vec2 u_mouse;
            uniform float u_time;

            vec2 Hash(vec2 uv){
                return fract(cos(uv*mat2(-64.2,71.3,81.4,-29.8))*8321.3);
            }

            float Worley(vec2 uv){
                vec2 p = floor(uv);
                vec2 f = fract(uv);

                float minDist = 1.0;
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = Hash(neighbor + p);
                        float dist = distance(point + neighbor, f);
                        if( dist < minDist ) {
                            minDist = dist;
                        }
                    }
                }
                return 1.0 - minDist;
            }

            vec3 hash33(vec3 p3) {
                p3 = fract(p3 * MOD3);
                p3 += dot(p3, p3.yxz + 19.19);
                return -1.0 + 2.0 * fract(vec3((p3.x+p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
            }

            float PerlinNoise(vec3 p){
                vec3 i = floor(p);
                vec3 f = p-i;

                vec3 w = f*f*(3.0-2.0*f);


                return mix(

                        mix(
                            mix(
                                dot(f - vec3(0,0,0),hash33(i + vec3(0,0,0))),
                                dot(f - vec3(1,0,0),hash33(i + vec3(1,0,0))),
                                w.x
                            ),
                            mix(
                                dot(f - vec3(0,0,1),hash33(i + vec3(0,0,1))),
                                dot(f - vec3(1,0,1),hash33(i + vec3(1,0,1))),
                                w.x
                            ),
                            w.z
                        ),
                        mix(
                            mix(
                                dot(f - vec3(0,1,0),hash33(i + vec3(0,1,0))),
                                dot(f - vec3(1,1,0),hash33(i + vec3(1,1,0))),
                                w.x
                            ),
                            mix(
                                dot(f - vec3(0,1,1),hash33(i + vec3(0,1,1))),
                                dot(f - vec3(1,1,1),hash33(i + vec3(1,1,1))),
                                w.x
                            ),
                            w.z
                        ),
                        w.y
                );                
            }



            void main(){

                vec2 p = vUv;
                float n = 1.0 + PerlinNoise(vec3(p, u_time * 0.05) * 8.0);
                
                n *= (1.0+(Worley(p.xy*16.0)+ 0.5*Worley(2.0*p.xy*16.0)+ 0.25*Worley(4.0*p.xy*16.0)));

                vec3 color = vec3(n);

                gl_FragColor = vec4(color/4.0, 1.0);

            }
        `;

const fs2 = `
            #define MOD3 vec3(.1031,.11369,.13787)
            varying vec2 vUv;
            varying vec3 vPosition;
            uniform vec2 u_mouse;
            uniform float u_time;

            vec2 Hash(vec2 uv){
                return fract(cos(uv*mat2(-64.2,71.3,81.4,-29.8))*8321.3);
            }

            float Worley(vec2 uv){
                vec2 p = floor(uv);
                vec2 f = fract(uv);

                float minDist = 1.0;
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = Hash(neighbor + p);
                        float dist = distance(point + neighbor, f);
                        if( dist < minDist ) {
                            minDist = dist;
                        }
                    }
                }
                return 1.0 - minDist;
            }

            vec3 hash33(vec3 p3) {
                p3 = fract(p3 * MOD3);
                p3 += dot(p3, p3.yxz + 19.19);
                return -1.0 + 2.0 * fract(vec3((p3.x+p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
            }

            float PerlinNoise(vec3 p){
                vec3 i = floor(p);
                vec3 f = p-i;

                vec3 w = f*f*(3.0-2.0*f);

                return mix(
                        mix(
                            mix(
                                dot(f - vec3(0,0,0),hash33(i + vec3(0,0,0))),
                                dot(f - vec3(1,0,0),hash33(i + vec3(1,0,0))),
                                w.x
                            ),
                            mix(
                                dot(f - vec3(0,0,1),hash33(i + vec3(0,0,1))),
                                dot(f - vec3(1,0,1),hash33(i + vec3(1,0,1))),
                                w.x
                            ),
                            w.z
                        ),
                        mix(
                            mix(
                                dot(f - vec3(0,1,0),hash33(i + vec3(0,1,0))),
                                dot(f - vec3(1,1,0),hash33(i + vec3(1,1,0))),
                                w.x
                            ),
                            mix(
                                dot(f - vec3(0,1,1),hash33(i + vec3(0,1,1))),
                                dot(f - vec3(1,1,1),hash33(i + vec3(1,1,1))),
                                w.x
                            ),
                            w.z
                        ),
                        w.y
                );                
            }

            void main(){
                vec2 p = vUv;
                float n = 1.0 + PerlinNoise(vec3(p, u_time * 0.05) * 8.0);
                
                n *= (1.0+(Worley(p.xy*16.0)+ 0.5*Worley(2.0*p.xy*16.0)+ 0.25*Worley(4.0*p.xy*16.0)));

                vec3 color = vec3(n);


                gl_FragColor = vec4(color/4.0, 1.0);
            }
        `;


const fs3 = `
            #define MOD3 vec3(.1031,.11369,.13787)
            varying vec2 vUv;
            varying vec3 vPosition;
            uniform vec2 u_mouse;
            uniform float u_time;

            vec2 Hash(vec2 uv){
                return fract(cos(uv*mat2(-64.2,71.3,81.4,-29.8))*8321.3);
            }

            float Worley(vec2 uv){
                vec2 p = floor(uv);
                vec2 f = fract(uv);

                float minDist = 1.0;
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = Hash(neighbor + p);
                        float dist = distance(point + neighbor, f);
                        if( dist < minDist ) {
                            minDist = dist;
                        }
                    }
                }
                return 1.0 - minDist;
            }

            vec3 hash33(vec3 p3) {
                p3 = fract(p3 * MOD3);
                p3 += dot(p3, p3.yxz + 19.19);
                return -1.0 + 2.0 * fract(vec3((p3.x+p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
            }

            float PerlinNoise(vec3 p){
                vec3 i = floor(p);
                vec3 f = p-i;

                vec3 w = f*f*(3.0-2.0*f);

                return mix(
                        mix(
                            mix(
                                dot(f - vec3(0,0,0),hash33(i + vec3(0,0,0))),
                                dot(f - vec3(1,0,0),hash33(i + vec3(1,0,0))),
                                w.x
                            ),
                            mix(
                                dot(f - vec3(0,0,1),hash33(i + vec3(0,0,1))),
                                dot(f - vec3(1,0,1),hash33(i + vec3(1,0,1))),
                                w.x
                            ),
                            w.z
                        ),
                        mix(
                            mix(
                                dot(f - vec3(0,1,0),hash33(i + vec3(0,1,0))),
                                dot(f - vec3(1,1,0),hash33(i + vec3(1,1,0))),
                                w.x
                            ),
                            mix(
                                dot(f - vec3(0,1,1),hash33(i + vec3(0,1,1))),
                                dot(f - vec3(1,1,1),hash33(i + vec3(1,1,1))),
                                w.x
                            ),
                            w.z
                        ),
                        w.y
                );                
            }

            void main(){
                vec2 p = vUv;
                float n = 1.0 + PerlinNoise(vec3(p, u_time * 0.05) * 8.0);
                
                n *= (1.0+(Worley(p.xy*16.0)+ 0.5*Worley(2.0*p.xy*16.0)+ 0.25*Worley(4.0*p.xy*16.0)));

                vec3 color = vec3(n);


                gl_FragColor = vec4(color/4.0, 1.0);
            }
        `;