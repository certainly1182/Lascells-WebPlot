if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let o={};const l=e=>i(e,t),u={module:{uri:t},exports:o,require:l};s[t]=Promise.all(n.map((e=>u[e]||l(e)))).then((e=>(r(...e),o)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-7QICQtet.js",revision:null},{url:"assets/index-IObMJDp8.css",revision:null},{url:"index.html",revision:"b2150074900711724a7e99bea5e02259"},{url:"lascells_Logo_Blue.png",revision:"7c6544049418b607c5a9e01a30ace691"},{url:"logo.svg",revision:"1bad8464369f487105aeaa014fb66491"},{url:"registerSW.js",revision:"ef2c396b7704a1b1766b6b865a7c6240"},{url:"manifest.webmanifest",revision:"c1f2853ff1533651a2a58302e9436b25"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
