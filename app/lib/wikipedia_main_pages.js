//first of all, query the page
//http://blog.comperiosearch.com/blog/2012/06/27/make-an-instant-search-application-using-json-ajax-and-jquery/

var langID = 'en';
var page = 'Spain';
var graph = {nodes:[],edges:[]};
var nodedict = {};
var maxdepth = 0;
var iterations = 3;
var done = false;

var parent = {"name":"Spain", "depthlevel":0, "id":0};
nodedict[page] = parent;
graph.nodes.push(parent);


//When DOM loaded we attach click event to button
$(document).ready(function() {

  //after button is clicked we download the data
  $('#export_gexf').click(function () {
    //console.log(graph)
    console.log(GEXFexport(page, graph));
  });

  count = 1;
  visited = 0;

 // loadPage(langID,parent,nodedict,graph, false);

  function loadPage(_langID, _parent, _nodedict, _graph, last) {

    var baseURL = "http://" + _langID + ".wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content|size&format=json&callback=?&titles=" + _parent.name;
    console.log('carico ' + baseURL);
    $.getJSON(
      baseURL,
      function (data) {
        try {
          //load page from API
           visited++;
          var pagedata = data['query']['pages'];

          for (first in pagedata) break;
          var text = pagedata[first]['revisions'][0]['*'];
          var pagesize = pagedata[first]['revisions'][0]['size'];

          if (!(_parent.name in _nodedict)) _nodedict[_parent.name] = {};

          _nodedict[_parent.name].size = pagesize;
          _nodedict[_parent.name].status = 'visited';
          //console.log(JSON.stringify(pagedata,null,2));



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
            if (!(newpage in _nodedict)) {
              if (_parent.depthlevel<iterations-1) count++;
              maxdepth = _parent.depthlevel + 1;

              _nodedict[newpage] = {
                name: newpage,
                size: 0,
                depthlevel: _parent.depthlevel + 1,
                status: 'new',
                id: _graph.nodes.length
              };
              _graph.nodes.push(_nodedict[newpage]);
            }

            var found = _graph.edges.filter(function(w){return w.source == _parent.id && _parent.target == _nodedict[newpage].id});
            if(found.length ==0) _graph.edges.push({source: _parent.id, target: _nodedict[newpage].id});
            //console.log('added '+newpage);
            //console.log(JSON.stringify(_graph, null, 2));
          }
        } catch (e) {
          //console.log(JSON.stringify(_graph.nodes, null, 2));
          console.log('error: ' + _parent.name);
          _parent.status = 'not found';
        }

      }
    ).success(function () {

        console.log(count,visited);

         //if(d3.values(_nodedict).filter(function(z){return z.status=="new" && z.depthlevel < iterations}).length==0) {
        if(maxdepth==iterations && count == visited && !done) {

            if(last) {
              console.log("get final",last)
              getFinalInfo(_langID, _nodedict, _graph);
            }

        }
        else if(maxdepth<iterations){
          d3.values(_nodedict).forEach(function(d,i){
            if(d.status == "new") {
              d.status = "visited";
              if(i == d3.values(_nodedict).length-1) {
                loadPage(langID,d,_nodedict,_graph,true);
              }
              else {
                loadPage(langID,d,_nodedict,_graph,false);
              }

            }
          })
        }

      });
  }

  function getFinalInfo(lang,elems,graph) {
    if(!done) {

      d3.values(elems).forEach(function (d, i) {

        if (d.status == "new") {
          d.status = "border"

          var baseURL = "http://" + lang + ".wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content|size&format=json&callback=?&titles=" + d.name;
          console.log('carico ' + baseURL);
          $.getJSON(
            baseURL,
            function (data) {
              try {
                //load page from API
                var pagedata = data['query']['pages'];

                for (first in pagedata) break;
                //var text = pagedata[first]['revisions'][0]['*'];
                var pagesize = pagedata[first]['revisions'][0]['size'];
                d.size = pagesize;

                var graphel = graph.nodes.filter(function (e) {
                  return e.name == d.name
                })[0]
                graphel.size = pagesize;


              }
              catch (e) {
                d.status = "not found"
                graph.nodes.filter(function(e){return e.id == d.id})[0].status = "not found";
                console.log("error", d);
              }


            }).success(function () {
              done = true;

            })

        }

      })
      console.log(graph);
    }
  }


  function GEXFexport(_netName, _graph) {
    //a quick and dirt GEXF exporter
    var output = '';

    //we iterate through nodes and we add them

    var nodeoutput = '';
    //we set up a dictionary for attributes

    for (var n in _graph.nodes) {
      var node = _graph.nodes[n];
      console.log(node.color);
      var color = hexToRgb(node.color)
      nodeoutput += '<node id="' + n + '" label="' + escapeRegExp(node.name) + '">\r';
      nodeoutput += '<attvalues>\r';
      //save node variables
      nodeoutput += '<attvalue for="status" value="' + node.status + '"/>\r';
      nodeoutput += '<attvalue for="size" value="' + node.size + '"/>\r';
      nodeoutput += '<attvalue for="depthlevel" value="' + node.depthlevel + '"/>\r';
      nodeoutput += '</attvalues>\r';
      nodeoutput += '<viz:size value="' + node.weight + '" />\r';
      nodeoutput += '<viz:position x="' + node.x + '" y="' + node.y + '" z="0.0" />\r';
      nodeoutput += '<viz:color r="' + color.r + '" g="' + color.g + '" b="' + color.b + '" />\r';
      nodeoutput += '</node>\r';
    }

    //we iterate through edges

    var edgeoutput = '';

    for (var l in _graph.edges) {
      var edge = _graph.edges[l];
      edgeoutput += '<edge id="' + l + '" source="' + edge.source.id + '" target="' + edge.target.id + '"/>\r';
    }


    //now put everything togheter

    //first, set up the initials
    output += '<?xml version="1.0" encoding="UTF-8"?>\r'
    + '<gexf xmlns="http://www.gexf.net/1.2draft" version="1.2" xmlns:viz="http://www.gexf.net/1.2draft/viz" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.gexf.net/1.2draft http://www.gexf.net/1.2draft/gexf.xsd">\r'
    + '<meta lastmodifieddate="' + getDate() + '">\r'
    + '<creator>DensityDesign Lab | www.densitydesign.org</creator>\r'
    + '<description>' + _netName + '</description>\r'
    + '</meta>\r'
    + '<graph mode="static" defaultedgetype="directed">\r'
    + '<attributes class="node">\r'
    + '<attribute id="size" title="size" type="float"/>\r'
    + '<attribute id="depthlevel" title="depthlevel" type="float"/>\r'
    + '<attribute id="status" title="status" type="string"/>\r'
    + '</attributes>'
    + '<nodes>\r'
    + nodeoutput
    + '</nodes>\r'
    + '<edges>\r'
    + edgeoutput
    + '</edges>\r'
    + '</graph>\r'
    + '</gexf>';

    download(_netName + '_' + getDate() + '.gexf', output);
    return output;
  }

//http://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server

  function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
  }

//http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

//http://stackoverflow.com/questions/13459866/javascript-change-date-into-format-of-dd-mm-yyyy

  function getDate() {
    function pad(s) {
      return (s < 10) ? '0' + s : s;
    }

    var d = new Date(Date.now());
    //console.log(d);
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
  }

//http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex

  function escapeRegExp(str) {
    return $('nulla').text(str).html();
  }
})
