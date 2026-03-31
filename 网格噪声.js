const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
const fs1 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return fract(sin(vUv)*43758.5453123);
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                vec2 point[5];
                point[0] = vec2(0.83,0.75);
                point[1] = vec2(0.60,0.07);
                point[2] = vec2(0.28,0.64);
                point[3] =  vec2(0.31,0.26);
                // point[4] = u_mouse;  // 第5个点跟随鼠标
                float m_dist = 1.0;

                for (int i = 0; i < 2; i++) {
                    float dist = distance(uv, point[i]);
                    m_dist = min(m_dist, dist);
                }
                color += m_dist;
                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs2 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                vec2 point[5];
                point[0] = vec2(0.83,0.75);
                point[1] = vec2(0.60,0.07);
                point[2] = vec2(0.28,0.64);
                point[3] = vec2(0.31,0.26);
                point[4] = u_mouse;  // 第5个点跟随鼠标

                // 找到离鼠标最近的点的索引（一次循环完成）
                float minDist = 10.0;
                int closestIndex = 0;
                for (int i = 0; i < 4; i++) {
                    float dist = distance(point[4], point[i]);
                    if(dist < minDist){
                        minDist = dist;
                        closestIndex = i;
                    }
                }

                // 只更新最近的那个点
                point[closestIndex] = point[4];

                // 计算Voronoi距离
                float m_dist = 1.0;
                for (int i = 0; i < 5; i++) {
                    float dist = distance(uv, point[i]);
                    m_dist = min(m_dist, dist);
                }

                color += m_dist;
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fs3 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                vec2 point[5];
                point[0] = vec2(0.83,0.75);
                point[1] = vec2(0.60,0.07);
                point[2] = vec2(0.28,0.64);
                point[3] =  vec2(0.31,0.26);
                point[4] = u_mouse;  // 第5个点跟随鼠标

                // point[0] -= distance(point[4], point[0]) * 0.1;
                // point[1] -= distance(point[4], point[1]) * 0.1;
                // point[2] -= distance(point[4], point[2]) * 0.1;
                // point[3] -= distance(point[4], point[3]) * 0.1;

                float m_dist = 1.0;

                for (int i = 0; i < 5; i++) {
                    float dist = distance(uv, point[i]);

                    m_dist = min(m_dist, dist);
                }
                color += m_dist;
                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs4 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
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
                    // value += amplitude * snoise(uv);
                    value += amplitude * noise(uv);

                    uv *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                uv *= 3.0;
                vec2 ipos = floor(uv);
                vec2 fpos = fract(uv);

                vec2 id = ipos;

                // 用 fbm 生成两个独立通道（x / y）
                vec2 flow = vec2(
                    fbm(id + vec2(0.0, 0.0) + u_time * 0.08),
                    fbm(id + vec2(5.2, 1.3) + u_time * 0.08)
                );

                flow *= 3.5;

                // 映射到 0~1
                flow = flow * 0.5 + 0.5;

                // 控制活动范围（避免贴边）
                // flow =flow * 0.9;

                vec2 point = flow;
                
                vec2 diff = point - fpos;
                float dist = length(diff);

                color += dist;

                color += 1.0 - step(0.02, dist);

                color.r += step(.98, fpos.x) + step(.98, fpos.y);

                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs5 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return fract(sin(vUv)*43758.5453123);
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                uv *= 3.0;
                vec2 ipos = floor(uv);
                vec2 fpos = fract(uv);

                vec2 point = random(ipos);
                vec2 diff = point - fpos;
                float dist = length(diff);

                color += dist;

                // color += 1.0 - step(0.02, dist);

                // color.r += step(.98, fpos.x) + step(.98, fpos.y);

                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs6 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return fract(sin(vUv)*43758.5453123);
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                uv *= 3.0;
                vec2 ipos = floor(uv);
                vec2 fpos = fract(uv);

                float m_dist = 1.0;

                for(int j = -1; j <= 1; j++) {
                    for(int i = -1; i <= 1; i++) {
                        vec2 neighbor = vec2(float(i), float(j));

                        vec2 point = random(ipos + neighbor );
                        // point = 0.5 + 0.5*sin(u_time + 6.2831*point) ;
                        vec2 diff = neighbor + point - fpos;
                        float dist = length(diff);

                        m_dist = min(m_dist, dist);
                    }
                }

                // color += m_dist;
                // color += 1.0 - step(0.02, m_dist);
                // color.r += step(.98, fpos.x) + step(.98, fpos.y);

                
                vec2 mousePoint = u_mouse * 4.0; // 缩放到相同的网格空间
                vec2 mouseDiff = mousePoint - uv;
                float mouseDist = length(mouseDiff);
                m_dist = min(m_dist, mouseDist);

                color += m_dist;
                // color += 1.0 - step(0.02, m_dist);
                // color.r += step(.98, fpos.x) + step(.98, fpos.y);
                
                float mousePointHighlight = 1.0 - smoothstep(0.0, 0.1, mouseDist);
                color += mousePointHighlight * 0.8;

                gl_FragColor = vec4(color, 1.0);

            }
        `;



const fs7 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return fract(sin(vUv)*43758.5453123);
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                uv *= 4.0;
                vec2 ipos = floor(uv);
                vec2 fpos = fract(uv);

                float m_dist = 1.0;

                for(int j = -1; j <= 1; j++) {
                    for(int i = -1; i <= 1; i++) {
                        vec2 neighbor = vec2(float(i), float(j));

                        vec2 point = random(ipos + neighbor );
                        point = 0.5 + 0.5*sin(u_time + 6.2831*point) ;
                        vec2 diff = neighbor + point - fpos;
                        float dist = length(diff);

                        m_dist = min(m_dist, dist);
                    }
                }

                color += m_dist;


                color += 1.0 - step(0.02, m_dist);
                gl_FragColor = vec4(color, 1.0);

            }
        `;



const fs8 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return fract(sin(vUv)*43758.5453123);
            }

            float worley(vec2 uv, float time) {
                vec2 ipos = floor(uv);
                vec2 fpos = fract(uv);

                float F1 = 1.0; // 最近距离
                float F2 = 1.0; // 第二近距离
                for (int j = -1; j <= 1; j++) {
                    for (int i = -1; i <= 1; i++) {
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(ipos + neighbor);
                        point = 0.5 + 0.5 * sin(time + 6.2831 * point);
                        vec2 diff = neighbor + point - fpos;
                        float dist = length(diff);

                        if (dist < F1) {
                            F2 = F1;
                            F1 = dist;
                        } else if (dist < F2) {
                            F2 = dist;
                        }
                    }
                }

                float cell = F1;           // 基础细胞
                float edge = F2 - F1;      // 边界
                float crack = smoothstep(0.0, 0.05, F2 - F1); // 裂缝

                return cell;
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                color += worley(uv * 10.0, u_time * 0.5);
                gl_FragColor = vec4(color, 1.0);

            }
        `;


const fs9 = `
    varying vec2 vUv;
    uniform vec2 u_mouse;

    vec2 random (vec2 vUv){
        vUv = vec2(
            dot(vUv,vec2(127.1,311.7)),
            dot(vUv,vec2(269.5,183.3))
        );
        return fract(sin(vUv)*43758.5453123);
    }

    void main(){
        vec2 uv = vUv;
        vec3 color = vec3(0.0);

        // 放大 cell
        uv *= 10.0;

        vec2 ipos = floor(uv);
        vec2 fpos = fract(uv);

        float minDist = 1.0;

        // 🔥 9宫格搜索
        for(int x = -1; x <= 1; x++){
            for(int y = -1; y <= 1; y++){
                vec2 neighbor = vec2(float(x), float(y));

                vec2 point = random(ipos + neighbor);

                vec2 diff = neighbor + point - fpos;
                float dist = length(diff);

                minDist = min(minDist, dist);
            }
        }

        // color += minDist;
        // color = vec3(color);

        // 🔥 圆环映射（核心）
        // float t = 3.0 * exp(-4.0 * abs(2.5 * minDist - 1.1));

        float radius = 0.4;
        float width  = 4.0;
        float t = exp(-width * abs(minDist - radius));

        color = vec3(t);

        // t *= sqrt(3.0 * exp(-4.0 * abs(2.5 * minDist*2.0 - 1.0)));
        // t *= exp(-dot(vUv - 0.5, vUv - 0.5) * 3.0);

        // 🔥 蓝色发光
        // color = vec3(0.1, 1.1*t, pow(t, 0.5 - t));
        

        gl_FragColor = vec4(color, 1.0);
    }
`;

const fs10 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return fract(sin(vUv)*43758.5453123);
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                uv *= 5.0;
                vec2 ipos = floor(uv);
                vec2 fpos = fract(uv);

                float m_dist = 1.0;

                for(int j = -1; j <= 1; j++) {
                    for(int i = -1; i <= 1; i++) {
                        vec2 neighbor = vec2(float(i), float(j));

                        vec2 point = random(ipos + neighbor );
                        point = 0.5 + 0.5*sin(u_time + 6.2831*point) ;
                        vec2 diff = neighbor + point - fpos;
                        float dist = length(diff);

                        m_dist = min(m_dist, dist);
                    }
                }

                // color += m_dist;
                // color += 1.0 - step(0.02, m_dist);

                float radius = 0.4;
                float width  = 10.0;
                float t = exp(-width * abs(m_dist - radius));
                color = vec3(t);

                gl_FragColor = vec4(color, 1.0);

            }
        `;


const fs11 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return fract(sin(vUv)*43758.5453123);
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                uv *= 4.0;
                vec2 ipos = floor(uv);
                vec2 fpos = fract(uv);

                float m_dist = 1.0;
                vec2 m_point;

                for(int j = -1; j <= 1; j++) {
                    for(int i = -1; i <= 1; i++) {
                        vec2 neighbor = vec2(float(i), float(j));

                        vec2 point = random(ipos + neighbor );
                        point = 0.5 + 0.5*sin(u_time + 6.2831*point) ;
                        vec2 diff = neighbor + point - fpos;
                        float dist = length(diff);

                        if( dist < m_dist ) {
                            m_dist = dist;
                            m_point = point;
                        }
                    }
                }

                // color = vec3(m_dist);

                color = vec3(dot(m_point,vec2(.3,.6)));

                // float radius = 0.4;
                // float width  = 10.0;
                // float t = exp(-width * abs(m_dist - radius));
                // color = vec3(t);

                gl_FragColor = vec4(color, 1.0);

            }
        `;


const fs12 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return fract(sin(vUv)*43758.5453123);
            }

            vec3 voronoi(vec2 uv){
                vec2 p = floor(uv);
                vec2 f = fract(uv);

                float minDist = 1.0;
                vec2 val = vec2(0.0);
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);
                        vec2 diff = neighbor + point - f;
                        float dis = dot(diff,diff);

                        if(dis < minDist){
                            minDist = dis;
                            val = point;
                        }
                    }
                }
                return vec3(val * (1.-minDist), minDist);
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                uv *= 10.0;
                vec3 col = vec3(voronoi(uv).xy, 0.);
                color = col;
                gl_FragColor = vec4(color, 1.0);

            }
        `;


const fs13 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return fract(sin(vUv)*43758.5453123);
            }

            vec2 voronoi(vec2 uv){
                vec2 p = floor(uv);
                vec2 f = fract(uv);

                float minDist = 1.0;
                vec2 val = vec2(0.0);
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);
                        vec2 diff = neighbor + point - f;
                        // float dis = dot(diff,diff);
                        float dis = length(diff);


                        if(dis < minDist){
                            minDist = dis;
                            val = point;
                        }
                    }
                }
                return vec2(val * (1.0 - minDist));
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);

                uv *= 10.0;
                color = vec3(voronoi(uv), 0.0);
                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs14 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return fract(sin(vUv)*43758.5453123);
            }

            float voronoi(vec2 uv){
                vec2 p = floor(uv);
                vec2 f = fract(uv);

                float minDist = 1.0;
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);
                        // point = 0.5 + 0.5*sin(u_time + 6.2831*point);
                        vec2 diff = neighbor + point - f;
                        float dist = length(diff);

                        minDist = min(minDist, minDist*dist);
                    }
                }
                return minDist;
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);

                uv *= 3.0;
                color += step(0.060, voronoi(uv)); 
                gl_FragColor = vec4(color, 1.0);

            }
        `;
