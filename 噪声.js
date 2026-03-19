
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

            void main(){
                vec2 pos = vec2(vUv * 5.0) ;
                float n = noise(pos);

                gl_FragColor = vec4(vec3(n), 1.0);
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

            void main(){
                vec2 pos = vec2(vUv * 10.0);
    
                gl_FragColor = vec4(vec3(noise(pos)*.5+.5), 1.0);
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

            void main(){
                vec2 pos = vec2(vUv * 10.0);
    
                gl_FragColor = vec4(vec3(noise(pos)*.5+.5), 1.0);
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


