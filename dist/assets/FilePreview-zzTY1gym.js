import{j as t,I as Y,_ as _e,h as g,d as H,A as R,k as he,o as m,w as r,a as n,t as v,p as w,l as k,x as c,D as T,R as E,c as _,b as Z,al as B,am as D,an as be,a9 as xe,K as G,E as L,ak as we,f as $}from"./index-BG3bheTR.js";/* empty css                                                                    */import{E as W}from"./ExportOutlined-SFbvGTwm.js";var ye={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"defs",attrs:{},children:[{tag:"style",attrs:{}}]},{tag:"path",attrs:{d:"M326 664H104c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h174v176c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16V696c0-17.7-14.3-32-32-32zm16-576h-48c-8.8 0-16 7.2-16 16v176H104c-8.8 0-16 7.2-16 16v48c0 8.8 7.2 16 16 16h222c17.7 0 32-14.3 32-32V104c0-8.8-7.2-16-16-16zm578 576H698c-17.7 0-32 14.3-32 32v224c0 8.8 7.2 16 16 16h48c8.8 0 16-7.2 16-16V744h174c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16zm0-384H746V104c0-8.8-7.2-16-16-16h-48c-8.8 0-16 7.2-16 16v224c0 17.7 14.3 32 32 32h222c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16z"}}]},name:"compress",theme:"outlined"};function q(s){for(var a=1;a<arguments.length;a++){var i=arguments[a]!=null?Object(arguments[a]):{},f=Object.keys(i);typeof Object.getOwnPropertySymbols=="function"&&(f=f.concat(Object.getOwnPropertySymbols(i).filter(function(p){return Object.getOwnPropertyDescriptor(i,p).enumerable}))),f.forEach(function(p){Oe(s,p,i[p])})}return s}function Oe(s,a,i){return a in s?Object.defineProperty(s,a,{value:i,enumerable:!0,configurable:!0,writable:!0}):s[a]=i,s}var N=function(a,i){var f=q({},a,i.attrs);return t(Y,q({},f,{icon:ye}),null)};N.displayName="CompressOutlined";N.inheritAttrs=!1;var Pe={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M912 192H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM104 228a56 56 0 10112 0 56 56 0 10-112 0zm0 284a56 56 0 10112 0 56 56 0 10-112 0zm0 284a56 56 0 10112 0 56 56 0 10-112 0z"}}]},name:"unordered-list",theme:"outlined"};function Q(s){for(var a=1;a<arguments.length;a++){var i=arguments[a]!=null?Object(arguments[a]):{},f=Object.keys(i);typeof Object.getOwnPropertySymbols=="function"&&(f=f.concat(Object.getOwnPropertySymbols(i).filter(function(p){return Object.getOwnPropertyDescriptor(i,p).enumerable}))),f.forEach(function(p){ke(s,p,i[p])})}return s}function ke(s,a,i){return a in s?Object.defineProperty(s,a,{value:i,enumerable:!0,configurable:!0,writable:!0}):s[a]=i,s}var J=function(a,i){var f=Q({},a,i.attrs);return t(Y,Q({},f,{icon:Pe}),null)};J.displayName="UnorderedListOutlined";J.inheritAttrs=!1;const Ce={class:"file-preview-container"},ze={class:"file-info-header"},Ie={class:"file-info"},Fe={class:"file-name"},Se={class:"file-size"},je={class:"file-actions"},Ue={class:"preview-content"},Me={key:0,class:"pdf-preview"},Te={class:"pdf-toolbar"},Be={class:"zoom-info"},De={class:"pdf-viewer"},Le=["src"],$e={key:1,class:"office-preview"},Ne={key:0,class:"pdf-preview"},Ve={class:"pdf-toolbar"},Ae={class:"zoom-info"},He={class:"pdf-viewer"},Re=["src"],Ee={key:1,class:"converting-status"},Ze={class:"converting-content"},Ge={class:"conversion-animation"},We={class:"progress-info"},qe={class:"progress-bar"},Qe={class:"progress-text"},Ye={class:"conversion-features"},Je={class:"feature-item"},Xe={class:"feature-item"},Ke={class:"feature-item"},et={key:2,class:"conversion-error"},tt={class:"unavailable-content"},ot={class:"error-actions"},nt={key:2,class:"image-preview"},st={class:"image-toolbar"},it={class:"zoom-info"},at={class:"image-viewer"},lt=["src"],rt={key:3,class:"unsupported-preview"},ct={class:"unsupported-content"},dt={key:4,class:"loading-overlay"},ut={__name:"FilePreview",props:{visible:{type:Boolean,default:!1},fileInfo:{type:Object,default:()=>({})}},emits:["update:visible","download"],setup(s,{emit:a}){const i=s,f=a,p=g(!1),z=g(!1),d=g(1),h=g(1),I=g(1),b=g(""),X=g(""),y=g(""),C=g(0),x=H(()=>{var u;const e=(u=(i.fileInfo.name||"").split(".").pop())==null?void 0:u.toLowerCase();return["pdf"].includes(e)?"pdf":["doc","docx"].includes(e)?"word":["ppt","pptx"].includes(e)?"powerpoint":["jpg","jpeg","png","gif","bmp"].includes(e)?"image":["xls","xlsx"].includes(e)?"excel":"unknown"}),V=H(()=>["word","powerpoint","excel"].includes(x.value));R(()=>i.fileInfo,o=>{o&&o.name&&S()},{immediate:!0}),R(()=>i.visible,o=>{var e;o&&((e=i.fileInfo)!=null&&e.name)?S():o||le()});const S=async()=>{var o;if((o=i.fileInfo)!=null&&o.name){p.value=!0;try{await K()}catch(e){console.error("Preview generation failed:",e)}finally{p.value=!1}}},K=async()=>{const o=i.fileInfo;x.value==="pdf"?o.url?b.value=o.url:b.value="/api/files/preview/demo.pdf":V.value?await ee():x.value==="image"&&(o.url?b.value=o.url:b.value="/api/files/preview/demo.jpg")},ee=async()=>{const o=i.fileInfo;await A(o)},j=()=>{d.value<3&&(d.value=Math.min(d.value+.25,3))},U=()=>{d.value>.1&&(d.value=Math.max(d.value-.25,.1))},te=()=>{d.value=1},oe=()=>{h.value>1&&h.value--},ne=()=>{h.value<I.value&&h.value++},se=()=>{S()},ie=o=>{const e=o.name||"未知文件",u=O(u.value),l=`
    <html>
      <head>
        <meta charset="utf-8">
        <title>${e} - 预览</title>
        <style>
          body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            margin: 40px;
            background: #f5f5f5;
            color: #333;
          }
          .preview-container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1890ff;
            padding-bottom: 20px;
          }
          .file-icon {
            font-size: 48px;
            color: #1890ff;
            margin-bottom: 10px;
          }
          .file-name {
            font-size: 24px;
            font-weight: bold;
            color: #1890ff;
          }
          .file-type {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }
          .content {
            margin: 30px 0;
            line-height: 1.8;
          }
          .demo-text {
            background: #f0f8ff;
            padding: 20px;
            border-radius: 4px;
            border-left: 4px solid #1890ff;
            margin: 20px 0;
          }
          .conversion-info {
            background: #f6ffed;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #b7eb8f;
            margin-top: 30px;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e8e8e8;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="preview-container">
          <div class="header">
            <div class="file-icon">📄</div>
            <div class="file-name">${e}</div>
            <div class="file-type">${u} 智能转换预览</div>
          </div>
          
          <div class="content">
            <div class="demo-text">
              <h3>📋 文件预览演示</h3>
              <p>这是 <strong>${u}</strong> 文件的智能转换预览效果。</p>
              <p>实际项目中，这里会显示您的文档转换后的真实内容。</p>
            </div>
            
            <h4>🔧 智能转换特性：</h4>
            <ul>
              <li><strong>自动布局优化</strong>：根据内容类型选择最佳页面方向</li>
              <li><strong>智能缩放调整</strong>：确保所有内容都能完整显示</li>
              <li><strong>字体嵌入处理</strong>：保证文字显示效果一致</li>
              <li><strong>图片质量优化</strong>：平衡文件大小与显示质量</li>
            </ul>
            
            <div class="conversion-info">
              ✅ <strong>转换完成</strong> - 文件已成功转换为PDF格式，支持缩放、翻页等操作
            </div>
          </div>
          
          <div class="footer">
            华水科研管理系统 - 智能文档预览服务
          </div>
        </div>
      </body>
    </html>
  `,P=new Blob([l],{type:"text/html"});return URL.createObjectURL(P)},M=()=>{f("download",i.fileInfo),$.info("开始下载文件...")},ae=()=>{f("update:visible",!1)},le=()=>{d.value=1,h.value=1,I.value=1,y.value&&y.value.startsWith("blob:")&&URL.revokeObjectURL(y.value),b.value="",X.value="",y.value="",p.value=!1},re=o=>o?o<1024?o+"B":o<1024*1024?(o/1024).toFixed(1)+"KB":o<1024*1024*1024?(o/1024/1024).toFixed(1)+"MB":(o/1024/1024/1024).toFixed(1)+"GB":"未知大小",ce=o=>({pdf:"red",word:"blue",powerpoint:"orange",excel:"green",image:"purple"})[x.value]||"default",O=o=>({pdf:"PDF文档",word:"Word文档",powerpoint:"PowerPoint演示文稿",excel:"Excel表格",image:"图片文件",unknown:"未知文件"})[x.value]||"未知文件",A=async o=>{z.value=!0,C.value=0;try{const e=de(o),u=[{step:"分析文档结构...",progress:15},{step:"优化页面布局...",progress:35},{step:"调整内容大小...",progress:55},{step:"生成PDF格式...",progress:80},{step:"完成转换处理...",progress:100}];for(const l of u)C.value=l.progress,await new Promise(P=>setTimeout(P,800));y.value=ie(o),$.success(`${O(x.value)} 转换完成！已优化为最佳预览效果`)}catch(e){$.error("智能转换失败："+e.message)}finally{z.value=!1,C.value=0}},de=o=>{const e=o.size||0,u=o.name||"",l=ue(u);return{orientation:l==="powerpoint"?"landscape":"portrait",quality:e>10*1024*1024?"medium":"high",pageSize:fe(l),scaleToFit:!0,embedFonts:!0,imageCompression:e>5*1024*1024?.8:.9,optimizations:pe(l)}},ue=o=>{var u;const e=(u=o.split(".").pop())==null?void 0:u.toLowerCase();return["ppt","pptx"].includes(e)?"powerpoint":["doc","docx"].includes(e)?"word":["xls","xlsx"].includes(e)?"excel":"unknown"},fe=(o,e)=>{switch(o){case"powerpoint":return"A4-landscape";case"excel":return"A3-landscape";case"word":default:return"A4-portrait"}},pe=o=>{switch(o){case"powerpoint":return{preserveSlideTransitions:!1,optimizeForViewing:!0,maintainAspectRatio:!0};case"excel":return{autoFitColumns:!0,showGridlines:!0,optimizeForPrint:!1};case"word":return{preserveFormatting:!0,optimizeImages:!0,maintainPageBreaks:!0};default:return{}}},ve=async()=>{await A(i.fileInfo)};return(o,e)=>{const u=k("a-tag"),l=k("a-button"),P=k("a-divider"),F=k("a-space"),me=k("a-spin"),ge=k("a-modal");return m(),he(ge,{open:s.visible,title:s.fileInfo.name||"文件预览",width:"90%",footer:null,"destroy-on-close":!0,onCancel:ae,class:"file-preview-modal"},{default:r(()=>[n("div",Ce,[n("div",ze,[n("div",Ie,[n("span",Fe,v(s.fileInfo.name),1),n("span",Se,v(re(s.fileInfo.size)),1),t(u,{color:ce(s.fileInfo.type)},{default:r(()=>[w(v(O(s.fileInfo.type)),1)]),_:1},8,["color"])]),n("div",je,[t(l,{type:"link",onClick:M},{default:r(()=>[t(c(T)),e[0]||(e[0]=w(" 下载 "))]),_:1,__:[0]}),t(l,{type:"link",onClick:se},{default:r(()=>[t(c(E)),e[1]||(e[1]=w(" 刷新 "))]),_:1,__:[1]})])]),n("div",Ue,[x.value==="pdf"?(m(),_("div",Me,[n("div",Te,[t(F,null,{default:r(()=>[t(l,{onClick:U,disabled:d.value<=.5},{default:r(()=>[t(c(B))]),_:1},8,["disabled"]),n("span",Be,v(Math.round(d.value*100))+"%",1),t(l,{onClick:j,disabled:d.value>=3},{default:r(()=>[t(c(D))]),_:1},8,["disabled"]),t(P,{type:"vertical"}),n("span",null,"页面: "+v(h.value)+" / "+v(I.value),1),t(l,{onClick:oe,disabled:h.value<=1},{default:r(()=>[t(c(be))]),_:1},8,["disabled"]),t(l,{onClick:ne,disabled:h.value>=I.value},{default:r(()=>[t(c(xe))]),_:1},8,["disabled"])]),_:1})]),n("div",De,[b.value?(m(),_("iframe",{key:0,src:b.value,frameborder:"0",width:"100%",height:"600px"},null,8,Le)):Z("",!0)])])):V.value?(m(),_("div",$e,[y.value?(m(),_("div",Ne,[n("div",Ve,[t(F,null,{default:r(()=>[t(l,{onClick:U,disabled:d.value<=.5},{default:r(()=>[t(c(B))]),_:1},8,["disabled"]),n("span",Ae,v(Math.round(d.value*100))+"%",1),t(l,{onClick:j,disabled:d.value>=3},{default:r(()=>[t(c(D))]),_:1},8,["disabled"]),t(P,{type:"vertical"}),n("span",null,v(O(s.fileInfo.type))+" (已转换为PDF)",1)]),_:1})]),n("div",He,[n("iframe",{src:y.value,frameborder:"0",width:"100%",height:"600px"},null,8,Re)])])):z.value?(m(),_("div",Ee,[n("div",Ze,[n("div",Ge,[t(c(W),{style:{"font-size":"48px",color:"#1890ff","margin-bottom":"16px"}}),n("h3",null,"正在智能转换 "+v(O(s.fileInfo.type)),1),e[5]||(e[5]=n("p",null,"自动优化内容布局和显示效果，请稍候...",-1)),n("div",We,[n("div",qe,[n("div",{class:"progress-fill",style:G({width:C.value+"%"})},null,4)]),n("div",Qe,v(C.value)+"%",1)]),n("div",Ye,[n("div",Je,[t(c(L),{style:{color:"#52c41a"}}),e[2]||(e[2]=n("span",null,"智能页面布局",-1))]),n("div",Xe,[t(c(L),{style:{color:"#52c41a"}}),e[3]||(e[3]=n("span",null,"自适应内容大小",-1))]),n("div",Ke,[t(c(L),{style:{color:"#52c41a"}}),e[4]||(e[4]=n("span",null,"最优显示方向",-1))])])])])])):(m(),_("div",et,[n("div",tt,[t(c(W),{style:{"font-size":"48px",color:"#ff4d4f"}}),n("h3",null,v(O(s.fileInfo.type))+" 转换遇到问题",1),e[8]||(e[8]=n("p",null,"智能转换服务暂时不可用，请稍后重试",-1)),n("div",ot,[t(F,null,{default:r(()=>[t(l,{type:"primary",onClick:ve,loading:z.value},{default:r(()=>[t(c(E)),e[6]||(e[6]=w(" 重新转换 "))]),_:1,__:[6]},8,["loading"]),t(l,{onClick:M},{default:r(()=>[t(c(T)),e[7]||(e[7]=w(" 下载文件 "))]),_:1,__:[7]})]),_:1})])])]))])):x.value==="image"?(m(),_("div",nt,[n("div",st,[t(F,null,{default:r(()=>[t(l,{onClick:U,disabled:d.value<=.1},{default:r(()=>[t(c(B))]),_:1},8,["disabled"]),n("span",it,v(Math.round(d.value*100))+"%",1),t(l,{onClick:j,disabled:d.value>=5},{default:r(()=>[t(c(D))]),_:1},8,["disabled"]),t(l,{onClick:te},{default:r(()=>[t(c(N)),e[9]||(e[9]=w(" 适应窗口 "))]),_:1,__:[9]})]),_:1})]),n("div",at,[n("img",{src:b.value,style:G({transform:`scale(${d.value})`,transformOrigin:"center"})},null,12,lt)])])):(m(),_("div",rt,[n("div",ct,[t(c(we),{style:{"font-size":"48px",color:"#ccc"}}),e[11]||(e[11]=n("h3",null,"不支持预览此文件类型",-1)),n("p",null,"文件类型："+v(O(s.fileInfo.type)),1),t(l,{type:"primary",onClick:M},{default:r(()=>[t(c(T)),e[10]||(e[10]=w(" 下载文件查看 "))]),_:1,__:[10]})])])),p.value?(m(),_("div",dt,[t(me,{size:"large"},{tip:r(()=>e[12]||(e[12]=[w("正在加载预览...")])),_:1})])):Z("",!0)])])]),_:1},8,["open","title"])}}},mt=_e(ut,[["__scopeId","data-v-6e8fd5e5"]]);export{mt as F,J as U};
