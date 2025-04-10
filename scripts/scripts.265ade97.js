"use strict";angular.module("mainologyApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","ngTouch"]).config(["$routeProvider","$logProvider",function(a,b){b.debugEnabled(!0),a.when("/",{templateUrl:"views/main.html",controller:"AltCtrl"}).otherwise({redirectTo:"/"})}]),angular.module("mainologyApp").controller("AboutCtrl",["$scope",function(a){a.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}]),angular.module("mainologyApp").controller("AltCtrl",["$scope","$http","$log","$timeout","$q",function(a,b,c,d,e){function f(b,c,d,e,h,i){var j="http://"+b+".wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content|size&format=json&callback=?&titles="+c.name;$.getJSON(j,function(b){try{var f=b.query.pages;for(var g in f)break;var h=f[g].revisions[0]["*"],j=f[g].revisions[0].size;c.name.toLowerCase()in d||(d[c.name.toLowerCase()]={}),d[c.name.toLowerCase()].size=j,d[c.name.toLowerCase()].status="visited";var k=h.match(/\{\{[Mm]ain\|(.+?)\}\}/g),l=[];for(var m in k){var n=k[m].match(/\{\{[Mm]ain\|(.+?)\}\}/)[1],o=n.split("|");for(var p in o){var q=/^l.=/g,r=q.exec(o[p]);null===r&&l.push(o[p].split("#")[0])}}for(var m in l){var s=l[m];s.toLowerCase()in d||""===s||null===s||(c.depthlevel<a.iterations-1&&(a.counts[i]++,a.count=d3.sum(a.counts),a.$apply()),a.maxdepth=c.depthlevel+1,d[s.toLowerCase()]={name:s,size:0,depthlevel:c.depthlevel+1,status:"new",id:e.nodes.length},e.nodes.push(d[s.toLowerCase()]));var t=e.edges.filter(function(a){return a.source==c.id&&c.target==d[s.toLowerCase()].id});0==t.length&&(e.edges.push({source:c.id,target:d[s.toLowerCase()].id,index:d[s.toLowerCase()].depthlevel}),a.showlinks.push({source:c.name,target:s,index:d[s.toLowerCase()].depthlevel}))}}catch(u){console.log("error: "+c.name),c.status="not found",a.notFound.push(c.name),a.$apply()}}).success(function(){a.visiteds[i]++,a.visited=d3.sum(a.visiteds),a.$apply(),console.log(a.counts[i],a.visiteds[i]),a.counts[i]==a.visiteds[i]?(console.log("Am I last? ",h),g(b,d,e,i)):a.maxdepth<a.iterations&&d3.values(d).forEach(function(a,c){"new"==a.status&&(a.status="visited",c==d3.values(d).length-1?f(b,a,d,e,!0,i):f(b,a,d,e,!1,i))})})}function g(b,c,d,e){var f=d3.values(c).filter(function(a){return"new"==a.status||!("size"in a)}),g=f.length;f.forEach(function(c,f){if("new"==c.status||!("size"in c)){console.log("finalizing "+c.name),c.status="visited";var h="http://"+b+".wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content|size&format=json&callback=?&titles="+c.name;$.getJSON(h,function(b){try{var e=b.query.pages;for(var f in e)break;var g=e[f].revisions[0].size;c.size=g;var h=d.nodes.filter(function(a){return a.name==c.name})[0];h.size=g,console.log(c.name+" updated")}catch(i){c.status="not found",d.nodes.filter(function(a){return a.id==c.id})[0].status="not found",console.log("error",c),a.notFound.push(c.name),a.$apply()}}).success(function(){if(f==g-1){i[e]=!0,j(d);var b=!1;i.forEach(function(a,c){a||(b=!0)}),b||(console.log("really finished"),a.finished=!0,a.done=!0,a.$apply())}})}})}var h=/en\.wikipedia\.org\/wiki\/.+/;a.query="",a.qarr=[],a.res=[],a.notFound=[],a.edges=[],a.nodes=[],a.graph={edges:a.edges,nodes:a.nodes},a.count=0,a.visited=0,a.iterations=2,a.finished=!0;var i=[];a.counts=[],a.visiteds=[],a.update=function(){if(a.finished=!1,c.debug("starting crawling for",a.query.split("\n").length,"pages"),a.alert=!1,a.download=!1,a.notFound=[],a.lang="en",a.showlinks=[],a.res=[],a.count=0,a.maxdepth=0,a.edges=[],a.nodes=[],a.visited=0,a.nodedict={},i=[],a.counts=[],a.visiteds=[],a.done=!1,""!==a.query.trim()){var b=[],d=a.query.split("\n"),e=[];e=d.filter(function(a){return""==a.trim()?!1:(c.info("checking",a,h.test(a)?"is a wikipedia page":"is not a wiki page ..."),h.test(a)?a:void b.push(a))}),c.debug("valid wikipedia pages:",e,"/",d,"n. error pages:",b.length),b.length?(c.error("Not valid wikipedia pages: ",b),a.alert=!0):e.forEach(function(b,c){var d=/wiki\/(.+)/g;console.log("input",JSON.stringify(b));var e=d.exec(b)[1],g=decodeURIComponent(e).replace(/_/g," "),h={name:g,depthlevel:0,id:0},j={truename:h},k={nodes:[h],edges:[]};a.counts.push(1),a.visiteds.push(0),i.push(!1),f(a.lang,h,j,k,!1,c)})}else c.error("Empty Query!"),a.alert=!0};var j=function(b){var d=a.nodes.length,e={},f=[];d>0?(b.nodes.forEach(function(b,c){var g=a.nodes.filter(function(a){return a.name==b.name});g.length>0?(e[b.id]=g[0].id,console.log("found common")):(b.id=b.id+d,f.push(b),console.log("pushing"))}),console.log("nodes to add",f),b.edges.forEach(function(a,b){a.source in e?a.source=e[a.source]:a.source=a.source+d,a.target in e?a.target=e[a.target]:a.target=a.target+d})):f=b.nodes,a.nodes=a.nodes.concat(f),a.edges=a.edges.concat(b.edges),c.debug("nodes",a.nodes,a.nodes.length),c.debug("edges",a.edges,a.edges.length)};a.$watch("counts",function(a,b){}),a.$watch("visiteds",function(a,b){}),a.downloadJSON=function(){var b=angular.toJson({nodes:a.nodes,edges:a.edges}),c=new Blob([b],{type:"data:text/json;charset=utf-8"});saveAs(c,"data.json")},a.downloadCSV=function(){var b="source	target	depth\n";a.edges.forEach(function(a,c){b+=a.source+"	"+a.target+"	"+a.index+"\n"});var c=new Blob([b],{type:"data:text/csv;charset=utf-8"});saveAs(c,"data.tsv")},a.downloadGEXF=function(){var b=gexf.create({defaultEdgeType:"directed"});b.addNodeAttribute({id:"level",title:"Level",type:"integer"}),b.addNodeAttribute({id:"size",title:"Size",type:"integer"}),a.nodes.forEach(function(a){b.addNode({id:a.id,label:a.name,attributes:{level:a.depthlevel,size:a.size}})}),a.edges.forEach(function(a){b.addEdge({source:a.source,target:a.target})});var c=new Blob([b.serialize()],{type:"data:application/xml+gexf;charset=utf-8"});saveAs(c,"data.gexf")},a.$watch("resolved",function(b,d){c.debug("resolved",b,"pending",a.pending)})}]);