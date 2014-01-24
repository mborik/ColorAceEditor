/*
 * ColorAceEditor v0.2.1
 * online editor of color images for PMD 85 microcomputer
 * Copyright (c) 2014 Martin Bórik
 */
var initializer={libraries:["jquery","jqueryui","scroller","app"],include:function(a){try{document.write('<script type="text/javascript" language="javascript" src="'+a+'"></script>')}catch(b){var c=document.createElement("script");c.type="text/javascript",c.src=a,document.getElementsByTagName("head")[0].appendChild(c)}},load:function(){var a,b,c,d=/init\.js(\?.*)?$/,e=window.location.href.match(/[\?&]dev(.*)$/)?".dev":"",f=document.getElementsByTagName("script");for(a=0;a<f.length;a++)if(c=f[a].getAttribute("src"),c.match(d)){b=c.replace(d,"");break}for(a in this.libraries)this.include(b+this.libraries[a]+e+".js")}};initializer.load();