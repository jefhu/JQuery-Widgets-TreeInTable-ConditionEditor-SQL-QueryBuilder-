/*
 * @author : Jie Jeffery Hu (Jeff)
 * 
 *
 * Copyright 2013, Jie Jeffery Hu
 * Dual licensed under the MIT 
 */
(function($) {

    $.widget("ise.conditioneditor", $.ise.treeintable, {
    	getExpandieWidgetInnerHTMLText :function(expandieWidget){
			//return (expandieWidget.treetableArrayItem.expanded)? " + " : " - ";
    		return this._super(expandieWidget);
		},
		
		
		processStoreItemsBeforeBuildTable:function(storeItems){
			// summary:
			// Override api
			//			
			//			 convert from 
			//
			//			 + LogicalExpression	||
			//	           + BinaryExpression	          ==
			//	                    Identifier	priority
			//	                    Literal	5	5
			//	           + LogicalExpression	          &&
			//	                     + BinaryExpression	                    ==
			//	                              Identifier	souceIp
			//	                              Literal	1.2.2.3	"1.2.2.3"
			//	                     + BinaryExpression	                    ==
			//	                              Identifier	device
			//	                              Literal	router	"router"
			//	                              
			//	           to (reduce some rows)
			//
			//	          
			//			  ▼||
			//	          priority == 5
			//	          ▼&&
			//	                    souceIp == 1.2.2.3
			//	                    device == router
			//			 */
			
			var treepathArray=[];
			for (var i=0; i<storeItems.length; i++){
				var currentItem = storeItems[i];
				this.processStoreItemsBeforeBuildTableHelper(currentItem, treepathArray);
		   }
			var indentLevel =0;
			this.processStoreItemsBeforeBuildTableHelper(currentItem, treepathArray, indentLevel,  null);  //start travsing
			
			return treepathArray; //storeItems;
			
			
		},
		
	
		/**
		 * type-0 (UnaryExpression)
		 * {"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"UnaryExpression","operator":"!","argument":{"type":"CallExpression","callee":{"type":"Identifier","name":"endWith"},"arguments":[{"type":"Literal","value":"Domain","raw":"\"Domain\""},{"type":"Literal","value":"aaa","raw":"\"aaa\""}]},"prefix":true}}]}
		 * 
		 * type-1 (LogicalExpression)
		 * {"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"LogicalExpression","operator":"&&","left":{"type":"CallExpression","callee":{"type":"Identifier","name":"contains"},"arguments":[{"type":"Literal","value":"Device Name","raw":"\"Device Name\""},{"type":"Literal","value":"a","raw":"\"a\""}]},"right":{"type":"CallExpression","callee":{"type":"Identifier","name":"contains"},"arguments":[{"type":"Literal","value":"Device Name","raw":"\"Device Name\""},{"type":"Literal","value":"v","raw":"\"v\""}]}}}]}
		 *
		 * 
		 * type-2 (ExpressionStatement)
		 * {"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"CallExpression","callee":{"type":"Identifier","name":"endWith"},"arguments":[{"type":"Literal","value":"Device Name","raw":"\"Device Name\""},{"type":"Literal","value":"a","raw":"\"a\""}]}}]}
		 * 
		 * type-3 (BinaryExpression)
		 * {"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"BinaryExpression","operator":">","left":{"type":"Identifier","name":"a"},"right":{"type":"Identifier","name":"B"}}}]}
		 * 
		 *  type-4 (ExpressionStatement)  --> false
		 *  {"type":"Program","body":[{"type":"ExpressionStatement","expression":{"type":"Literal","value":false,"raw":"false"}}]}
		 * 
		 *  type=5 (AssignmentExpression) --> name =9
		 * {"type":"AssignmentExpression", "operator":"=", "left":{"type":"Identifier", "name":"name"}, "right":{"type":"Literal", "value":9, "raw":"9"}}
	     *		
		 */		
		processStoreItemsBeforeBuildTableHelper:function(currentItem, treepathArray){
			var isOKToInclude = true;
			if (currentItem.dataItem.type =="UnaryExpression"){
				//type-0
			    var operator = currentItem.dataItem.operator;
			    currentItem.dataItem['expression']=operator;
			}else if (currentItem.dataItem.type == "LogicalExpression"){
				//type-1
				currentItem.dataItem['expression']=currentItem.dataItem.operator;		
			}else if  (currentItem.dataItem.type == "ExpressionStatement"){
				//type-2
				console.log("ExpressionStatement");
				if (currentItem.dataItem.expression.type=="AssignmentExpression"){
					var opLeft = currentItem.dataItem.expression.left
					var	opRight = currentItem.dataItem.expression.right;
					var operator = currentItem.dataItem.expression.operator;
					currentItem.dataItem['expression']= opLeft.name + " " + operator + " \"" + ((opRight.value!=undefined)? opRight.value: opRight.name) + "\"";
				}else if  (currentItem.dataItem.expression.type == "CallExpression"){
					console.log("CallExpression");
					var operator = currentItem.dataItem.expression.callee.name;
					var optLeft = "";
					var argumentsList = currentItem.dataItem.expression.arguments;
					var optRight ="";
					for (var i=0; i<argumentsList.length; i++){
						var temp = (argumentsList[i].name != undefined)? argumentsList[i].name: argumentsList[i].value;
						if (i==0){
							optRight = temp;
						}else{
							optRight = optRight + "," + temp;
						}
					}
					currentItem.dataItem['expression']= optLeft + " " + operator + " \"" + optRight + "\"";
				}
			    
			}else if  (currentItem.dataItem.type == "BinaryExpression"){
				//type-3
				var opLeft = currentItem.dataItem.left
			    var	opRight = currentItem.dataItem.right;
			    var operator = currentItem.dataItem.operator;
			    currentItem.dataItem['expression']= opLeft.name + " " + operator + " \"" + ((opRight.value!=undefined)? opRight.value: opRight.name)+ "\"";			     
			}else{
				isOKToInclude = false;
			}
			
			if (isOKToInclude){
				currentItem.indentLevel -=1;
				treepathArray.push(currentItem);
			}
		}, 
		
		isParentItem :function(dataItem){
			//summary:
			// Override parent class's api 

				var bool =(dataItem.type == "LogicalExpression" || dataItem.type == "UnaryExpression")? true: false;
				return bool;
		},
		
		 getUnwantedAttributeListWhenClone:function(){
		    	var unwartedAttributeList =['left', 'right'];
		    	return unwartedAttributeList;
		    },
		
		getTreeNodeJSON:function(rowItem){
			//summary:
			// Override parent class's api 
			
	    	var cloned = JSON.parse(JSON.stringify(rowItem.treetableArrayItem.dataItem));
	    	if (this.isParentItem(cloned)){
	    		cloned = this._removeUnwantedAttribute(cloned, this.getUnwantedAttributeListWhenClone());
	    	}
	    	
	    	var mychildren = this.getDirectChildren(rowItem);
	    	if (mychildren.length >0){
	    		var children = [];
	    		 for (var i = 0; i < mychildren.length; i++) {
	    			 var clonedChild = this.getTreeNodeJSON(mychildren[i]);
	    			 children.push(clonedChild);
	    		 }
	    		 cloned["left"]= children[0];
	    		 cloned["right"]= children[1];
	    	}
	    	return cloned;
	    },
	    
	    getMathExpression:function(){
	    	var roots = this.getRootLevelRowItems();
	    	var stringBuffer ="";
	    	if (roots !=0 && roots[0] ){
	    		stringBuffer = this.getMathExpressionLooper(  roots[0], stringBuffer);
	    	}
	    	return stringBuffer;
	    },
	    
	    getMathExpressionLooper:function(trNode, mathExpression){
	    	var dataItem = trNode.treetableArrayItem.dataItem;
	    	if (dataItem.type == "UnaryExpression"){
	    		mathExpression = mathExpression + " " +  dataItem.expression + "(";
	    		var children = this.getDirectChildren(trNode);	
	    		var strTemp="";
	    		strTemp = this.getMathExpressionLooper(children[0], strTemp);	    		
	    		mathExpression = mathExpression + strTemp + " )";
	    	}else if (dataItem.type == "LogicalExpression"){
	    		var children = this.getDirectChildren(trNode);
	    		var len = children.length;
	    		for (var i=0; i<len; i++){
	    			var childFilter = children[i];
					var  buf = "";
					buf = this.getMathExpressionLooper(childFilter, buf);
					if (len <=2 ){
						if (i >0){
							//buffer.append(filter.getOperatorSymbol());
							mathExpression = mathExpression + dataItem.expression;
						}
					}else{
						// in case && has 4 children a, b, c, d.  We will add "&&" between (a, b), (b, c), (c, d) ==>  a && b && c && d
						if (i >0 && i< (len) ){
							//buffer.append(filter.getOperatorSymbol());
							mathExpression = mathExpression + dataItem.expression;
						}	
					}
					//buffer.append(Filter.LEFTBRACKET).append(buf.toString()).append(Filter.RIGHTBRACKET);
					mathExpression = mathExpression + "(" + buf + ")";
	    		}	    		
	    	}else{	    		
	    		mathExpression = dataItem.expression;
	    	}
	    	return mathExpression;
	    },
		
    
    	dummy:null
    });  // end widget
})(jQuery);