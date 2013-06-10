/*
 * @author : Jie Jeffery Hu (Jeff)
 * 
 *
 * Copyright 2013, Jie Jeffery Hu
 * Dual licensed under the MIT 
 */
(function($) {

    $.widget("ise.treeintable", {
		options: {
			url: null, //"data/test1.json",
			store:null
		},
		
		store:null,
		_DATASTORE :"datastore",
		id:null,
		declaredClass:"ise.treeintable",
		_debug:false,
				
		_create: function() {
			var self = this;
			if (self._debug) console.log("treeintable._create()");
			self.store = self.options.store.data(self._DATASTORE);
			if (self.options.debug) { self._debug =(self.options.debug)};
			self.id = (self.options.id)? self.options.id:"ise.treeintable_"+(new Date()).getTime();
		}, // _create
		
		_init: function(){
            var self = this;
            //var datastorePlugin = $("#datastore1").data("datastore");
            //console.log("datastorePlugin", datastorePlugin);
            //datastorePlugin.getItems();
		},
		
		processStoreItemsBeforeBuildTable:function(storeItems){
		// summary:
		// This api is a hook for application to do something before "this" build the table UI.
		// For example, application can filter out some items.
		// Here,  default is doing nothing. Just return the input "storeItems" list.
			
			return storeItems;
		},
		
		buildTreeTable:function(){
		// summary:
		// build UI TreeTable
			if (this._debug) console.log("treeintable.buildTreeTable()");
			var self = this;
			
			var tableNode = $("<table class='cpmTable' id=" + self.id + "></table>");
			self.tableNode=tableNode;
			self.element.append(tableNode);
			
			var treetableArray = self.store.getItems();
			var count = treetableArray.length;
			//count =3 ; // for debugging. set different values of count and start. e.g start=4, count=5, I can see the 5th elment
			var start=0;
			for (var i=start; i<count;i++){
				if (this._debug) console.log(i, treetableArray[i].dataItem, treetableArray[i].indentLevel);
				self.buildTableRow(self.store, treetableArray[i],i,tableNode);
			}
			self.onTableCreationComplete();
		},//end function
		
		
		
		onTableCreationComplete:function(){
		// summary:
		// Override api for application to do something once the build construction is complete.
		},
		
		isItemsAttributes:function(attributes){
		// summary:
		// check if any one of the given attributes is "items" 
			var boolResult = false;
			for ( var j = 0; attributes &&j < attributes.length; j++){
				if(attributes[j] === this.getItemChildrenMarker()){
					return true;
				}
			}
			return boolResult;
		},
		
		getItemChildrenMarker:function(){
			// summary:
			// This is a helper function. It returns the store-item sub-group attribute.
			// For example
			//				"territories":{
			//	            	"items":[
			//	            			{
			//	            				"territoryName":"East Timor"
			//	            			},
			//	            			{
			//	            				"territoryName":"Guan Island"
			//	            			}
			//	            	]
			//	            }
			//  "items" is an attribute of "territories.  This "items" attributes contains children data-items.

			return "items";
		},
		
		buildTableRow : function(store, treetableItem,i, tableNode){
		// summary:
		// build a table row  for a given treetableItem item
				try{
					var cpmTable=this;
					var cpmTableRow = document.createElement("tr");
					cpmTableRow.id= this.id + "_row_" + i.toString();
					cpmTableRow.table = this;

					var treetableArrayItem = treetableItem;
					treetableArrayItem.rowNodeId =cpmTableRow.id;
					treetableArrayItem.index= i;
					var item = treetableArrayItem.dataItem;
					var attributes = store.getAttributes(item);
					
					cpmTableRow.isColumnHeaderRow=false;
					
					if (this.isItemsAttributes(attributes)){
						
						if (this.shouldSkipItemsRow(treetableArrayItem, store)){
							//continue;
							return;
						}else{
							// build column header
							this.buildItemsAttributesColumnHeaders(cpmTableRow, treetableArrayItem,  this.store.getItems(),store);
							cpmTableRow.isItemsRowColumnHeaderRow=true;
						}
						
					}else{
						this.buildRowContent(cpmTableRow, treetableArrayItem, store.getItems(),store,cpmTableRow);

					}
					
					cpmTableRow.treetableArrayItem = treetableArrayItem;
					cpmTableRow.treepathArrayIndex = cpmTableRow.treepathArrayIndex;
					cpmTableRow.isColumnHeaderRow=cpmTableRow.isColumnHeaderRow;
					$(tableNode).append(cpmTableRow);

					cpmTableRow = cpmTable.setCpmtableRowNodeMouseEventHandler(cpmTableRow);
					$(cpmTableRow).addClass("cpmtableItemNormal");
					cpmTable.decorateTablerow(cpmTableRow);
					cpmTable.onTablerowCreateComplete(cpmTableRow);
				}catch(e){
					console.error(this.declaredClass + ".buildTableRow() error " + e);
					throw e;
					
				}
		},//end function
		
		setCpmtableRowNodeMouseEventHandler:function(cpmtableRowNode){
		//summary:
		// Create mouse over/out/down event function for cpmtableRowNode
		// cpmtableRowNode is a html-node to represent a row in this cpmtable
		// 
			cpmtableRowNode.onmouseover = function(e){
				if (!e) return;
				var cpmtable =e.currentTarget.table;
				if(cpmtable){
					cpmtable.oncpmtableRowNodeMouseOver(e.currentTarget);
				}
			};
			cpmtableRowNode.onmousedown = function(e){
				if (!e) return;
				var cpmtable = e.currentTarget.table;
				if(cpmtable){
					cpmtable.setOnFocusRowStyle(e.currentTarget);
				}
			};
			cpmtableRowNode.onmouseout = function(e){
				if (!e) return;
				var cpmtable = e.currentTarget.table;
				if(cpmtable){
					cpmtable.oncpmtableRowNodeMouseOut(e.currentTarget);
				}
			};
			return cpmtableRowNode;
		},

		oncpmtableRowNodeMouseOver : function(cpmtableRowNode) {
			// summary:
			// 	Mouse over handler.
			
			if (!$(cpmtableRowNode).hasClass('cpmtableItemDown')){
				$(cpmtableRowNode).addClass('cpmtableItemHover');
			}
	    },

	    oncpmtableRowNodeMouseOut : function(cpmtableRowNode) {
	    	// summary:
			// 	Mouse out handler.
			
	        $(cpmtableRowNode).removeClass('cpmtableItemHover');
	        $(cpmtableRowNode).removeClass('cpmtableItemHover');
	        $(cpmtableRowNode).addClass('cpmtableItemNormal');
	    },

	    setOnFocusRowStyle :function(cpmtableRowNode){
	    // summary:
		// 	decorate this cpmtable as "onFocus" style	
			
			var cpmtable = this;
			if (cpmtable.selectedRow && cpmtableRowNode==cpmtable.selectedRow) return;
			
			cpmtable.previousselectedRow=cpmtable.selectedRow;
	    	if (cpmtable.selectedRow ){
	    		$(cpmtable.selectedRow ).removeClass('cpmtableItemDown');    		
	    	}
	    	$(cpmtableRowNode).removeClass('cpmtableItemHover');
	    	$(cpmtableRowNode).removeClass('cpmtableItemDown');
	    	$(cpmtableRowNode).removeClass('cpmtableItemHover');

	    	$(cpmtableRowNode).addClass('cpmtableItemDown');
	    	cpmtable.selectedRow =cpmtableRowNode;
	    	cpmtable.onRowSelect(cpmtableRowNode);
	    },

	    setSelectedRow:function (cpmTableRow){
			// summary:
			// Override super's api
				if (!cpmTableRow) return;
				try{
					this.setOnFocusRowStyle(cpmTableRow);
				}catch(e){
					console.error(this.id + " setSelectedRow(..) error " , e);
				}
		} ,
		
		onTablerowCreateComplete:function(cpmTableRow){
		// summary:
		// api hook for application to do something on newly created row before calling row creation complete	
		},
		
		onRowSelect:function(trNode){
			// summary:
			// API hook for applicaiton to do something if 
		},


		decorateTablerow:function(cpmTableRow){
		// summary:
		// api hook for application to do something on newly created row before calling row creation complete
		},
		
		shouldSkipItemsRow:function(treetableArrayItem, store){
		// summary:
		// return boolean.  Some dojo store contains 
		  // "territories":{
		  //           	"items":[
		  //           			{
		  //           				"territoryName":"East Timor"
		  //           			},
		  //           			{
		  //           				"territoryName":"Guan Island"
		  //           			}
		  //           	]
		  //           },
		  // when reaches to "items", should it skip processing items sub-tree.  default is false;
			return false;
		}, 
		
		buildItemsAttributesColumnHeaders:function(itemDiv, treetableArrayItem, treetableArray,store){
		// summary:
		// build column headers for the given treetableArrayItem. 
			
			var spaceNode = document.createElement("span");
			$(spaceNode).css({'display':'inline-block', 'font-weight':'bold'});
			spaceNode.innerHTML=this.getIndentSpace(treetableArrayItem.indentLevel+1);
			
			
			var columnNode =document.createElement("div");
			//columnNode.style= "display:inline-block; font-weight:bold";
			$(columnNode).css({'display':'inline-block', 'font-weight':'bold'});
			columnNode.innerHTML=treetableArrayItem.parentItemAttribute;
			
			var tdNdoe = document.createElement("td");
			tdNdoe.appendChild(spaceNode);
			tdNdoe.appendChild(columnNode);
			itemDiv.appendChild(tdNdoe);
		},
		
		buildRowContent:function (trNode, treetableArrayItem, treetableArray,store,repeaterItem){
		//summary:
		// This function is include in "refresh()" api. It loops store-item's attributes and display data in RepeaterItem
			var item = treetableArrayItem.dataItem;
			var storeAttributes = store.getAttributes(item);
			var attributes = this.getProcessAttributes(storeAttributes, item);

			
			for ( var j = 0; attributes &&j < attributes.length; j++) {
				if (!this.shouldDisplayThisAttribute(attributes[j],treetableArrayItem)){
					continue;
				}
				try{
					this.buildCellContent(trNode, treetableArrayItem, treetableArray,store,repeaterItem, attributes, j);
				}catch(e){
					console.error(this.declaredClass + ".buildRowContent() error " + e);
					throw e;
				}
			}

		},//end function
		
		shouldDisplayThisAttribute:function(attribute, treepathArrayItem){
			// summary:
			// override-able api to control which store-item attribute to display.
			if (attribute==="itemTreepath" ||attribute==="refRepeaterItemWidgetId"||attribute==="flagDirtyOption"||attribute==="sortIndex"){
				return false;
			}
			return true;
		},
		
		buildCellContent:function(trNode, treetableArrayItem, treetableArray,store,repeaterItem, attributes, attributeIndex){
		// summary:
		// Build cell content api.  
		// Application can override this api to customize cell ui.  
		// Say. In attrubute "2" then "name" , app wants to add url under name.  Or combine 2 and 3 attribute in one cell

			var j = attributeIndex;
			var item = treetableArrayItem.dataItem; // get the stoer data-item

			var values = store.getValues(item,attributes[j]);
				if (values && $.type(values)!="object") {
					
					if (this._isItem(values) ){
						var columnNode = document.createElement("td");
						var newText = document.createTextNode(values);
						columnNode.title = attributes[j] + " : " + values;
						if (this.shouldThisAttributeHaveExpandie(attributes[j])){
							if (this.isParentItem(treetableArrayItem.dataItem) ) {
								this.buildIndentSpaceForDataRow (columnNode, treetableArrayItem);
		                    	this.buildDataRowExpandie(columnNode, treetableArrayItem, treetableArray,store,repeaterItem);
							}else{
								this.buildIndentSpaceForDataRow (columnNode, treetableArrayItem);
							}
						}else if (this.isToBuildExpandieBasedOnRank()==attributeIndex){
							this.buildIndentSpaceForDataRow (columnNode, treetableArrayItem);
		                    this.buildDataRowExpandie(columnNode, treetableArrayItem, treetableArray,store,repeaterItem);
						}
						$(columnNode).append(newText);
						$(trNode).append(columnNode);
					}
					
				}	
		},//end function
		
		isToBuildExpandieBasedOnRank:function(){
		// summary:
		// when store data is given in a way that each layer has its own columns, like below "continent" and "country" columns.  We can pick a column to 
		// show expandie.  This api will return the column index;
		// return integer. (must be >=0 < attrubues.length).  default is 0.  say return 1, 
			//{
		    // "items": [
		    //     {
		    //         "continentName":"Asia",   //<--when this function  return 0,  expandie in this column in this layer 
		    //         "type":"continent",
		    //         "area":500,
		    //         "territories":{
		    //         	"items":[
		    //         			{
		    //         				"territoryName":"East Timor"
		    //         			},
		    //         			{
		    //         				"territoryName":"Guan Island"
		    //         			}
		    //         	]
		    //         },
		    //         "country":{
		    //             "items":[
		    //                 {
		    //                     "countryName":"China",  //<--when this function  return 0,  expandie in this column in this layer 
		    //                     "type":"country",
		    //                     "population":1300,
		    //                     "city": {
		    //                         "currentStatus":"6",
		    //                         "items":[
		    //                             {
		    //                                 "cityName":"HongKong" 
		    //                             } ,
		    //                             {
		    //                                 "cityName":"Beijing" 
		    //                             } ,
		    //                             {
		    //                                 "cityName":"Shanghai" 
		    //                             } 
		    //                         ] 
		    //                     } 
		    //                 } ,
		    //                 {
		    //                     "countryName":"India",
		    //                     "type":"country",
		    //                     "population":1000,
		    //                     "city": {
		    //                         "items":[
		    //                             {
		    //                                 "cityName":"New Dehli" 
		    //                             } ,
		    //                             {
		    //                                 "cityName":"Bangalore" 
		    //                             }
		    //                         ] 
		    //                     } 
		    //                 } 
		    //             ] 
		    //         } 
		    //     } ,
			if ($.type(this.options.isToBuildExpandieBasedOnRank)=="function"){
				return this.options.isToBuildExpandieBasedOnRank();
			}
			return 0;
		},

		
		isParentItem :function(dataItem){
		//summary:
		// Helper function to if the dataItem is a parent item

			var bool =(dataItem.children && dataItem.children.length>0)? true: false;
			return bool;
		},
		
		shouldThisAttributeHaveExpandie:function(attribute){
        // summary:
        // return boolean;
        // An important api which determines underline attribute need to present expandie icon
        // Application must over write this api
        // e.g return (attribute=="name");
			
//            var idAtt = this.store.getIdentityAttributes()[0];
//            if (idAtt && idAtt==attribute){
//            	return true;
//            }
			if ($.type(this.options.shouldThisAttributeHaveExpandie)=="function"){
				return this.options.shouldThisAttributeHaveExpandie(attribute);
			}
			return false;
		},
		
		_isItem:function(value){
		//summary:
		// is given value is an object
			if (value &&$.type(value)=='string') return true;
			if (value &&$.type(value)=='number') return true;
			if (value &&$.type(value)=='object') return true;
			//if (value &&$.type(value)=='function') return false;
			return false;
		},
		
		buildIndentSpaceForDataRow:function (/*html-node*/itemDiv, treetableArrayItem){
			// summary:
			// build indent space for repeaterItem
			var spaceNode = document.createElement("span");
			spaceNode.innerHTML= this.getIndentSpace(treetableArrayItem.indentLevel);
			itemDiv.appendChild(spaceNode);//$(itemDiv).append(spaceNode);   
		},
		
		getIndentSpace:function (indentLevel){
			//summary:
			// override-able api to get how much space for indentation.
			var spaceConstant = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			var s="";
			for(var i=0; i<indentLevel;i++){
				s +=spaceConstant;
			}
			return s;
		},//end function
		
		buildDataRowExpandie:function(tdNode, treetableArrayItem, treetableArray,store,trNode){
		// summary:
		// This api build the Expand/Collpase control - the expandie
			
			if (!treetableArrayItem.isLeafNode){
				
				var expandieWidget = document.createElement("a");
				var expandState = (treetableArrayItem.expanded)? "expanded":"collapse";
				//expandieWidget.setAttribute('state', expandState);
				expandieWidget.setAttribute('title', this.getDataRowExpandieTooltip(treetableArrayItem.expanded));
				expandieWidget.treetableArrayItem= treetableArrayItem;
				expandieWidget.treeintable=this;
				expandieWidget.trNode= trNode,
				
				expandieWidget.treetableArrayItem=treetableArrayItem;
				expandieWidget.id = trNode.id+"_expandie";
				trNode.expandieWidgetId= expandieWidget.id;
				expandieWidget.rowId = trNode.id;
				this.setExpandieUI(expandieWidget);
				tdNode.appendChild(expandieWidget);
				expandieWidget.onclick =function(e){
											console.log("expandieWidget.onclick");
											var table = this.treeintable;
											table.rowExpandieClickHandler(expandieWidget);
											return false;};
			}
			
		},
		
		rowExpandieClickHandler:function(expandieWidget){
		// summary:
		// This is the expandie's click handler. This function will fire onExpandieClick(..) event after handler logic is completed.
		// Application can override this api or onExpandieClick() to implement row lazy loading.
		// Given input parameter "expandie" .  You can retrieve row infomation and table information as
		
			try{
				//var expandieWidget = this; 
				var repeaterItem = expandieWidget.trNode; 
				var cpmTable = expandieWidget.treeintable;

				
				cpmTable.expandOrCollapseByRowitem(repeaterItem,expandieWidget);
				
				if ( repeaterItem.treetableArrayItem.statusObject ) {
					repeaterItem.treetableArrayItem.statusObject.isExpanded =!repeaterItem.treetableArrayItem.statusObject.isExpanded ;
				}


				// in case this expandie is expanded, we have to take care of followed collapsed items
				if(expandieWidget.treetableArrayItem.expanded){
					var repeaterItemIndex = cpmTable.getRowIndexByRowNode(repeaterItem);  
					if (repeaterItemIndex<0) return;
					var children = cpmTable.getAllRowNodes();
					for (var i=repeaterItemIndex+1;i<children.length;i++){
						var currentRepeaterItem = children[i];
						if (currentRepeaterItem.treetableArrayItem.indentLevel>repeaterItem.treetableArrayItem.indentLevel){
							cpmTable._showHideRowItemBasedOnParentRowState(currentRepeaterItem);
						}else{
							break;
						}
					}
				}
				this.onExpandieClick( expandieWidget, repeaterItem, expandieWidget.treetableArrayItem.expanded);
			}catch(e){
				console.error(this.id + "rowExpandieClickHandler() error" + e);
			}
		},
		
		getRowIndexByRowNode:function(rowNode){
		// summary:
		// return index of a given table-row.
			var idx = 0;
			var cpmTable = this;
			var children = cpmTable.getAllRowNodes();
			for (var i=0; i<children.length;i++){
				if (rowNode==children[i]){
					return i;
				}
			}
			return 0;
		},

		getAllRowNodes:function(){
		// Summary
		// Helper function to get all rows of the table
				var idx = 0;
				var cpmTable = this;
				var children = new Array();
				var thNtrNodes = $(cpmTable.tableNode).find('tr');
				for (var i=0;i<thNtrNodes.length;i++){
					if (thNtrNodes[i].tagName.toLowerCase()=="tr"){
						children.push(thNtrNodes[i]);
					}
				}
				return children;
		},
		
		expandOrCollapseByRowitem:function(cpmTableRow, expandieWidget){
		// summary:
		// This is an API enable programmatically  call to expand or collapse sub-tree rowItems under given cpmTableRow
		// How it works
		// Say given cpmTableRow is in 5th row in the entire list.  Row from 6 to 10 are under cpmTableRow. So, row 11 will have
		// the same indentLevel as cpmTableRow.  This API find cpmTableRow's index of the list which is 5, process row from 6-10.
			
			try{
				var cpmTable = this; 
				var rowItemIndex = cpmTable.getRowIndexByRowNode(cpmTableRow);   
				if (rowItemIndex<0) return;
                var children = cpmTable.getAllRowNodes();
				for (var i=rowItemIndex+1;i<children.length;i++){
					var currentRowItem = children[i];
					if (currentRowItem.treetableArrayItem.indentLevel>cpmTableRow.treetableArrayItem.indentLevel){
						if (expandieWidget.treetableArrayItem.expanded){
							$(currentRowItem).removeClass(cpmTable.getDataRowShowHideClass(!expandieWidget.treetableArrayItem.expanded));
							$(currentRowItem).addClass(cpmTable.getDataRowShowHideClass(expandieWidget.treetableArrayItem.expanded));
						}else{
							$(currentRowItem).removeClass(cpmTable.getDataRowShowHideClass(!expandieWidget.treetableArrayItem.expanded));
							$(currentRowItem).addClass(cpmTable.getDataRowShowHideClass(expandieWidget.treetableArrayItem.expanded));
						}
					}else{
						break;
					}
				}
				expandieWidget.treetableArrayItem.expanded = !expandieWidget.treetableArrayItem.expanded;
				cpmTable.setExpandieUI(expandieWidget);
				expandieWidget.title=   cpmTable.getDataRowExpandieTooltip  (expandieWidget.treetableArrayItem.expanded);
			
				
			}catch(e){
				console.error(this.id + "expandOrCollapseByRowitem(..) error" + e);
			}
		},
		
		onExpandieClick:function(expandie, cpmTableRow, isExpanded){
			// Summary:
			// This is an event function after expandie is clicked.
		},

		_showHideRowItemBasedOnParentRowState:function(cmpTableRow){
		// summary:
			
			var hideCSSClass = this.getDataRowShowHideClass(true);
			var showCSSClass = this.getDataRowShowHideClass(false);
			if (this._isAnyParentItemInCollapseState(cmpTableRow)){
				$(cmpTableRow).removeClass(showCSSClass );
				$(cmpTableRow).addClass( hideCSSClass );
			}else{
				$(cmpTableRow).removeClass(hideCSSClass );
				$(cmpTableRow).addClass(showCSSClass );
			}
		},
		
		_isAnyParentItemInCollapseState:function(repeaterItem){
			// summary:
			// Traverse the parent data-item path to see if any parentDateItemRepeaterItem is in collapse state.
			// return true/false

			/*var boolParentCollapse = false;
			var idx = this.getChildItemIndex(repeaterItem);
			var currentRepeaterItem = repeaterItem;
			var parentDateItemRepeaterItem = this._getParentDataItemRepeaterItem(currentRepeaterItem);
			while(parentDateItemRepeaterItem && !boolParentCollapse){
				if ( parentDateItemRepeaterItem.treetableArrayItem.statusObject && 
						!parentDateItemRepeaterItem.treetableArrayItem.statusObject.isExpanded){
					return true;
				}else{
					currentRepeaterItem = parentDateItemRepeaterItem;
					var parentDateItemRepeaterItem = this._getParentDataItemRepeaterItem(currentRepeaterItem);
				}
			}

			return boolParentCollapse;*/
			return false;
		},
		
		getDataRowShowHideClass:function(/*boolean*/ isExpanded){
		// summary:
		// override-api to provide css-class name to show/hide repeaterItem when expandie clicked.  You need to define 2 css-classes "hideRepeaterItem" and "unhideRepeaterItem";
		// .hideRepeaterItem{
		//    display:none;
		// }
		// .unhideRepeaterItem{
		//	display:block;
		// }
				var iconClassName = (isExpanded) ? "hideRepeaterItem": "unhideRepeaterItem";
				return iconClassName;
		},
		
		setExpandieUI:function(expandieWidget){
		// summary:
	    // API that style the expandie
				
				expandieWidget.innerHTML=(expandieWidget.treetableArrayItem.expanded)? "&#9660;":"&#9658;";
				
				if (expandieWidget.treetableArrayItem.expanded){
					$(expandieWidget).removeClass("cmpTableExpendieCollapse");
					$(expandieWidget).removeClass("cmpTableExpendieCollapse");
				}
				else{
					$(expandieWidget).addClass("cmpTableExpendieCollapse");
					$(expandieWidget).removeClass("cmpTableExpendieCollapse");
				}
				
		},
		
		
		getDataRowExpandieIconClass:function(/*boolean*/ isExpanded){
		// summary:
		// override-api to provide css-class name for the repeaterItem expandie widget.  You need to define 2 css-classes "iconExpand" and "iconCollapse"
			var iconClassName = (isExpanded) ? "iconExpand": "iconCollapse";
			return iconClassName;
		},

		getDataRowExpandieTooltip:function(/*boolean*/ isExpanded){
		// summary:
		// override-api to assign tooltip string for the repeaterItem expandie widget.  
			var TooltipString = (isExpanded) ? "Click to Collapse": "Click to Expand";
			return TooltipString;
		},

		
		
		getProcessAttributes:function(storeAttributes, item){
		// summary:
		// Override-able api that let application to control which store-item attributes to process and the prcocessing order;
		// say, store-item has attributes [ a, b, c, d].  this function can return [c, d, a] 
			if ($.type(this.options.getProcessAttributes)=="function"){
				return this.options.getProcessAttributes(storeAttributes, item);
			}
			return storeAttributes;
		},//end function
				
		destroy: function() {			
			this.element.next().remove();
		},//end function
		
		_setOption: function(option, value) {
			this._super( key, value );
		},//end function
		
		_setOption: function( key, value ) {
	        if ( key === "url" ) {
	        	this._super( key, value );
	        	this.refresh();
	        }else{
	        	this._super( key, value );
	        }
	    },//end function
	    
	    dummy:null
		
	});
})(jQuery);