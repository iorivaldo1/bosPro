const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

const fragmentShader1 = `
            varying vec2 vUv;

            float random (vec2 vUv){
                return fract(sin(dot(vUv.xy, vec2(12.9898,78.233))) * 43758.5453);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                float a = random(ipos);
                float b = random(ipos + vec2(1.0,0.0));
                float c = random(ipos + vec2(0.0,1.0));
                float d = random(ipos + vec2(1.0,1.0));
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);

                //mix(a, b, u.x):底边插值
                //(c - a)* u.y * (1.0 - u.x):左边插值,(1.0 - u.x)是靠左的权重
                //(d - b) * u.x * u.y:右边插值,u.x是靠右的权重
                return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) +  (d - b) * u.x * u.y;
            }

            float fbm(vec2 uv) {
                float value = 0.0;
                float amplitude = 0.5;
                
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise(uv);
                    uv *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }


            void main(){
                vec2 uv = vUv  ;
                uv *= 10.0;

                // float n = noise(uv * 10.0);
                
                // float n = fbm(uv)*0.5 + 0.5;

                uv += vec2(fbm(uv + vec2(1.0,0.0)), fbm(uv + vec2(0.0,1.0)));
                float n = fbm(uv)*0.5 + 0.5;

                vec3 color = vec3(smoothstep(0.2, 0.75, n));
                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fragmentShader2 = `
            #define PI 3.14159265359

            varying vec2 vUv;
            uniform float u_time;

                  float random(vec2 p){
                return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);

                float a = random(ipos);
                float b = random(ipos + vec2(1.0,0.0));
                float c = random(ipos + vec2(0.0,1.0));
                float d = random(ipos + vec2(1.0,1.0));

                vec2 u = fpos*fpos*(3.0-2.0*fpos);

                return mix(a, b, u.x) +
                    (c - a)* u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
            }


            float softRect(vec2 uv, vec2 center, vec2 size, float blur){
                vec2 d = abs(uv - center) - size;
                float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
                return smoothstep(blur, -blur, dist);
            }

            float softRectNoise(vec2 uv, vec2 center, vec2 size, float blur){
                vec2 p = uv - center;

                // 🔥 边缘噪声（低频 + 高频）
                float n1 = noise(uv * 8.0);
                float n2 = noise(uv * 20.0);

                float edgeNoise = (n1 * 0.6 + n2 * 0.4 - 0.5) * 0.08;

                // 标准 SDF
                vec2 d = abs(p) - size;

                float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);

                // 🔥 扰动边界
                dist += edgeNoise;

                return smoothstep(blur, -blur, dist);
            }


            void main(){
                vec2 uv = vUv;

                float n = noise(uv * 6.0);

                vec3 bg = vec3(0.15, 0.05, 0.02) + n * 0.1;
                vec3 color = bg;

                float r1 = softRectNoise(uv, vec2(0.2, 0.5), vec2(0.15, 0.4), 0.08);
                vec3 col1 = vec3(0.6, 0.05, 0.05);

                float r2 = softRectNoise(uv, vec2(0.45, 0.5), vec2(0.18, 0.42), 0.08);
                vec3 col2 = vec3(0.1, 0.2, 0.02);

                float r3 = softRect(uv, vec2(0.75, 0.5), vec2(0.15, 0.4), 0.08);
                vec3 col3 = vec3(0.9, 0.75, 0.5);

                // 给每个块加“画布噪声”
                float n1 = noise(uv * 20.0);
                float n2 = noise(uv * 15.0);
                float n3 = noise(uv * 25.0);

                col1 += n1 * 0.08;
                col2 += n2 * 0.06;
                col3 += n3 * 0.05;

                color = mix(color, col1, r1);
                color = mix(color, col2, r2);
                color = mix(color, col3, r3);

                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader3 = `
            #define PI 3.14159265359
            #define TWO_PI 6.28318530718
            varying vec2 vUv;
            uniform float u_time;

            float random (float x){
                return fract(sin(x) * 10000.0);
            }

            float random(vec2 p){
                return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);

                float a = random(ipos);
                float b = random(ipos + vec2(1.0,0.0));
                float c = random(ipos + vec2(0.0,1.0));
                float d = random(ipos + vec2(1.0,1.0));

                vec2 u = fpos*fpos*(3.0-2.0*fpos);

                return mix(a, b, u.x) +
                    (c - a)* u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
            }
            
            float geometrySDF(vec2 uv,float dis){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 5;
                float r = TWO_PI/float(N);
                float uvDis = cos(floor(0.5 + a/r)*r - a) * length(p);

                float n1 = noise(uv * 8.0);
                float n2 = noise(uv * 20.0);

                // float edgeNoise = (n1 * 0.6 + n2 * 0.4 - 0.5) *( 2.0+ sin(u_time *0.5))*0.2;
                float edgeNoise = (n1 * 0.6 + n2 * 0.4 - 0.5)*0.2;
                uvDis += edgeNoise;

                return smoothstep(dis + 0.01, dis, uvDis);
            }

            void main(){
                vec2 pos = vUv * 2.0 - 1.0;
                float geo =geometrySDF(pos,0.6);
               
                gl_FragColor = vec4(vec3(geo), 1.0);
            }
        `;

const fragmentShader4 = `
            #define PI 3.14159265359
            #define TWO_PI 6.28318530718
            varying vec2 vUv;
            uniform float u_time;

            float random (float x){
                return fract(sin(x) * 10000.0);
            }

            float random(vec2 p){
                return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);

                float a = random(ipos);
                float b = random(ipos + vec2(1.0,0.0));
                float c = random(ipos + vec2(0.0,1.0));
                float d = random(ipos + vec2(1.0,1.0));

                vec2 u = fpos*fpos*(3.0-2.0*fpos);

                return mix(a, b, u.x) +
                    (c - a)* u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
            }
            
            float geometrySDF(vec2 uv,float dis){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 5;
                float r = TWO_PI/float(N);
                float uvDis = cos(floor(0.5 + a/r)*r - a) * length(p);

                float n1 = noise(uv * 8.0);
                float n2 = noise(uv * 20.0);

                // float edgeNoise = (n1 * 0.6 + n2 * 0.4 - 0.5) *( 2.0+ sin(u_time *0.5))*0.2;
                float edgeNoise = (n1 * 0.6 + n2 * 0.4 - 0.5)*0.2*(sin(u_time * 0.5) + 1.5);
                uvDis += edgeNoise;

                return smoothstep(dis + 0.01, dis, uvDis);
            }

            void main(){
                vec2 pos = vUv * 2.0 - 1.0;
                float geo =geometrySDF(pos,0.6);
               
                gl_FragColor = vec4(vec3(geo), 1.0);
            }
        `;

const fragmentShader5 = `
            #define PI 3.14159265359
            #define TWO_PI 6.28318530718
            varying vec2 vUv;
            uniform float u_time;

            float random (float x){
                return fract(sin(x) * 10000.0);
            }

            float random(vec2 p){
                return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);

                float a = random(ipos);
                float b = random(ipos + vec2(1.0,0.0));
                float c = random(ipos + vec2(0.0,1.0));
                float d = random(ipos + vec2(1.0,1.0));

                vec2 u = fpos*fpos*(3.0-2.0*fpos);

                return mix(a, b, u.x) +
                    (c - a)* u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
            }
            
            float geometrySDF(vec2 uv,float dis){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 8;
                float r = TWO_PI/float(N);
                float uvDis = cos(floor(0.5 + a/r)*r - a) * length(p);

                // 👇 当前属于哪条边
                float edgeId = floor(0.5 + a / r);

                // 👇 每条边一个随机值
                float edgeRand = random(edgeId);

                // 👇 随机方向
                float angle = edgeRand * TWO_PI;
                vec2 flowDir = vec2(cos(angle), sin(angle));

                // 👇 随机速度
                float speed = mix(0.02, 0.1, edgeRand);

                // 👇 flow
                vec2 flow = flowDir * u_time * speed;

                // 👇 noise
                float n1 = noise((uv + flow) * 8.0);
                float n2 = noise((uv + flow) * 20.0);

                // float edgeNoise = (n1 * 0.6 + n2 * 0.4 - 0.5) *( 2.0+ sin(u_time *0.5))*0.2;
                float edgeNoise = (n1 * 0.6 + n2 * 0.4 - 0.5)*0.2*(sin(u_time * 0.5)*0.1 + 2.5);
                uvDis += edgeNoise;

                return smoothstep(dis + 0.01, dis, uvDis);
            }

            void main(){
                vec2 pos = vUv * 2.0 - 1.0;
                float geo =geometrySDF(pos,0.6);
               
                gl_FragColor = vec4(vec3(geo), 1.0);
            }
        `;

const fragmentShader6 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            float random (vec2 vUv){
                return fract(sin(dot(vUv.xy, vec2(12.9898,78.233))) * 43758.5453);
            }

            float geometrySDF(vec2 uv,float dis){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 5;
                float r = TWO_PI/float(N);
                float uvDis = cos(floor(0.5 + a/r)*r - a) * length(p);

                return smoothstep(dis + 0.01, dis, uvDis);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                float a = random(ipos);
                float b = random(ipos + vec2(1.0,0.0));
                float c = random(ipos + vec2(0.0,1.0));
                float d = random(ipos + vec2(1.0,1.0));
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);

                return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) +  (d - b) * u.x * u.y;
            }

            void main(){
                vec2 pos = vec2(vUv * 2.0) - 1.0;
                pos = pos + noise(pos) * 0.5;
                float geo = geometrySDF(pos,0.6);

                gl_FragColor = vec4(vec3(geo), 1.0);
            }
        `;

const fragmentShader7 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            float random (vec2 vUv){
                return -1.0 + 2.0 *fract(sin(dot(vUv.xy, vec2(12.9898,78.233))) * 43758.5453);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);

                return mix(mix(random(ipos + vec2(0.0, 0.0)),random(ipos + vec2(1.0, 0.0)), u.x), mix(random(ipos + vec2(0.0, 1.0)), random(ipos + vec2(1.0, 1.0)), u.x), u.y);
            }

            float fbm(vec2 uv) {
                float value = 0.0;
                float amplitude = 0.5;
                
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise(uv);
                    uv *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main(){
                vec2 uv = vUv  ;
                uv *= 3.0;

                // float n = noise(uv * 10.0);
                
                // float n = fbm(uv)*0.5 + 0.5;

                uv += vec2(fbm(uv + vec2(1.0,0.0)), fbm(uv + vec2(0.0,1.0)));
                float n = fbm(uv)*0.5 + 0.5;

                vec3 color = vec3(smoothstep(0.2, 0.75, n));
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader8 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return -1.0 + 2.0*fract(sin(vUv)*43758.5453123);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);
                return mix(mix(dot(random(ipos + vec2(0.0, 0.0)), fpos - vec2(0.0, 0.0)),
                               dot(random(ipos + vec2(1.0, 0.0)), fpos - vec2(1.0, 0.0)), u.x),
                           mix(dot(random(ipos + vec2(0.0, 1.0)), fpos - vec2(0.0, 1.0)),
                               dot(random(ipos + vec2(1.0, 1.0)), fpos - vec2(1.0, 1.0)), u.x), u.y);
            }

            float fbm(vec2 uv) {
                float value = 0.0;
                float amplitude = 0.5;
                
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise(uv);
                    uv *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main(){
                vec2 uv = vUv  ;
                uv *= 3.0;

                // float n = noise(uv * 10.0);
                
                // float n = fbm(uv)*0.5 + 0.5;

                uv += vec2(fbm(uv + vec2(1.0,0.0)), fbm(uv + vec2(0.0,1.0)));
                float n = fbm(uv)*0.5 + 0.5;

                vec3 color = vec3(smoothstep(0.2, 0.75, n));
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader9 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return -1.0 + 2.0*fract(sin(vUv)*43758.5453123);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);
                return mix(mix(dot(random(ipos + vec2(0.0, 0.0)), fpos - vec2(0.0, 0.0)),
                               dot(random(ipos + vec2(1.0, 0.0)), fpos - vec2(1.0, 0.0)), u.x),
                           mix(dot(random(ipos + vec2(0.0, 1.0)), fpos - vec2(0.0, 1.0)),
                               dot(random(ipos + vec2(1.0, 1.0)), fpos - vec2(1.0, 1.0)), u.x), u.y);
            }

            float geometrySDF(vec2 uv,float dis){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 5;
                float r = TWO_PI/float(N);
                float uvDis = cos(floor(0.5 + a/r)*r - a) * length(p);

                float n1 = noise(uv * 8.0);
                float n2 = noise(uv * 20.0);

                float edgeNoise = (n1 * 0.6 + n2 * 0.4 - 0.5)*0.2;
                uvDis += edgeNoise;

                return smoothstep(dis + 0.01, dis, uvDis);
            }


            void main(){
                vec2 pos = vec2(vUv * 2.0) - 1.0;
                float geo = geometrySDF(pos,0.6);

                gl_FragColor = vec4(vec3(geo), 1.0);
            }
        `;

const fragmentShader10 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return -1.0 + 2.0*fract(sin(vUv)*43758.5453123);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);
                return mix(mix(dot(random(ipos + vec2(0.0, 0.0)), fpos - vec2(0.0, 0.0)),
                               dot(random(ipos + vec2(1.0, 0.0)), fpos - vec2(1.0, 0.0)), u.x),
                           mix(dot(random(ipos + vec2(0.0, 1.0)), fpos - vec2(0.0, 1.0)),
                               dot(random(ipos + vec2(1.0, 1.0)), fpos - vec2(1.0, 1.0)), u.x), u.y);
            }

            float geometrySDF(vec2 uv,float dis){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 5;
                float r = TWO_PI/float(N);
                float uvDis = cos(floor(0.5 + a/r)*r - a) * length(p);

                float n1 = noise(uv * 8.0);
                float n2 = noise(uv * 20.0);

                float edgeNoise = (n1 * 0.6 + n2 * 0.4 - 0.5)*0.2*(sin(u_time * 0.5) + 1.5);
                uvDis += edgeNoise;

                return smoothstep(dis + 0.01, dis, uvDis);
            }


            void main(){
                vec2 pos = vec2(vUv * 2.0) - 1.0;
                float geo = geometrySDF(pos,0.6);

                gl_FragColor = vec4(vec3(geo), 1.0);
            }
        `;

const fragmentShader11 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            float random (float x){
                return fract(sin(x) * 10000.0);
            }

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return -1.0 + 2.0*fract(sin(vUv)*43758.5453123);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);
                return mix(mix(dot(random(ipos + vec2(0.0, 0.0)), fpos - vec2(0.0, 0.0)),
                               dot(random(ipos + vec2(1.0, 0.0)), fpos - vec2(1.0, 0.0)), u.x),
                           mix(dot(random(ipos + vec2(0.0, 1.0)), fpos - vec2(0.0, 1.0)),
                               dot(random(ipos + vec2(1.0, 1.0)), fpos - vec2(1.0, 1.0)), u.x), u.y);
            }

            float geometrySDF(vec2 uv,float dis){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 8;
                float r = TWO_PI/float(N);
                float uvDis = cos(floor(0.5 + a/r)*r - a) * length(p);

                float edgeId = floor(0.5 + a / r);

                float edgeRand = random(edgeId);

                float angle = edgeRand * TWO_PI;
                vec2 flowDir = vec2(cos(angle), sin(angle));

                float speed = mix(0.02, 0.1, edgeRand);

                vec2 flow = flowDir * u_time * speed;

                float n1 = noise((uv + flow) * 8.0);
                float n2 = noise((uv + flow) * 20.0);

                float edgeNoise = (n1 * 0.6 + n2 * 0.4 - 0.5)*0.2*(sin(u_time * 0.5) * 0.1 + 2.5);
                uvDis += edgeNoise;

                return smoothstep(dis + 0.01, dis, uvDis);
            }


            void main(){
                vec2 pos = vec2(vUv * 2.0) - 1.0;
                float geo = geometrySDF(pos,0.6);

                gl_FragColor = vec4(vec3(geo), 1.0);
            }
        `;

const fragmentShader12 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            float random (float x){
                return fract(sin(x) * 10000.0);
            }

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return -1.0 + 2.0*fract(sin(vUv)*43758.5453123);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);
                return mix(mix(dot(random(ipos + vec2(0.0, 0.0)), fpos - vec2(0.0, 0.0)),
                               dot(random(ipos + vec2(1.0, 0.0)), fpos - vec2(1.0, 0.0)), u.x),
                           mix(dot(random(ipos + vec2(0.0, 1.0)), fpos - vec2(0.0, 1.0)),
                               dot(random(ipos + vec2(1.0, 1.0)), fpos - vec2(1.0, 1.0)), u.x), u.y);
            }

            void main(){
                vec2 pos = vec2(vUv * 3.0) - 1.0;
                vec3 color = vec3(0.0);
                
                float n1 = noise(pos * 8.0);
                float n2 = noise(pos * 20.0);
                float edgeNoise = (n1 * 0.6 + n2 * 0.4 - 0.5) * 0.2;

                float dis = abs(pos.y + 0.3);
                dis += edgeNoise;
                dis = smoothstep(0.02, 0.0, dis);
                color = vec3(dis)*vec3(1.0, 0.0, 0.0);

                float dis2 = abs(pos.y - 1.2);
                dis2 += edgeNoise;
                dis2 = smoothstep(0.02, 0.0, dis2);
                color += vec3(dis2)*vec3(0.0, 0.8, 0.2);

                
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader13 = `
            varying vec2 vUv;

            float random (vec2 vUv){
                return fract(sin(dot(vUv.xy, vec2(12.9898,78.233))) * 43758.5453);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);

                vec2 u = fpos*fpos*(3.0-2.0*fpos);

                return mix(mix(random(ipos + vec2(0.0, 0.0)),random(ipos + vec2(1.0, 0.0)), u.x), mix(random(ipos + vec2(0.0, 1.0)), random(ipos + vec2(1.0, 1.0)), u.x), u.y);
            }

            mat2 rotate2d(float angle){
                return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
            }

            float lines(vec2 uv,float b){
                float scale = 10.0;
                uv *= scale;
                return smoothstep(0.0,0.5+b*0.5,abs(sin(uv.x*3.1415) + b*2.0)*0.5);
            }


            void main(){
                vec2 pos = vUv*vec2(3.0,10.0);
                //旋转90度，竖线变横线
                pos = pos.yx;                         
                //根据噪声值旋转坐标系，制造线条的扭曲感
                pos = rotate2d(noise(pos))*pos;
                float pattern = lines(pos,0.5);

                gl_FragColor = vec4(vec3(pattern), 1.0);
            }
        `;

const fragmentShader14 = `
            varying vec2 vUv;

            float random (vec2 vUv){
                return fract(sin(dot(vUv.xy, vec2(12.9898,78.233))) * 43758.5453);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);

                vec2 u = fpos*fpos*(3.0-2.0*fpos);

                return mix(mix(random(ipos + vec2(0.0, 0.0)),random(ipos + vec2(1.0, 0.0)), u.x), mix(random(ipos + vec2(0.0, 1.0)), random(ipos + vec2(1.0, 1.0)), u.x), u.y);
            }

            mat2 rotate2d(float angle){
                return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
            }

            float lines(vec2 uv,float b){
                float scale = 4.0;
                uv *= scale;
                return smoothstep(0.0,0.5+b*0.5,abs(sin(uv.x*3.1415) + b*2.0)*0.5);
            }


            void main(){
                vec2 pos = vUv*vec2(3.0,10.0);
                pos = pos.yx;                         
            
                pos = rotate2d(noise(pos))*pos;
                pos = pos*vec2(10.0);
                // float line = smoothstep(0.5,0.51,abs(pos.x - 8.0));
                // float line = smoothstep(0.5,0.51,sin(pos.x));
                float line = smoothstep(0.5,0.51,abs(sin(pos.x)));


                // float line = smoothstep(0.0,0.75,abs(sin(pos.x*3.1415) + 1.0)*0.5);
                

                gl_FragColor = vec4(vec3(line), 1.0);
            }
        `;

const fragmentShader15 = `
            varying vec2 vUv;

            float random (vec2 vUv){
                return fract(sin(dot(vUv.xy, vec2(12.9898,78.233))) * 43758.5453);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);

                vec2 u = fpos*fpos*(3.0-2.0*fpos);

                return mix(mix(random(ipos + vec2(0.0, 0.0)),random(ipos + vec2(1.0, 0.0)), u.x), mix(random(ipos + vec2(0.0, 1.0)), random(ipos + vec2(1.0, 1.0)), u.x), u.y);
            }

            mat2 rotate2d(float angle){
                return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
            }

            void main(){
                vec2 pos = vUv*vec2(10.0);
                pos = rotate2d(noise(pos))*pos;
                pos = pos*vec2(10.0);
                float dis = abs(pos.y - 5.0);
                // float line = smoothstep(0.5,0.51,dis);
                // float line = smoothstep(0.5,0.51,sin(dis));
                float line = smoothstep(0.5,0.51,abs(sin(dis)));


                gl_FragColor = vec4(vec3(line), 1.0);
            }
        `;


const fragmentShader16 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return -1.0 + 2.0*fract(sin(vUv)*43758.5453123);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);
                return mix(mix(dot(random(ipos + vec2(0.0, 0.0)), fpos - vec2(0.0, 0.0)),
                               dot(random(ipos + vec2(1.0, 0.0)), fpos - vec2(1.0, 0.0)), u.x),
                           mix(dot(random(ipos + vec2(0.0, 1.0)), fpos - vec2(0.0, 1.0)),
                               dot(random(ipos + vec2(1.0, 1.0)), fpos - vec2(1.0, 1.0)), u.x), u.y);
            }

            void main(){
                float t = 4.0;
                vec2 pos = vUv * 10.0;
                pos += vec2(noise(pos)*t);
                vec3 color =vec3(1.0) * smoothstep(0.18,0.2,noise(pos));
                color += smoothstep(0.15,0.2,noise(pos*10.0));
                color += smoothstep(0.35,0.41,noise(pos*10.0));
                gl_FragColor = vec4(vec3(1.0 - color), 1.0);
            }
        `;

const fragmentShader17 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return -1.0 + 2.0*fract(sin(vUv)*43758.5453123);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);
                return mix(mix(dot(random(ipos + vec2(0.0, 0.0)), fpos - vec2(0.0, 0.0)),
                               dot(random(ipos + vec2(1.0, 0.0)), fpos - vec2(1.0, 0.0)), u.x),
                           mix(dot(random(ipos + vec2(0.0, 1.0)), fpos - vec2(0.0, 1.0)),
                               dot(random(ipos + vec2(1.0, 1.0)), fpos - vec2(1.0, 1.0)), u.x), u.y);
            }

            void main(){
                vec2 pos = vUv * 10.0;
                pos += vec2(noise(pos)*4.0);
                vec3 color =vec3(smoothstep(0.18,0.2,noise(pos*1.0)));
                color += smoothstep(0.15,0.2,noise(pos*10.0));
                color += smoothstep(0.35,0.41,noise(pos*20.0));

                gl_FragColor = vec4(vec3(1.0 - color), 1.0);
            }
        `;

const fragmentShader18 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return -1.0 + 2.0*fract(sin(vUv)*43758.5453123);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);
                return mix(mix(dot(random(ipos + vec2(0.0, 0.0)), fpos - vec2(0.0, 0.0)),
                               dot(random(ipos + vec2(1.0, 0.0)), fpos - vec2(1.0, 0.0)), u.x),
                           mix(dot(random(ipos + vec2(0.0, 1.0)), fpos - vec2(0.0, 1.0)),
                               dot(random(ipos + vec2(1.0, 1.0)), fpos - vec2(1.0, 1.0)), u.x), u.y);
            }

            void main(){
                vec2 pos = vUv * 2.0 - 1.0;
                // float dis = abs(length(pos) - 0.78);
                // float circle = step(0.02, dis);

                float angle = atan(pos.y, pos.x);
                angle +=u_time * 0.1;
                float teeth = 20.0;          // 齿数
                float strength = 0.05;       // 齿的高度

                float r = length(pos);
                r += sin(angle * teeth) * strength;
                r += noise(vec2(angle * teeth)) * 0.03;

                float dis = abs(r - 0.78);
                float circle = step(0.02, dis);

                gl_FragColor = vec4(vec3(circle), 1.0);
            }
        `;

const fragmentShader19 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return -1.0 + 2.0*fract(sin(vUv)*43758.5453123);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);
                return mix(mix(dot(random(ipos + vec2(0.0, 0.0)), fpos - vec2(0.0, 0.0)),
                               dot(random(ipos + vec2(1.0, 0.0)), fpos - vec2(1.0, 0.0)), u.x),
                           mix(dot(random(ipos + vec2(0.0, 1.0)), fpos - vec2(0.0, 1.0)),
                               dot(random(ipos + vec2(1.0, 1.0)), fpos - vec2(1.0, 1.0)), u.x), u.y);
            }

            void main(){
                vec2 pos = vUv * 2.0 - 1.0;

                float r = length(pos);
                float a = atan(pos.y, pos.x);
                float m = abs(mod(a + u_time * 2.0, TWO_PI) - PI) / 3.6;
                m += noise(pos + u_time * 0.1) * 0.5;
                float f = 0.78;
                f += sin(a * 50.0) * noise(pos + u_time * 0.2) * 0.1;
                f += sin(a * 20.0) * 0.1 * pow(m, 2.0);
                float dis = abs(r - f);
                float circle = smoothstep(0.02,0.021, dis);
                gl_FragColor = vec4(vec3(circle), 1.0);
            }
        `;

const fragmentShader20 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return -1.0 + 2.0*fract(sin(vUv)*43758.5453123);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);
                return mix(mix(dot(random(ipos + vec2(0.0, 0.0)), fpos - vec2(0.0, 0.0)),
                               dot(random(ipos + vec2(1.0, 0.0)), fpos - vec2(1.0, 0.0)), u.x),
                           mix(dot(random(ipos + vec2(0.0, 1.0)), fpos - vec2(0.0, 1.0)),
                               dot(random(ipos + vec2(1.0, 1.0)), fpos - vec2(1.0, 1.0)), u.x), u.y);
            }

            void main(){
                vec2 pos = vUv;

                vec2 warp = vec2(noise(pos*4.0),noise(pos*4.0 + 10.0));
                pos += warp * 0.2;
                float n1 = noise(pos * 4.0);
                float n2 = noise(pos * 20.0);
                float n3 = noise(pos * 80.0);

                vec3 pink  = vec3(0.75, 0.45, 0.35);
                vec3 gray = vec3(0.6);
                vec3 black = vec3(0.1);

                vec3 color = pink;

                color = mix(color, gray, vec3(smoothstep(0.3,0.6,n2)));
                color = mix(color, black, vec3(smoothstep(0.6,0.8,n3)));
                color *= 0.8 + 0.4 * n1;
                gl_FragColor = vec4(vec3( color), 1.0);
            }
        `;

const fragmentShader21 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return -1.0 + 2.0*fract(sin(vUv)*43758.5453123);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);
                return mix(mix(dot(random(ipos + vec2(0.0, 0.0)), fpos - vec2(0.0, 0.0)),
                               dot(random(ipos + vec2(1.0, 0.0)), fpos - vec2(1.0, 0.0)), u.x),
                           mix(dot(random(ipos + vec2(0.0, 1.0)), fpos - vec2(0.0, 1.0)),
                               dot(random(ipos + vec2(1.0, 1.0)), fpos - vec2(1.0, 1.0)), u.x), u.y);
            }

            float fbm(vec2 uv) {
                float value = 0.0;
                float amplitude = 0.5;
                
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise(uv);
                    uv *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main(){
                vec2 uv = vUv;
                float t = u_time * 0.02;
                uv += vec2(fbm(uv + t), fbm(uv - t));
                // uv += vec2(fbm(uv ), fbm(uv ));

                float n = fbm(uv)*0.5 + 0.5;

                float cracks = smoothstep(0.4, 0.7, n);
                vec3 color = mix(
                    vec3(0.05, 0.0, 0.0),
                    vec3(1.0, 0.3, 0.0),
                    cracks
                );
                color += pow(cracks, 3.0) * vec3(1.0, 0.8, 0.2);
                        
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader22 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return -1.0 + 2.0*fract(sin(vUv)*43758.5453123);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);
                return mix(mix(dot(random(ipos + vec2(0.0, 0.0)), fpos - vec2(0.0, 0.0)),
                               dot(random(ipos + vec2(1.0, 0.0)), fpos - vec2(1.0, 0.0)), u.x),
                           mix(dot(random(ipos + vec2(0.0, 1.0)), fpos - vec2(0.0, 1.0)),
                               dot(random(ipos + vec2(1.0, 1.0)), fpos - vec2(1.0, 1.0)), u.x), u.y);
            }

            float fbm(vec2 uv) {
                float value = 0.0;
                float amplitude = 0.5;
                
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise(uv);
                    uv *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main(){
                vec2 uv = vUv;
                float t = u_time * 0.02;

                // uv += vec2(fbm(uv ), fbm(uv ));
                // uv += vec2(fbm(uv  + vec2(1.0, 0.0)), fbm(uv + vec2(0.0, 1.0)));
                uv += vec2(fbm(uv  + t), fbm(uv - t));

                float n = fbm(uv)*0.5 + 0.5;
                float smoke = smoothstep(0.2, 0.75, n);
                vec3 color = vec3(smoke);
                    
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader23 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return -1.0 + 2.0*fract(sin(vUv)*43758.5453123);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);
                return mix(mix(dot(random(ipos + vec2(0.0, 0.0)), fpos - vec2(0.0, 0.0)),
                               dot(random(ipos + vec2(1.0, 0.0)), fpos - vec2(1.0, 0.0)), u.x),
                           mix(dot(random(ipos + vec2(0.0, 1.0)), fpos - vec2(0.0, 1.0)),
                               dot(random(ipos + vec2(1.0, 1.0)), fpos - vec2(1.0, 1.0)), u.x), u.y);
            }

            float fbm(vec2 uv) {
                float value = 0.0;
                float amplitude = 0.5;
                
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise(uv);
                    uv *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main(){
                vec2 uv = vUv;
                float t = u_time * 0.02;
                uv += vec2(fbm(uv + t), fbm(uv - t));

                float wave = sin(uv.x * 10.0 + t) * 0.05 + sin(uv.y * 15.0 - t * 1.2) * 0.05;
                float n = fbm(uv+wave);   
                vec3 deepWater = vec3(0.0, 0.1, 0.3);
                vec3 shallowWater = vec3(0.0, 0.5, 0.8);
                vec3 color = mix(deepWater, shallowWater, n);
                float highlight = pow(n, 4.0);
                color += highlight * vec3(0.6, 0.8, 1.0);    
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader24 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return -1.0 + 2.0*fract(sin(vUv)*43758.5453123);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);
                return mix(mix(dot(random(ipos + vec2(0.0, 0.0)), fpos - vec2(0.0, 0.0)),
                               dot(random(ipos + vec2(1.0, 0.0)), fpos - vec2(1.0, 0.0)), u.x),
                           mix(dot(random(ipos + vec2(0.0, 1.0)), fpos - vec2(0.0, 1.0)),
                               dot(random(ipos + vec2(1.0, 1.0)), fpos - vec2(1.0, 1.0)), u.x), u.y);
            }

            float fbm(vec2 uv) {
                float value = 0.0;
                float amplitude = 0.5;
                
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise(uv);
                    uv *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            float geometrySDF(vec2 uv, vec2 center){
                vec2 p = uv - center;
                float a = atan(p.y, p.x);
                int N = 3;
                float r = TWO_PI/float(N);
                return cos(floor(0.5 + a/r)*r - a) * length(p);
            }

            float geometrySDFN(vec2 uv, vec2 center,float time){
                vec2 p = uv - center;
                float a = atan(p.y, p.x);
                int N = 4;
                float r = TWO_PI/float(N);
                float n = noise(uv*3.0 + time);
                return cos(floor(0.5 + a/r)*r - a) * length(p) + n * 0.3;
            }

            void main(){
                // vec2 uv = vUv;
                // float t = u_time * 0.2;

                // uv += vec2(fbm(uv + t), fbm(uv - t));
                // vec2 center = vec2(0.5, 0.5);
                // float geo = geometrySDF(uv, center);

                // vec2 center = vec2(0.5 + 0.2 * noise(vec2(t, 0.0)), 0.5 + 0.2 * noise(vec2(0.0, t)));
                // float geo = geometrySDF(uv, center);
                
                // vec2 center = vec2(0.5);
                // float geo = geometrySDFN(uv, center,t);

                // vec2 warp = vec2(fbm(uv + t), fbm(uv + vec2(5.2,1.3) - t));
                // uv += warp * 0.2;
                // uv += vec2(fbm(uv * 2.0), fbm(uv * 2.0 + 10.0)) * 0.1;
                // vec2 center = vec2(0.5, 0.5);
                // float geo = geometrySDF(uv, center);

                // vec3 color = vec3(step(0.1, geo));
                // gl_FragColor = vec4(color, 1.0);

                vec2 uv = vUv;
                float t = u_time * 0.2;
                vec2 grid = floor(uv * 2.0);   // (0,0) (1,0) (0,1) (1,1)
                vec2 localUV = fract(uv * 2.0); // 每个象限内部的 uv

                float geo = 0.0;

                if (grid.x == 0.0 && grid.y == 0.0) {
                    // 左下：原始 fbm 扭曲
                    vec2 uv2 = localUV;
                    uv2 += vec2(fbm(uv2 + t), fbm(uv2 - t));
                    geo = geometrySDF(uv2, vec2(0.5));
                }

                else if (grid.x == 1.0 && grid.y == 0.0) {
                    // 右下：中心乱跑
                    vec2 center = vec2(
                        0.5 + 0.8 * noise(vec2(t, 0.0)),
                        0.5 + 0.8 * noise(vec2(0.0, t))
                    );
                    geo = geometrySDF(localUV, center);

                    
                    float n1 = noise(localUV * 8.0);
                    float n2 = noise(localUV * 20.0);
                    float edgeNoise = (n1 * 0.6 + n2 * 0.4 - 0.5)*0.2*(sin(u_time * 0.5) + 1.5);
                    geo += edgeNoise;
                }

                else if (grid.x == 0.0 && grid.y == 1.0) {
                    // 左上：形状被 noise 扭曲

                    // float base = geometrySDF(localUV, vec2(0.5));
                    // base += fbm(localUV * 3.0 + t) * 0.1;
                    // geo = base;
                    
                    geo = geometrySDFN(localUV, vec2(0.5), t);
                }

                else {
                    // 右上：高级 domain warping
                    vec2 uv2 = localUV;

                    vec2 warp = vec2(
                        fbm(uv2 + t),
                        fbm(uv2 + vec2(5.2,1.3) - t)
                    );

                    uv2 += warp * 0.2;
                    uv2 += vec2(
                        fbm(uv2 * 2.0),
                        fbm(uv2 * 2.0 + 10.0)
                    ) * 0.1;

                    geo = geometrySDF(uv2, vec2(0.5));
                }

                vec3 color = vec3(step(0.05, geo));


                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fragmentShader25 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return -1.0 + 2.0*fract(sin(vUv)*43758.5453123);
            }

            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);
                return mix(mix(dot(random(ipos + vec2(0.0, 0.0)), fpos - vec2(0.0, 0.0)),
                               dot(random(ipos + vec2(1.0, 0.0)), fpos - vec2(1.0, 0.0)), u.x),
                           mix(dot(random(ipos + vec2(0.0, 1.0)), fpos - vec2(0.0, 1.0)),
                               dot(random(ipos + vec2(1.0, 1.0)), fpos - vec2(1.0, 1.0)), u.x), u.y);
            }

            float fbm(vec2 uv) {
                float value = 0.0;
                float amplitude = 0.5;
                
                for (int i = 0; i < 5; i++) {
                    value += amplitude * noise(uv);
                    uv *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            float geometrySDF(vec2 uv, vec2 center,float dis){
                vec2 p = uv - center;
                float a = atan(p.y, p.x);
                int N = 5;
                float r = TWO_PI/float(N);
                float uvDis = cos(floor(0.5 + a/r)*r - a) * length(p);

                float n1 = noise(uv * 8.0);
                float n2 = noise(uv * 20.0);

                float edgeNoise = (n1 * 0.6 + n2 * 0.4 - 0.5)*0.12*(sin(u_time * 0.5) + 1.5);
                uvDis += edgeNoise;

                return smoothstep(dis, dis + 0.001, uvDis);
            }

            void main(){
                vec2 uv = vUv;
                float t = u_time * 0.2;

                vec2 center = vec2(
                        0.5 + 0.3 * noise(vec2(t, 0.0)),
                        0.5 + 0.3 * noise(vec2(0.0, t))
                    );

                float dis = 0.0001;
                float geo = geometrySDF(uv, center, dis);


                vec3 color = vec3(smoothstep(0.05, 0.1, geo));


                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fragmentShader26 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec2 skew(vec2 uv){
                vec2 r = vec2(0.0);
                r.x = 1.1547*uv.x;
                r.y = uv.y + 0.5*r.x;
                return r;
            }

            vec3 simplexGrid(vec2 uv){
                vec3 xyz = vec3(0.0);
                
                vec2 p = fract(skew(uv));

                if(p.x > p.y){
                    xyz.xy = 1.0 - vec2(p.x,p.y-p.x);
                    xyz.z = p.y;
                } else {
                    xyz.yz = 1.0 - vec2(p.x-p.y,p.y);
                    xyz.x = p.x;
                }

                return fract(xyz);
            }

            void main(){
                vec2 uv = vUv *2.0;
                vec3 color = vec3(0.0);

                color.rg = fract(skew(uv));

                color = simplexGrid(uv);
                gl_FragColor = vec4(color, 1.0);

            }

`

const fragmentShader27 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec2 skew(vec2 uv){
                vec2 r = vec2(0.0);
                r.x = 1.1547*uv.x;
                r.y = uv.y + 0.5*r.x;
                return r;
            }

            vec3 simplexGrid(vec2 uv){
                vec3 xyz = vec3(0.0);
                
                vec2 p = fract(skew(uv));

                if(p.x > p.y){
                    xyz.xy = 1.0 - vec2(p.x,p.y-p.x);
                    xyz.z = p.y;
                } else {
                    xyz.yz = 1.0 - vec2(p.x-p.y,p.y);
                    xyz.x = p.x;
                }

                return fract(xyz);
            }

            vec2 hash2(vec2 p){
                p = fract(p * vec2(123.34, 456.21));
                p += dot(p, p + 45.32);
                return fract(vec2(p.x * p.y, p.x + p.y)) * 2.0 - 1.0;
            }

            float contrib(vec2 p, vec2 corner){
                float d = dot(p, p);
                float w = max(0.5 - d, 0.0);
                w *= w;
                w *= w;

                vec2 g = hash2(corner);   // 梯度
                return w * dot(g, p);
            }

            float mySnoise(vec2 uv){

                vec2 s = skew(uv);
                vec2 cell = floor(s);
                vec2 f = fract(s);

                vec2 i1 = (f.x > f.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);

                float K = 0.211324865;

                vec2 x0 = f;
                vec2 x1 = f - i1 + K;
                vec2 x2 = f - 1.0 + 2.0 * K;

                float n0 = contrib(x0, cell);
                float n1 = contrib(x1, cell + i1);
                float n2 = contrib(x2, cell + 1.0);

                return 70.0 * (n0 + n1 + n2);
            }

            void main(){
                vec2 uv = vUv;
                vec3 color = vec3(0.0);

                uv *= 10.0;
                color = vec3(mySnoise(uv)*0.5 + 0.5);
                gl_FragColor = vec4(color, 1.0);

            }

`

const fragmentShader28 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187,
                    // (3.0-sqrt(3.0))/6.0
                    0.366025403784439,
                    // 0.5*(sqrt(3.0)-1.0)
                    -0.577350269189626,
                    // -1.0 + 2.0 * C.x
                    0.024390243902439);
                    // 1.0 / 41.0

                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);

                // Other two corners (x1, x2)
                vec2 i1 = vec2(0.0);
                i1 = (x0.x > x0.y)? vec2(1.0, 0.0):vec2(0.0, 1.0);
                vec2 x1 = x0.xy + C.xx - i1;
                vec2 x2 = x0.xy + C.zz;

                i = mod289(i);
                vec3 p = permute(
                        permute( i.y + vec3(0.0, i1.y, 1.0))
                            + i.x + vec3(0.0, i1.x, 1.0 ));

                vec3 m = max(0.5 - vec3(
                                    dot(x0,x0),
                                    dot(x1,x1),
                                    dot(x2,x2)
                                    ), 0.0);

                m = m*m ;
                m = m*m ;

                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;

                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);

                vec3 g = vec3(0.0);
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
                return 130.0 * dot(m, g);
                }

            void main(){
                vec2 uv = vUv;
                vec3 color = vec3(0.0);

                uv *= 10.0;
                color = vec3(snoise(uv)*0.5 + 0.5);
                gl_FragColor = vec4(color, 1.0);

            }

`


const fragmentShader29 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187,
                    // (3.0-sqrt(3.0))/6.0
                    0.366025403784439,
                    // 0.5*(sqrt(3.0)-1.0)
                    -0.577350269189626,
                    // -1.0 + 2.0 * C.x
                    0.024390243902439);
                    // 1.0 / 41.0

                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);

                // Other two corners (x1, x2)
                vec2 i1 = vec2(0.0);
                i1 = (x0.x > x0.y)? vec2(1.0, 0.0):vec2(0.0, 1.0);
                vec2 x1 = x0.xy + C.xx - i1;
                vec2 x2 = x0.xy + C.zz;

                i = mod289(i);
                vec3 p = permute(
                        permute( i.y + vec3(0.0, i1.y, 1.0))
                            + i.x + vec3(0.0, i1.x, 1.0 ));

                vec3 m = max(0.5 - vec3(
                                    dot(x0,x0),
                                    dot(x1,x1),
                                    dot(x2,x2)
                                    ), 0.0);

                m = m*m ;
                m = m*m ;

                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;

                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);

                vec3 g = vec3(0.0);
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
                return 130.0 * dot(m, g);
        }

            float fbm(vec2 uv) {
                float value = 0.0;
                float amplitude = 0.5;
                
                for (int i = 0; i < 5; i++) {
                    value += amplitude * snoise(uv);
                    uv *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main(){
                vec2 uv = vUv;
                float t = u_time * 0.02;
                uv += vec2(fbm(uv + t), fbm(uv - t));
                            
                float n = fbm(uv)*0.5 + 0.5;
                
                float cracks = smoothstep(0.4, 0.7, n);
                vec3 color = mix(
                    vec3(0.05, 0.0, 0.0),
                    vec3(1.0, 0.3, 0.0),
                    cracks
                );
                color += pow(cracks, 3.0) * vec3(0.2, 0.8, 0.2);

                gl_FragColor = vec4(color, 1.0);

            }

`
const fragmentShader30 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187,
                    // (3.0-sqrt(3.0))/6.0
                    0.366025403784439,
                    // 0.5*(sqrt(3.0)-1.0)
                    -0.577350269189626,
                    // -1.0 + 2.0 * C.x
                    0.024390243902439);
                    // 1.0 / 41.0

                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);

                // Other two corners (x1, x2)
                vec2 i1 = vec2(0.0);
                i1 = (x0.x > x0.y)? vec2(1.0, 0.0):vec2(0.0, 1.0);
                vec2 x1 = x0.xy + C.xx - i1;
                vec2 x2 = x0.xy + C.zz;

                i = mod289(i);
                vec3 p = permute(
                        permute( i.y + vec3(0.0, i1.y, 1.0))
                            + i.x + vec3(0.0, i1.x, 1.0 ));

                vec3 m = max(0.5 - vec3(
                                    dot(x0,x0),
                                    dot(x1,x1),
                                    dot(x2,x2)
                                    ), 0.0);

                m = m*m ;
                m = m*m ;

                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;

                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);

                vec3 g = vec3(0.0);
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
                return 130.0 * dot(m, g);
            }

            vec2 curlNoise(vec2 p) {
                float e = 0.001;

                float n1 = snoise(p + vec2(0.0, e));
                float n2 = snoise(p - vec2(0.0, e));
                float n3 = snoise(p + vec2(e, 0.0));
                float n4 = snoise(p - vec2(e, 0.0));

                float dx = (n1 - n2) / (2.0 * e);
                float dy = (n3 - n4) / (2.0 * e);

                return vec2(dy, -dx); // 关键：旋转90°
            }

            float fbm(vec2 uv) {
                float value = 0.0;
                float amplitude = 0.5;
                
                for (int i = 0; i < 5; i++) {
                    value += amplitude * snoise(uv);
                    uv *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main(){
                vec2 uv = vUv ;
                float t = u_time * 0.02;
                vec2 flow = vec2(0.0);

                flow += curlNoise(uv * 1.0 + t) * 0.5;
                flow += curlNoise(uv * 2.0 - t) * 0.25;
                flow += curlNoise(uv * 4.0 + t) * 0.125;
                uv += flow * 0.3;
                float n = fbm(uv)*0.5 + 0.5;
                
                float cracks = smoothstep(0.3, 0.7, n);
                vec3 color = mix(
                    vec3(0.05, 0.0, 0.0),
                    vec3(1.0, 0.3, 0.0),
                    cracks
                );
                color += pow(cracks, 3.0) * vec3(0.2, 0.8, 0.2);

                gl_FragColor = vec4(color, 1.0);

            }

`

const fragmentShader31 = `
            #define TWO_PI 6.28318530718
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform float u_time;

            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187,
                    // (3.0-sqrt(3.0))/6.0
                    0.366025403784439,
                    // 0.5*(sqrt(3.0)-1.0)
                    -0.577350269189626,
                    // -1.0 + 2.0 * C.x
                    0.024390243902439);
                    // 1.0 / 41.0

                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);

                // Other two corners (x1, x2)
                vec2 i1 = vec2(0.0);
                i1 = (x0.x > x0.y)? vec2(1.0, 0.0):vec2(0.0, 1.0);
                vec2 x1 = x0.xy + C.xx - i1;
                vec2 x2 = x0.xy + C.zz;

                i = mod289(i);
                vec3 p = permute(
                        permute( i.y + vec3(0.0, i1.y, 1.0))
                            + i.x + vec3(0.0, i1.x, 1.0 ));

                vec3 m = max(0.5 - vec3(
                                    dot(x0,x0),
                                    dot(x1,x1),
                                    dot(x2,x2)
                                    ), 0.0);

                m = m*m ;
                m = m*m ;

                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;

                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);

                vec3 g = vec3(0.0);
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * vec2(x1.x,x2.x) + h.yz * vec2(x1.y,x2.y);
                return 130.0 * dot(m, g);
            }

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return -1.0 + 2.0*fract(sin(vUv)*43758.5453123);
            }


            float noise(vec2 vUv){
                vec2 ipos = floor(vUv);
                vec2 fpos = fract(vUv);
                
                vec2 u = fpos*fpos*(3.0-2.0*fpos);
                return mix(mix(dot(random(ipos + vec2(0.0, 0.0)), fpos - vec2(0.0, 0.0)),
                               dot(random(ipos + vec2(1.0, 0.0)), fpos - vec2(1.0, 0.0)), u.x),
                           mix(dot(random(ipos + vec2(0.0, 1.0)), fpos - vec2(0.0, 1.0)),
                               dot(random(ipos + vec2(1.0, 1.0)), fpos - vec2(1.0, 1.0)), u.x), u.y);
            }

            float fbm(vec2 uv) {
                float value = 0.0;
                float amplitude = 0.5;
                
                for (int i = 0; i < 5; i++) {
                    // value += amplitude * snoise(uv);
                    value += amplitude * snoise(uv);

                    uv *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main(){
                vec2 uv = vUv ;

                
                float t = u_time * 0.02;
                uv += vec2(fbm(uv  + t), fbm(uv - t));
                
                float n = fbm(uv)*0.5 + 0.5;
                float smoke = smoothstep(0.1, 0.8, n);
                vec3 color = vec3(smoke);

                gl_FragColor = vec4(color, 1.0);

            }

`
