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

              vec2 voronoi(vec2 uv){
                vec2 p = floor(uv);
                vec2 f = fract(uv);

                float minDist = 1.0;
                float cellIndex;
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);
                        vec2 diff = neighbor + point - f;
                        float dist = length(diff);

                        if( dist < minDist ) {
                            minDist = dist;
                            cellIndex = point.x;
                        }
                    }
                }
                return vec2(minDist, cellIndex);
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                uv *= 5.0;


                float minDist = voronoi(uv).x;
                float cellIndex = voronoi(uv).y;
                float cellCenterMask = step(0.02, minDist); // 细胞中心为0，边界为1

                color = mix(vec3(1.0,0.0,0.0), vec3(cellIndex),cellCenterMask);

                gl_FragColor = vec4(color, 1.0);

            }
        `;


const fs2 = `
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
                        // point = 0.5 + 0.5*sin(u_time + 6.2831*point) ;
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
                        // point = 0.5 + 0.5*sin(u_time + 6.2831*point) ;
                        
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

const fs3 = `
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

                vec2 res = vec2(0.0);

                // 第一遍：找到最近的种子点
                vec2 closestPoint;
                vec2 closestCell;
                float minDist = 10.0;
                
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);
                        // point = 0.5 + 0.5*sin(u_time + 6.2831*point) ;
                        vec2 diff = neighbor + point - f;
                        float dist = length(diff);
                        
                        if (dist < minDist) {
                            minDist = dist;
                            closestPoint = point;
                            closestCell = neighbor;
                        }
                    }
                }
                res.x = minDist;
                

                float edgeDist = 10.0;
                
                for(int j=-2;j<=2;j++){
                    for(int i=-2;i<=2;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);

                        vec2 cellDiff = neighbor - closestCell;
                        if(dot(cellDiff, cellDiff) < 0.1) continue;
                        
                        vec2 closestPos = closestCell + closestPoint - f;
                        vec2 otherPos = neighbor + point - f;
                        vec2 midPoint = (closestPos + otherPos) * 0.5;

                        vec2 edgeDir = normalize(otherPos - closestPos);
                        
                        float dist = abs(dot(midPoint, edgeDir));
                        
                        edgeDist = min(edgeDist, dist);
                    }
                }

                res.y = edgeDist;
                
                return res;
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                uv *= 6.0;

                float minDist = voronoi(uv).x;
                float cellCenterMask = step(0.02, minDist);
                
                float edge = voronoi(uv).y;
                float edgeMask = step(0.01, edge);

                // color = mix(vec3(1.0), vec3(0.0),cellCenterMask);

                // color = mix(vec3(0.0), vec3(1.0), edgeMask);

                color = mix(vec3(0.0),vec3(cellCenterMask),edgeMask);

                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs4 = `
           varying vec2 vUv;
uniform vec2 u_mouse;
uniform float u_time;

vec2 random (vec2 vUv){
    vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
    return fract(sin(vUv)*43758.5453123);
}

// 返回值改为 vec3: x=到种子点距离, y=最近的边距离, z=第二近的边距离
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
            // 可以取消注释让点动起来
            // point = 0.5 + 0.5*sin(u_time + 6.2831*point) ;
            vec2 diff = neighbor + point - f;
            float dist = length(diff);
            
            if (dist < minDist) {
                minDist = dist;
                closestPoint = point;
                closestCell = neighbor;
            }
        }
    }

    float edgeDist = 10.0;
    float edgeDist2 = 10.0; // 新增：记录第二近的边距离
    
    // 第二遍：计算边缘距离
    for(int j=-2;j<=2;j++){
        for(int i=-2;i<=2;i++){
            vec2 neighbor = vec2(float(i), float(j));
            vec2 point = random(neighbor + p);

            vec2 cellDiff = neighbor - closestCell;
            if(dot(cellDiff, cellDiff) < 0.1) continue;
            
            vec2 closestPos = closestCell + closestPoint - f;
            vec2 otherPos = neighbor + point - f;
            vec2 midPoint = (closestPos + otherPos) * 0.5;

            vec2 edgeDir = normalize(otherPos - closestPos);
            
            float dist = abs(dot(midPoint, edgeDir));
            
            // 新增逻辑：同时维护最小值和次小值
            if (dist < edgeDist) {
                edgeDist2 = edgeDist;
                edgeDist = dist;
            } else if (dist < edgeDist2) {
                edgeDist2 = dist;
            }
        }
    }

    return vec3(minDist, edgeDist, edgeDist2);
}

void main(){
    vec2 uv = vUv;
    uv *= 6.0;

    vec3 vData = voronoi(uv);
    float minDist = vData.x;
    float edgeDist = vData.y;
    float edgeDist2 = vData.z; // 获取第二近的边

    // 1. 绘制种子点 (中心白色点)
    float cellCenterMask = 1.0 - step(0.04, minDist);
    
    // 2. 绘制边缘 (灰色线)
    float edgeMask = 1.0 - step(0.015, edgeDist);

    // 3. 绘制顶点 (红色点)
    // 顶点是距离两条边都很近的地方，用 length 组合两者可以得到一个圆润的顶点
    float vertexDist = length(vec2(edgeDist, edgeDist2));
    float vertexMask = 1.0 - step(0.05, vertexDist);

    // 组合颜色
    vec3 color = vec3(0.0); // 背景纯黑
    color = mix(color, vec3(0.4), edgeMask);       // 铺上灰色的边
    color = mix(color, vec3(1.0, 1.0, 1.0), cellCenterMask); // 铺上白色的中心点
    color = mix(color, vec3(1.0, 0.0, 0.0), vertexMask);     // 铺上红色的顶点！

    gl_FragColor = vec4(color, 1.0);
}
        `;

const fs5 = `
varying vec2 vUv;
uniform vec2 u_mouse;
uniform float u_time;

vec2 random (vec2 vUv){
    vUv = vec2( dot(vUv,vec2(127.1,311.7)), dot(vUv,vec2(269.5,183.3)) );
    return fract(sin(vUv)*43758.5453123);
}

// 提取一个生成随机颜色的函数
vec3 randomColor(vec2 id) {
    return vec3(
        fract(sin(dot(id, vec2(12.9898, 78.233))) * 43758.5453),
        fract(sin(dot(id, vec2(39.346, 11.135))) * 43758.5453),
        fract(sin(dot(id, vec2(73.156, 52.235))) * 43758.5453)
    );
}

// 返回值：x=中心点距离, y=边缘距离, z=第二边缘距离, w=子区域随机灰度
vec4 voronoi(vec2 uv){
    vec2 p = floor(uv);
    vec2 f = fract(uv);

    vec2 closestPoint;
    vec2 closestCell;
    float minDist = 10.0;
    
    // 第一遍：找最近的种子点 (也就是当前 Cell 的主人)
    for(int j=-1;j<=1;j++){
        for(int i=-1;i<=1;i++){
            vec2 neighbor = vec2(float(i), float(j));
            vec2 point = random(neighbor + p);
            
            // 让点动起来会更好看
            // point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);
            
            vec2 diff = neighbor + point - f;
            float dist = length(diff);
            
            if (dist < minDist) {
                minDist = dist;
                closestPoint = point;
                closestCell = neighbor;
            }
        }
    }

    float edgeDist = 10.0;
    float edgeDist2 = 10.0;
    vec2 closestNeighborId; // 新增：记录是哪个邻居切出了最近的边
    
    // 第二遍：计算边缘并划分"三角"子区域
    for(int j=-2;j<=2;j++){
        for(int i=-2;i<=2;i++){
            vec2 neighbor = vec2(float(i), float(j));
            vec2 point = random(neighbor + p);

            vec2 cellDiff = neighbor - closestCell;
            if(dot(cellDiff, cellDiff) < 0.1) continue;
            
            vec2 closestPos = closestCell + closestPoint - f;
            vec2 otherPos = neighbor + point - f;
            vec2 midPoint = (closestPos + otherPos) * 0.5;

            vec2 edgeDir = normalize(otherPos - closestPos);
            float dist = abs(dot(midPoint, edgeDir));
            
            if (dist < edgeDist) {
                edgeDist2 = edgeDist;
                edgeDist = dist;
                // 核心魔法：记录当前区域受哪个邻居的影响最大
                closestNeighborId = neighbor + p; 
            } else if (dist < edgeDist2) {
                edgeDist2 = dist;
            }
        }
    }

    // 根据影响最大的邻居ID，生成一个随机灰度值，用来区分"三角"切面
    float facetShade = fract(sin(dot(closestNeighborId, vec2(12.9898, 78.233))) * 43758.5453);

    return vec4(minDist, edgeDist, edgeDist2, facetShade);
}

void main(){
    vec2 uv = vUv;
    uv *= 6.0;

    vec4 vData = voronoi(uv);
    float minDist = vData.x;
    float edgeDist = vData.y;
    float edgeDist2 = vData.z;
    float facetShade = vData.w; // 获取切面灰度

    // 绘制基础遮罩
    float cellCenterMask = 1.0 - step(0.04, minDist);
    float edgeMask = 1.0 - step(0.015, edgeDist);
    float vertexDist = length(vec2(edgeDist, edgeDist2));
    float vertexMask = 1.0 - step(0.05, vertexDist);

    // 1. 晶体切面底色：将原本纯黑的背景替换为子区域的颜色
    // 我们用基础颜色乘密切面灰度，产生3D立体的折纸/晶体感
    vec3 baseColor = vec3(0.2, 0.5, 0.8); // 可以换成你喜欢的颜色
    vec3 color = baseColor * (0.3 + 0.7 * facetShade); 

    // 2. 画出从中心到顶点的"分割线" (可选，加强三角感)
    // 如果一个像素离两条边差不多近，说明它在两条边的交界线上（也就是中心到顶点的线上）
    float innerLines = smoothstep(0.0, 0.02, abs(edgeDist - edgeDist2));
    color = mix(vec3(1.0), color, innerLines);

    // 3. 叠加原有的边、中心点和顶点
    color = mix(color, vec3(0.1), edgeMask);       // 黑色边框
    color = mix(color, vec3(1.0), cellCenterMask); // 白色中心点
    color = mix(color, vec3(1.0, 0.2, 0.2), vertexMask); // 红色顶点

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

    vec3 getFacetData(vec2 uv){
        vec2 p = floor(uv);
        vec2 f = fract(uv);

        vec2 closestPoint;
        vec2 closestCell;
        float minDist = 10.0;
        
        for(int j=-1;j<=1;j++){
            for(int i=-1;i<=1;i++){
                vec2 neighbor = vec2(float(i), float(j));
                vec2 point = random(neighbor + p);
                
                vec2 diff = neighbor + point - f;
                float dist = length(diff);
                
                if (dist < minDist) {
                    minDist = dist;
                    closestPoint = point;
                    closestCell = neighbor;
                }
            }
        }

        float edgeDist = 10.0;
        vec2 closestNeighborId; 
        
        for(int j=-1;j<=1;j++){
            for(int i=-1;i<=1;i++){
                vec2 neighbor = vec2(float(i), float(j));
                vec2 point = random(neighbor + p);

                vec2 cellDiff = neighbor - closestCell;
                if(dot(cellDiff, cellDiff) < 0.1) continue;
                
                vec2 closestPos = closestCell + closestPoint - f;
                vec2 otherPos = neighbor + point - f;
                vec2 midPoint = (closestPos + otherPos) * 0.5;

                vec2 edgeDir = normalize(otherPos - closestPos);
                float dist = abs(dot(midPoint, edgeDir));
                
                if (dist < edgeDist) {
                    edgeDist = dist;
                    closestNeighborId = neighbor + p; 
                }
            }
        }

        float shade = fract(sin(dot(closestNeighborId, vec2(12.9898, 78.233))) * 43758.5453);
        return vec3(shade, closestNeighborId);
    }

    void main(){
        vec2 uv = vUv;
        uv *= 3.0;

        vec3 facetData = getFacetData(uv);
        float facetShade = facetData.x;
        vec2 normalizedPos = facetData.yz / 3.0;

        vec3 colKhaki = vec3(0.65, 0.61, 0.54);
        vec3 colOlive = vec3(0.40, 0.48, 0.15);
        vec3 colDark  = vec3(0.12, 0.16, 0.05);

        float wTopLeft = smoothstep(-0.2, 1.2, (1.0 - normalizedPos.x) + normalizedPos.y); 
        vec3 baseColor = mix(colOlive, colKhaki, wTopLeft * 0.8);
        vec3 color = mix(colDark, baseColor, 0.15 + 0.85 * facetShade); 

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

            vec2 voronoi(vec2 uv){
                vec2 p = floor(uv);
                vec2 f = fract(uv);

                float minDist = 1.0;
                float cellIndex;
                for(int j=-1;j<=1;j++){
                    for(int i=-1;i<=1;i++){
                        vec2 neighbor = vec2(float(i), float(j));
                        vec2 point = random(neighbor + p);
                        vec2 diff = neighbor + point - f;
                        float dist = length(diff);

                        if( dist < minDist ) {
                            minDist = dist;
                            cellIndex = point.x;
                        }
                    }
                }
                return vec2(minDist, cellIndex);
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                uv *= 50.0;

                // float cellIndex = voronoi(uv).y;

                // color += cellIndex;

                color += voronoi(uv).x;

                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs8 = `
            varying vec2 vUv;
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
                return minDist;
            }

            void main(){
                vec2 uv = vUv ;
                vec3 color = vec3(0.0);
                uv *= 50.0;



                color += Worley(uv);

                gl_FragColor = vec4(color, 1.0);

            }
        `;

const fs9 = `
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
                        // point = 0.5 + 0.5*sin(u_time + 6.2831*point) ;
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
                        // point = 0.5 + 0.5*sin(u_time + 6.2831*point) ;
                        
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
                // color += step(0.01, edge);

                color += edge*(0.5 + 0.5*sin(128.0*edge))*vec3(1.0);

                gl_FragColor = vec4(color, 1.0);

            }
        `;