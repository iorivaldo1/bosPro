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

                return edge;
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

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                vec2 point[4];
                point[0] = vec2(0.83,0.75);
                point[1] = vec2(0.60,0.37);
                point[2] = vec2(0.28,0.64);
                point[3] =  vec2(0.31,0.26);
                float m_dist = 0.0;

                for (int i = 0; i < 4; i++) {
                    float dist = distance(uv, point[i]);
                    m_dist += 0.03/(dist*dist);
                }
                color += step(1.0, m_dist);
                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs15 = `
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

                float minDist = 0.0;
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);
                        point = 0.5 + 0.5*sin(u_time + 6.2831*point);
                        vec2 diff = neighbor + point - f;
                        float dist = length(diff);

                        // minDist = min(minDist, dist);
                        minDist += 0.04/(dist*dist);
                    }
                }
                return minDist;
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);

                uv *= 3.0;
                // color = vec3(voronoi(uv));
                // color += step(0.060, voronoi(uv));
                color += step(voronoi(uv),1.0); 
                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs16 = `
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

                        minDist = min(minDist, dist);
                    }
                }
                return minDist;
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);

                uv *= 3.0;
                color = vec3(voronoi(uv));
                // color += step(0.060, voronoi(uv)); 
                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs17 = `
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
                color = vec3(voronoi(uv));
                // color += step(0.060, voronoi(uv)); 
                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs18 = `
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
                        point = 0.5 + 0.5*sin(u_time + 6.2831*point);
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
                color = vec3(voronoi(uv));
                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs19 = `
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
                        point = 0.5 + 0.5*sin(u_time + 6.2831*point);
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
                color += smoothstep(0.06, 0.061, voronoi(uv));
                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs20 = `
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
                        point = 0.5 + 0.5*sin(u_time + 6.2831*point);
    
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
                // color = vec3(voronoi(uv));
                color += step(0.060, voronoi(uv)); 
                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs21 = `
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
                vec2 point[4];
                point[0] = vec2(0.83,0.75);
                point[1] = vec2(0.60,0.37);
                point[2] = vec2(0.28,0.64);
                point[3] =  vec2(0.31,0.26);
                float m_dist = 1.0;

                for (int i = 0; i < 4; i++) {
                    float dist = distance(uv, point[i]);
                    m_dist = min(m_dist, dist);
                }
                color += m_dist;
                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs22 = `
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
                vec2 point[4];
                point[0] = vec2(0.83,0.75);
                point[1] = vec2(0.60,0.37);
                point[2] = vec2(0.28,0.64);
                point[3] =  vec2(0.31,0.26);
                float m_dist = 1.0;

                for (int i = 0; i < 4; i++) {
                    float dist = distance(uv, point[i]);
                    m_dist = min(m_dist, m_dist*dist);
                }
                color += m_dist;
                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs23 = `
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

                // 第一遍：找到最近的种子点
                vec2 closestPoint;
                vec2 closestCell;
                float minDist = 10.0;
                
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);
                        point = 0.5 + 0.5*sin(u_time + 6.2831*point) ;
                        vec2 diff = neighbor + point - f;
                        float dist = length(diff);
                        
                        if (dist < minDist) {
                            minDist = dist;
                            closestPoint = point;
                            closestCell = neighbor;
                        }
                    }
                }

                // 第二遍：计算到最近边界的真实距离
                float edgeDist = 10.0;
                
                for(int j=-2;j<=2;j++){
                    for(int i=-2;i<=2;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);
                        point = 0.5 + 0.5*sin(u_time + 6.2831*point) ;
                        
                        // 跳过最近的种子点本身
                        vec2 cellDiff = neighbor - closestCell;
                        if(dot(cellDiff, cellDiff) < 0.1) continue;
                        
                        // 计算当前点到两个种子点连线的垂直平分线的距离
                        vec2 closestPos = closestCell + closestPoint - f;
                        vec2 otherPos = neighbor + point - f;
                        
                        // 中点
                        vec2 midPoint = (closestPos + otherPos) * 0.5;
                        // 边界方向（两点连线的方向）
                        vec2 edgeDir = normalize(otherPos - closestPos);
                        
                        // 当前点到边界的距离
                        float dist = abs(dot(midPoint, edgeDir));
                        
                        edgeDist = min(edgeDist, dist);
                    }
                }
                
                return edgeDist;
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                uv *= 3.0;
                
                float edge = voronoi(uv);
                // 固定边界宽度：0.05
                color += step(0.01, edge);

                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs24 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return fract(sin(vUv)*43758.5453123);
            }
            
            // 根据种子点位置生成颜色
            vec3 randomColor(vec2 seed){
                return vec3(
                    fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453),
                    fract(sin(dot(seed, vec2(39.346, 11.135))) * 43758.5453),
                    fract(sin(dot(seed, vec2(73.156, 52.235))) * 43758.5453)
                );
            }

            // 返回 vec3: (edgeDist, cellId.x, cellId.y)
            vec3 voronoi(vec2 uv){
                vec2 p = floor(uv);
                vec2 f = fract(uv);

                // 第一遍：找到最近的种子点
                vec2 closestPoint;
                vec2 closestCell;
                float minDist = 10.0;
                
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);
                        point = 0.5 + 0.5*sin(u_time + 6.2831*point);
                        vec2 diff = neighbor + point - f;
                        float dist = length(diff);
                        
                        if (dist < minDist) {
                            minDist = dist;
                            closestPoint = point;
                            closestCell = neighbor;
                        }
                    }
                }

                // 第二遍：计算到最近边界的真实距离
                float edgeDist = 10.0;
                
                for(int j=-2;j<=2;j++){
                    for(int i=-2;i<=2;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);
                        point = 0.5 + 0.5*sin(u_time + 6.2831*point);
                        
                        // 跳过最近的种子点本身
                        vec2 cellDiff = neighbor - closestCell;
                        if(dot(cellDiff, cellDiff) < 0.1) continue;
                        
                        // 计算当前点到两个种子点连线的垂直平分线的距离
                        vec2 closestPos = closestCell + closestPoint - f;
                        vec2 otherPos = neighbor + point - f;
                        
                        // 中点
                        vec2 midPoint = (closestPos + otherPos) * 0.5;
                        // 边界方向（两点连线的方向）
                        vec2 edgeDir = normalize(otherPos - closestPos);
                        
                        // 当前点到边界的距离
                        float dist = abs(dot(midPoint, edgeDir));
                        
                        edgeDist = min(edgeDist, dist);
                    }
                }
                
                // 返回边界距离和细胞ID（种子点所在的格子坐标）
                vec2 cellId = p + closestCell;
                return vec3(edgeDist, cellId);
            }

            void main(){
                vec2 uv = vUv;

                uv *= 3.0;
                
                vec3 v = voronoi(uv);
                float edgeDist = v.x;
                vec2 cellId = v.yz;
                
                // 根据细胞ID生成颜色
                vec3 cellColor = randomColor(cellId);
                
                // 边界为黑色，内部为细胞颜色
                float edge = step(0.03, edgeDist);
                vec3 color = cellColor * edge;

                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs25 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return fract(sin(vUv)*43758.5453123);
            }
            
            // 根据种子点位置生成颜色
            vec3 randomColor(vec2 seed){
                return vec3(
                    fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453),
                    fract(sin(dot(seed, vec2(39.346, 11.135))) * 43758.5453),
                    fract(sin(dot(seed, vec2(73.156, 52.235))) * 43758.5453)
                );
            }

            // 返回 vec3: (edgeDist, cellId.x, cellId.y)
            vec3 voronoi(vec2 uv){
                vec2 p = floor(uv);
                vec2 f = fract(uv);

                // 第一遍：找到最近的种子点
                vec2 closestPoint;
                vec2 closestCell;
                float minDist = 10.0;
                
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);
                        point = 0.5 + 0.5*sin(u_time + 6.2831*point);
                        vec2 diff = neighbor + point - f;
                        float dist = length(diff);
                        
                        if (dist < minDist) {
                            minDist = dist;
                            closestPoint = point;
                            closestCell = neighbor;
                        }
                    }
                }

                // 第二遍：计算到最近边界的真实距离
                float edgeDist = 10.0;
                
                for(int j=-2;j<=2;j++){
                    for(int i=-2;i<=2;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);
                        point = 0.5 + 0.5*sin(u_time + 6.2831*point);
                        
                        // 跳过最近的种子点本身
                        vec2 cellDiff = neighbor - closestCell;
                        if(dot(cellDiff, cellDiff) < 0.1) continue;
                        
                        // 计算当前点到两个种子点连线的垂直平分线的距离
                        vec2 closestPos = closestCell + closestPoint - f;
                        vec2 otherPos = neighbor + point - f;
                        
                        // 中点
                        vec2 midPoint = (closestPos + otherPos) * 0.5;
                        // 边界方向（两点连线的方向）
                        vec2 edgeDir = normalize(otherPos - closestPos);
                        
                        // 当前点到边界的距离
                        float dist = abs(dot(midPoint, edgeDir));
                        
                        edgeDist = min(edgeDist, dist);
                    }
                }
                
                // 返回边界距离和细胞ID（种子点所在的格子坐标）
                vec2 cellId = p + closestCell;
                return vec3(edgeDist, cellId);
            }

            void main(){
                vec2 uv = vUv;
                uv *= 3.0;
                
                vec3 v = voronoi(uv);
                float edgeDist = v.x;
                vec2 cellId = v.yz;
                
                // 根据细胞ID生成颜色
                vec3 cellColor = randomColor(cellId);
                
                // 边界为白色，内部为细胞颜色
                float edgeMask = step(0.03, edgeDist);  // 边界内=0，边界外=1
                vec3 edgeColor = vec3(1.0);             // 白色边界
                vec3 color = mix(edgeColor, cellColor, edgeMask);

                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs26 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return fract(sin(vUv)*43758.5453123);
            }

            vec3 randomColor(vec2 seed){
                return vec3(
                    fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453),
                    fract(sin(dot(seed, vec2(39.346, 11.135))) * 43758.5453),
                    fract(sin(dot(seed, vec2(73.156, 52.235))) * 43758.5453)
                );
            }

            vec3 voronoi(vec2 uv){
                vec2 p = floor(uv);
                vec2 f = fract(uv);

                vec2 closestCell;
                float minDist = 1.0;
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);
                        point = 0.5 + 0.5*sin(u_time + 6.2831*point);
                        vec2 diff = neighbor + point - f;
                        float dist = length(diff);

                        if (dist < minDist) {
                            minDist = dist;
                            closestCell = neighbor;
                        }
                    }
                }
                vec2 cellId = p +closestCell;

                return vec3(minDist, cellId);
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                uv *= 4.0;
                vec3 voronoiResult = voronoi(uv);
                float m_dist = voronoiResult.x;
                vec2 cellId = voronoiResult.yz  ;
                
                // color += vec3(m_dist);
                // color += step(0.3, m_dist);
                // color = randomColor(cellId) ;

                float cellCenterMask = step(0.02, m_dist); // 细胞中心为0，边界为1
                vec3 cellColor = vec3(1.0);
                color = mix(cellColor, randomColor(cellId),cellCenterMask);
                
                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs27 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return fract(sin(vUv)*43758.5453123);
            }

            vec3 randomColor(vec2 seed){
                return vec3(
                    fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453),
                    fract(sin(dot(seed, vec2(39.346, 11.135))) * 43758.5453),
                    fract(sin(dot(seed, vec2(73.156, 52.235))) * 43758.5453)
                );
            }

            vec3 voronoi(vec2 uv){
                vec2 p = floor(uv);
                vec2 f = fract(uv);

                vec2 closestCell;
                float minDist = 1.0;
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);
                        point = 0.5 + 0.5*sin(u_time + 6.2831*point);
                        vec2 diff = neighbor + point - f;
                        float dist = length(diff);

                        if (dist < minDist) {
                            minDist = dist;
                            closestCell = neighbor;
                        }
                    }
                }
                vec2 cellId = p +closestCell;

                return vec3(minDist, cellId);
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                uv *= 4.0;
                vec3 voronoiResult = voronoi(uv);
                float m_dist = voronoiResult.x;
                vec2 cellId = voronoiResult.yz  ;
                

                float cellCenterMask = step(0.4, m_dist); // 细胞中心为0，边界为1
                vec3 cellColor = vec3(1.0);
                color = mix(randomColor(cellId), cellColor, cellCenterMask);
                
                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs28 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            vec2 random (vec2 vUv){
                vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
                return fract(sin(vUv)*43758.5453123);
            }

            // 基于两个单元格坐标生成一致的随机颜色
            vec3 randomColorFromCells(vec2 cell1, vec2 cell2){
                // 对两个单元格排序，确保相同的两个单元格总是产生相同的颜色
                vec2 minCell = min(cell1, cell2);
                vec2 maxCell = max(cell1, cell2);
                // 组合两个单元格坐标生成种子
                float seed = dot(minCell, vec2(127.1, 311.7)) + dot(maxCell, vec2(269.5, 183.3));
                return vec3(
                    fract(sin(seed * 1.0) * 43758.5453),
                    fract(sin(seed * 2.0) * 43758.5453),
                    fract(sin(seed * 3.0) * 43758.5453)
                );
            }

            // Voronoi函数，返回最小距离和最近两个单元格
            void voronoiWithCells(vec2 uv, out float minDist, out vec2 cell1, out vec2 cell2){
                vec2 p = floor(uv);
                vec2 f = fract(uv);

                float dist1 = 10.0;
                float dist2 = 10.0;
                cell1 = vec2(0.0);
                cell2 = vec2(0.0);
                
                // 找到最近的两个细胞中心
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 cellPos = neighbor + p;
                        vec2 point = random(cellPos);
                        point = 0.5 + 0.5*sin(u_time + 6.2831*point);
                        vec2 diff = neighbor + point - f;
                        float dist = length(diff);

                        if(dist < dist1){
                            dist2 = dist1;
                            cell2 = cell1;
                            dist1 = dist;
                            cell1 = cellPos;
                        } else if(dist < dist2){
                            dist2 = dist;
                            cell2 = cellPos;
                        }
                    }
                }
                // 融合距离：两个距离的乘积
                minDist = dist1 * dist2;
            }

            void main(){
                vec2 uv = vUv;
                vec3 color = vec3(0.0);
                uv *= 4.0;
                
                float m_dist;
                vec2 nearestCell1, nearestCell2;
                voronoiWithCells(uv, m_dist, nearestCell1, nearestCell2);

                float cellCenterMask = step(0.1, m_dist); // 融合区域为0，其他为1
                
                // 基于相邻的两个单元格生成颜色（融合区域颜色）
                vec3 fusionColor = randomColorFromCells(nearestCell1, nearestCell2);

                vec3 cellColor = vec3(1.0); // 非融合区域颜色（黑色）
                color = mix(fusionColor, cellColor, cellCenterMask);

                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fs29 = `
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            float hash(float n) {
                return fract(sin(n)*43758.5453123);
            }

            void main(){
                vec3 color = vec3(0.0);
                vec3 center = vec3(0.5, 0.0, 0.5);
                vec3 pp = vec3(0.0);
                float minDist = 1.0;
                float count = 500.0;
                float ceilIndex = 0.0;
                for(float i = 0.0; i < count; i++){
                    // float angle = sin(u_time*PI*0.0001)-hash(i)*PI*2.0;
                    float angle = hash(i)*PI*2.0;
                    float radius = sqrt(hash(angle))*0.8;
                    // vec2 pos = vec2(center.x + cos(angle)*radius,center.z+sin(angle)*radius);
                    vec2 pos = center.xz + vec2(cos(angle), sin(angle))*radius;
                    pos += vec2(sin(u_time + 6.2831*pos.x), cos(u_time + 6.2831*pos.y));
                    float dist = distance(vUv, pos);
                    
                    float newDist = dist*minDist*10.0;
                    if(newDist < minDist){
                        pp.xy = pos;
                        pp.z = i/count * vUv.x*vUv.y;
                        ceilIndex = i;
                        minDist = newDist;
                    }
                }

                color += step(0.001, minDist);
                // color += vec3(minDist);

                gl_FragColor = vec4(color ,1.0);
            }
`;


const fs30 = `
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            float hash(float n) {
                return fract(sin(n)*43758.5453123);
            }

            vec3 randomColorFromCells(float cellIndex){
                    // 组合两个单元格坐标生成种子
                    float seed = hash(cellIndex);
                    return vec3(
                        fract(sin(seed * 1.0) * 43758.5453),
                        fract(sin(seed * 2.0) * 43758.5453),
                        fract(sin(seed * 3.0) * 43758.5453)
                    );
                }

            void main(){
                vec3 color = vec3(0.0);
                vec3 center = vec3(0.5, 0.0, 0.5);
                vec3 pp = vec3(0.0);
                float minDist = 1.0;
                float count = 500.0;
                float ceilIndex = 0.0;
                for(float i = 0.0; i < count; i++){
                    // float angle = sin(u_time*PI*0.0001)-hash(i)*PI*2.0;
                    float angle = hash(i)*PI*2.0;
                    float radius = sqrt(hash(angle))*0.5;
                    vec2 pos = vec2(center.x + cos(angle)*radius,center.z+sin(angle)*radius);
                    pos += vec2(sin(u_time + 6.2831*pos.x), cos(u_time + 6.2831*pos.y));
                    float dist = distance(vUv, pos);
                   
                    float newDist = dist*minDist*10.0;
                    if(newDist < minDist){
                        pp.xy = pos;
                        pp.z = i/count * vUv.x*vUv.y;
                        ceilIndex = i;
                        minDist = newDist;
                    }
                }

                float mask = step(0.03, minDist);
                vec3 maskColor = vec3(1.0);
                color = mix(randomColorFromCells(ceilIndex) ,maskColor, mask);

                // color += step(0.03, minDist);



                gl_FragColor = vec4(color ,1.0);
            }
`;

const fs31 = `
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            float hash(float n) {
                return fract(sin(n)*43758.5453123);
            }

            void main(){
                vec3 center = vec3(0.5, 0.0, 0.5);
                vec3 pp = vec3(0.0);
                float length = 5.0;
                float count = 1000.0;
                vec2 closestCenter = vec2(0.0);
                
                for(float i = 0.0; i < count; i++){
                    float angle = hash(i)*PI*2.0;
                    float radius = sqrt(hash(angle))*0.5;
                    vec2 pos = vec2(center.x + cos(angle)*radius,center.z+sin(angle)*radius);
                    float dist = distance(vUv, pos);
                    length = min(length, dist);

                    if(length == dist){
                        pp.xy = pos;
                        pp.z = i/count * vUv.x*vUv.y;
                        closestCenter = pos;
                    }
                }

                // 在每个单元中心绘制圆圈
                float distToCenter = distance(vUv, closestCenter);
                float circleEdge = step(0.01,distToCenter) ;
                
                vec3 circleColor = vec3(1.0);
                vec3 finalColor = mix(circleColor, pp, circleEdge);

                gl_FragColor = vec4(finalColor, 1.0);
            }
`;

const fs32 = `
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            float hash(float n) {
                return fract(sin(n)*43758.5453123);
            }

            void main(){
                vec3 color = vec3(0.0);
                // vec3 center = vec3( sin( u_time ), 1.0, cos( u_time * 0.5 ) );
                vec3 center = vec3(0.5, 0.0, 0.5);
                vec3 pp = vec3(0.0);
                float minDist = 4.0;
                float count = 100.0;
                for(float i = 0.0; i < count; i++){
                    // float angle = sin(u_time*PI*0.0001)-hash(i)*PI*2.0;
                    float angle = hash(i)*PI*2.0;
                    float radius = sqrt(hash(angle))*0.8;
                    vec2 offset = vec2(cos(angle), sin(angle))*radius;
                    vec2 pos = center.xz + offset;
                    float dist = distance(vUv, pos);
                    minDist = min(minDist, dist);

                    if(minDist == dist){
                        pp.xy = pos;
                        pp.z = i/count * vUv.x*vUv.y;
                    }
                }

                vec3 shader = vec3(1.0)*(0.5 - max(0.0,dot(pp,center)));
                gl_FragColor = vec4(pp + shader,1.0);

                // color += smoothstep(0.01, 0.04, minDist);
                    // color += step(0.01, minDist);
                // color += minDist;
                // gl_FragColor = vec4(color ,1.0);
            }
`;

const fs33 = `
            #define PI 3.14159265359
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            float hash(float n) {
                return fract(sin(n)*43758.5453123);
            }

            void main(){
                vec3 color = vec3(0.0);
                // vec3 center = vec3( sin( u_time ), 1.0, cos( u_time * 0.5 ) );
                vec3 center = vec3(0.5, 0.0, 0.5);
                vec3 pp = vec3(0.0);
                float minDist = 4.0;
                float count = 100.0;
                for(float i = 0.0; i < count; i++){
                    // float angle = sin(u_time*PI*0.0001)-hash(i)*PI*2.0;
                    float angle = hash(i)*PI*2.0;
                    float radius = sqrt(hash(angle))*0.8;
                    vec2 offset = vec2(cos(angle), sin(angle))*radius;
                    vec2 pos = center.xz + offset;
                    float dist = distance(vUv, pos);
                    minDist = min(minDist, dist);

                    if(minDist == dist){
                        pp.xy = pos;
                        pp.z = i/count * vUv.x*vUv.y;
                    }
                }

                float radial = distance(pp.xz, center.xz);
                vec3 shader = vec3(-radial * 0.35);
                gl_FragColor = vec4(vec3(0.2,0.8,0.4) + shader,1.0);
            }
`;

const fs34 = `
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
                vec2 cellIndex;
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);
                        vec2 diff = neighbor + point - f;
                        float dist = length(diff);

                          if( dist < minDist ) {
                            minDist = dist;
                            cellIndex = point;
                        }
                    }
                }
                return vec3(minDist, cellIndex);
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                uv *= 4.0;
                vec3 res = voronoi(uv);
                float minDist = res.x;
                vec2 cellIndex = res.yz;

                // 基于UV位置的渐变基础色
                // 上方：暖灰  下方左：深橄榄  下方右：黄绿
                vec3 topColor = vec3(0.55, 0.55, 0.45);
                vec3 bottomLeft = vec3(0.20, 0.25, 0.10);
                vec3 bottomRight = vec3(0.60, 0.70, 0.15);
                
                // vUv.y 控制上下渐变，vUv.x 控制底部左右渐变
                vec3 bottomColor = mix(bottomLeft, bottomRight, vUv.x);
                vec3 baseColor = mix(bottomColor, topColor, vUv.y);
                
                // 每个单元格的随机亮度偏移，模拟低多边形光照
                float brightness = dot(cellIndex, vec2(0.15, 0.65));
                float variation = fract(sin(brightness * 43758.5453) * 2.0) * 0.3 - 0.15;
                
                color = baseColor + variation;
                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs35 = `
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
                vec2 cellIndex;
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);
                        vec2 diff = neighbor + point - f;
                        float dist = length(diff);

                          if( dist < minDist ) {
                            minDist = dist;
                            cellIndex = point;
                        }
                    }
                }
                return vec3(minDist, cellIndex);
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
                        vec2 diff = neighbor + point - fpos;
                        float dist = length(diff);

                        if( dist < m_dist ) {
                            m_dist = dist;
                            m_point = point;
                        }
                    }
                }

                float minDist = voronoi(uv).x;
                vec2 cellIndex = voronoi(uv).yz;

                color = vec3(dot(cellIndex,vec2(.3,.6)));


                gl_FragColor = vec4(color, 1.0);

            }
        `;