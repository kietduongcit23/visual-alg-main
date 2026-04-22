import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css            */class B{frames=[];currentFrameIndex=0;isPlaying=!1;speed=50;timer=null;onFrameChange;onPlaybackStateChange;constructor(e,t){this.onFrameChange=e,this.onPlaybackStateChange=t}setFrames(e){this.frames=e,this.currentFrameIndex=0,this.renderCurrentFrame()}setSpeed(e){this.speed=e}getIsPlaying(){return this.isPlaying}getCurrentIndex(){return this.currentFrameIndex}getTotalFrames(){return this.frames.length}play(){this.isPlaying||this.currentFrameIndex>=this.frames.length-1||(this.isPlaying=!0,this.onPlaybackStateChange(!0),this.run())}pause(){this.isPlaying=!1,this.onPlaybackStateChange(!1),this.timer&&clearTimeout(this.timer)}next(){this.currentFrameIndex<this.frames.length-1&&(this.currentFrameIndex++,this.renderCurrentFrame())}prev(){this.currentFrameIndex>0&&(this.currentFrameIndex--,this.renderCurrentFrame())}jumpTo(e){e>=0&&e<this.frames.length&&(this.currentFrameIndex=e,this.renderCurrentFrame())}async run(){this.isPlaying&&(this.currentFrameIndex<this.frames.length-1?(this.next(),this.timer=setTimeout(()=>this.run(),1e3-this.speed*9)):this.pause())}renderCurrentFrame(){const e=this.frames[this.currentFrameIndex];e&&this.onFrameChange(e)}}const M=["do","  swapped = false","  for i from 0 to n-2","    if arr[i] > arr[i+1]","      swap(arr[i], arr[i+1])","      swapped = true","while swapped"],k=["for i from 0 to n-1","  minIdx = i","  for j from i+1 to n-1","    if arr[j] < arr[minIdx]","      minIdx = j","  swap(arr[i], arr[minIdx])"];function C(){const f=document.getElementById("visualizer-mount"),e=document.getElementById("visualizer-title"),t=document.getElementById("algo-name"),l=document.getElementById("difficulty-badge"),a=document.querySelector(".pseudocode-list"),r=document.getElementById("explanation-mount"),n=document.getElementById("stage-actions");e.textContent="Sorting Visualizer",t.textContent="BUBBLE SORT",l.textContent="Easy",l.className="badge status-pass",n.innerHTML=`
    <div class="control-group">
      <select id="algorithm-select" class="select">
        <option value="bubble">Bubble Sort</option>
        <option value="selection">Selection Sort</option>
      </select>
      <input type="text" id="custom-array" class="input" placeholder="e.g. 5,2,9,1" style="width: 120px;">
      <button id="btn-custom" class="btn">Set Array</button>
      <button id="btn-random" class="btn">Random</button>
    </div>
  `;let i=[29,10,14,37,13];const s=new B(g=>v(g),g=>d(g));function v(g){const p=g.data;f.innerHTML='<div class="sorting-stage" id="sorting-stage"></div>';const o=document.getElementById("sorting-stage");p.forEach((c,y)=>{const u=document.createElement("div");u.className="sort-bar",u.style.height=`${c/Math.max(...p,40)*100}%`;const w=g.highlights.get(y);w&&u.classList.add(w);const x=document.createElement("span");x.textContent=c.toString(),x.style.position="absolute",x.style.bottom="-24px",x.style.width="100%",x.style.textAlign="center",x.style.fontSize="0.7rem",x.style.color="var(--muted)",u.appendChild(x),o.appendChild(u)}),document.querySelectorAll(".pseudocode-line").forEach(c=>c.classList.remove("active")),document.querySelector(`.pseudocode-line[data-line="${g.line}"]`)?.classList.add("active"),r.innerHTML=`<p class="explanation-text">${g.explanation}</p>`;const b=document.getElementById("frame-slider"),h=document.getElementById("frame-counter");b&&(b.value=s.getCurrentIndex().toString()),h&&(h.textContent=`${s.getCurrentIndex()+1} / ${s.getTotalFrames()}`)}function d(g){const p=document.getElementById("ctrl-play");p&&(p.textContent=g?"⏸":"▶")}function m(g){const p=[],o=[...g],b=o.length;p.push({data:[...o],highlights:new Map,line:0,explanation:"Starting Bubble Sort."});let h;do{h=!1,p.push({data:[...o],highlights:new Map,line:1,explanation:"Reset <b>swapped</b> to false."});for(let c=0;c<b-1;c++){const y=o[c],u=o[c+1];y===void 0||u===void 0||(p.push({data:[...o],highlights:new Map([[c,"compare"],[c+1,"compare"]]),line:2,explanation:`Checking <b>${y}</b> and <b>${u}</b>.`}),y>u&&(o[c]=u,o[c+1]=y,h=!0,p.push({data:[...o],highlights:new Map([[c,"swap"],[c+1,"swap"]]),line:4,explanation:`Swap <b>${u}</b> and <b>${y}</b>.`})))}}while(h);return p.push({data:[...o],highlights:new Map(o.map((c,y)=>[y,"sorted"])),line:0,explanation:"Array is <b>sorted</b>!"}),p}function I(g){const p=[],o=[...g],b=o.length;for(let h=0;h<b;h++){let c=h;p.push({data:[...o],highlights:new Map([[h,"active"]]),line:1,explanation:`Pass ${h}. Setting <b>minIdx</b> to ${h}.`});for(let u=h+1;u<b;u++){p.push({data:[...o],highlights:new Map([[h,"active"],[u,"compare"],[c,"active"]]),line:3,explanation:"Comparing with current minimum."});const w=o[u],x=o[c];w!==void 0&&x!==void 0&&w<x&&(c=u,p.push({data:[...o],highlights:new Map([[h,"active"],[u,"active"]]),line:5,explanation:`New minimum found: <b>${w}</b>.`}))}if(c!==h){const u=o[h],w=o[c];u!==void 0&&w!==void 0&&(o[h]=w,o[c]=u,p.push({data:[...o],highlights:new Map([[h,"swap"],[c,"swap"]]),line:6,explanation:`Swapping <b>${u}</b> with minimum.`}))}const y=new Map;for(let u=0;u<=h;u++)y.set(u,"sorted");p.push({data:[...o],highlights:y,line:0,explanation:`Position <b>${h}</b> is sorted.`})}return p}function E(g){i=g;const p=document.getElementById("algorithm-select").value;p==="bubble"?(t.textContent="BUBBLE SORT",a.innerHTML=M.map((h,c)=>`<li class="pseudocode-line" data-line="${c}">${h}</li>`).join("")):(t.textContent="SELECTION SORT",a.innerHTML=k.map((h,c)=>`<li class="pseudocode-line" data-line="${c}">${h}</li>`).join(""));const o=p==="bubble"?m(i):I(i);s.setFrames(o);const b=document.getElementById("frame-slider");b&&(b.max=(o.length-1).toString(),b.value="0")}document.getElementById("ctrl-play")?.addEventListener("click",()=>{s.getIsPlaying()?s.pause():s.play()}),document.getElementById("ctrl-next")?.addEventListener("click",()=>s.next()),document.getElementById("ctrl-prev")?.addEventListener("click",()=>s.prev()),document.getElementById("frame-slider")?.addEventListener("input",g=>s.jumpTo(parseInt(g.target.value))),document.getElementById("speed-slider")?.addEventListener("input",g=>s.setSpeed(parseInt(g.target.value))),document.getElementById("btn-random")?.addEventListener("click",()=>E(Array.from({length:6},()=>Math.floor(Math.random()*45)+5))),document.getElementById("btn-custom")?.addEventListener("click",()=>{const p=document.getElementById("custom-array").value.split(",").map(o=>parseInt(o.trim())).filter(o=>!isNaN(o));p.length>0&&E(p)}),document.getElementById("algorithm-select")?.addEventListener("change",()=>E(i)),E(i)}const $=["initialize queue with startNode","while queue is not empty","  u = queue.dequeue()","  if u is endNode, return path","  for each neighbor v of u","    if v is not visited and not wall","      v.visited = true, v.parent = u","      queue.enqueue(v)"];class N{container;engine;rows=15;cols=20;startNode={r:5,c:5};endNode={r:10,c:15};walls=new Set;isMouseDown=!1;constructor(e){this.container=e,this.engine=new B(t=>this.renderFrame(t),t=>this.updatePlayButton(t))}render(){const e=document.getElementById("visualizer-title"),t=document.getElementById("algo-name"),l=document.getElementById("difficulty-badge"),a=document.querySelector(".pseudocode-list"),r=document.getElementById("stage-actions");e.textContent="Pathfinding Visualizer",t.textContent="BFS (BREADTH FIRST SEARCH)",l.textContent="Medium",l.className="badge status-warn",a.innerHTML=$.map((n,i)=>`
      <li class="pseudocode-line" data-line="${i}">${n}</li>
    `).join(""),r.innerHTML=`
      <button id="btn-clear-walls" class="btn">Clear Walls</button>
      <button id="btn-reset-path" class="btn">Reset Path</button>
    `,this.setupGridListeners(),this.setupControlListeners(),this.generateFrames()}setupGridListeners(){this.container.addEventListener("mousedown",e=>{e.target.classList.contains("grid-cell")&&(this.isMouseDown=!0)}),window.addEventListener("mouseup",()=>this.isMouseDown=!1)}setupControlListeners(){document.getElementById("ctrl-play")?.addEventListener("click",()=>{this.engine.getIsPlaying()?this.engine.pause():this.engine.play()}),document.getElementById("ctrl-next")?.addEventListener("click",()=>this.engine.next()),document.getElementById("ctrl-prev")?.addEventListener("click",()=>this.engine.prev()),document.getElementById("frame-slider")?.addEventListener("input",e=>{this.engine.jumpTo(parseInt(e.target.value))}),document.getElementById("speed-slider")?.addEventListener("input",e=>{this.engine.setSpeed(parseInt(e.target.value))}),document.getElementById("btn-clear-walls")?.addEventListener("click",()=>{this.walls.clear(),this.generateFrames()}),document.getElementById("btn-reset-path")?.addEventListener("click",()=>{this.generateFrames()})}generateFrames(){const e=[],t=new Set,l=new Map,a=[this.startNode];t.add(`${this.startNode.r}-${this.startNode.c}`),e.push({data:{visited:new Set,path:[]},highlights:new Map,line:0,explanation:"Initialize queue with start node at ("+this.startNode.r+", "+this.startNode.c+")."});let r=!1;for(;a.length>0;){const i=a.shift(),s=`${i.r}-${i.c}`;if(e.push({data:{visited:new Set(t),path:[]},highlights:new Map([[i.r*this.cols+i.c,"active"]]),line:2,explanation:`Dequeuing node at <b>(${i.r}, ${i.c})</b>.`}),i.r===this.endNode.r&&i.c===this.endNode.c){r=!0;break}const v=this.getNeighbors(i.r,i.c);for(const d of v){const m=`${d.r}-${d.c}`;!t.has(m)&&!this.walls.has(m)&&(t.add(m),l.set(m,s),a.push(d),e.push({data:{visited:new Set(t),path:[]},highlights:new Map([[d.r*this.cols+d.c,"compare"]]),line:7,explanation:`Found neighbor at <b>(${d.r}, ${d.c})</b>. Adding to queue.`}))}}if(r){const i=[];let s=`${this.endNode.r}-${this.endNode.c}`;for(;s;){const[v,d]=s.split("-").map(Number);if(i.push({r:v,c:d}),s=l.get(s),s===`${this.startNode.r}-${this.startNode.c}`){i.push(this.startNode);break}}e.push({data:{visited:new Set(t),path:i.reverse()},highlights:new Map,line:3,explanation:"<b>Target found!</b> Reconstructing shortest path."})}else e.push({data:{visited:new Set(t),path:[]},highlights:new Map,line:1,explanation:"Queue is empty. <b>No path exists</b>."});this.engine.setFrames(e);const n=document.getElementById("frame-slider");n.max=(e.length-1).toString(),n.value="0"}getNeighbors(e,t){const l=[];return e>0&&l.push({r:e-1,c:t}),e<this.rows-1&&l.push({r:e+1,c:t}),t>0&&l.push({r:e,c:t-1}),t<this.cols-1&&l.push({r:e,c:t+1}),l}renderFrame(e){const{visited:t,path:l}=e.data;this.container.innerHTML=`<div class="path-grid" id="path-grid" style="grid-template-columns: repeat(${this.cols}, 1fr)"></div>`;const a=document.getElementById("path-grid");for(let n=0;n<this.rows;n++)for(let i=0;i<this.cols;i++){const s=document.createElement("div");s.className="grid-cell";const v=`${n}-${i}`;n===this.startNode.r&&i===this.startNode.c?s.classList.add("start"):n===this.endNode.r&&i===this.endNode.c?s.classList.add("end"):this.walls.has(v)?s.classList.add("wall"):l.some(m=>m.r===n&&m.c===i)?s.classList.add("path"):t.has(v)&&s.classList.add("visited");const d=e.highlights.get(n*this.cols+i);d&&s.classList.add(d),s.addEventListener("mouseenter",()=>{this.isMouseDown&&(this.walls.has(v)?this.walls.delete(v):this.walls.add(v),this.generateFrames())}),a.appendChild(s)}document.querySelectorAll(".pseudocode-line").forEach(n=>n.classList.remove("active")),document.querySelector(`.pseudocode-line[data-line="${e.line}"]`)?.classList.add("active"),document.getElementById("explanation-mount").innerHTML=`<p class="explanation-text">${e.explanation}</p>`;const r=document.getElementById("frame-counter");r&&(r.textContent=`${this.engine.getCurrentIndex()+1} / ${this.engine.getTotalFrames()}`)}updatePlayButton(e){const t=document.getElementById("ctrl-play");t&&(t.textContent=e?"⏸":"▶")}}const F=["func solve(row)","  if row == N return true","  for col = 0 to N-1","    if isSafe(row, col)","      place queen at (row, col)","      if solve(row + 1) return true","      remove queen (backtrack)","  return false"];class P{container;engine;n=8;constructor(e){this.container=e,this.engine=new B(t=>this.renderFrame(t),t=>this.updatePlayButton(t))}render(){const e=document.getElementById("visualizer-title"),t=document.getElementById("algo-name"),l=document.getElementById("difficulty-badge"),a=document.querySelector(".pseudocode-list"),r=document.getElementById("stage-actions");e.textContent="N-Queens Visualizer",t.textContent="N-QUEENS BACKTRACKING",l.textContent="Hard",l.className="badge status-fail",a.innerHTML=F.map((n,i)=>`
      <li class="pseudocode-line" data-line="${i}">${n}</li>
    `).join(""),r.innerHTML=`
      <div class="control-group">
        <label style="font-size: 0.8rem;">Size:</label>
        <input type="number" id="n-size" value="${this.n}" min="4" max="10" class="input" style="width: 60px;">
        <button id="btn-restart" class="btn">Restart</button>
      </div>
    `,this.setupControlListeners(),this.generateFrames()}setupControlListeners(){document.getElementById("ctrl-play")?.addEventListener("click",()=>{this.engine.getIsPlaying()?this.engine.pause():this.engine.play()}),document.getElementById("ctrl-next")?.addEventListener("click",()=>this.engine.next()),document.getElementById("ctrl-prev")?.addEventListener("click",()=>this.engine.prev()),document.getElementById("frame-slider")?.addEventListener("input",e=>{this.engine.jumpTo(parseInt(e.target.value))}),document.getElementById("speed-slider")?.addEventListener("input",e=>{this.engine.setSpeed(parseInt(e.target.value))}),document.getElementById("btn-restart")?.addEventListener("click",()=>{const e=parseInt(document.getElementById("n-size").value);this.n=isNaN(e)?8:e,this.generateFrames()})}generateFrames(){const e=[],t=Array(this.n).fill(-1),l=(n,i,s)=>{for(let v=0;v<n;v++){const d=s[v];if(d!==void 0&&(d===i||Math.abs(d-i)===Math.abs(v-n)))return!1}return!0},a=n=>{if(e.push({data:[...t],highlights:new Map,line:1,explanation:`Checking row <b>${n}</b>.`}),n===this.n)return e.push({data:[...t],highlights:new Map,line:1,explanation:"<b>Success!</b> All queens placed."}),!0;for(let i=0;i<this.n;i++)if(e.push({data:[...t],highlights:new Map([[n*this.n+i,"trying"]]),line:2,explanation:`Trying to place queen at <b>(${n}, ${i})</b>.`}),l(n,i,t)){if(t[n]=i,e.push({data:[...t],highlights:new Map([[n*this.n+i,"queen"]]),line:4,explanation:`Safe! Placing queen at <b>(${n}, ${i})</b>.`}),a(n+1))return!0;t[n]=-1,e.push({data:[...t],highlights:new Map([[n*this.n+i,"backtrack"]]),line:6,explanation:`Failed at row ${n+1}. <b>Backtracking</b> from (${n}, ${i}).`})}else e.push({data:[...t],highlights:new Map([[n*this.n+i,"conflict"]]),line:3,explanation:`Conflict! Cannot place queen at (${n}, ${i}).`});return!1};a(0),this.engine.setFrames(e);const r=document.getElementById("frame-slider");r&&(r.max=(e.length-1).toString(),r.value="0")}renderFrame(e){const t=e.data;this.container.innerHTML=`<div id="nqueens-board" class="chess-board" style="grid-template-columns: repeat(${this.n}, 1fr); width: ${Math.min(400,this.n*50)}px; height: ${Math.min(400,this.n*50)}px;"></div>`;const l=document.getElementById("nqueens-board");for(let r=0;r<this.n;r++)for(let n=0;n<this.n;n++){const i=document.createElement("div");i.className=`chess-cell ${(r+n)%2===0?"light":"dark"}`,t[r]===n&&(i.classList.add("queen"),i.innerHTML="♛");const s=e.highlights.get(r*this.n+n);s&&(i.classList.add(s),s==="trying"&&(i.innerHTML="?")),l.appendChild(i)}document.querySelectorAll(".pseudocode-line").forEach(r=>r.classList.remove("active")),document.querySelector(`.pseudocode-line[data-line="${e.line}"]`)?.classList.add("active"),document.getElementById("explanation-mount").innerHTML=`<p class="explanation-text">${e.explanation}</p>`;const a=document.getElementById("frame-counter");a&&(a.textContent=`${this.engine.getCurrentIndex()+1} / ${this.engine.getTotalFrames()}`)}updatePlayButton(e){const t=document.getElementById("ctrl-play");t&&(t.textContent=e?"⏸":"▶")}}const z=["find point with lowest Y (startPoint)","sort other points by polar angle","initialize stack with first 3 points","for each remaining point p","  while crossProduct(p1, p2, p) <= 0","    pop from stack","  push p to stack","return stack as convex hull"];class T{container;engine;points=[];canvas=null;ctx=null;constructor(e){this.container=e,this.engine=new B(t=>this.renderFrame(t),t=>this.updatePlayButton(t))}render(){const e=document.getElementById("visualizer-title"),t=document.getElementById("algo-name"),l=document.getElementById("difficulty-badge"),a=document.querySelector(".pseudocode-list"),r=document.getElementById("stage-actions");e.textContent="Geometric Visualizer",t.textContent="GRAHAM SCAN (CONVEX HULL)",l.textContent="Hard",l.className="badge status-fail",a.innerHTML=z.map((n,i)=>`
      <li class="pseudocode-line" data-line="${i}">${n}</li>
    `).join(""),r.innerHTML='<button id="btn-gen-hull" class="btn">New Points</button>',this.container.innerHTML=`
      <div class="canvas-container" style="width: 100%; height: 100%;">
        <canvas id="hull-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
      </div>
    `,this.canvas=document.getElementById("hull-canvas"),this.ctx=this.canvas.getContext("2d"),this.resizeCanvas(),this.setupControlListeners(),this.generatePoints(),window.addEventListener("resize",()=>{this.resizeCanvas(),this.engine.jumpTo(this.engine.getCurrentIndex())})}resizeCanvas(){if(!this.canvas)return;const e=this.canvas.parentElement;this.canvas.width=e.clientWidth,this.canvas.height=e.clientHeight}setupControlListeners(){document.getElementById("ctrl-play")?.addEventListener("click",()=>{this.engine.getIsPlaying()?this.engine.pause():this.engine.play()}),document.getElementById("ctrl-next")?.addEventListener("click",()=>this.engine.next()),document.getElementById("ctrl-prev")?.addEventListener("click",()=>this.engine.prev()),document.getElementById("frame-slider")?.addEventListener("input",e=>{this.engine.jumpTo(parseInt(e.target.value))}),document.getElementById("speed-slider")?.addEventListener("input",e=>{this.engine.setSpeed(parseInt(e.target.value))}),document.getElementById("btn-gen-hull")?.addEventListener("click",()=>this.generatePoints())}generatePoints(){this.points=Array.from({length:25},()=>({x:Math.random()*(this.canvas.width-100)+50,y:Math.random()*(this.canvas.height-100)+50})),this.generateFrames()}generateFrames(){const e=[],t=[...this.points];if(t.length<3)return;const l=t[0];if(!l)return;let a=l;for(const d of t)(d.y>a.y||d.y===a.y&&d.x<a.x)&&(a=d);e.push({data:{hull:[],active:[a]},highlights:new Map,line:0,explanation:"Find the point with the lowest Y coordinate."});const r=t.filter(d=>d!==a).sort((d,m)=>{const I=Math.atan2(d.y-a.y,d.x-a.x),E=Math.atan2(m.y-a.y,m.x-a.x);return I-E});e.push({data:{hull:[],active:[a,...r]},highlights:new Map,line:1,explanation:"Sort all other points by their polar angle relative to the start point."});const n=r[0],i=r[1];if(!n||!i)return;const s=[a,n,i];e.push({data:{hull:[...s],active:[]},highlights:new Map,line:2,explanation:"Initialize stack with the first three points."});for(let d=2;d<r.length;d++){const m=r[d];if(m){for(e.push({data:{hull:[...s],active:[m]},highlights:new Map,line:3,explanation:`Considering point at (${Math.round(m.x)}, ${Math.round(m.y)}).`});s.length>=2;){const I=s[s.length-2],E=s[s.length-1];if(!I||!E||!m)break;const g=(E.x-I.x)*(m.y-I.y)-(E.y-I.y)*(m.x-I.x);if(e.push({data:{hull:[...s],active:[m]},highlights:new Map,line:4,explanation:`Checking cross product: <b>${g>0?"Left":"Right/Straight"}</b> turn.`}),g<=0)s.pop(),e.push({data:{hull:[...s],active:[m]},highlights:new Map,line:5,explanation:"Non-left turn detected. <b>Popping</b> from stack."});else break}s.push(m),e.push({data:{hull:[...s],active:[]},highlights:new Map,line:6,explanation:"Valid left turn. <b>Pushing</b> point to stack."})}}e.push({data:{hull:[...s],active:[]},highlights:new Map,line:7,explanation:"Scan complete. The <b>convex hull</b> is formed!"}),this.engine.setFrames(e);const v=document.getElementById("frame-slider");v&&(v.max=(e.length-1).toString(),v.value="0")}renderFrame(e){if(!this.ctx||!this.canvas)return;const{hull:t,active:l}=e.data,a=this.ctx;if(a.clearRect(0,0,this.canvas.width,this.canvas.height),this.points.forEach(n=>{a.beginPath(),a.arc(n.x,n.y,4,0,Math.PI*2),a.fillStyle="var(--muted)",a.fill()}),l.forEach(n=>{a.beginPath(),a.arc(n.x,n.y,8,0,Math.PI*2),a.fillStyle="var(--accent)",a.fill(),a.strokeStyle="white",a.stroke()}),t.length>0){a.beginPath(),a.moveTo(t[0].x,t[0].y);for(let n=1;n<t.length;n++)a.lineTo(t[n].x,t[n].y);this.engine.getCurrentIndex()===this.engine.getTotalFrames()-1&&a.closePath(),a.strokeStyle="var(--teal)",a.lineWidth=3,a.stroke(),t.forEach(n=>{a.beginPath(),a.arc(n.x,n.y,5,0,Math.PI*2),a.fillStyle="var(--teal)",a.fill()})}document.querySelectorAll(".pseudocode-line").forEach(n=>n.classList.remove("active")),document.querySelector(`.pseudocode-line[data-line="${e.line}"]`)?.classList.add("active"),document.getElementById("explanation-mount").innerHTML=`<p class="explanation-text">${e.explanation}</p>`;const r=document.getElementById("frame-counter");r&&(r.textContent=`${this.engine.getCurrentIndex()+1} / ${this.engine.getTotalFrames()}`)}updatePlayButton(e){const t=document.getElementById("ctrl-play");t&&(t.textContent=e?"⏸":"▶")}}const L=document.getElementById("app");function S(){L.innerHTML=`
    <div class="visualizer-hub">
      <header class="app-header">
        <div class="app-heading">
          <h1>Algorithm Visualizer</h1>
          <a href="/visual-alg-main/" class="hub-link">Back to Lessons</a>
        </div>
        <div class="header-right">
          <button id="theme-toggle" class="btn">🌓</button>
        </div>
      </header>

      <section class="hero-section">
        <h1>Algorithm Visualizer Hub</h1>
        <p>Explore algorithms with step-by-step interactive visualizations, pseudocode synchronization, and detailed explanations.</p>
      </section>

      <div class="algo-grid">
        <div class="algo-card" data-algo="sorting">
          <div class="algo-preview">
            <div style="display:flex; align-items:flex-end; gap:4px; height:80px; width: 200px;">
              <div style="flex:1; height:30%; background:var(--accent); border-radius: 4px;"></div>
              <div style="flex:1; height:60%; background:var(--accent); border-radius: 4px;"></div>
              <div style="flex:1; height:45%; background:var(--accent); border-radius: 4px;"></div>
              <div style="flex:1; height:90%; background:var(--accent); border-radius: 4px;"></div>
              <div style="flex:1; height:70%; background:var(--accent); border-radius: 4px;"></div>
            </div>
          </div>
          <h3>Sorting Algorithms</h3>
          <p>Visualize how Quick Sort, Merge Sort, and Bubble Sort organize data step-by-step.</p>
          <button class="btn btn-primary open-visualizer">Explore Sorting</button>
        </div>

        <div class="algo-card" data-algo="pathfinding">
          <div class="algo-preview">
            <div style="display:grid; grid-template-columns:repeat(5, 16px); gap:4px">
              ${Array(25).fill(0).map((f,e)=>`<div style="width:16px; height:16px; background:${[6,7,8,13,18].includes(e)?"var(--teal)":"var(--surface-strong)"}; border-radius:2px;"></div>`).join("")}
            </div>
          </div>
          <h3>Pathfinding</h3>
          <p>See BFS, DFS, and Dijkstra's algorithm navigate complex mazes to find the shortest path.</p>
          <button class="btn btn-primary open-visualizer">Explore Pathfinding</button>
        </div>

        <div class="algo-card" data-algo="nqueens">
          <div class="algo-preview">
            <div style="font-size:3rem; filter: drop-shadow(0 0 10px var(--accent-soft))">♛</div>
          </div>
          <h3>N-Queens</h3>
          <p>Visualize the recursive backtracking process used to solve the classic N-Queens puzzle.</p>
          <button class="btn btn-primary open-visualizer">Explore N-Queens</button>
        </div>

        <div class="algo-card" data-algo="convexhull">
          <div class="algo-preview">
            <svg width="120" height="80" viewBox="0 0 100 60">
              <polygon points="20,50 50,10 80,40" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2" />
              <circle cx="20" cy="50" r="3" fill="var(--teal)" />
              <circle cx="50" cy="10" r="3" fill="var(--teal)" />
              <circle cx="80" cy="40" r="3" fill="var(--teal)" />
              <circle cx="45" cy="35" r="2" fill="var(--muted)" />
            </svg>
          </div>
          <h3>Convex Hull</h3>
          <p>Watch the Graham Scan algorithm compute the smallest convex set containing all points.</p>
          <button class="btn btn-primary open-visualizer">Explore Convex Hull</button>
        </div>
      </div>
    </div>
  `,document.querySelectorAll(".open-visualizer").forEach(f=>{f.addEventListener("click",e=>{const l=e.target.closest(".algo-card").dataset.algo;l&&q(l)})}),document.getElementById("theme-toggle")?.addEventListener("click",()=>{const f=document.documentElement.dataset.theme==="light";document.documentElement.dataset.theme=f?"dark":"light",localStorage.setItem("theme",f?"dark":"light")})}function q(f){L.innerHTML=`
    <div class="visualizer-page">
      <header class="app-header">
        <div class="app-heading">
          <a href="#" class="back-link" id="back-to-hub" style="margin: 0;">← Hub</a>
          <span style="color: var(--muted); margin: 0 12px;">/</span>
          <h1 id="visualizer-title" style="font-size: 1.1rem; margin: 0;">Loading...</h1>
        </div>
        <div class="header-right">
          <div id="extra-header-controls"></div>
        </div>
      </header>

      <main class="visualizer-main">
        <section class="visualizer-stage-container">
          <div class="stage-header">
            <div id="stage-info">
              <span id="algo-name" style="font-weight: 800; color: var(--accent);">ALGO</span>
              <span id="difficulty-badge" class="badge" style="margin-left: 12px;">Medium</span>
            </div>
            <div class="stage-actions" id="stage-actions">
              <!-- Custom inputs will go here -->
            </div>
          </div>
          <div class="stage-content" id="visualizer-mount">
            <!-- Animation happens here -->
          </div>
        </section>

        <aside class="visualizer-sidebar">
          <article class="panel explanation-panel" style="flex: 0 0 auto;">
            <div class="panel-header">Explanation</div>
            <div class="panel-body" id="explanation-mount">
              <p class="explanation-text">Select an action to begin.</p>
            </div>
          </article>

          <article class="panel pseudocode-panel" style="flex: 1; min-height: 0;">
            <div class="panel-header">Pseudocode</div>
            <div class="panel-body" id="pseudocode-mount">
              <ul class="pseudocode-list">
                <!-- Lines go here -->
              </ul>
            </div>
          </article>
        </aside>
      </main>

      <footer class="playback-bar">
        <div class="control-group">
          <button class="icon-btn" id="ctrl-prev" title="Previous Step">⏮</button>
          <button class="icon-btn primary" id="ctrl-play" title="Play">▶</button>
          <button class="icon-btn" id="ctrl-next" title="Next Step">⏭</button>
        </div>

        <div class="progress-slider-container">
          <span style="font-size: 0.75rem; color: var(--muted);" id="frame-counter">0 / 0</span>
          <input type="range" class="progress-slider" id="frame-slider" min="0" max="0" value="0">
        </div>

        <div class="control-group">
          <span style="font-size: 0.75rem; color: var(--muted);">Speed</span>
          <input type="range" id="speed-slider" min="1" max="100" value="50" style="width: 100px;">
        </div>
      </footer>
    </div>
  `,document.getElementById("back-to-hub")?.addEventListener("click",t=>{t.preventDefault(),S()});const e=document.getElementById("visualizer-mount");switch(f){case"sorting":C();break;case"pathfinding":new N(e).render();break;case"nqueens":new P(e).render();break;case"convexhull":new T(e).render();break}}const H=localStorage.getItem("theme")||"dark";document.documentElement.dataset.theme=H;S();
