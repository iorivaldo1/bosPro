const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

const fragmentShader1 = `
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
                point[4] = u_mouse;  // 第5个点跟随鼠标
                float m_dist = 1.0;

                for (int i = 0; i < 5; i++) {
                    vec2 p =0.5 + 0.5*sin(u_time + 6.2831*point[i]);
                    
                    float dist = distance(uv, p);

                    m_dist = min(m_dist, dist);
                }
                color += m_dist;
                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fragmentShader2 = `
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

const fragmentShader3 = `
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

const fragmentShader4 = `
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

const fragmentShader5 = `
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

                color += 1.0 - step(0.02, dist);

                color.r += step(.98, fpos.x) + step(.98, fpos.y);

                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fragmentShader6 = `
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

                        vec2 point = random(ipos + neighbor);
                        point = 0.5 + 0.5*sin(u_time + 6.2831*point);
                        vec2 diff = neighbor + point - fpos;
                        float dist = length(diff);

                        m_dist = min(m_dist, dist);
                    }
                }

                vec2 point = random(ipos);
                vec2 diff = point - fpos;
                float dist = length(diff);

                color += m_dist;

                color += 1.0 - step(0.02, m_dist);

                color.r += step(.98, fpos.x) + step(.98, fpos.y);

                gl_FragColor = vec4(color, 1.0);

            }
        `;