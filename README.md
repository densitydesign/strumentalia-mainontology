# strumentalia-mainology

On Wikipedia, when an article's section becomes too big, it stems in a new article ([see here](https://en.wikipedia.org/wiki/Wikipedia:Summary_style)). The link among the two pages is defined using the "main" template. One complex topic is therefore covered by many articles. This tool allows you to follow the ["main article"](https://en.wikipedia.org/wiki/Template_talk:Main) links starting from one or more pages. This tool works only with the English version of Wikipedia.

**Try it here: http://labs.densitydesign.org/mainontology/**

Usage
-----

Paste the full link to one or more english Wikipedia articles (one per line).

The "distance" value define the number of iterations. With distance 1, you'll get the original pages and the ones contained in the "see also" section. 
Increasing the value, the toll will perform the same operation on each retrieved page.

Output
------

Results will be printed as list meanwhile the data collection is performed. 
On the right panel, errors, stopped pages and exceptions (if any) will be printed.

Again in the right panel a "Download" button will allow you to download the results.
Three formats are available:
* **TSV.** A tab-separated table, easily editable in Libreoffice, Google Sheets, Excel. In the table, each line represent a connection from the source article to one target article cited in the "see also" section. The table contains four columns. "Source" contains the analyzed articles. "Target" contains the collected ones. "Level" is the distance from the original node. "Size" is number of characters contained in the Wikipedia article.
* **JSON.** The network described as object. It is compatible both with [D3.js](http://bl.ocks.org/mbostock/4062045) and [sigma.js](http://sigmajs.org/).
It contains two arrays of objects: the first one containing nodes, the second one containing edges. Each node and edge is defined as object.
* **GEXF.** The network in [XML-compliant format](http://gexf.net/format/), easily importable in [Gephi](http://gephi.github.io/), an opensource tool for network visualization.
