JQuery-Datastore-and-TreeInTable-Widgets
========================================

There are several widgets in this repository. The first widget is "datastore"  which knows how to retrieve json data and let you manipulate data. 

The second widget is "treeintable".  It uses "datastore" widget and presents data in a table in which one of table column is a tree.

The third widget is "ConditionEditor". It lets user use a simple drag and drop to configure a boolean expression . It is ideal for creating data search criteria.  


jquery.ise.datastore.js is a powerful widget.  It internally converts a hierarchical data set into to an array and provides rich API set to
manipulate data.   By using this widget, application developers no longer has to write boilerplate code to handle raw data.   I borrowed DOJO "data-store" concept and develop this jquery widget.  Please check <a href="https://github.com/jefhu/JQuery-Datastore-and-TreeInTable-Widgets/wiki/Hierarchical-data-is-just-an-array." target="_blank">wiki </a> article to see why hierarchical data can be converted and presented as an array. 

jquery.ise.treeintable.js widget uses datastore as data-model.  "treeintable" widget just takes advantage of datastore APIs and 
makes a user interface.  Sample <a href="http://upload.newmusicland.com/files/jquery-treeintable/test_jquery_treeintable.html" target="_blank">test_jquery_treeintable.html</a> shows how to put two widgets together and techniques of overriding function
in widget instance.

jquery.ise.conditioneditor widget extends from jquery.ise.treeintable.js.  It makes manipulating a boolean expression very simple and easy.  Say, you have searching criteria looks like "(priority == "5")||((souceIp == "1.2.2.3")&&(device == "router"))".  ConditionEditor will organize it in a hierarchical tree like
<br/>
▼||
<br/>
&nbsp;&nbsp;priority == "5"
          <br/>
&nbsp;&nbsp;▼&&
          <br/>
&nbsp;&nbsp;&nbsp;&nbsp;souceIp == "1.2.2.3"
                    <br/>
&nbsp;&nbsp;&nbsp;&nbsp;device == "router"                  
<br/>
Then, you can drag and drop to re-arrange tree-nodes to make the tree look like 

<br/>
▼||
<br/>
&nbsp;&nbsp;souceIp == "1.2.2.3"
          <br/>
&nbsp;&nbsp;▼&&
          <br/>
&nbsp;&nbsp;&nbsp;&nbsp;device == "router"
                    <br/>
&nbsp;&nbsp;&nbsp;&nbsp;priority == "5"                  
<br/>
<br/>
<a href="http://upload.newmusicland.com/files/jquery-treeintable/test_jquery_conditioneditorDnD.html" target="_blank">See Condition Editor Semo here</a>

All of these these widgets are based on jquery.ui.Factory.  It means they are 100% extendable. 

<a href="http://upload.newmusicland.com/files/jquery-treeintable/index.html" target="_blank">Demo Program Link</a>

  

