/* Cena de partículas da abertura: uma "poeira" azul que nasce como uma
   árvore de luz, se desfaz numa nuvem e se recompõe, um a um, nos símbolos
   das artes, até voltar a ser árvore, sobre um chão escuro com ondas.
   Feita com three.js. Se a biblioteca não carregar, o degradê de fundo fica. */
(function(){
  function pronta(){window.__cenaPronta=true;try{dispatchEvent(new Event('cenapronta'))}catch(e){}}
  if(typeof THREE==='undefined'){pronta();return}
  var cv=document.getElementById('cena'),hero=document.getElementById('hero');
  if(!cv||!hero){pronta();return}
  var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var N=matchMedia('(max-width:700px)').matches?9000:16000;

  /* ---------- formas-alvo ---------- */
  function rnd(){return Math.random()}
  function gauss(){return (rnd()+rnd()+rnd()-1.5)*1.2}
  function arvore(){
    var out=new Float32Array(N*3);
    // tronco curto, galhos subindo em leque e uma copa arredondada de "folhas"
    var galhos=[];
    for(var g=0;g<30;g++){
      var ang=rnd()*6.283,el=0.7+rnd()*0.6,len=0.6+rnd()*0.55,curv=(rnd()-0.5)*0.8;
      galhos.push({a:ang,e:el,l:len,c:curv,y0:-0.45+rnd()*0.5,sub:[]});
      var ns=2+(rnd()*3|0);
      for(var q=0;q<ns;q++)galhos[g].sub.push({at:0.4+rnd()*0.5,a:ang+(rnd()-0.5)*1.6,e:el+(rnd()-0.4)*0.8,l:0.25+rnd()*0.4,c:(rnd()-0.5)*1.2});
    }
    function ponto(gl,u,base){ // posição ao longo de um galho curvo
      var dx=Math.cos(gl.a)*Math.cos(gl.e),dy=Math.sin(gl.e),dz=Math.sin(gl.a)*Math.cos(gl.e);
      var bend=u*u*gl.c;
      return [base[0]+dx*gl.l*u+Math.sin(gl.a+1.57)*bend*0.4, base[1]+dy*gl.l*u-u*u*0.12, base[2]+dz*gl.l*u+Math.cos(gl.a+1.57)*bend*0.4];
    }
    for(var i=0;i<N;i++){
      var x,y,z,j;
      if(i<N*0.14){ // tronco
        var t=rnd(),r=(0.11-0.07*t)*Math.sqrt(rnd()),a=rnd()*6.283;
        x=Math.cos(a)*r+gauss()*0.006; y=-1.2+t*1.0; z=Math.sin(a)*r+gauss()*0.006;
      }else if(i<N*0.44){ // galhos principais
        var gl=galhos[(rnd()*galhos.length)|0],u=Math.pow(rnd(),0.8),pt=ponto(gl,u,[0,gl.y0,0]);
        j=0.012+u*0.04;x=pt[0]+gauss()*j;y=pt[1]+gauss()*j;z=pt[2]+gauss()*j;
      }else if(i<N*0.66){ // galhos secundários
        var gl2=galhos[(rnd()*galhos.length)|0],sb=gl2.sub[(rnd()*gl2.sub.length)|0];
        var base=ponto(gl2,sb.at,[0,gl2.y0,0]),u2=Math.pow(rnd(),0.8),pt2=ponto(sb,u2,base);
        j=0.01+u2*0.04;x=pt2[0]+gauss()*j;y=pt2[1]+gauss()*j;z=pt2[2]+gauss()*j;
      }else if(i<N*0.92){ // copa: folhas numa nuvem arredondada
        var u3=rnd()*2-1,a3=rnd()*6.283,r3=Math.pow(rnd(),0.45),q3=Math.sqrt(1-u3*u3);
        x=Math.cos(a3)*q3*r3*1.05;y=0.62+u3*r3*0.72;z=Math.sin(a3)*q3*r3*1.05;
      }else{ // poeira caindo das pontas
        var gl3=galhos[(rnd()*galhos.length)|0],pt3=ponto(gl3,0.7+rnd()*0.3,[0,gl3.y0,0]);
        x=pt3[0]+gauss()*0.12;y=pt3[1]-rnd()*0.9+gauss()*0.05;z=pt3[2]+gauss()*0.12;
      }
      out[i*3]=x;out[i*3+1]=y;out[i*3+2]=z;
    }
    return out;
  }
  /* símbolos: desenhados em 2D e "extrudados" em duas faces + miolo esparso,
     como o cubo do original, que tem arestas densas e interior ralo. */
  var SIMBOLOS=[
    // máscaras de teatro (comédia e tragédia)
    ['M6.5 3C3.5 3 1.5 6 1.5 10c0 4.5 2.5 8 5 8s5-3.5 5-8c0-4-2-7-5-7Z','M3.4 9c.8-1.4 2.4-1.4 3.2 0c-.8 1-2.4 1-3.2 0Z','M6.4 9c.8-1.4 2.4-1.4 3.2 0c-.8 1-2.4 1-3.2 0Z','M3.6 12.4c1.5 2.8 4.3 2.8 5.8 0c-1.7 1-4.1 1-5.8 0Z','M17.5 6c-3 0-5 3-5 7 0 4.5 2.5 8 5 8s5-3.5 5-8c0-4-2-7-5-7Z','M14.4 12.6c.8 1.2 2.4 1.2 3.2 0c-.8-.7-2.4-.7-3.2 0Z','M17.4 12.6c.8 1.2 2.4 1.2 3.2 0c-.8-.7-2.4-.7-3.2 0Z','M14.6 18c1.5-2.6 4.3-2.6 5.8 0c-1.7-.9-4.1-.9-5.8 0Z'],
    // nota musical
    ['M9 18V6l12-2.5V15','M9 18a3 2.4 0 1 1-6 0 3 2.4 0 1 1 6 0Z','M21 15a3 2.4 0 1 1-6 0 3 2.4 0 1 1 6 0Z'],
    // claquete
    ['M3 10h18v11H3z','M3 10l2-5 16 3-2 2','M7.5 6.2l2 3.2','M12 7l2 3.2','M16.5 8l1.8 2.5'],
    // livro aberto
    ['M2 4h7a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H2z','M22 4h-7a3 3 0 0 0-3 3v14a3 3 0 0 1 3-3h7z'],
    // estrela
    ['M12 2l2.6 6.6L21 9.2l-5 4.4 1.5 6.9L12 17l-5.5 3.5L8 13.6 3 9.2l6.4-.6z'],
    // documento: o projeto para o edital
    ['M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z','M14 3v6h6M8 13h8M8 17h5']
  ];
  var MOB=matchMedia('(max-width:700px)').matches;
  var SIMB_K=MOB?2.2:2.3,SIMB_Y=MOB?0.1:-0.05;
  function amostrar(paths){
    var S=220,c=document.createElement('canvas');c.width=c.height=S;var g=c.getContext('2d',{willReadFrequently:true});
    g.translate(14,14);g.scale((S-28)/24,(S-28)/24);
    g.lineWidth=0.9;g.lineCap='round';g.lineJoin='round';g.strokeStyle='#fff';
    paths.forEach(function(d){g.stroke(new Path2D(d))});
    var traco=[],px=g.getImageData(0,0,S,S).data;
    for(var y=0;y<S;y++)for(var x=0;x<S;x++)if(px[(y*S+x)*4+3]>60)traco.push([x,y]);
    g.clearRect(-20,-20,S+40,S+40);g.fillStyle='#fff';paths.forEach(function(d){g.fill(new Path2D(d))});
    var cheio=[];px=g.getImageData(0,0,S,S).data;
    for(var y2=0;y2<S;y2++)for(var x2=0;x2<S;x2++)if(px[(y2*S+x2)*4+3]>60)cheio.push([x2,y2]);
    if(!cheio.length)cheio=traco;
    var out=new Float32Array(N*3),k=SIMB_K/S,prof=0.08;
    for(var i=0;i<N;i++){
      var p,z;
      if(i<N*0.78){p=traco[(rnd()*traco.length)|0];z=(rnd()<0.5?-prof:prof)+gauss()*0.02;
        if(rnd()<0.18){z=(rnd()*2-1)*prof}} // arestas de ligação entre as faces
      else{p=cheio[(rnd()*cheio.length)|0];z=(rnd()*2-1)*prof*0.9}
      out[i*3]=(p[0]-S/2)*k+gauss()*0.01;out[i*3+1]=-(p[1]-S/2)*k+SIMB_Y+gauss()*0.01;out[i*3+2]=z;
    }
    return out;
  }
  // sem WebGL, fica só o degradê de fundo
  var probe=document.createElement('canvas'),gl0=null;try{gl0=probe.getContext('webgl')||probe.getContext('experimental-webgl')}catch(e){}
  if(!gl0){pronta();return}
  var ARV=arvore(),simb=SIMBOLOS.map(amostrar);

  /* ---------- cena ---------- */
  var renderer;try{renderer=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:false,powerPreference:'default'})}catch(e){pronta();return}
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
  var CHAO=-1.75; // recalculado em size()
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

  /* ---------- roteiro ----------
     Um ritmo só, para todas as trocas: a forma se desfaz em poeira (a poeira
     abre numa nuvem esférica que gira devagar) e a nuvem se recolhe na forma
     seguinte. A árvore abre o ciclo; depois, as linguagens da cultura, uma a
     uma; a estrela fecha; e a poeira volta a ser árvore. Nenhuma forma troca
     "de repente": toda troca passa pela nuvem. */
  var ORDEM=[5,0,2,3,1,4]; // documento (o projeto), máscaras, claquete, livro, nota, estrela
  // ordem de chegada/saída de cada grão: a árvore cresce de baixo para cima
  // (e se desfaz das folhas para o tronco); os símbolos se desenham da
  // esquerda para a direita, como um traço.
  function ordemPor(f,eixo){var o=new Float32Array(N),mn=1e9,mx=-1e9,i;for(i=0;i<N;i++){var v=f[i*3+eixo];if(v<mn)mn=v;if(v>mx)mx=v}
    for(i=0;i<N;i++)o[i]=(f[i*3+eixo]-mn)/(mx-mn||1);return o}
  var roteiro=[{f:ARV,o:ordemPor(ARV,1),h:3.4,giro:0.55,op:MOB?0.8:1}];
  ORDEM.forEach(function(i){roteiro.push({f:simb[i],o:ordemPor(simb[i],0),h:3.2,giro:0.22,op:MOB?0.6:0.72})});
  var JAN_DISS=0.7,T_DISS=0.5,T_NUVEM=0.3,JAN_MONT=1.0,T_MONT=0.6;
  var INICIO_MONT=JAN_DISS+T_DISS+T_NUVEM,TRANS=INICIO_MONT+JAN_MONT+T_MONT;
  // nuvem: casca esférica solta, pré-calculada por grão
  var NUV=new Float32Array(N*3);
  for(var ni=0;ni<N;ni++){var u=rnd()*2-1,a=rnd()*6.283,r=0.75+rnd()*0.4,q=Math.sqrt(1-u*u);NUV[ni*3]=Math.cos(a)*q*r;NUV[ni*3+1]=u*r*0.85+0.1;NUV[ni*3+2]=Math.sin(a)*q*r}
  var etapa=0,tEtapa=0,emTrans=true,tTrans=INICIO_MONT,oDe=roteiro[0].o,oPara=roteiro[0].o,giroDe=0.55;
  function passo(){return roteiro[etapa%roteiro.length]}
  to.set(ARV);from.set(ARV);
  var easeIO=function(x){return x<0.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2},easeOut=function(x){return 1-Math.pow(1-x,3)};
  var clamp=function(x){return x<0?0:x>1?1:x};

  var mouse={x:0,y:0};
  hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width*2-1;mouse.y=(e.clientY-r.top)/r.height*2-1});
  hero.addEventListener('pointerleave',function(){mouse.x=0;mouse.y=0});

  var CHAO_W=0,CHAO_H=0,lado0=0;
  function size(){var r=hero.getBoundingClientRect(),W=Math.round(r.width),H=Math.round(r.height);
    if(W!==CHAO_W||H!==CHAO_H){CHAO_W=W;CHAO_H=H;renderer.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix()}
    var m=W<700; // cena centralizada atrás do texto, como no layout original
    grupo.position.set(0,m?-0.35:-0.01,0); grupo.scale.setScalar(m?0.95:1.45); chao.scale.setScalar(m?0.85:1);
    chao.visible=true; reflexo.visible=true; mat.size=0.042; lado0=0;
    CHAO=grupo.position.y-1.2*grupo.scale.y; chao.position.y=CHAO; posReflexo();
    if(rm)renderer.render(scene,cam)}
  size();addEventListener('resize',size);pronta();

  var last=performance.now(),tempo=0,rodando=true,agendado=false,giroAtual=0.55;
  function frame(now){
    agendado=false;
    if(!rodando) return;
    var dt=Math.min(0.05,Math.max(0,(now-last)/1000));last=now;tempo+=dt;
    if(emTrans){
      tTrans+=dt;
      if(tTrans>=TRANS){emTrans=false;tEtapa=0}
    }else{
      tEtapa+=dt;
      if(tEtapa>=passo().h){from.set(to);oDe=passo().o;giroDe=passo().giro;etapa=(etapa+1)%roteiro.length;to.set(passo().f);oPara=passo().o;emTrans=true;tTrans=0}
    }
    var arr=geo.attributes.position.array;
    var w=tempo*0.45,cw=Math.cos(w),sw=Math.sin(w); // a nuvem gira devagar
    var resp=1+0.006*Math.sin(tempo*1.3); // respiração
    for(var i=0;i<N;i++){
      var s=seed[i],j=i*3;
      var br=0.006*Math.sin(tempo*1.3+s*40); // cintilação leve
      var x,y,z;
      if(!emTrans){
        x=to[j];y=to[j+1];z=to[j+2];
      }else{
        // ponto na nuvem, girando e com turbulência
        var nx0=NUV[j],ny0=NUV[j+1],nz0=NUV[j+2];
        var cx=nx0*cw-nz0*sw+Math.sin(s*37.1+tempo*1.1)*0.09,cy=ny0+Math.cos(s*19.7+tempo*0.9)*0.08,cz=nx0*sw+nz0*cw+Math.sin(s*53.3+tempo*1.0)*0.09;
        var kd=(1-oDe[i])*0.7+s*0.3;               // quem solta primeiro
        var km=oPara[i]*0.7+s*0.3;                 // quem pousa primeiro
        var d=easeIO(clamp((tTrans-kd*JAN_DISS)/T_DISS));
        var m=easeOut(clamp((tTrans-INICIO_MONT-km*JAN_MONT)/T_MONT));
        var arco;
        if(m>0){arco=Math.sin(Math.PI*m)*0.22;x=cx+(to[j]-cx)*m+Math.sin(s*61.3)*arco;y=cy+(to[j+1]-cy)*m+arco*0.5;z=cz+(to[j+2]-cz)*m+Math.cos(s*47.9)*arco}
        else{arco=Math.sin(Math.PI*d)*0.18;x=from[j]+(cx-from[j])*d+Math.sin(s*61.3)*arco;y=from[j+1]+(cy-from[j+1])*d+arco*0.6;z=from[j+2]+(cz-from[j+2])*d+Math.cos(s*47.9)*arco}
      }
      arr[j]=x*resp+br;arr[j+1]=y*resp+br*0.6;arr[j+2]=z*resp;
    }
    geo.attributes.position.needsUpdate=true;
    var giroAlvo=(emTrans&&tTrans<INICIO_MONT)?giroDe:passo().giro; // só muda a amplitude escondida na nuvem
    giroAtual+=(giroAlvo-giroAtual)*(1-Math.exp(-dt/0.45));grupo.rotation.y=Math.sin(tempo*0.32)*giroAtual;
    mat.opacity+=(passo().op-mat.opacity)*(1-Math.exp(-dt/0.6));
    var kc=1-Math.exp(-dt/0.4);cam.position.x+=(mouse.x*0.35-cam.position.x)*kc; cam.position.y+=(0.45-mouse.y*0.2-cam.position.y)*kc; cam.lookAt(0,-0.1,0);
    chaoMat.uniforms.t.value=tempo;
    renderer.render(scene,cam);
    agendado=true;requestAnimationFrame(frame);
  }
  if(rm){ // sem movimento: um quadro parado da árvore
    renderer.render(scene,cam);
  }else{
    var visivel=true;
    function religar(){rodando=!document.hidden&&visivel;if(rodando&&!agendado){last=performance.now();agendado=true;requestAnimationFrame(frame)}}
    agendado=true;requestAnimationFrame(frame);
    document.addEventListener('visibilitychange',religar);
    if('IntersectionObserver' in window)new IntersectionObserver(function(e){visivel=e[e.length-1].isIntersecting;religar()},{threshold:0}).observe(hero);
  }
})();
