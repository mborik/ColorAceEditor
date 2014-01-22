/*
 * ColorAceEditor v0.2.1
 * online editor of color images for PMD 85 microcomputer
 * Copyright (c) 2014 Martin Bórik
 */
var initializer={libraries:["jquery","jqueryui","scroller","app"],include:function(a){try{document.write('<script type="text/javascript" language="javascript" src="'+a+'"></script>')}catch(b){var c=document.createElement("script");c.type="text/javascript",c.src=a,document.getElementsByTagName("head")[0].appendChild(c)}},load:function(){var a,b,c,d=/init\.js(\?.*)?$/,e="",f=document.getElementsByTagName("script");for(a=0;a<f.length;a++){var g=f[a].getAttribute("src");if(c=g.match(d)){c[1]&&0==c[1].indexOf("?dev")&&(e=".dev"),b=g.replace(d,"");break}}for(a in this.libraries)this.include(b+this.libraries[a]+e+".js")}};initializer.load();