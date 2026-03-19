
const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

const fragmentShader1 = `
            varying vec2 vUv;

            float circle(vec2 vUv, float radius){
                return smoothstep(radius+0.001,radius,length(vUv-0.5));
            }

            void main() {
                vec2 pos = fract(vUv * 5.0);
                vec3 color = vec3(circle(pos,0.25));

                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader2 = `
            #define PI 3.1415926535
            #define TWO_PI 6.28318530718
            varying vec2 vUv;

            float geometrySDF(vec2 uv, vec2 center){
                vec2 p = uv - center;
                float a = atan(p.y, p.x);
                int N = 5;
                float r = TWO_PI/float(N);
                return cos(floor(0.5 + a/r)*r - a) * length(p);
            }

            float circle(vec2 vUv, float radius){
                return  smoothstep(radius+0.001,radius,length(vUv-0.5));
            }

            void main() {
                vec2 scaledUv = vUv * 3.0;
                vec2 gridPos = floor(scaledUv);
                vec2 pos = fract(scaledUv);

                float shapeC = 0.0;
                float shapeT = 0.0;

                float matchX = 1.0 - step(0.1,abs(gridPos.x - 2.0));
                float matchY = 1.0 - step(0.1,abs(gridPos.y - 1.0));
                shapeC = circle(pos,0.25) * matchX * matchY;

                float matchX2 = 1.0 - step(0.1,abs(gridPos.x - 2.0));
                float matchY2 = 1.0 - step(0.1,abs(gridPos.y - 2.0));
                float tri = geometrySDF(pos,vec2(0.5,0.5));
                shapeT = (smoothstep(0.151,0.15,tri)) * matchX2 * matchY2;
     
                vec3 color = vec3(shapeC + shapeT);
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader3 = `
            #define PI 3.1415926535
            #define TWO_PI 6.28318530718
            varying vec2 vUv;

            float geometrySDF(vec2 uv){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 4;
                float r = TWO_PI/float(N);
                return cos(floor(0.5 + a/r)*r - a) * length(p);
            }

            mat2 rotate2d(float angle){
                return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
            }

            void main() {
                vec2 scaledUv = vUv * 6.0;
                vec2 pos = fract(scaledUv) - 0.5;
                vec2 center = vec2(0.5,0.5);
                
                pos = rotate2d(PI/4.0) * pos;

                float tri = geometrySDF(pos);
                
                vec3 color = vec3( smoothstep(0.351,0.35,tri));
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader4 = `
            #define PI 3.1415926535
            #define TWO_PI 6.28318530718
            varying vec2 vUv;

            float geometrySDF(vec2 uv){
                vec2 p = uv ;
                float a = atan(p.y, p.x);
                int N = 4;
                float r = TWO_PI/float(N);
                return cos(floor(0.5 + a/r)*r - a) * length(p);
            }

            mat2 rotate2d(float angle){
                return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
            }

            void main() {
                vec2 scaledUv = vUv * 5.0;
                vec2 pos = fract(scaledUv) - 0.5;
                vec2 posIndex = floor(scaledUv);
                
                pos = rotate2d(PI/4.0) * pos;

                float matchX = step(abs(posIndex.x - 1.0), 0.1);
                float matchY = step(abs(posIndex.y - 3.0), 0.1);

                float tri = geometrySDF(pos);
                
                vec3 color =vec3(smoothstep(0.351,0.35,tri));
                vec3 baseColor = mix(vec3(1.0), vec3(1.0, 0.0, 0.0), matchX * matchY);
                color = color * baseColor;
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader5 = `
            #define PI 3.1415926535
            #define TWO_PI 6.28318530718
            varying vec2 vUv;
            uniform float u_time;

            float geometrySDF(vec2 uv){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 5;
                float r = TWO_PI/float(N);
                return cos(floor(0.5 + a/r)*r - a) * length(p);
            }

            mat2 rotate2d(float angle){
                return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
            }

            void main() {
                vec2 scaledUv = vUv * 3.0;
                vec2 pos = fract(scaledUv) - 0.5;
                vec2 posIndex = floor(scaledUv);
                
                float angle = u_time * 0.5;
                pos = rotate2d(angle) * pos;

                float tri = geometrySDF(pos);
                float isMatch = 1.0 - step(0.1, length(posIndex - vec2(1.0, 0.0)));

                vec3 baseColor = mix(vec3(1.0), vec3(1.0, 0.0, 0.0), isMatch);
                vec3 color =  baseColor * smoothstep(0.351, 0.35, tri) ;
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader6 = `
            varying vec2 vUv;

            float lineSDF(vec2 p, vec2 a, vec2 b) {
                vec2 pa = p - a, ba = b - a;
                float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
                return length(pa - ba * h);
            }

            void main() {
                // float pl = step(abs(vUv.x -vUv.y),0.01);
                // float pl = step(vUv.y - 0.51,0.01) * step(0.01,vUv.y -0.5);
                // float pl = step(lineSDF(vUv,vec2(0.0,0.5),vec2(1.0,0.5)),0.01);

                float lineSegment = lineSDF(vUv, vec2(0.2, 0.2), vec2(0.8, 0.8));
                float pl = smoothstep(0.015, 0.01, lineSegment);
                
                vec3 color = vec3(pl);
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader7 = `
            varying vec2 vUv;

            float box(vec2 uv, vec2 center, vec2 size) {
                vec2 d = abs(uv - center) - size / 2.0;
                float res =  step(max(d.x, d.y), 0.0);
                return res;
            }

            void main() {
                vec2 scaledUv = vUv * 5.0;
                scaledUv.x += step(1.0, mod(scaledUv.y,2.0)) * 0.2;

                vec2 pos = fract(scaledUv) ;
                float tp = box(pos,vec2(0.5), vec2(0.9));                
                vec3 color = vec3(tp);
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader8 = `
            varying vec2 vUv;
            uniform float u_time;
            float box(vec2 uv, vec2 center, vec2 size) {
                vec2 d = abs(uv - center) - size / 2.0;
                float res =  step(max(d.x, d.y), 0.0);
                return res;
            }

            void main() {
                vec2 scaledUv = vUv * 6.0;

                float rowIndex = floor(scaledUv.y);

                scaledUv.x -= (1.0 - mod(rowIndex,2.0)) * fract(u_time * 0.5);
                scaledUv.x += mod(rowIndex,2.0) * fract(u_time * 0.5);


                vec2 pos = fract(scaledUv) ;
                float tp = box(pos,vec2(0.5), vec2(0.9));                
                vec3 color = vec3(tp);
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader9 = `
            varying vec2 vUv;
            uniform float u_time;
            float box(vec2 uv, vec2 center, vec2 size) {
                vec2 d = abs(uv - center) - size / 2.0;
                float res =  step(max(d.x, d.y), 0.0);
                return res;
            }

            void main() {
                vec2 scaledUv = vUv * 6.0;

                float colIndex = floor(scaledUv.x);

                scaledUv.y -= (1.0 - mod(colIndex,2.0)) * fract(u_time * 0.5);
                scaledUv.y += mod(colIndex,2.0) * fract(u_time * 0.5);


                vec2 pos = fract(scaledUv) ;
                float tp = box(pos,vec2(0.5), vec2(0.9));                
                vec3 color = vec3(tp);
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader10 = `
            varying vec2 vUv;
            uniform float u_time;
            
            float circle(vec2 vUv, float radius){
                return  smoothstep(radius,radius+0.001,length(vUv-0.5));
            }

            void main() {
                vec2 scaledUv = vUv * 6.0;

                float colIndex = floor(scaledUv.x);

                scaledUv.y -= (1.0 - mod(colIndex,2.0)) * fract(u_time * 0.5);
                scaledUv.y += mod(colIndex,2.0) * fract(u_time * 0.5);

                vec2 pos = fract(scaledUv) ;
                float tp = circle(pos,0.19);                
                vec3 color = vec3(tp);
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader11 = `
            varying vec2 vUv;
            uniform float u_time;
            
            float circle(vec2 vUv, float radius){
                return  smoothstep(radius,radius+0.001,length(vUv-0.5));
            }

            void main() {
                vec2 scaledUv = vUv * 6.0;

                float rowIndex = floor(scaledUv.y);
                float colIndex = floor(scaledUv.x);

                float t = u_time ;
                float cycle = mod(t, 2.0);
                float offsetX = clamp(cycle, 0.0, 1.0);
                float offsetY = clamp(cycle - 1.0, 0.0, 1.0);
                scaledUv.x -= (1.0 - mod(rowIndex, 2.0)) * offsetX;
                scaledUv.x += mod(rowIndex, 2.0) * offsetX;
                scaledUv.y -= (1.0 - mod(colIndex, 2.0)) * offsetY;
                scaledUv.y += mod(colIndex, 2.0) * offsetY;

                vec2 pos = fract(scaledUv) ;
                float tp = circle(pos,0.19);                
                vec3 color = vec3(tp);
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader12 = `
            #define PI 3.1415926535
            #define TWO_PI 6.28318530718
            varying vec2 vUv;

            float geometrySDF(vec2 uv){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 3;
                float r = TWO_PI/float(N);
                return cos(floor(0.5 + a/r)*r - a) * length(p);
            }

            mat2 rotate2d(float angle){
                return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
            }

            void main() {
                float divideXY = 2.0;
                vec2 pos = fract(vUv * divideXY) ;
                vec2 scaledUv = pos* divideXY * 2.0 ;
                pos = fract(scaledUv) - 0.5;
                
                float colIndex = floor(scaledUv.x)  ;
                float rowIndex = floor(scaledUv.y)  ;

                float matchX = step(abs(colIndex - 0.0), 0.1);
                float matchY = step(abs(rowIndex - 0.0), 0.1);

                float matchX2 = step(abs(colIndex - 1.0), 0.1);
                float matchY2 = step(abs(rowIndex - 1.0), 0.1);
                
                float tri = geometrySDF(pos);
                
                vec3 color = vec3( smoothstep(0.251,0.25,tri));
                vec3 baseColor = mix(vec3(1.0), vec3(1.0, 0.0, 0.0), matchX * matchY);
                baseColor = mix(baseColor, vec3(0.0, 1.0, 0.0), matchX2 * matchY2);
                color = color * baseColor;
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader13 = `
            #define PI 3.1415926535
            #define TWO_PI 6.28318530718
            varying vec2 vUv;

            float geometrySDF(vec2 uv){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 3;
                float r = TWO_PI/float(N);
                return cos(floor(0.5 + a/r)*r - a) * length(p);
            }

            mat2 rotate2d(float angle){
                return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
            }

            void main() {
                vec2 scaledUv = vUv * 6.0;
                vec2 pos = fract(scaledUv) - 0.5;

                vec2 scaledUv2 = pos*4.0;
                pos = fract(scaledUv2) - 0.5;
                
                float colIndex = floor(scaledUv2.x) ;
                float rowIndex = floor(scaledUv2.y) ;

                float evenCol = mod(colIndex,2.0);
                float evenRow = mod(rowIndex,2.0);
                float oddCol = 1.0 - evenCol;
                float oddRow = 1.0 - evenRow;

                pos = mix(pos,rotate2d(0.2)*pos, evenCol*evenRow);
                pos = mix(pos,rotate2d(0.4)*pos, oddCol*oddRow);
                pos = mix(pos,rotate2d(0.6)*pos, evenCol*oddRow);
                pos = mix(pos,rotate2d(0.8)*pos, oddCol*evenRow);

                float tri = geometrySDF(pos);
                
                vec3 color = vec3( smoothstep(0.251,0.25,tri));
                vec3 baseColor = mix(vec3(1.0), vec3(1.0, 0.0, 0.0), evenCol*evenRow);
                baseColor = mix(baseColor, vec3(0.0, 1.0, 0.0), oddCol*oddRow);
                baseColor = mix(baseColor, vec3(0.0, 0.0, 1.0), evenCol*oddRow);
                baseColor = mix(baseColor, vec3(1.0, 0.0, 1.0), oddCol*evenRow);
                color = color * baseColor;
                gl_FragColor = vec4(color, 1.0);
            }
        `;


const fragmentShader14 = `
            #define PI 3.1415926535
            #define TWO_PI 6.28318530718
            varying vec2 vUv;
            uniform float u_time;

            float geometrySDF(vec2 uv){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 3;
                float r = TWO_PI/float(N);
                return cos(floor(0.5 + a/r)*r - a) * length(p);
            }

            mat2 rotate2d(float angle){
                return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
            }

            void main() {
                float gridSize = 3.0;
                vec2 scaledUv = vUv * 2.0;
                vec2 pos = fract(scaledUv) - 0.5;
                vec2 scaledUv2 = pos* gridSize * 2.0 ;
                pos = fract(scaledUv2) - 0.5;

                float colIndex = floor(scaledUv2.x)  ;
                float rowIndex = floor(scaledUv2.y)  ;

                float evenCol = mod(colIndex,2.0);
                float evenRow = mod(rowIndex,2.0);
                float oddCol = 1.0 - evenCol;
                float oddRow = 1.0 - evenRow;

                float angle = u_time * 0.5;

                pos = mix(pos,rotate2d(angle)*pos, evenCol*evenRow);
                pos = mix(pos,rotate2d(angle)*pos, oddCol*oddRow);
                pos = mix(pos,rotate2d(angle)*pos, evenCol*oddRow);
                pos = mix(pos,rotate2d(angle)*pos, oddCol*evenRow);

                float tri = geometrySDF(pos);
                
                vec3 color = vec3( smoothstep(0.251,0.25,tri));
                vec3 baseColor = mix(vec3(1.0), vec3(1.0, 0.0, 0.0), evenCol*evenRow);
                baseColor = mix(baseColor, vec3(0.0, 1.0, 0.0), oddCol*oddRow);
                baseColor = mix(baseColor, vec3(0.0, 0.0, 1.0), evenCol*oddRow);
                baseColor = mix(baseColor, vec3(1.0, 0.0, 1.0), oddCol*evenRow);
                color = color * baseColor;
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader15 = `
            #define PI 3.1415926535
            #define TWO_PI 6.28318530718
            varying vec2 vUv;
            uniform float u_time;

            float geometrySDF(vec2 uv){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 3;
                float r = TWO_PI/float(N);
                return cos(floor(0.5 + a/r)*r - a) * length(p);
            }

            mat2 rotate2d(float angle){
                return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
            }

            void main() {
                float gridSize = 2.0;
                vec2 pos = fract(vUv * gridSize) - 0.5;
                vec2 scaledUv = pos* gridSize * 2.0 ;
                pos = fract(scaledUv) - 0.5;
                
                float colIndex = floor(scaledUv.x) ;
                float rowIndex = floor(scaledUv.y) ;

                float evenCol = mod(colIndex,2.0);
                float evenRow = mod(rowIndex,2.0);
                float oddCol = 1.0 - evenCol;
                float oddRow = 1.0 - evenRow;

                float angle = u_time * 0.5;

                pos = mix(pos,rotate2d(angle)*pos, evenCol*evenRow);
                pos = mix(pos,rotate2d(angle)*pos, oddCol*oddRow);
                pos = mix(pos,rotate2d(angle)*pos, evenCol*oddRow);
                pos = mix(pos,rotate2d(angle)*pos, oddCol*evenRow);

                float tri = geometrySDF(pos);
                
                vec3 color = vec3( smoothstep(0.251,0.25,tri));
                vec3 baseColor = mix(vec3(1.0), vec3(1.0, 0.0, 0.0), evenCol*evenRow);
                baseColor = mix(baseColor, vec3(0.0, 1.0, 0.0), oddCol*oddRow);
                baseColor = mix(baseColor, vec3(0.0, 0.0, 1.0), evenCol*oddRow);
                baseColor = mix(baseColor, vec3(1.0, 0.0, 1.0), oddCol*evenRow);
                color = color * baseColor;
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader16 = `
            #define PI 3.1415926535
            #define TWO_PI 6.28318530718
            varying vec2 vUv;

            float geometrySDF(vec2 uv){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 3;
                float r = TWO_PI/float(N);
                return cos(floor(0.5 + a/r)*r - a) * length(p);
            }

            mat2 rotate2d(float angle){
                return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
            }

            void main() {
                float divideX = 5.0;
                float divideY = 3.0;
                
                vec2 scaledUv = vUv * vec2(divideX, divideY);
                vec2 pos = fract(scaledUv) - 0.5;
                float colIndex = floor(scaledUv.x)  ;
                float rowIndex = floor(scaledUv.y)  ;

                float evenCol = mod(colIndex,2.0);
                float evenRow = mod(rowIndex,2.0);
                float oddCol = 1.0 - evenCol;
                float oddRow = 1.0 - evenRow;
                
                float tri = geometrySDF(pos);
                
                vec3 color = vec3(smoothstep(0.251,0.25,tri));
                vec3 baseColor = mix(vec3(1.0), vec3(1.0, 0.0, 0.0), evenRow);
                color = color * baseColor;
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader17 = `
            #define PI 3.1415926535
            #define TWO_PI 6.28318530718
            varying vec2 vUv;

            float geometrySDF(vec2 uv){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 3;
                float r = TWO_PI/float(N);
                return cos(floor(0.5 + a/r)*r - a) * length(p);
            }

            mat2 rotate2d(float angle){
                return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
            }

            void main() {
                float divideX = 5.0;
                float divideY = 3.0;
                
                vec2 scaledUv = vUv * vec2(divideX, divideY);
                vec2 pos = fract(scaledUv) - 0.5;
                
                //判断指定的行列要+divideXY,否则index会从负的divideXY开始
                float colIndex = floor(scaledUv.x) ;
                float rowIndex = floor(scaledUv.y) ;

                float matchX = step(abs(colIndex - 0.0), 0.1);
                float matchY = step(abs(rowIndex - 1.0), 0.1);

                float matchX2 = step(abs(colIndex - 1.0), 0.1);
                float matchY2 = step(abs(rowIndex - 1.0), 0.1);
                
                float tri = geometrySDF(pos);
                
                vec3 color = vec3( smoothstep(0.251,0.25,tri));
                vec3 baseColor = mix(vec3(1.0), vec3(1.0, 0.0, 0.0), matchX * matchY);
                baseColor = mix(baseColor, vec3(0.0, 1.0, 0.0), matchX2 * matchY2);
                color = color * baseColor;
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader18 = `
            #define PI 3.1415926535
            #define TWO_PI 6.28318530718
            varying vec2 vUv;

            float geometrySDF(vec2 uv){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 5;
                float r = TWO_PI/float(N);
                return cos(floor(0.5 + a/r)*r - a) * length(p);
            }

            mat2 rotate2d(float angle){
                return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
            }

            void main() {
                float divideX = 9.0;
                float divideY = 3.0;
                vec2 scaledUv = vUv * vec2(divideX, divideY);
                //第一次分割，不进行中心偏移
                vec2 pos = fract(scaledUv) ;

                float divideX2 = 3.0;
                float divideY2 = 3.0;
                vec2 scaledUv2 = pos * vec2(divideX2, divideY2);
                //第二次分割，要计算geometrySDF的中心，所以要进行中心偏移
                pos = fract(scaledUv2) - 0.5;
                
                float colIndex = floor(scaledUv2.x)   ;
                float rowIndex = floor(scaledUv2.y)   ;

                float matchX = step(abs(colIndex - 0.0), 0.1);
                float matchY = step(abs(rowIndex - 0.0), 0.1);

                float matchX2 = step(abs(colIndex - 1.0), 0.1);
                float matchY2 = step(abs(rowIndex - 1.0), 0.1);
                
                float tri = geometrySDF(pos);
                
                vec3 color = vec3( smoothstep(0.251,0.25,tri));
                vec3 baseColor = mix(vec3(1.0), vec3(1.0, 0.0, 0.0), matchX * matchY);
                baseColor = mix(baseColor, vec3(0.0, 1.0, 0.0), matchX2 * matchY2);
                color = color * baseColor;
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader19 = `
            #define PI 3.1415926535
            #define TWO_PI 6.28318530718
            varying vec2 vUv;

            float geometrySDF(vec2 uv){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 5;
                float r = TWO_PI/float(N);
                return cos(floor(0.5 + a/r)*r - a) * length(p);
            }

            mat2 rotate2d(float angle){
                return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
            }

            void main() {
                float divideX = 9.0;
                float divideY = 3.0;
                vec2 scaledUv = vUv * vec2(divideX, divideY);
                //第一次分割，不进行中心偏移
                vec2 pos = fract(scaledUv) ;

                float divideX2 = 3.0;
                float divideY2 = 3.0;
                vec2 scaledUv2 = pos * vec2(divideX2, divideY2);
                //第二次分割，要计算geometrySDF的中心，所以要进行中心偏移
                pos = fract(scaledUv2) - 0.5;
                
                float colIndex = floor(scaledUv2.x);
                float rowIndex = floor(scaledUv2.y);

                float evenCol = mod(colIndex,2.0);
                float evenRow = mod(rowIndex,2.0);
                float oddCol = 1.0 - evenCol;
                float oddRow = 1.0 - evenRow;

                float tri = geometrySDF(pos);
                
                vec3 color = vec3( smoothstep(0.251,0.25,tri));
                vec3 baseColor = mix(vec3(1.0), vec3(1.0, 0.0, 0.0), evenRow);
                baseColor = mix(baseColor, vec3(0.0, 1.0, 0.0), oddRow);
                color = color * baseColor;
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader20 = `
            #define PI 3.1415926535
            #define TWO_PI 6.28318530718
            varying vec2 vUv;
            uniform float u_time;

            float geometrySDF(vec2 uv){
                vec2 p = uv;
                float a = atan(p.y, p.x);
                int N = 5;
                float r = TWO_PI/float(N);
                return cos(floor(0.5 + a/r)*r - a) * length(p);
            }

            mat2 rotate2d(float angle){
                return mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
            }

            void main() {
                float divideX = 9.0;
                float divideY = 7.0;
                vec2 scaledUv = vUv * vec2(divideX, divideY);
                //第一次分割，不进行中心偏移
                vec2 pos = fract(scaledUv) ;

                float divideX2 = 3.0;
                float divideY2 = 3.0;
                vec2 scaledUv2 = pos * vec2(divideX2, divideY2);
                //第二次分割，要计算geometrySDF的中心，所以要进行中心偏移
                pos = fract(scaledUv2) - 0.5;
                
                float colIndex = floor(scaledUv2.x);
                float rowIndex = floor(scaledUv2.y);

                float evenCol = mod(colIndex,2.0);
                float evenRow = mod(rowIndex,2.0);
                float oddCol = 1.0 - evenCol;
                float oddRow = 1.0 - evenRow;

                float angle = u_time * 0.5;
                pos = mix(pos,rotate2d(angle)*pos, evenCol*evenRow);
                pos = mix(pos,rotate2d(angle + 0.2)*pos, oddCol*oddRow);
                pos = mix(pos,rotate2d(angle + 0.4)*pos, evenCol*oddRow);
                pos = mix(pos,rotate2d(angle + 0.6)*pos, oddCol*evenRow);

                float tri = geometrySDF(pos);
                
                vec3 color = vec3( smoothstep(0.251,0.25,tri));
                vec3 baseColor = mix(vec3(1.0), vec3(1.0, 0.0, 0.0), evenCol*evenRow);
                baseColor = mix(baseColor, vec3(0.0, 1.0, 0.0), oddCol*oddRow);
                baseColor = mix(baseColor, vec3(0.0, 0.0, 1.0), evenCol*oddRow);
                baseColor = mix(baseColor, vec3(1.0, 0.0, 1.0), oddCol*evenRow);
                color = color * baseColor;
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader21 = `
            #define PI 3.14159265359
            #define TWO_PI 6.28318530718

            varying vec2 vUv;

            float shape(vec2 st, float N){
                st = st * 2.0 - 1.0;
                float a = atan(st.x, st.y) + PI;
                float r = TWO_PI / N;
                return abs(cos(floor(0.5 + a / r) * r - a) * length(st));
            }

            float box(vec2 st, vec2 size){
                return shape(st * size, 4.0);
            }

            float rect(vec2 _st, vec2 _size){
                _size = vec2(0.5) - _size * 0.5;
                vec2 uv = smoothstep(_size, _size + vec2(1e-4), _st);
                uv *= smoothstep(_size, _size + vec2(1e-4), vec2(1.0) - _st);
                return uv.x * uv.y;
            }

            float hexFull(vec2 st, float a, float b, float c, float d, float e, float f){
                st = st * vec2(2.0, 6.0);
                vec2 fpos = fract(st);
                vec2 ipos = floor(st);
                if (ipos.x == 1.0) fpos.x = 1.0 - fpos.x;
                if (ipos.y < 1.0){
                    return mix(box(fpos, vec2(0.84, 1.0)), box(fpos - vec2(0.03, 0.0), vec2(1.0)), a);
                } else if (ipos.y < 2.0){
                    return mix(box(fpos, vec2(0.84, 1.0)), box(fpos - vec2(0.03, 0.0), vec2(1.0)), b);
                } else if (ipos.y < 3.0){
                    return mix(box(fpos, vec2(0.84, 1.0)), box(fpos - vec2(0.03, 0.0), vec2(1.0)), c);
                } else if (ipos.y < 4.0){
                    return mix(box(fpos, vec2(0.84, 1.0)), box(fpos - vec2(0.03, 0.0), vec2(1.0)), d);
                } else if (ipos.y < 5.0){
                    return mix(box(fpos, vec2(0.84, 1.0)), box(fpos - vec2(0.03, 0.0), vec2(1.0)), e);
                } else if (ipos.y < 6.0){
                    return mix(box(fpos, vec2(0.84, 1.0)), box(fpos - vec2(0.03, 0.0), vec2(1.0)), f);
                }
                return 0.0;
            }

            float hex(vec2 st, float N){
                float b0, b1, b2, b3, b4, b5;
                float remain = floor(mod(N, 64.0));
                b0 = step(1.0, mod(remain, 2.0)); remain = ceil(remain / 2.0);
                b1 = step(1.0, mod(remain, 2.0)); remain = ceil(remain / 2.0);
                b2 = step(1.0, mod(remain, 2.0)); remain = ceil(remain / 2.0);
                b3 = step(1.0, mod(remain, 2.0)); remain = ceil(remain / 2.0);
                b4 = step(1.0, mod(remain, 2.0)); remain = ceil(remain / 2.0);
                b5 = step(1.0, mod(remain, 2.0));
                return hexFull(st, b0, b1, b2, b3, b4, b5);
            }

            void main(){
                vec2 st = vUv;
                vec2 fpos = fract(st);
                vec2 ipos = floor(st);

                float df = hex(fpos, ipos.x + ipos.y) + (1.0 - rect(fpos, vec2(0.7)));

                gl_FragColor = vec4(mix(vec3(0.0), vec3(1.0), step(0.7, df)), 1.0);
            }
        `;

const fragmentShader22 = `
            #define PI 3.14159265359
            #define TWO_PI 6.28318530718

            varying vec2 vUv;
            uniform float u_time;

            float shape(vec2 st, float N){
                st = st * 2.0 - 1.0;
                float a = atan(st.x, st.y) + PI;
                float r = TWO_PI / N;
                return abs(cos(floor(0.5 + a / r) * r - a) * length(st));
            }

            float box(vec2 st, vec2 size){
                return shape(st * size, 4.0);
            }

            float rect(vec2 _st, vec2 _size){
                _size = vec2(0.5) - _size * 0.5;
                vec2 uv = smoothstep(_size, _size + vec2(1e-4), _st);
                uv *= smoothstep(_size, _size + vec2(1e-4), vec2(1.0) - _st);
                return uv.x * uv.y;
            }

            float hexFull(vec2 st, float a, float b, float c, float d, float e, float f){
                st = st * vec2(2.0, 6.0);
                vec2 fpos = fract(st);
                vec2 ipos = floor(st);
                if (ipos.x == 1.0) fpos.x = 1.0 - fpos.x;
                if (ipos.y < 1.0){
                    return mix(box(fpos, vec2(0.84, 1.0)), box(fpos - vec2(0.03, 0.0), vec2(1.0)), a);
                } else if (ipos.y < 2.0){
                    return mix(box(fpos, vec2(0.84, 1.0)), box(fpos - vec2(0.03, 0.0), vec2(1.0)), b);
                } else if (ipos.y < 3.0){
                    return mix(box(fpos, vec2(0.84, 1.0)), box(fpos - vec2(0.03, 0.0), vec2(1.0)), c);
                } else if (ipos.y < 4.0){
                    return mix(box(fpos, vec2(0.84, 1.0)), box(fpos - vec2(0.03, 0.0), vec2(1.0)), d);
                } else if (ipos.y < 5.0){
                    return mix(box(fpos, vec2(0.84, 1.0)), box(fpos - vec2(0.03, 0.0), vec2(1.0)), e);
                } else if (ipos.y < 6.0){
                    return mix(box(fpos, vec2(0.84, 1.0)), box(fpos - vec2(0.03, 0.0), vec2(1.0)), f);
                }
                return 0.0;
            }

            float hex(vec2 st, float N){
                float b0, b1, b2, b3, b4, b5;
                float remain = floor(mod(N, 64.0));
                b0 = step(1.0, mod(remain, 2.0)); remain = ceil(remain / 2.0);
                b1 = step(1.0, mod(remain, 2.0)); remain = ceil(remain / 2.0);
                b2 = step(1.0, mod(remain, 2.0)); remain = ceil(remain / 2.0);
                b3 = step(1.0, mod(remain, 2.0)); remain = ceil(remain / 2.0);
                b4 = step(1.0, mod(remain, 2.0)); remain = ceil(remain / 2.0);
                b5 = step(1.0, mod(remain, 2.0));
                return hexFull(st, b0, b1, b2, b3, b4, b5);
            }

            void main(){
                vec2 st = vUv * 5.0;
                vec2 fpos = fract(st);
                vec2 ipos = floor(st);

                float t = u_time * 5.0;
                float df = hex(fpos, ipos.x + ipos.y + t) + (1.0 - rect(fpos, vec2(0.7)));

                gl_FragColor = vec4(mix(vec3(0.0), vec3(1.0), step(0.7, df)), 1.0);
            }
        `;