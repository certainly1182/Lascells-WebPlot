if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(s[o])return;let t={};const l=e=>i(e,o),u={module:{uri:o},exports:t,require:l};s[o]=Promise.all(n.map((e=>u[e]||l(e)))).then((e=>(r(...e),t)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-CEz7iWt-.js",revision:null},{url:"assets/index-CsIuAX-G.css",revision:null},{url:"index.html",revision:"c22899ba9e1964bc00725da8bef39e5c"},{url:"lascells_Logo_Blue.png",revision:"7c6544049418b607c5a9e01a30ace691"},{url:"logo.svg",revision:"227401a9d82e8bbd190166f270880b14"},{url:"registerSW.js",revision:"ef2c396b7704a1b1766b6b865a7c6240"},{url:"manifest.webmanifest",revision:"6d41294fd75fe774ddd7f02f298a26fe"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
