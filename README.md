JQuery-Datastore-and-TreeInTable-Widgets
========================================

There are several widgets in this repository. The first one is "datastore" widget which knows how to retrieve json data and let you manipulate data. 

The second widget is "treeintable" widget.  It uses "datastore" widget and presents data in a table in which one of table column is 
a tree.

The third widget is "ConditionEditor" widget. It lets user configure Boolean expression using simple drag and drop. It is ideal for creating data search criteria.  


jquery.ise.datastore.js is a powerful widget.  It internally converts a hierarchical data set into to an array and provides rich API set to
manipulate data.   By using this widget, application no longer has to mess with raw data.  I know dojo quite well.  Basically, I 
borrow dojo "store" concept and develop this jquery widget.  Please check wiki article to see why hierarchical data can be treated as array. 

jquery.ise.treeintable.js widget uses datastore as data-model.  "treeintable" widget just takes advantage of datastore APIs and 
makes a user interface.  Sample test_jquery_treeintable.html shows how to put two widgets together and techniques of overriding function
in widget instance.

jquery.ise.conditioneditor widget extends from jquery.ise.datastore.js.  It makes manipulating boolean expression very easy.  Say, you have searching criteria looks like "(priority == "5")||((souceIp == "1.2.2.3")&&(device == "router"))".  ConditionEditor will organize it in a hierarchical tree like
<br/>
▼||
<br/>
&nbsp;&nbsp;          priority == "5"
          <br/>
          ▼&&
&nbsp;&nbsp;          <br/>
&nbsp;&nbsp;&nbsp;&nbsp;                    souceIp == "1.2.2.3"
                    <br/>
&nbsp;&nbsp;&nbsp;&nbsp;                  device == "router"
                    <br/>
<br/>
Then, you can use drag-and-drop to re-arrange tree-nodes.  You got to check out this baby!

All of these these widgets are based on jquery.ui.Factory.  It means they are 100% extendable. 

http://upload.newmusicland.com/files/jquery-treeintable/index.html

  

