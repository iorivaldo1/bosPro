
const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

const fragmentShader1 = `
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
                vec2 st = vUv *1.0;
                vec2 fpos = fract(st);
                vec2 ipos = floor(st);

                // float df = hex(fpos, ipos.x + ipos.y + u_time ) + (1.0 - rect(fpos, vec2(0.7)));
                float df = hex(fpos, ipos.x + ipos.y + u_time );


                gl_FragColor = vec4(mix(vec3(0.0), vec3(1.0), step(0.7, df)), 1.0);
            }
        `;

const fragmentShader2 = `
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
                vec2 st = vUv *1.0;
                vec2 fpos = fract(st);
                vec2 ipos = floor(st);

                float df = hex(fpos, ipos.x + ipos.y + u_time ) + (1.0 - rect(fpos, vec2(0.7)));

                gl_FragColor = vec4(mix(vec3(0.0), vec3(1.0), step(0.7, df)), 1.0);
            }
        `;

const fragmentShader3 = `
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
                st = st * vec2(1.0, 6.0);
                vec2 fpos = fract(st);
                vec2 ipos = floor(st);
                if (ipos.y < 1.0){
                    // return mix(box(fpos, vec2(0.84, 1.0)), box(fpos - vec2(0.03, 0.0), vec2(1.0)), a);
                    return box(fpos, vec2(1.0, 1.0));
                    // return box(fpos - vec2(0.03, 0.0) , vec2(1.0, 1.0));
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
                vec2 st = vUv *1.0;
                vec2 fpos = fract(st);
                vec2 ipos = floor(st);

                float df = hex(fpos, ipos.x + ipos.y + u_time ) ;

                gl_FragColor = vec4(mix(vec3(0.0), vec3(1.0), step(0.7, df)), 1.0);
            }
        `;

const fragmentShader4 = `
            #define PI 3.14159265359
            #define TWO_PI 6.28318530718

            varying vec2 vUv;
            uniform float u_time;

            float geometrySDF(vec2 uv,float xScale,float yScale){
                //让y方向的长度变为4倍，这样y方向的圆就变扁了
                vec2 p = vec2(uv.x * xScale , uv.y *yScale);
                float a = atan(p.y, p.x);
                int N = 4;
                float r = TWO_PI/float(N);
                return cos(floor(0.5 + a/r)*r - a) * length(p);
            }

            void main(){
                float rec1 = geometrySDF(vUv - 0.5,1.0,1.0);

                float divideX = 1.0;
                float divideY = 6.0;
                vec2 scaledUV = vUv * vec2(divideX, divideY);


                vec2 pos = fract(scaledUV) - 0.5;
                pos = vec2(pos.x ,pos.y - 0.4);
                float geo = geometrySDF(pos,1.0,0.5);

                float row = floor(scaledUV.y);
                float col = smoothstep(0.3,0.31,geo);
                if(row == 1.0){
                    col = 1.0 - col;
                }
                geo = max(geo,rec1);

                gl_FragColor = vec4(vec3(smoothstep(0.3,0.31,geo)), 1.0);
            }
        `;