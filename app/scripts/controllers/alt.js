'use strict';

/**
 * @ngdoc function
 * @name mainologyApp.controller:AltCtrl
 * @description
 * # AltCtrl
 * Controller of the mainologyApp
 */
angular.module('mainologyApp')
  .controller('AltCtrl', function ($scope, $http, $log, $timeout,$q) {
    var regex = /en\.wikipedia\.org\/wiki\/.+/; // regex to match candidates


    $scope.query = "";//http://en.wikipedia.org/wiki/God\nhttp://en.wikipedia.org/wiki/Devil\n";


    $scope.qarr = [];
    $scope.res = [];
    $scope.notFound=[];
    $scope.edges=[];
    $scope.nodes=[];
    $scope.graph = {"edges":$scope.edges,"nodes":$scope.nodes};
    $scope.count=0;
    $scope.visited=0;
    $scope.iterations = 2;
    $scope.finished = true;
    var finisheds=[];
    $scope.counts=[];
    $scope.visiteds=[];




    $scope.update = function () {
      $scope.finished = false;
      $log.debug('starting crawling for', $scope.query.split('\n').length, 'pages')
      $scope.alert=false;
      $scope.download=false;
      $scope.notFound=[];
      $scope.lang = "en";
      $scope.showlinks=[];
      $scope.res = [];
      $scope.count=0;
      $scope.maxdepth = 0;
      $scope.edges=[];
      $scope.nodes=[];
      $scope.visited=0;
      $scope.nodedict={};
      finisheds=[];
      $scope.counts=[];
      $scope.visiteds=[];
      $scope.done = false;




      if ($scope.query.trim() !== '') {
        var errors = [],
          listOfPages = $scope.query.split('\n'),
          validPages  = [];

        // check for integrity
        validPages = listOfPages.filter(function(d) {
          if(d.trim() == '')
            return false;

          $log.info('checking', d, regex.test(d)? 'is a wikipedia page': 'is not a wiki page ...');

          if(regex.test(d))
            return d;
          else
            errors.push(d);
        });


        $log.debug('valid wikipedia pages:',validPages, '/', listOfPages, 'n. error pages:', errors.length);

        if(!errors.length) {
          validPages.forEach(function (e, i) {
            var rgx = /wiki\/(.+)/g;
            console.log("input", JSON.stringify(e));
            var name = rgx.exec(e)[1];
            var truename = decodeURIComponent(name).replace(/_/g, " ");
            //var ret = getSons(e, 0, $scope.res);
            var obj = {"name":truename, "depthlevel":0, "id":0}
            var nodedict = {truename:obj};
            var graph = {nodes:[obj],edges:[]}

           $scope.counts.push(1);
            $scope.visiteds.push(0);
            finisheds.push(false);
            loadPage($scope.lang, obj, nodedict, graph, false, i);
          })


        } else {
          $log.error('Not valid wikipedia pages: ', errors);
          $scope.alert = true;
        }
      } else {
        $log.error('Empty Query!')
        $scope.alert = true;
      }
    }


    function loadPage(_langID, _parent, _nodedict, _graph, last, ind) {


      var baseURL = "http://" + _langID + ".wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content|size&format=json&callback=?&titles=" + _parent.name;

      $.getJSON(
        baseURL,
        function (data) {
          try {
            //load page from API




            var pagedata = data['query']['pages'];

            for (var first in pagedata) break;
            var text = pagedata[first]['revisions'][0]['*'];
            var pagesize = pagedata[first]['revisions'][0]['size'];

            if (!(_parent.name.toLowerCase() in _nodedict)) _nodedict[_parent.name.toLowerCase()] = {};

            _nodedict[_parent.name.toLowerCase()].size = pagesize;
            _nodedict[_parent.name.toLowerCase()].status = 'visited';




            //get main pages
            var templates = text.match(/\{\{[Mm]ain\|(.+?)\}\}/g);
            var pages = []
            for (var i in templates) {
              var allpages = templates[i].match(/\{\{[Mm]ain\|(.+?)\}\}/)[1];
              var temppages = allpages.split('|');
              for (var j in temppages) {
                pages.push(temppages[j]);

              }
            }


            for (var i in pages) {
              var newpage = pages[i]

              //check if pages exixts
              if (!(newpage.toLowerCase() in _nodedict) && newpage!=="" && newpage!==null) {
                if (_parent.depthlevel<$scope.iterations-1) {
                  $scope.counts[ind]++;
                  $scope.count = d3.sum($scope.counts);
                  $scope.$apply();
                }
                $scope.maxdepth = _parent.depthlevel + 1;

                _nodedict[newpage.toLowerCase()] = {
                  name: newpage,
                  size: 0,
                  depthlevel: _parent.depthlevel + 1,
                  status: 'new',
                  id: _graph.nodes.length
                };
                _graph.nodes.push(_nodedict[newpage.toLowerCase()]);
              }

              var found = _graph.edges.filter(function(w){return w.source == _parent.id && _parent.target == _nodedict[newpage.toLowerCase()].id});
              if(found.length == 0) {
                _graph.edges.push({source: _parent.id, target: _nodedict[newpage.toLowerCase()].id, index:_nodedict[newpage.toLowerCase()].depthlevel});
                $scope.showlinks.push({"source":_parent.name,"target":newpage,"index":_nodedict[newpage.toLowerCase()].depthlevel})
              }

            }
          } catch (e) {
            console.log('error: ' + _parent.name);
            _parent.status = 'not found';
            $scope.notFound.push(_parent.name);
            $scope.$apply();
          }

        }
      ).success(function () {
          $scope.visiteds[ind]++;
          $scope.visited = d3.sum($scope.visiteds);
          $scope.$apply();
          console.log($scope.counts[ind],$scope.visiteds[ind]);

          //if(d3.values(_nodedict).filter(function(z){return z.status=="new" && z.depthlevel < iterations}).length==0) {
          if($scope.counts[ind] == $scope.visiteds[ind]) {
            console.log("Am I last? ",last);

              getFinalInfo(_langID, _nodedict, _graph,ind);


          }
          else if($scope.maxdepth<$scope.iterations){
            d3.values(_nodedict).forEach(function(d,i){
              if(d.status == "new") {
                d.status = "visited";
                if(i == d3.values(_nodedict).length-1) {
                  loadPage(_langID,d,_nodedict,_graph,true,ind);
                }
                else {
                  loadPage(_langID,d,_nodedict,_graph,false,ind);
                }

              }
            })
          }

        });
    }

    function getFinalInfo(lang,elems,graph,ind) {



        var filtered = d3.values(elems).filter(function(e){return e.status == "new" || !("size" in e)});
        var maxlen = filtered.length;

        filtered.forEach(function (d, i) {

          if (d.status == "new" || !("size" in d) ) {
            console.log("finalizing "+ d.name)
            d.status = "visited";

            var baseURL = "http://" + lang + ".wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content|size&format=json&callback=?&titles=" + d.name;

            $.getJSON(
              baseURL,
              function (data) {
                try {
                  //load page from API
                  var pagedata = data['query']['pages'];

                  for (var first in pagedata) break;
                  //var text = pagedata[first]['revisions'][0]['*'];
                  var pagesize = pagedata[first]['revisions'][0]['size'];
                  d.size = pagesize;

                  var graphel = graph.nodes.filter(function (e) {
                    return e.name == d.name
                  })[0]
                  graphel.size = pagesize;
                  console.log(d.name+" updated");


                }
                catch (e) {
                  d.status = "not found"
                  graph.nodes.filter(function(e){return e.id == d.id})[0].status = "not found";
                  console.log("error", d);
                  $scope.notFound.push(d.name);
                  $scope.$apply();
                }


              }).success(function () {

                if(i==maxlen-1) {
                  finisheds[ind] = true;
                  concatGraphs(graph);

                  var found = false;
                  finisheds.forEach(function(s,k) {
                    if(!s) found = true;
                  })
                  if(!found) {
                    console.log("really finished");
                    $scope.finished = true;
                    $scope.done = true;
                    $scope.$apply();
                  }

                }
              })
          }
        })
    }


var concatGraphs = function(gr) {

  var l = $scope.nodes.length;
  var common = {};
  var nodesToAdd = [];
  if (l>0) {

    gr.nodes.forEach(function(d,i){
      var exsts = $scope.nodes.filter(function(e){return e.name == d.name})
      if(exsts.length>0) {
        common[d.id] = exsts[0].id;
        console.log("found common")
      }
      else {
        d.id = d.id + l;
        nodesToAdd.push(d);
        console.log("pushing")
      }
    })

    console.log("nodes to add",nodesToAdd);

    gr.edges.forEach(function(d,i){

      if(d.source in common) {
        d.source = common[d.source];
      }
      else {
        d.source = d.source + l;
      }
      if(d.target in common) {
        d.target = common[d.target];
      }
      else{
        d.target = d.target + l;
      }
    })
  }

  else {
    nodesToAdd = gr.nodes;
  }

  $scope.nodes = $scope.nodes.concat(nodesToAdd);
  $scope.edges = $scope.edges.concat(gr.edges);

  $log.debug("nodes",$scope.nodes,$scope.nodes.length);
  $log.debug("edges",$scope.edges,$scope.edges.length);

}



$scope.$watch("counts",function(newValue,oldValue){
  if(newValue != oldValue) {

  }
})

$scope.$watch("visiteds",function(newValue,oldValue){
  if(newValue != oldValue) {

  }
})


    $scope.downloadJSON = function() {



      var json = angular.toJson({nodes:$scope.nodes,edges:$scope.edges});
      var blob = new Blob([json], { type: "data:text/json;charset=utf-8" });
      saveAs(blob, "data.json")
    };

    $scope.downloadCSV = function() {

      var csvtxt = "source\ttarget\tdepth\n";
      $scope.edges.forEach(function(e,i){
        csvtxt+=(e.source+"\t"+ e.target+"\t"+e.index+"\n");
      })
      var blob = new Blob([csvtxt], { type: "data:text/csv;charset=utf-8" });
      saveAs(blob, "data.tsv")
    };

    $scope.downloadGEXF = function() {
      var gexfDoc = gexf.create();

      gexfDoc.addNodeAttribute({id: 'level', title: 'Level', type: 'integer'});
      gexfDoc.addNodeAttribute({id: 'size', title: 'Size', type: 'integer'});

      $scope.nodes.forEach(function(n) {
        gexfDoc.addNode({
          id: n.id,
          label: n.name,
          attributes: {
            level: n.depthlevel,
            size: n.size
          }
        });
      });

      $scope.edges.forEach(function(e) {
        gexfDoc.addEdge({source: e.source, target: e.target});
      });

      var blob = new Blob([gexfDoc.serialize()], { type: "data:application/xml+gexf;charset=utf-8" });
      saveAs(blob, "data.gexf")
    };

    $scope.$watch("resolved",function(newValue,oldValue){
      $log.debug("resolved",newValue,"pending",$scope.pending);
    })
  });
