(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const c of s)if(c.type==="childList")for(const h of c.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&i(h)}).observe(document,{childList:!0,subtree:!0});function o(s){const c={};return s.integrity&&(c.integrity=s.integrity),s.referrerPolicy&&(c.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?c.credentials="include":s.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function i(s){if(s.ep)return;s.ep=!0;const c=o(s);fetch(s.href,c)}})();function ve(){return window.matchMedia("(max-width: 767px)").matches}function le(){return window!==window.parent}const ee="###story###";function Ie(e,t){return e.startsWith(t)}function ce(e,t){let o=-1;for(const i of e)if(o++,i.trim()!==""&&i!==t){const s=e[o-1];return!!(s&&s.trim()==="")}return!1}var y=(e=>(e.Gather="Gather",e.Choice="Choice",e.Undecided="Undecided",e))(y||{});function Te(e,t){const o=e.indexOf(t);return o===-1?[e,""]:[e.slice(0,o),e.slice(o+t.length)]}function ke(e,t){return e.split(t).length-1}function te(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Ne(e){const t=e.search(/\s/);return t===-1?[e.trim(),""]:[e.slice(0,t).trim(),e.slice(t+1).trim()]}const ne=".",oe="-";let ae;function E(e,t){throw ae(e,t),new Error(e)}function Se(e){return e.split(`
`).map((t,o)=>({orgText:t,orgCodeLineNo:o+1,text:t.trim(),index:o,level:0,nextLineIndex:0,type:y.Undecided,deadEnd:!1}))}function ie(e,t){let o=0,i=0;for(;i<e.length;){const s=e[i];if(s!==t&&s.trim()!=="")break;s===t&&o++,i++}return[e.substring(i).trim(),o]}function Oe(e){for(const t of e){const o=t.text;if(Ie(o,oe)){t.type=y.Gather;const[i,s]=ie(o,oe);t.text=i,t.level=s}else if(ce(o,ne)){t.type=y.Choice;const[i,s]=ie(o,ne);t.text=i,t.level=s}else t.type=y.Undecided}}function Me(e){let t=1;for(const o of e){if(o.level){if(o.type===y.Gather)t=o.level;else if(o.type===y.Choice)t=o.level+1;else throw new Error("Fatal: only choices and gathers should have a level property at this stage.");continue}o.level=t}}function _e(e){let t=-1;for(const o of e){t++;const i=e[t+1];if(!i)break;if(i.type===y.Choice||i.type===y.Gather){if(i.level===o.level)continue;if(i.level>o.level){E("Line level too high for this context.",i);return}o.deadEnd=!0}}}function $e(e){const t=[];for(const o of e){if(o.type===y.Gather){const i=o;for(;t.length;){const s=t[t.length-1];if(i.level<=s.level-1){const c=t.pop();if(!c)throw new Error("Fatal");c.nextLineIndex=i.index}else break}continue}o.deadEnd&&t.push(o)}}function Ae(e){const t=[];for(const o of e){if(o.type===y.Choice){for(;t.length&&!(t[t.length-1].level<=o.level);){const s=t.pop();console.log("§GUKESH REMOVE FROM STACK",s)}if(t.length&&t[t.length-1].level===o.level){const s=t.pop();if(!s)throw new Error("Fatal. No choice.");s.level===o.level&&(s.nextLineIndex=o.index)}t.push(o)}if(o.type===y.Gather)for(;t.length&&!(t[t.length-1].level<o.level);)t.pop()}}function Be(e,t){let o=-1;for(const i of e)o++,i.orgCodeLineNo=t+o+1}function De(e,t){const o=Se(e);return o[0].text.startsWith(".")&&E("The very first line cannot start with a dot.",o[0]),Be(o,t),Oe(o),Me(o),_e(o),$e(o),Ae(o),Pe(o),o}function Pe(e){Ue(e),We(e),He(e),Re(e),Ve(e)}function Re(e){const t=[];for(const o of e)if(o.isIfCondition)t.push({elseCount:0});else if(o.isEnd)t.pop();else if(o.isElse){const i=t[t.length-1];i||E('"else" not allowed outside if block.',o),i.elseCount++,i.elseCount>1&&E('Only one "else" per if block allowed.',o)}}function He(e){for(const t of e)t.isIfCondition&&(t.ifProps=Ge(t.text,t))}function Ge(e,t){const i=[">=","<=","<>","!=","<",">","="].find(p=>e.includes(p));i||E("Expected = or > or similar.",t),e.split(i).length-1!==1&&E("Only one operator like = or >= allowed.",t);const c=e.indexOf(i),h=e.slice(0,c).trim(),m=e.slice(c+i.length).trim();return re(h)||E(`${h}: expected a variable name or number.`,t),re(m)||E(`${m}: expected a variable name or number.`,t),{left:h,operator:i,right:m}}function re(e){return/^[A-Za-z0-9_\.\-]+$/.test(e)}function Ve(e){for(const t of e)delete t.correspondingElseLine}function We(e){const t=[];for(const o of e)if(o.isIfCondition)t.push(o);else if(o.isEnd){const i=t.pop();if(i||E('"end" not allowed outside if block.',o),i.correspondingElseLine){const s=i.correspondingElseLine;s.nextLineIndex=o.index}else i.nextLineIndex=o.index}else if(o.isElse){const i=t[t.length-1];i||E('"else" not allowed outside if block.',o),i.nextLineIndex=o.index+1,i.correspondingElseLine=o}t.length>0&&E("Unclosed if. Expected end.",t[t.length-1])}function Ue(e){for(const t of e)t.type===y.Undecided&&(t.text.startsWith("if ")?(t.isIfCondition=!0,t.text=t.text.replace("if ","").trim()):t.text==="else"?t.isElse=!0:t.text==="end"&&(t.isEnd=!0))}function Fe(e){const t=e.split(`
`),o={};for(let i of t){if(i=i.trim(),i===""||i.startsWith("#"))continue;let[s,c]=Ne(i);s=s.replace(":","").trim(),c=c.trim(),o[s]=c}return o}function Ye(e){if(!e.includes(ee))return[{},e,1,""];const[t,o]=Te(e,ee);return[Fe(t),o,ke(t,`
`),t]}function qe(e){ae=e}function Ke(e){const[t,o,i,s]=Ye(e),c=De(o,i);return{metaData:t,lines:c,metaDataOrg:s}}function Je(){return`
# Your story's title:
title: Untitled Story

# Your name:
author: Anonymous

# Accent color. Allowed values:
# red, blue, green, pink or monochrome
color: monochrome

# If you want, you can set this to:
# debugfast: yes
# If yes, there will be no
# animations while
# the story is being developed.
# This makes testing things faster. The final
# exported story will still have animations.
debugfast: no

###story###

.set x 5+4

You are in a forest.

There are two paths here,
one leasing left, one right.

What will you choose?

. Go left.
  You reach the beach.

  Good choice!

. Go right.
  You reach the hills.

  .. Go into the mountains.

    You go into the mountains.
    
    You freeze to
    death.

  .. Stay here.

    You live in the hills.
    
    Then you die.
  

-
The End

`}function je(){const e=document.querySelector("#sm_top");if(window.visualViewport){const t=()=>{const o=window.visualViewport.offsetTop;e.style.transform=`translateY(${o}px)`};window.visualViewport.addEventListener("resize",t),window.visualViewport.addEventListener("scroll",t)}}let R;function ze(){if(R=document.getElementById("app"),!R)throw new Error("Cannot start. No #app element.");Ze(),Xe(),je()}function Ze(){const e=`
    <div id="sm_top">
      <div>
        <button id="sm_play">Play</button>
        <button id="sm_edit">Edit</button>
      </div>

      <div id="error-displayer"></div>

      <div>
        <button id="more-menu-button">☰</button>
        <button id="sm_close-for-mobile">✖</button>
      </div>
    </div>
    
    <div id="sm_main">

      <div id="sm_code-wrapper">

        <div id="code-editor"
          contenteditable="true" autocapitalize="off"
          spellcheck="false">
        </div>

      </div>
      
      <div id="sm_play-wrapper">
        <iframe id="iframe-preview"></iframe>
      </div>

    </div>
  `;R.innerHTML=e}function Xe(){var e;le()?(e=document.getElementById("sm_close-for-mobile"))==null||e.addEventListener("click",()=>{Qe()}):document.getElementById("sm_close-for-mobile")}function Qe(){le()&&(document.referrer?window.parent.location.href=document.referrer:window.parent.location.reload())}const et=window;function tt(e,t,o={}){const i={tab:"	",indentOn:/[({\[]$/,moveToNewLine:/^[)}\]]/,spellcheck:!1,catchTab:!0,preserveIdent:!0,addClosing:!0,history:!0,window:et,autoclose:{open:`([{'"`,close:`)]}'"`},...o},s=i.window,c=s.document,h=[],m=[];let p=-1,v=!1,O=()=>{},G;e.setAttribute("contenteditable","plaintext-only"),e.setAttribute("spellcheck",i.spellcheck?"true":"false"),e.style.outline="none",e.style.overflowWrap="break-word",e.style.overflowY="auto",e.style.whiteSpace="pre-wrap";const _=(n,r)=>{t(n,r)},V=s.navigator.userAgent.match(/Firefox\/([0-9]+)\./),me=V?parseInt(V[1]):0;let $=!1;(e.contentEditable!=="plaintext-only"||me>=136)&&($=!0),$&&e.setAttribute("contenteditable","true");const he=z(()=>{const n=w();_(e,n),g(n)},30);let B=!1;const W=n=>!J(n)&&!j(n)&&n.key!=="Meta"&&n.key!=="Control"&&n.key!=="Alt"&&!n.key.startsWith("Arrow"),ye=z(n=>{W(n)&&(I(),B=!1)},300),k=(n,r)=>{h.push([n,r]),e.addEventListener(n,r)};k("keydown",n=>{n.defaultPrevented||(G=N(),i.preserveIdent?ge(n):q(n),i.catchTab&&we(n),i.addClosing&&Ee(n),i.history&&(be(n),W(n)&&!B&&(I(),B=!0)),$&&!Le(n)&&g(w()))}),k("keyup",n=>{n.defaultPrevented||n.isComposing||(G!==N()&&he(),ye(n),O(N()))}),k("focus",n=>{v=!0}),k("blur",n=>{v=!1}),k("paste",n=>{I(),xe(n),I(),O(N())}),k("cut",n=>{I(),Ce(n),I(),O(N())});function w(){const n=S(),r={start:0,end:0,dir:void 0};let{anchorNode:l,anchorOffset:a,focusNode:d,focusOffset:f}=n;if(!l||!d)throw"error1";if(l===e&&d===e)return r.start=a>0&&e.textContent?e.textContent.length:0,r.end=f>0&&e.textContent?e.textContent.length:0,r.dir=f>=a?"->":"<-",r;if(l.nodeType===Node.ELEMENT_NODE){const u=c.createTextNode("");l.insertBefore(u,l.childNodes[a]),l=u,a=0}if(d.nodeType===Node.ELEMENT_NODE){const u=c.createTextNode("");d.insertBefore(u,d.childNodes[f]),d=u,f=0}return K(e,u=>{if(u===l&&u===d)return r.start+=a,r.end+=f,r.dir=a<=f?"->":"<-","stop";if(u===l)if(r.start+=a,!r.dir)r.dir="->";else return"stop";else if(u===d)if(r.end+=f,!r.dir)r.dir="<-";else return"stop";u.nodeType===Node.TEXT_NODE&&(r.dir!="->"&&(r.start+=u.nodeValue.length),r.dir!="<-"&&(r.end+=u.nodeValue.length))}),e.normalize(),r}function g(n){var X,Q;const r=S();let l,a=0,d,f=0;if(n.dir||(n.dir="->"),n.start<0&&(n.start=0),n.end<0&&(n.end=0),n.dir=="<-"){const{start:b,end:x}=n;n.start=x,n.end=b}let u=0;K(e,b=>{if(b.nodeType!==Node.TEXT_NODE)return;const x=(b.nodeValue||"").length;if(u+x>n.start&&(l||(l=b,a=n.start-u),u+x>n.end))return d=b,f=n.end-u,"stop";u+=x}),l||(l=e,a=e.childNodes.length),d||(d=e,f=e.childNodes.length),n.dir=="<-"&&([l,a,d,f]=[d,f,l,a]);{const b=U(l);if(b){const M=c.createTextNode("");(X=b.parentNode)==null||X.insertBefore(M,b),l=M,a=0}const x=U(d);if(x){const M=c.createTextNode("");(Q=x.parentNode)==null||Q.insertBefore(M,x),d=M,f=0}}r.setBaseAndExtent(l,a,d,f),e.normalize()}function U(n){for(;n&&n!==e;){if(n.nodeType===Node.ELEMENT_NODE){const r=n;if(r.getAttribute("contenteditable")=="false")return r}n=n.parentNode}}function F(){const r=S().getRangeAt(0),l=c.createRange();return l.selectNodeContents(e),l.setEnd(r.startContainer,r.startOffset),l.toString()}function Y(){const r=S().getRangeAt(0),l=c.createRange();return l.selectNodeContents(e),l.setStart(r.endContainer,r.endOffset),l.toString()}function ge(n){if(n.key==="Enter"){const r=F(),l=Y();let[a]=Z(r),d=a;if(i.indentOn.test(r)&&(d+=i.tab),d.length>0?(C(n),n.stopPropagation(),T(`
`+d)):q(n),d!==a&&i.moveToNewLine.test(l)){const f=w();T(`
`+a),g(f)}}}function q(n){if($&&n.key==="Enter")if(C(n),n.stopPropagation(),Y()==""){T(`
 `);const r=w();r.start=--r.end,g(r)}else T(`
`)}function Ee(n){const r=i.autoclose.open,l=i.autoclose.close;if(r.includes(n.key)){C(n);const a=w(),d=a.start==a.end?"":S().toString(),f=n.key+d+(l[r.indexOf(n.key)]??"");T(f),a.start++,a.end++,g(a)}}function we(n){if(n.key==="Tab")if(C(n),n.shiftKey){const r=F();let[l,a]=Z(r);if(l.length>0){const d=w(),f=Math.min(i.tab.length,l.length);g({start:a,end:a+f}),c.execCommand("delete"),d.start-=f,d.end-=f,g(d)}}else T(i.tab)}function be(n){if(J(n)){C(n),p--;const r=m[p];r&&(e.innerHTML=r.html,g(r.pos)),p<0&&(p=0)}if(j(n)){C(n),p++;const r=m[p];r&&(e.innerHTML=r.html,g(r.pos)),p>=m.length&&p--}}function I(){if(!v)return;const n=e.innerHTML,r=w(),l=m[p];if(l&&l.html===n&&l.pos.start===r.start&&l.pos.end===r.end)return;p++,m[p]={html:n,pos:r},m.splice(p+1);const a=300;p>a&&(p=a,m.splice(0,1))}function xe(n){if(n.defaultPrevented)return;C(n);const l=(n.originalEvent??n).clipboardData.getData("text/plain").replace(/\r\n?/g,`
`),a=w();T(l),_(e),g({start:Math.min(a.start,a.end)+l.length,end:Math.min(a.start,a.end)+l.length,dir:"<-"})}function Ce(n){const r=w(),l=S();(n.originalEvent??n).clipboardData.setData("text/plain",l.toString()),c.execCommand("delete"),_(e),g({start:Math.min(r.start,r.end),end:Math.min(r.start,r.end),dir:"<-"}),C(n)}function K(n,r){const l=[];n.firstChild&&l.push(n.firstChild);let a=l.pop();for(;a&&r(a)!=="stop";)a.nextSibling&&l.push(a.nextSibling),a.firstChild&&l.push(a.firstChild),a=l.pop()}function D(n){return n.metaKey||n.ctrlKey}function J(n){return D(n)&&!n.shiftKey&&P(n)==="Z"}function j(n){return D(n)&&n.shiftKey&&P(n)==="Z"}function Le(n){return D(n)&&P(n)==="C"}function P(n){let r=n.key||n.keyCode||n.which;if(r)return(typeof r=="string"?r:String.fromCharCode(r)).toUpperCase()}function T(n){n=n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"),c.execCommand("insertHTML",!1,n)}function z(n,r){let l=0;return(...a)=>{clearTimeout(l),l=s.setTimeout(()=>n(...a),r)}}function Z(n){let r=n.length-1;for(;r>=0&&n[r]!==`
`;)r--;r++;let l=r;for(;l<n.length&&/[ \t]/.test(n[l]);)l++;return[n.substring(r,l)||"",r,l]}function N(){return e.textContent||""}function C(n){n.preventDefault()}function S(){return e.getRootNode().getSelection()}return{updateOptions(n){Object.assign(i,n)},updateCode(n,r=!0){e.textContent=n,_(e),r&&O(n)},onUpdate(n){O=n},toString:N,save:w,restore:g,recordHistory:I,destroy(){for(let[n,r]of h)e.removeEventListener(n,r)}}}function nt(e){const t=e.innerText.split(`
`);e.innerHTML=t.map(o=>{const i=o.trim();let s="";return i.startsWith("###story###")?s="section-start":i.startsWith("#")?s="line-comment":i.startsWith(".label")?s="label":i.startsWith(".")?s=ce(i,".")?"line-choice":"line-command":(i.startsWith("if ")||i==="else"||i.startsWith("end"))&&(s="if-else-end"),s?`<span class="line ${s}">${o}</span>`:`<span class="line">${o}</span>`}).join(`
`)}function ot(e,t){let o;return(...i)=>{clearTimeout(o),o=setTimeout(()=>e(...i),t)}}const it="BuffySummers",rt=300;let A,de,H,L;document.addEventListener("DOMContentLoaded",()=>{if(ve())ze();else throw new Error("Big layout not supported yet. Make your viewport smaller.");if(at(),ut(),st(),de=document.getElementById("iframe-preview"),ft(),qe(yt),L=window.$__$runtimeData,!L){const e="Fatal. Runtime data could not be loaded.";alert(e),document.body.innerHTML=e;return}Et(),pe()});function st(){const e=document.getElementById("sm_play"),t=document.getElementById("sm_edit");e&&(e.addEventListener("click",lt),t.addEventListener("click",se),se())}function lt(){const e=document.getElementById("sm_play"),t=document.getElementById("sm_edit"),o=document.getElementById("sm_code-wrapper"),i=document.getElementById("sm_play-wrapper");t.style.display="block",e.style.display="none",o.style.display="none",i.style.display="block"}function se(){const e=document.getElementById("sm_play"),t=document.getElementById("sm_edit"),o=document.getElementById("sm_code-wrapper"),i=document.getElementById("sm_play-wrapper");t.style.display="none",e.style.display="block",o.style.display="block",i.style.display="none"}function ct(){var e,t;H=document.getElementById("more-menu"),(e=document.getElementById("close-more-menu"))==null||e.addEventListener("click",()=>{fe()}),(t=document.getElementById("more-menu-button"))==null||t.addEventListener("click",()=>{dt()})}function at(){const e=document.createElement("div");e.id="more-menu",e.innerHTML=`
    <div id="more-menu-top">
      <button id="close-more-menu">☰</button>
    </div>
    
    <div id="more-menu-main">
    
    </div>
  `,document.body.append(e),ct(),fe()}function dt(){H.style.display="flex"}function fe(){H.style.display="none"}function ft(){document.addEventListener("click",e=>{const t=e.target;if(t&&t.classList.contains("goto-error")){const o=t.getAttribute("data-index");if(!o)return;const i=Number(o);if(isNaN(i))return;pt(i)}})}function ut(){const e=Je(),t=document.querySelector("#code-editor");A=tt(t,nt,{tab:""}),ue(e);const o=ot(pe,rt);A.onUpdate(()=>{o()})}function pt(e){const o=document.querySelector("#code-editor").querySelectorAll(".line");if(e<1||e>o.length)return;o[e-1].scrollIntoView({behavior:"auto",block:"start"})}function mt(e,t){const i=document.querySelector("#code-editor").querySelectorAll(".line");if(e<=0||e>i.length)return;const s=i[e-1];s.classList.add("error-line"),s.setAttribute("data-error",t)}function ht(){document.querySelector("#code-editor").querySelectorAll(".line.error").forEach(o=>{o.classList.remove("error"),o.removeAttribute("data-error")})}function yt(e,t){mt(t.orgCodeLineNo,e),document.getElementById("error-displayer").innerHTML=e+`<button class="goto-error" 
    data-index="${t.orgCodeLineNo}">GO TO ERROR</button>`}function gt(){ht(),document.getElementById("error-displayer").innerText=""}function Et(){const e=localStorage.getItem(it);if(!e)return!1;let t=null;try{t=JSON.parse(e)}catch{return!1}return wt(t),!0}function wt(e){ue(e.code)}function ue(e){A.updateCode(e)}function bt(){return A.toString()}function xt(e){function t(c,h){s+=`<p class="debug-${h}">${c}</p>`}function o(c){if(c.text.trim()===""&&c.nextLineIndex===0)return;let h="&nbsp;".repeat((c.level-1)*4+1);const m=c.nextLineIndex===0?"":"-> "+e.lines[c.nextLineIndex].text;let p=`${c.orgCodeLineNo}${h}${c.text} ${m}`,v="";c.type===y.Choice&&(v="choice"),c.type===y.Gather&&(v="gather"),t(p,v)}const i=document.getElementById("debug-compilation-result");if(!i)return;let s="";for(const c of e.lines)o(c);i.innerHTML=s}function pe(){gt();const e=Lt();vt(e)}function Ct(e){let t;try{t=Ke(e)}catch{return{success:!1}}return{success:!0,kompilat:t}}function Lt(e=!1){const t=bt();if(!t)return"";const o=Ct(t);if(!o.success)return"Error";const i=o.kompilat;xt(i);const s={kompilat:i},c=e?"window.$__$isExportedStory = true":"",h=i.metaData.ifid?`<meta property="ifiction:ifid" content="${i.metaData.ifid}">`:"";let m=L.files["index.html"];return m=m.replace("</body>",`
      <script>${c}<\/script>
      <script>window.$__$story = ${JSON.stringify(s)};<\/script>
      <script>${L.code}<\/script>
      </body>
    `).replace("</head>",`
      <style>${L.files["resets.css"]}</style>
      <style>${L.files["confirm.css"]}</style>
      <style>${L.files["animation-killer.css"]}</style>
      <style>${L.files["style.css"]}</style>
      </head>
    `).replace("<head>",`
      <head>
        <title>${te(i.metaData.title||"")}</title>
        <meta name="author" content="${te(i.metaData.author||"")}">
        ${h}
    `),m}function vt(e){de.srcdoc=e}
