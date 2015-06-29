/*
 * @author : Jie Jeffery Hu (Jeff)
 * 
 *
 * Copyright 2015, Jie Jeffery Hu
 * Dual licensed under the MIT 
 */
(function($) {

    $.widget("ise.datastore", {
		options: {
			url: null,// "data/test1.json",
			data:null,
			debug:null
		},
		
		store:{},
		data:null,
		
		_debug:false,
		
		
		_create: function() {
			var self = this;
			if (this._debug)console.log("ise.datastore._create() called");
			if (self.options.data){
				self.data=self.options.data ;
				self.buildStoreFromJsonObject(self.options.data);
			}
			else if(self.options.url){
				self.refresh();
			}
			
		}, // _create
		
		refresh:function(urlString){
		//summary:
		// rebuild the store from given urlString
		
			var self=this;
			var url =(urlString)? urlString:self.options.url
			if ( url!= null){
                // Fetch one station's coming train data at a time. This will include trains from different routes and directions
                $.ajax({
                    url: url,
                    type: "GET",
                    dataType: "json",
                    error: function (xhr, status) {
                        console.error("Unable to retrieve network resource. Please check your network connection.");
                    },
                    success: function (data) {
                        self.options.storedata = data;
                        self._buildStore(self);
                    }
                });

			}else{
				alert("ise.datastore.refresh() encouter error input url is null");
			} 
			
		}, //end function
		
		_valueIsAnItem:function (/* anything */ aValue){
			// summary:
			//		Given any sort of value that could be in the raw json data,
			//		return true if we should interpret the value as being an
			//		item itself, rather than a literal value or a reference.
			// example:
			// 	|	false == _valueIsAnItem("Kermit");
			// 	|	false == _valueIsAnItem(42);
			// 	|	false == _valueIsAnItem(new Date());
			// 	|	false == _valueIsAnItem({_type:'Date', _value:'May 14, 1802'});
			// 	|	false == _valueIsAnItem({_reference:'Kermit'});
			// 	|	true == _valueIsAnItem({name:'Kermit', color:'green'});
			// 	|	true == _valueIsAnItem({iggy:'pop'});
			// 	|	true == _valueIsAnItem({foo:42});
			var isItem = (
				(aValue !== null) &&
				(typeof aValue === "object") &&
				(!$.isArray(aValue) || addingArrays) &&
				(!$.isFunction(aValue)) &&
				(aValue.constructor == Object || dojo.isArray(aValue)) &&
				(typeof aValue._reference === "undefined") && 
				(typeof aValue._type === "undefined") && 
				(typeof aValue._value === "undefined") 
			);
			return isItem;
		},
		
		_traverse: function (anItem, treepathArray, indentLevel ,boolStartPoint,  parentItemAttribute ) {
		// summary:
		// recursively walk the hierarchical "anItem" to build an array ( the array is "treepathArray")
			
			var dataObj={};
	    	var obj = {};
	    	
	    	obj.isLeafNode=this.isLeafNode(anItem);
	    	obj.expanded=this.determineItemExpandState(anItem);
	    	obj.dataItem= dataObj;
            obj.indentLevel = indentLevel;
            obj.parentItemAttribute =parentItemAttribute;
            
            if (!boolStartPoint){ //skip the very top level
            	treepathArray.push(obj);
            }
			
			for(var attribute in anItem){
				
				var valueForAttribute = anItem[attribute];
				dataObj[attribute]=valueForAttribute;
				if(valueForAttribute){
					if($.isArray(valueForAttribute)){
						var valueArray = valueForAttribute;
						for(var k = 0; k < valueArray.length; ++k){
							var singleValue = valueArray[k];
							if(this._valueIsAnItem(singleValue)){
								this._traverse(singleValue,  treepathArray, indentLevel +1,false,  attribute );
							}
							
						}
					}else if (valueForAttribute!=null && valueForAttribute!=undefined){
						if(this._valueIsAnItem(valueForAttribute)){
							this._traverse(valueForAttribute, treepathArray, indentLevel +1, false,attribute);
						}
						
					}
				}
			}
			
		} , // end function   
		
		isLeafNode:function(anItem){
		//summary:
		// is the given item a leaf node
			for(var attribute in anItem){
				var value = anItem[attribute];
				if (value &&$.type(value)=='array') return false;
				if (value &&$.type(value)=='object') return false;
			}
			return true;
		},
		
		determineItemExpandState:function(anItem){
		// summary:
		// This override-able determines the "expanded" state of the given item.
		// The default is to see if the item is a leaf node. If so, expanded=true.
		// In case application want to implment lazy loading. Application can override this api and treeintable.js rowExpandieClickHandler()
			return !this.isLeafNode(anItem);
		},
		
		_buildStore:function(self){
		// summary:
		// prepare data to call buildStoreFromJsonObject() api
			var self=this;
			if (this._debug)console.log("ise.datastore._buildStore()");
			var data = self.options.storedata;
			this.data=data;
			self.buildStoreFromJsonObject(data);
		},
		
		buildStoreFromJsonObject:function(data){
		// summary:
		// key function to build store model. 
			var self=this;
			if (this._debug)console.log("ise.datastore.buildStoreFromJsonObject()");
			var self=this;
			this.store.dataitems =new Array();
			var treepathArray =self.store.dataitems
			var indentLevel =-1;
			
			var anItem=data;
			var storeProperty={};
			self.store.property =storeProperty;
			var count =0;
			for(var attribute in anItem){
				var valueForAttribute = anItem[attribute];
				if(valueForAttribute){
					if(!$.isArray(valueForAttribute)){
						if(self._valueIsAnItem(valueForAttribute)){
							storeProperty[attribute]=valueForAttribute;
						}
					}
				}
				count+=1;
			}
			var boolStartPoint=true;
			self._traverse(data, treepathArray, indentLevel, boolStartPoint, null);  //start travsing
			//print to see result
//			for (var i=0; i<treepathArray.length;i++){
//				console.log(i, treepathArray[i].dataItem, treepathArray[i].indentLevel);
//			}
//			console.log("");
			
			//fire an event to outside
			self._trigger( "complete", null, {} );
		}, // end function
		
		getItems: function(){
		// summary:
		// return the array of dataItems
		// say store looks like
		//			{
		//				identifier:id,
		//				total:400,
		//				items:{[
		//				       ... 400 item
		//				]}
		//			}
		// This api return a list of 400 items
			var self = this;
			if (this._debug) console.log("ise.datastore.getItems() called");
			return this.store.dataitems;
		},//end function
		
		getStoreProperty:function(){
		// summary:
		// return store property
		// say store looks like
		//			{
		//				identifier:id,
		//				total:400,
		//				items:{[
		//				       ... 400 item
		//				]}
		//			}
		// This api return an object
		//	{
		//		identifier:id,
		//		total:400
		//	}
			return this.store.property;
		}, //end function
		
		
		
		getAttributes:function(dataitem){
		// summary:
		// Given a data-item, this api return a list of attribute names. 
		// It is like retrieving the column names of a given record.
			
			var attributes=[];
			for(var attribute in dataitem){
				attributes.push(attribute);
			}
			return attributes;
		},
		
		getValues:function(item,attributeName){
		// summary:
		// Given a item and its attribute-name, this function return the attribute-value
			if (item && attributeName){
				return item[attributeName];
			}
			return null;
		},
		
		getParentRowItem:function(rowItem){
		// summary:
		// Internal api to retrieve the Parent-DataItem's rowItem
		// For example
		// "city": {   
		//                "items":[
		//                    {
		//                        "cityName":"HongKong" 
		//                    } ,
		//                    {
		//                        "cityName":"Beijing" 
		//                    } ,
		//                    {
		//                        "cityName":"Shanghai" 
		//                    } 
		//                ] 
		//            } 
		//  If I am in "HongKong" level rowItem, this api will return "items" level rowItem
			var idx = this.getChildItemIndex(rowItem);
			for (var i=(idx-1); i>=0; i--){
				var currentRowItem = this.getChildAt(i);
				if (currentRowItem.indentLevel<rowItem.indentLevel){
					return currentRowItem;
				}

			}
			return null;
		},
		
		getChildAt:function(idx){
			return this.getItems()[idx];
		},
		
		_findItemIndexFromList:function(rowItems, rowItem){
		// summary:
		//
			var idx=-1;
			for (var i=0; i<rowItems.length;i++){
				if(rowItems[i]==rowItem){
					return i;
				}
			}
			return idx;
		},
		
		getChildItemIndex:function(rowItem){
		//summary:
		// Find the index number of.  Say [... rowItem..], rowItem is the in the i th row.  This api return i
			var idx=-1;
			var rowItems = this.getItems();
			return this._findItemIndexFromList(rowItems, rowItem);
			
		},
		
		getSubTree:function(rowItem){
		// summary:
		// get the list of items.  
		// How it works
		// Say given rowItem is in 5th row in the entire list.  Row from 6 to 10 are under rowItem. So, row 11 will have
		// the same indentLevel as rowItem.  This API find rowItem index of the list which is 5, return a list containing rows from 6-10.
			
			var subTree=[];
			var children = this.getItems();
			var rowItemIndex = this.getChildItemIndex(rowItem);
			for (var i=rowItemIndex+1;i<children.length;i++){
				var currentRowItem = children[i];
				if (currentRowItem && currentRowItem.indentLevel>rowItem.indentLevel){
					subTree.push(currentRowItem);
				}else{
					break;
				}
			}
			return subTree;
		},
		
		getDirectChildren:function(rowItem){
		// summary:
		// get direct children rows of given rowItem.
		// Say given rowItem is in 5th row in the entire list.  Row from 6 to 10 are under rowItem. Say row-6 and row-8 are 
		// immediate children of rowItem. This function return [row-6, row-8]
		// In this case, row-6.treetableArrayItem.indentLevel==rowItem.treetableArrayItem.indentLevel+1
			
			var directChildren=[];
			var children = this.getSubTree(rowItem);
			for (var i=0;i<children.length;i++){
				var currentRowItem = children[i];
				if (currentRowItem && currentRowItem.indentLevel==rowItem.indentLevel+1){
					directChildren.push(currentRowItem);
				}
			}
			
			return directChildren;
		},
		
		getParentRowItemsList :function(rowItem){
		// summary:
		// get a list containing rowItem's parent-row, grand-parent-row.. root
			var list = new Array();
			var myParent = this.getParentRowItem(rowItem);
			while(myParent){
				list.push(myParent);
				myParent = this.getParentRowItem(myParent);
			}
			return list;
		},
		
		getRootLevelRowItems:function(){
		// summary:
		// Get a list of root level rowItem
			var list=[];
			var children = this.getItems();
			for (var i=0;i<children.length;i++){
				var currentRowItem = children[i];
				if (currentRowItem && currentRowItem.indentLevel==0){
					list.push(currentRowItem);
				}
			}
			return list;
		},
		
		getChildIndexOfParent:function(rowItem){
		// summary:
		// Given a rowItem, find out rowItem is the n-th child of rowItem's parent
			var idx =-1;
			var myParent = this.getParentRowItem(rowItem);
			if (myParent){
				var children = this.getDirectChildren(myParent);
				for (var i=0; i<children.length;i++){
					if (children[i]==rowItem) return i;
				}
			}else{
				var rootList =this.getRootLevelRowItems();
				return this._findItemIndexFromList(rootList, rowItem);
			}
			//return idx;
		},
		
		getPreviousSiblingRowItem:function(rowItem){
		// summary:
		// get previous sibling RowItem
			
			var parent = this.getParentRowItem(rowItem);
			if (parent){
				var siblings = this.getDirectChildren(parent);
				var myIndex = this.getChildIndexOfParent(rowItem);
				//console.log("getPreviousSiblingRowItem myIndex of parent " , myIndex, siblings[myIndex-1]);
				return (siblings[myIndex-1])? siblings[myIndex-1] : null;
			}
			return null;
		},
		
		getNexeSiblingRowItem:function(rowItem){
		// summary:
		// get next sibling row
			var parent = this.getParentRowItem(rowItem);
			var siblings = this.getDirectChildren(rowItem);
			var myIndex = this.getChildIndexOfParent(parent);
			console.log("getNexeSiblingRowItem myIndex of parent " , myIndex, siblings[myIndex+1]);
			return (siblings[myIndex+1])? siblings[myIndex+1] : null;
		},
		
		_setOption: function( key, value ) {
	        if ( key === "url" ) {
	        	this._super( key, value );
	        	this.refresh();
	        }else{
	        	this._super( key, value );
	        }
	    },//end function
	    
	    _setOptions: function( options ) {
	        this._super( options );
	        this.refresh();
	    },//end function
    
		dummy:null
		
  });//end widget
})(jQuery);