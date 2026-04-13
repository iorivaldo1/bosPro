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

            float sdBox( in vec2 p, in vec2 b ){
                vec2 q = abs(p) - b;
                return min(max(q.x,q.y),0.0) + length(max(q,0.0));
            }

            float shape( in vec2 p ){
                return sdBox( p, vec2(0.7, 0.4) ) - 0.1;
            }

            float repeated(vec2 p){
                p =  p -  floor(p);
                return shape(p);
            }

            void main(){
                vec2 uv = vUv;
                uv = uv * 2.0 - 1.0;
                vec3 col = vec3(0.0);
                uv *= 4.25 ;
                float d = repeated(uv);
                // float d = shape(uv);
                col = mix(vec3(0.65,0.85,1.0),vec3(0.9,0.6,0.3),step(0.0,d));
                col *= 1.0 - exp(-64.0*abs(d));
                col *= 0.8 + 0.2*cos(121.416*d);
                col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.01,abs(d)) );
                gl_FragColor = vec4(col, 1.0);
            }
        `;

const fs2 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            float sdBox( in vec2 p, in vec2 b ){
                vec2 q = abs(p) - b;
                return min(max(q.x,q.y),0.0) + length(max(q,0.0));
            }

            float shape( in vec2 p ){
                return sdBox( p, vec2(0.4, 0.7) ) - 0.1;
            }

            float repeated(vec2 p,float s){
                vec2 r = p - s* round(p/s);
                return shape(r);
            }

            void main(){
                vec2 uv = vUv;
                uv = uv * 2.0 - 1.0;
                vec3 col = vec3(0.0);
                uv *= 4.25 ;
                float d = repeated(uv,2.0);
                // float d = shape(uv);
                col = mix(vec3(0.65,0.85,1.0),vec3(0.9,0.6,0.3),step(0.0,d));
                col *= 1.0 - exp(-6.0*abs(d));
                col *= 0.8 + 0.2*cos(31.416*d);
                col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.035,abs(d)) );
                gl_FragColor = vec4(col, 1.0);
            }
        `;


const fs3 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            float sdBox( in vec2 p, in vec2 b ){
                vec2 q = abs(p) - b;
                return min(max(q.x,q.y),0.0) + length(max(q,0.0));
            }

            vec2 size(vec2 id){
                return vec2(0.3,0.2) + 0.3*sin( id.x*111.1+id.y*2.4+vec2(0,2) );
            }   

            float shape( in vec2 p, vec2 id ){
                return sdBox( p, size(id) ) - 0.1;
            }

            float repeated(vec2 p,float s){
                vec2 id = round(p/s);
                vec2 r = p - s* id;
                return shape(r,id);
            }

            void main(){
                vec2 uv = vUv;
                uv = uv * 2.0 - 1.0;
                vec3 col = vec3(0.0);
                uv *= 4.25 ;
                float d = repeated(uv,2.0);
                // float d = shape(uv);
                col = mix(vec3(0.65,0.85,1.0),vec3(0.9,0.6,0.3),step(0.0,d));
                col *= 1.0 - exp(-6.0*abs(d));
                col *= 0.8 + 0.2*cos(31.416*d);
                col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.035,abs(d)) );
                gl_FragColor = vec4(col, 1.0);
            }
        `;

const fs4 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            float sdBox( in vec2 p, in vec2 b ){
                vec2 q = abs(p) - b;
                return min(max(q.x,q.y),0.0) + length(max(q,0.0));
            }

            vec2 size(vec2 id){
                return vec2(0.3,0.2) + 0.3*sin( id.x*111.1+id.y*2.4+vec2(0,2) );
            }   

            float shape( in vec2 p, vec2 id ){
                return sdBox( p, size(id) ) - 0.1;
            }

            float repeated(vec2 p,float s){
                vec2 id = round(p/s);
                vec2 off = sign(p-s*id);

                float d = 1e20;
                for(int j=0;j<2;j++){
                    for(int i=0;i<2;i++){
                        vec2 rid = id + vec2(i,j)*off;
                        vec2 r = p - s*rid;
                        d = min(d,shape(r,rid));
                    }
                }
                
                return d;
            }

            void main(){
                vec2 uv = vUv;
                uv = uv * 2.0 - 1.0;
                vec3 col = vec3(0.0);
                uv *= 4.25 ;
                float d = repeated(uv,2.0);
                // float d = shape(uv);
                col = mix(vec3(0.65,0.85,1.0),vec3(0.9,0.6,0.3),step(0.0,d));
                col *= 1.0 - exp(-6.0*abs(d));
                col *= 0.8 + 0.2*cos(31.416*d);
                col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.035,abs(d)) );
                gl_FragColor = vec4(col, 1.0);
            }
        `;

const fs5 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            float sdBox( in vec2 p, in vec2 b ){
                vec2 q = abs(p) - b;
                return min(max(q.x,q.y),0.0) + length(max(q,0.0));
            }

            vec2 size(vec2 id){
                return vec2(0.3,0.2) + 0.3*sin( id.x*111.1+id.y*2.4+vec2(0,2) );
            }   

            float shape( vec2 p ){
                p = p -vec2(4.0,0.0);
                return sdBox( p, vec2(0.7,0.25) ) - 0.1;
            }

            float repetition_rotational( vec2 p ){
                const float n =8.0;

                float sp = 6.283185/float(n);
                float an = atan(p.y,p.x);
                float id = floor(an/sp);

                float a1 = sp*(id+0.0);
                float a2 = sp*(id+1.0);
                vec2 r1 = mat2(cos(a1),-sin(a1),sin(a1),cos(a1))*p;
                vec2 r2 = mat2(cos(a2),-sin(a2),sin(a2),cos(a2))*p;

                return min( shape(r1), shape(r2) );
                // return shape(r1);
            }

            void main(){
                vec2 uv = vUv;
                uv = uv * 2.0 - 1.0;
                vec3 col = vec3(0.0);
                uv *= 4.0 ;
                float d = repetition_rotational(uv);
                // float d = shape(uv);
                col = mix(vec3(0.65,0.85,1.0),vec3(0.9,0.6,0.3),step(0.0,d));
                col *= 1.0 - exp(-6.0*abs(d));
                col *= 0.8 + 0.2*cos(31.416*d);
                col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.035,abs(d)) );
                gl_FragColor = vec4(col, 1.0);
            }
        `;

const fs6 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            float sdBox( in vec2 p, in vec2 b ){
                vec2 q = abs(p) - b;
                return min(max(q.x,q.y),0.0) + length(max(q,0.0));
            }

            float shape( vec2 p ){
                p =mat2(cos(u_time),sin(u_time),-sin(u_time),cos(u_time))*(p -vec2(2.0,0.0));
                return sdBox( p, vec2(0.7,0.25) ) - 0.1;
            }

            float repetition_rotational( vec2 p ){
                const float n = 8.0;

                float sp = 6.283185/float(n);
                float an = atan(p.y,p.x);
                float id = floor(an/sp);

                float a1 = sp*(id+0.0);
                float a2 = sp*(id+1.0);
                vec2 r1 = mat2(cos(a1),-sin(a1),sin(a1),cos(a1))*p;
                vec2 r2 = mat2(cos(a2),-sin(a2),sin(a2),cos(a2))*p;

                return min( shape(r1), shape(r2) );
                // return shape(r1);
            }

            void main(){
                vec2 uv = vUv;
                uv = uv * 2.0 - 1.0;
                vec3 col = vec3(0.0);
                uv *= 3.0 ;
                float d = repetition_rotational(uv);
                // float d = shape(uv);
                col = mix(vec3(0.65,0.85,1.0),vec3(0.9,0.6,0.3),step(0.0,d));
                col *= 1.0 - exp(-6.0*abs(d));
                col *= 0.8 + 0.2*cos(31.416*d);
                col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.035,abs(d)) );
                gl_FragColor = vec4(col, 1.0);
            }
        `;

const fs7 = `
            varying vec2 vUv;
            uniform vec2 u_mouse;
            uniform float u_time;

            float sdBox( in vec2 p, in vec2 b ){
                vec2 q = abs(p) - b;
                return min(max(q.x,q.y),0.0) + length(max(q,0.0));
            }

            float shape( vec2 p ){
                p =mat2(cos(u_time),sin(u_time),-sin(u_time),cos(u_time))*(p -vec2(2.0,0.0));
                return sdBox( p, vec2(0.7,0.25) ) - 0.1;
            }

            float repetition_rotational( vec2 p ){
                const float n = 8.0;

                float sp = 6.283185/float(n);
                float an = atan(p.y,p.x);
                float id = floor(an/sp);

                float a1 = sp*(id+0.0);
                float a2 = sp*(id+1.0);
                vec2 r1 = mat2(cos(a1),-sin(a1),sin(a1),cos(a1))*p;
                vec2 r2 = mat2(cos(a2),-sin(a2),sin(a2),cos(a2))*p;

                return min( shape(r1), shape(r2) );
                // return shape(r1);
            }

            void main(){
                vec2 uv = vUv;
                uv = uv * 2.0 - 1.0;
                vec3 col = vec3(0.0);
                uv *= 3.0 ;
                float d = repetition_rotational(uv);
                // float d = shape(uv);
                col = mix(vec3(0.65,0.85,1.0),vec3(0.9,0.6,0.3),step(0.0,d));
                col *= 1.0 - exp(-6.0*abs(d));
                col *= 0.8 + 0.2*cos(31.416*d);
                col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.035,abs(d)) );
                gl_FragColor = vec4(col, 1.0);
            }
        `;