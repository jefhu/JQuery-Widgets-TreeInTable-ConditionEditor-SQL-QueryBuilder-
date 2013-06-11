JQuery-Datastore-and-TreeInTable-Widgets
========================================

There are two widgets in this repository. One is "datastore" widget knows how to retrieve json data and let you manipulate data. 

The second widget is "treeintable" widget.  It uses "datastore" widget and presents data in a table in which one of table column is 
a tree.


jquery.ise.datastore.js is a powerful widget.  It converts a hierarchical data set into to an array and provides rich API set to
manipulate data.   By using this widget, application no longer has to mess with raw data.  I know dojo quite well.  Basically, I 
borrow dojo "store" concept and write this widget. 

jquery.ise.treeintable.js widget treats datastore as data-model.  "treeintable" widget just take advantage of datastore api and 
make a user interface.  Sample test_jquery_treeintable.html shows how to put two widgets together.

Both of these two widgets are of jquery.ui.Factory.  It means they are 100% extendable. 

Pleaes check wiki article to see why hierarchical data can be treated as array.   

