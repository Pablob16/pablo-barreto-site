/* Cena de partículas da abertura: uma "poeira" azul que nasce como uma
   árvore de luz, se dissolve e se recompõe em símbolos das artes, vira uma
   esfera e volta a ser árvore, sobre um chão escuro com ondas concêntricas.
   Feita com three.js. Se a biblioteca não carregar, o degradê de fundo fica. */
(function(){
  if(typeof THREE==='undefined') return;
  var cv=document.getElementById('cena'),hero=document.getElementById('hero');
  if(!cv||!hero) return;
  var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var N=matchMedia('(max-width:700px)').matches?9000:16000;

  /* ---------- formas-alvo ---------- */
  function rnd(){return Math.random()}
  function gauss(){return (rnd()+rnd()+rnd()-1.5)*1.2}
  function arvore(){
    var out=new Float32Array(N*3);
    // galhos principais e secundários, como uma árvore de luz
    var galhos=[];
    for(var g=0;g<34;g++){
      var ang=rnd()*6.283,el=0.25+rnd()*1.0,len=0.7+rnd()*0.8,curv=(rnd()-0.5)*0.9;
      galhos.push({a:ang,e:el,l:len,c:curv,y0:0.08+rnd()*0.25,sub:[]});
      var ns=2+(rnd()*3|0);
      for(var q=0;q<ns;q++)galhos[g].sub.push({at:0.35+rnd()*0.5,a:ang+(rnd()-0.5)*1.4,e:el+(rnd()-0.3)*0.9,l:0.25+rnd()*0.45,c:(rnd()-0.5)*1.2});
    }
    function ponto(gl,u,base){ // posição ao longo de um galho curvo
      var dx=Math.cos(gl.a)*Math.cos(gl.e),dy=Math.sin(gl.e),dz=Math.sin(gl.a)*Math.cos(gl.e);
      var bend=u*u*gl.c;
      return [base[0]+dx*gl.l*u+Math.sin(gl.a+1.57)*bend*0.4, base[1]+dy*gl.l*u-u*u*0.28, base[2]+dz*gl.l*u+Math.cos(gl.a+1.57)*bend*0.4];
    }
    for(var i=0;i<N;i++){
      var x,y,z,j;
      if(i<N*0.16){ // tronco
        var t=rnd(),r=(0.1-0.065*t)*Math.sqrt(rnd()),a=rnd()*6.283;
        x=Math.cos(a)*r+gauss()*0.006; y=-1.2+t*1.3; z=Math.sin(a)*r+gauss()*0.006;
      }else if(i<N*0.62){ // galhos principais
        var gl=galhos[(rnd()*galhos.length)|0],u=Math.pow(rnd(),0.8),pt=ponto(gl,u,[0,gl.y0,0]);
        j=0.012+u*0.05;x=pt[0]+gauss()*j;y=pt[1]+gauss()*j;z=pt[2]+gauss()*j;
      }else if(i<N*0.9){ // galhos secundários
        var gl2=galhos[(rnd()*galhos.length)|0],sb=gl2.sub[(rnd()*gl2.sub.length)|0];
        var base=ponto(gl2,sb.at,[0,gl2.y0,0]),u2=Math.pow(rnd(),0.8),pt2=ponto(sb,u2,base);
        j=0.01+u2*0.05;x=pt2[0]+gauss()*j;y=pt2[1]+gauss()*j;z=pt2[2]+gauss()*j;
      }else{ // poeira caindo das pontas
        var gl3=galhos[(rnd()*galhos.length)|0],pt3=ponto(gl3,0.7+rnd()*0.3,[0,gl3.y0,0]);
        x=pt3[0]+gauss()*0.12;y=pt3[1]-rnd()*0.9+gauss()*0.05;z=pt3[2]+gauss()*0.12;
      }
      out[i*3]=x;out[i*3+1]=y;out[i*3+2]=z;
    }
    return out;
  }
  function esfera(){
    var out=new Float32Array(N*3);
    for(var i=0;i<N;i++){
      var u=rnd()*2-1,a=rnd()*6.283,r=1.05+gauss()*0.035;
      var s=Math.sqrt(1-u*u);
      out[i*3]=Math.cos(a)*s*r;out[i*3+1]=u*r+0.05;out[i*3+2]=Math.sin(a)*s*r;
    }
    return out;
  }
  /* símbolos: desenhados em 2D e "extrudados" em duas faces + miolo esparso,
     como o cubo do original, que tem arestas densas e interior ralo. */
  var SIMBOLOS=[
    ['M12 2C6.5 2 3 6 3 11c0 6 4.5 11 9 11s9-5 9-11c0-5-3.5-9-9-9Z','M7.5 9.5c1.2-1 2.8-1 4 0','M12.5 9.5c1.2-1 2.8-1 4 0','M7.5 14.5c2.5 3 6.5 3 9 0'],
    ['M9 18V6l12-2.5V15','M9 18a3 2.4 0 1 1-6 0 3 2.4 0 1 1 6 0Z','M21 15a3 2.4 0 1 1-6 0 3 2.4 0 1 1 6 0Z'],
    ['M3 10h18v11H3z','M3 10l2-5 16 3-2 2','M7.5 6.2l2 3.2','M12 7l2 3.2','M16.5 8l1.8 2.5'],
    ['M2 4h7a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H2z','M22 4h-7a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h7z'],
    ['M12 2l2.6 6.6L21 9.2l-5 4.4 1.5 6.9L12 17l-5.5 3.5L8 13.6 3 9.2l6.4-.6z'],
    ['M12 2a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z','M5 11a7 7 0 0 0 14 0','M12 18v4M8 22h8'],
    ['M12 2C6.5 2 3 6 3 11c0 6 4.5 11 9 11s9-5 9-11c0-5-3.5-9-9-9Z','M7.5 10.5c1.2 1 2.8 1 4 0','M12.5 10.5c1.2 1 2.8 1 4 0','M7.5 17c2.5-3 6.5-3 9 0']
  ];
  function amostrar(paths){
    var S=220,c=document.createElement('canvas');c.width=c.height=S;var g=c.getContext('2d');
    g.translate(14,14);g.scale((S-28)/24,(S-28)/24);
    g.lineWidth=0.9;g.lineCap='round';g.lineJoin='round';g.strokeStyle='#fff';
    paths.forEach(function(d){g.stroke(new Path2D(d))});
    var traco=[],px=g.getImageData(0,0,S,S).data;
    for(var y=0;y<S;y++)for(var x=0;x<S;x++)if(px[(y*S+x)*4+3]>60)traco.push([x,y]);
    g.clearRect(-20,-20,S+40,S+40);g.fillStyle='#fff';paths.forEach(function(d){g.fill(new Path2D(d))});
    var cheio=[];px=g.getImageData(0,0,S,S).data;
    for(var y2=0;y2<S;y2++)for(var x2=0;x2<S;x2++)if(px[(y2*S+x2)*4+3]>60)cheio.push([x2,y2]);
    if(!cheio.length)cheio=traco;
    var out=new Float32Array(N*3),k=2.6/S,prof=0.2;
    for(var i=0;i<N;i++){
      var p,z;
      if(i<N*0.78){p=traco[(rnd()*traco.length)|0];z=(rnd()<0.5?-prof:prof)+gauss()*0.02;
        if(rnd()<0.18){z=(rnd()*2-1)*prof}} // arestas de ligação entre as faces
      else{p=cheio[(rnd()*cheio.length)|0];z=(rnd()*2-1)*prof*0.9}
      out[i*3]=(p[0]-S/2)*k+gauss()*0.01;out[i*3+1]=-(p[1]-S/2)*k+0.1+gauss()*0.01;out[i*3+2]=z;
    }
    return out;
  }
  var ARV=arvore(),ESF=esfera(),simb=SIMBOLOS.map(amostrar);

  /* ---------- cena ---------- */
  var renderer=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(1.75,window.devicePixelRatio||1));
  var scene=new THREE.Scene();
  var cam=new THREE.PerspectiveCamera(42,1,0.1,50);cam.position.set(0,0.7,5.4);cam.lookAt(0,-0.15,0);

  var pos=new Float32Array(ARV),from=new Float32Array(ARV),to=new Float32Array(ARV);
  var seed=new Float32Array(N),cor=new Float32Array(N*3);
  var c1=new THREE.Color('#2A55FF'),c2=new THREE.Color('#8FD0FF'),c3=new THREE.Color('#D6F0FF');
  for(var i=0;i<N;i++){seed[i]=rnd();var m=rnd();var c=m<0.75?c1.clone().lerp(c2,rnd()):c2.clone().lerp(c3,rnd());cor[i*3]=c.r;cor[i*3+1]=c.g;cor[i*3+2]=c.b}
  var geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color',new THREE.BufferAttribute(cor,3));
  // textura redonda e macia para cada grão
  var tc=document.createElement('canvas');tc.width=tc.height=64;var tg=tc.getContext('2d');
  var grd=tg.createRadialGradient(32,32,0,32,32,32);grd.addColorStop(0,'rgba(255,255,255,1)');grd.addColorStop(0.35,'rgba(255,255,255,.55)');grd.addColorStop(1,'rgba(255,255,255,0)');
  tg.fillStyle=grd;tg.fillRect(0,0,64,64);
  var tex=new THREE.CanvasTexture(tc);
  var mat=new THREE.PointsMaterial({size:0.042,map:tex,vertexColors:true,transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});
  var grupo=new THREE.Group();scene.add(grupo);
  var pontos=new THREE.Points(geo,mat);grupo.add(pontos);
  // reflexo no chão
  var CHAO=-1.75;
  var reflexo=new THREE.Points(geo,new THREE.PointsMaterial({size:0.026,map:tex,vertexColors:true,transparent:true,opacity:0.16,depthWrite:false,blending:THREE.AdditiveBlending}));
  reflexo.scale.y=-1;grupo.add(reflexo);
  function posReflexo(){reflexo.position.y=(2*CHAO-2*grupo.position.y)/grupo.scale.y}

  // chão com ondas concêntricas
  var chaoMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{t:{value:0}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform float t;varying vec2 vUv;void main(){vec2 p=(vUv-.5)*2.0;float d=length(p);float w=sin(d*34.0-t*1.4);w=pow(max(w,0.0),16.0);float fade=smoothstep(0.95,0.12,d)*smoothstep(0.03,0.22,d);float glow=exp(-d*d*16.0)*0.22;vec3 c=mix(vec3(0.10,0.24,1.0),vec3(0.45,0.75,1.0),w);gl_FragColor=vec4(c,(w*0.26+glow)*fade);}'
  });
  var chao=new THREE.Mesh(new THREE.PlaneGeometry(7.5,7.5,1,1),chaoMat);chao.rotation.x=-Math.PI/2;chao.position.y=CHAO;scene.add(chao);

  /* ---------- roteiro (mesma ordem do original: árvore → forma → esfera → árvore) ---------- */
  var HOLD_ARV=3.2,HOLD_FORMA=3.4,HOLD_ESF=1.6,MORPH=1.9;
  var etapa=0,idx=0,tEtapa=0,alvoAtual=ARV;
  function alvo(){ // sequência: árvore, símbolo, esfera, árvore, próximo símbolo...
    var k=etapa%3; if(k===0) return ARV; if(k===1) return simb[idx%simb.length]; return ESF;
  }
  function hold(){var k=etapa%3;return k===0?HOLD_ARV:k===1?HOLD_FORMA:HOLD_ESF}
  function proxima(){from.set(to);etapa++;if(etapa%3===0)idx++;to.set(alvo());tEtapa=0}
  to.set(ARV);
  var ease=function(x){return x<0.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};

  var mouse={x:0,y:0},alvoRot=0;
  hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width*2-1;mouse.y=(e.clientY-r.top)/r.height*2-1});
  hero.addEventListener('pointerleave',function(){mouse.x=0;mouse.y=0});

  function size(){var r=hero.getBoundingClientRect();renderer.setSize(r.width,r.height,false);cam.aspect=r.width/r.height;cam.updateProjectionMatrix();
    var m=r.width<700; grupo.position.set(0,m?-0.35:-0.15,0); grupo.scale.setScalar(m?0.95:1.45); chao.scale.setScalar(m?0.85:1);posReflexo()}
  size();addEventListener('resize',size);

  var last=performance.now(),tempo=0,rodando=true;
  function frame(now){
    if(!rodando) return;
    var dt=Math.min(0.05,(now-last)/1000);last=now;tempo+=dt;tEtapa+=dt;
    var h=hold(),e=1;
    if(tEtapa>h){e=Math.min(1,(tEtapa-h)/MORPH);if(e>=1){proxima();e=0}}
    var k=ease(e);
    var arr=geo.attributes.position.array;
    for(var i=0;i<N;i++){
      var s=seed[i],j=i*3;
      var ki=Math.min(1,Math.max(0,(k-s*0.25)/0.75)); // cada grão parte num instante diferente
      var sw=Math.sin(Math.PI*ki)*0.55;                 // poeira se espalha no meio da transição
      var fx=from[j],fy=from[j+1],fz=from[j+2],tx=to[j],ty=to[j+1],tz=to[j+2];
      var nx=Math.sin(s*37.1+tempo*0.9)*sw,ny=Math.cos(s*19.7+tempo*0.7)*sw*0.6+sw*0.35,nz=Math.sin(s*53.3+tempo*0.8)*sw;
      var br=0.012*Math.sin(tempo*1.3+s*40); // respiração leve quando parado
      arr[j]=fx+(tx-fx)*ki+nx+br;arr[j+1]=fy+(ty-fy)*ki+ny+br*0.6;arr[j+2]=fz+(tz-fz)*ki+nz;
    }
    geo.attributes.position.needsUpdate=true;
    grupo.rotation.y=Math.sin(tempo*0.32)*0.55;
    cam.position.x+= (mouse.x*0.35-cam.position.x)*0.04; cam.position.y+=(0.45-mouse.y*0.2-cam.position.y)*0.04; cam.lookAt(0,-0.1,0);
    chaoMat.uniforms.t.value=tempo;
    renderer.render(scene,cam);
    requestAnimationFrame(frame);
  }
  if(rm){ // sem movimento: um quadro parado da árvore
    renderer.render(scene,cam);
  }else{
    requestAnimationFrame(frame);
    document.addEventListener('visibilitychange',function(){rodando=!document.hidden;if(rodando){last=performance.now();requestAnimationFrame(frame)}});
  }
})();
