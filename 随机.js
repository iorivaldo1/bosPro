
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
            float random(vec2 vUv) {
                return fract(sin(dot(vUv.xy, vec2(12.9898,78.233))) * 43758.5453);
            }

            void main(){
                float random = random(vUv);
                gl_FragColor = vec4(random, random, random, 1.0);
            }
        `;

const fragmentShader2 = `
            #define PI 3.14159265359
            #define TWO_PI 6.28318530718

            varying vec2 vUv;
            uniform float u_time;

            float random(vec2 vUv) {
                return fract(sin(dot(vUv.xy, vec2(12.9898,78.233))) * 43758.5453);
            }

            vec3 switchColor(float index){
                if(index > 0.5){
                    return vec3(1.0,0.0,0.0);
                }else{
                    return vec3(0.0,0.0,1.0);
                }
            }

            void main(){
                vec2 pos = vUv * 10.0;

                vec2 ipos = floor(pos);
                vec2 fpos = fract(pos);

                // vec3 color = vec3(random(ipos));
                vec3 color = switchColor(random(ipos));

                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader3 = `
            #define PI 3.14159265359
            #define TWO_PI 6.28318530718

            varying vec2 vUv;
            uniform float u_time;

            float random(vec2 vUv) {
                return fract(sin(dot(vUv.xy, vec2(12.9898,78.233))) * 43758.5453);
            }

            vec2 pls(vec2 fpos,float index){
                if(index > 0.5){
                    return  vec2(1.0) - fpos;
                }else{
                    return vec2(fpos.x,1.0 - fpos.y);
                }
            }

            vec2 line(vec2 fpos,float index){
                if(index > 0.5){
                    return  vec2(1.0) - fpos;
                }else{
                    return vec2(fpos.x,1.0 - fpos.y);
                }
            }

            void main(){
                vec2 pos = vUv * 10.0;

                vec2 ipos = floor(pos);
                vec2 fpos = fract(pos);

                vec2 pl = pls(fpos,random(ipos));

                // vec3 color = vec3(smoothstep(pl.x - 0.3,pl.x,pl.y) - smoothstep(pl.x,pl.x + 0.3,pl.y));

                // vec3 color = vec3(1.0 - step(0.01,abs(pl.y - pl.x)));

                // vec3 color = vec3(step(0.01,abs(fpos.x - (1.0 - fpos.y))));

                // vec3 color = vec3(step(0.01,abs(fpos.x - fpos.y)));
                // color *= vec3(step(0.01,abs( fpos.x - (1.0 - fpos.y))));

                // float line = abs(vUv.x - vUv.y);
                // vec3 color = vec3(step(0.01,line));

                //左下角半圆环+右上角半圆环
                // float circle = step(length(vUv),0.6) - step(length(vUv),0.4) + step(length(vUv - vec2(1.0)),0.6) - step(length(vUv - vec2(1.0)),0.4) ;
                // vec3 color = vec3(circle);

                vec2 ps = vec2(1.0 - vUv.x,vUv.y);
                float circle = step(length(ps),0.6) - step(length(ps),0.4);
                vec3 color = vec3(circle);
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader4 = `
            #define PI 3.14159265359
            #define TWO_PI 6.28318530718

            varying vec2 vUv;
            uniform float u_time;

            float random(vec2 vUv) {
                return fract(sin(dot(vUv.xy, vec2(12.9898,78.233))) * 43758.5453);
            }

            void main(){
                vec2 pos = vUv * 5.0;
                vec2 ipos = floor(pos);
                vec2 fpos = fract(pos);

                //s：0-1选择器
                float s = step(0.5,random(ipos));

                //s=0时：line = fpos
                //s=1时：line = 1.0 - fpos.x
                // vec2 line = vec2(mix(fpos.x,1.0 - fpos.x,s),fpos.y);
                // vec3 color = vec3(smoothstep(line.x - 0.3,line.x,line.y) - smoothstep(line.x,line.x + 0.3,line.y));

                vec2 circlePts = vec2(mix(fpos.x,1.0 - fpos.x,s),fpos.y);
                float circle = step(length(circlePts),0.6) - step(length(circlePts),0.4) + step(length(circlePts - vec2(1.0)),0.6) - step(length(circlePts - vec2(1.0)),0.4);
                vec3 color = vec3(circle);

                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader5 = `
            #define PI 3.14159265359
            #define TWO_PI 6.28318530718

            varying vec2 vUv;
            uniform float u_time;

            float random(vec2 vUv) {
                return fract(sin(dot(vUv.xy, vec2(12.9898,78.233))) * 43758.5453);
            }

            void main(){
                vec2 pos = vec2(vUv.x * 3000.0,vUv.y);
                vec2 ipos = floor(pos);
                vec2 fpos = fract(pos);
                vec3 color = vec3(step(0.2,random(ipos)));
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;

const fragmentShader6 = `
            #define PI 3.14159265359
            #define TWO_PI 6.28318530718

            varying vec2 vUv;
            uniform float u_time;

            float scaleX (float x){
                return fract(sin(x) * 1000000.0);
            }

            float random(vec2 vUv) {
                return fract(sin(dot(vUv.xy, vec2(12.9898,78.233))) * 43758.5453);
            }

            float serie(float x,float freq,float speed){
                return step(0.8,scaleX(floor(x * freq) - floor(speed)));
            }

            void main(){
                vec2 pos = vUv;
                vec3 color = vec3(0.0);
                float cols = 2.0;
                float freq = scaleX(floor(u_time))+abs(atan(u_time)*0.1);
                float speed = 60.0 + u_time*(1.0-freq)*30.0;

                if(fract(pos.y*cols * 0.5)<0.5){
                    speed *=-1.0;
                }

                freq += scaleX(floor(pos.y));
                float offset = 0.025;
                
                //偶尔有色彩
                color = vec3(serie(pos.x,freq*100.0,speed + offset),serie(pos.x,freq*100.0,speed),serie(pos.x,freq*100.0,speed - offset));

                //一直有色彩
                // color = vec3(serie(pos.x +offset,freq*100.0,speed ),serie(pos.x,freq*100.0,speed),serie(pos.x - offset,freq*100.0,speed));


                gl_FragColor = vec4(1.0 - color, 1.0);
            }
        `;

//去掉offset       
const fragmentShader7 = `
            #define PI 3.14159265359
            #define TWO_PI 6.28318530718

            varying vec2 vUv;
            uniform float u_time;

            float random (float x){
                return fract(sin(x) * 10000.0);
            }

            void main(){
                vec2 pos = vUv;
                vec3 color = vec3(0.0);

                float freq = random(floor(u_time ))+abs(atan(u_time)*0.1);

                //x = x_0 + v * t
                float offset = 60.0 + u_time*(1.0-freq)*30.0;

                color = vec3(step(0.8,random(floor(pos.x*freq*1000.0) - floor(offset))));

                gl_FragColor = vec4(1.0 - color, 1.0);
            }
        `;

//去掉serie   
const fragmentShader8 = `
            #define PI 3.14159265359
            #define TWO_PI 6.28318530718

            varying vec2 vUv;
            uniform float u_time;

            float random (float x){
                return fract(sin(x) * 10000.0);
            }

            void main(){
                vec2 pos = vUv;
                vec3 color = vec3(0.0);
                vec2 grid = vec2(300.0,5.0);
                pos = pos * grid;
                vec2 ipos = floor(pos);
                vec2 fpos = fract(pos);

                float freq = random(floor(u_time) + ipos.y)+abs(atan(u_time)*0.1);

                float offset = 60.0 * ipos.y + u_time*(1.0-freq) * 30.0;

                color = vec3(step(0.8,random(floor(pos.x*freq) - floor(offset))));
                color = color * step(0.5,fpos.y);
                gl_FragColor = vec4(1.0 - color, 1.0);
            }
        `;

const fragmentShader9 = `
            #define PI 3.14159265359
            #define TWO_PI 6.28318530718

            varying vec2 vUv;
            uniform float u_time;

            float random (float x){
                return fract(sin(x) * 10000.0);
            }

            void main(){
                vec2 pos = vUv;
                vec3 color = vec3(0.0);
                vec2 grid = vec2(100.0,300.0);
                pos = pos * grid;
                vec2 ipos = floor(pos);
                vec2 fpos = fract(pos);

                float freq = random(floor(u_time * 0.1) + ipos.x)+abs(atan(u_time)*0.1);

                // 将 0.01 修改为合适的速度倍率，例如 20.0
                float offset = 60.0 * ipos.x + u_time*(1.0-freq) * 20.0;

                color = vec3(step(0.8,random(floor(pos.y*freq) - floor(offset))));
                color = color * step(fpos.x,0.5) ;
                gl_FragColor = vec4(1.0 - color, 1.0);
            }
        `;

const fragmentShader10 = `
            #define PI 3.14159265359
            #define TWO_PI 6.28318530718

            varying vec2 vUv;
            uniform float u_time;

            float random1 (float x){
                return fract(sin(x) * 10000.0);
            }

            float random2 (vec2 vUv){
                return fract(sin(dot(vUv.xy, vec2(12.9898,78.233))) * 43758.5453);
            }

            void main(){
                vec2 pos = vUv;
                vec2 grid = vec2(300.0,50.0);
                pos = pos * grid;
                vec2 ipos = floor(pos);
                vec2 fpos = fract(pos);

                //每秒产生一个向左偏移的值
                vec2 offset = vec2(-u_time * 50.0,0.0) * random1(ipos.y);

                //产生移动，采样pos左侧offset位置的值
                vec2 p = floor(pos + offset);
                vec3 color = vec3(step(0.9,random2(100.0 + p * 0.000001) + random1(p.x)*0.8));
                color = color * step(0.3,fpos.y);
                gl_FragColor = vec4(1.0 -color, 1.0);
            }
        `;