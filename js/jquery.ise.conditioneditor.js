/*
 * @author : Jie Jeffery Hu (Jeff)
 * 
 *
 * Copyright 2015, Jie Jeffery Hu
 * Dual licensed under the MIT 
 */
(function($) {

    $.widget("ise.conditioneditor", $.ise.treeintable, {
    	
    	
		
		
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
		
		decorateTableNode:function(tableNode){
		//summary:
		//Override super's api
			tableNode.addClass("conditioneditor");
		},

		getExpandieWidgetInnerHTMLText :function(expandieWidget){				
			return this._super(expandieWidget);  // how to call super .
		},
		
		setExpandieUI:function(expandieWidget){
		// summary:
		// API that style the expandie

			expandieWidget.innerHTML= "&nbsp;&nbsp;&nbsp;&nbsp;"
			if (expandieWidget.treetableArrayItem.expanded){
				$(expandieWidget).removeClass("cpmTableCCEExpendieCollapse");
				$(expandieWidget).addClass("cpmTableCCEExpendieExpand");

			}
			else{
				$(expandieWidget).addClass("cpmTableCCEExpendieCollapse");
				$(expandieWidget).removeClass("cpmTableCCEExpendieExpand");
			}
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
		// summary:
		// This API excludes some fields when cloning object.
			
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
	    
	    buildThNodeContent:function(headers, i){
    	// summary:
	    // override super's api
				var thNode = document.createElement("th"); 
				$(thNode).addClass("cceTH");
				
				//logical operators
				this.buildOperatorButtons(headers, i, thNode)
				
				//condition buttons
				var separator1 = this.buildToolbarSeparator();
				thNode.appendChild(separator1[0]);				
				this.buildConditionButtons(headers, i, thNode);
				
				//action buttons
				var separator2 = this.buildToolbarSeparator();
				thNode.appendChild(separator2[0]);				
				this.buildActionButtons(headers, i, thNode);
				
				return thNode;
	    },
	    
	    buildOperatorButtons:function(headers, i, thNode){
	    	var opAndWidget = this.buildThNodeContentOperatorNode(headers, i, "AND");
			var opOrWidget  = this.buildThNodeContentOperatorNode(headers, i, "OR");
			var opNotWidget = this.buildThNodeContentOperatorNode(headers, i, "NOT");
			
			thNode.appendChild(opAndWidget);
			thNode.appendChild(opOrWidget);
			thNode.appendChild(opNotWidget);
	    }, 
	    
	    buildToolbarSeparator:function(){
	    	 return $('<span class="toolbarSeparator"></span>').text('|');
	    },
	    
	    buildThNodeContentOperatorNode:function(headers, i, symbol){
	    	var operatorWidget = document.createElement("button");
	    	$( operatorWidget).button({
	    	      icons: {
	    	        primary: "cce" + symbol
	    	      },
	    	      text: false
	    	    });
	    	operatorWidget.symbol=symbol;
	    	operatorWidget.treeintable=this;	
	    	
	    	$(operatorWidget ).bind( "click", function() {
	    		var table = this.treeintable;
				table.operatorClickHandler(operatorWidget);	
			});	
			return operatorWidget;
	    },	    
	    
	    buildConditionButtons:function(headers, i, thNode){
    	// summary:
    	// build "condition" buttons

	    	var conditionWidget = this.buildThNodeContentActionNode(headers, i, "Condition");	
	    	thNode.appendChild(conditionWidget);
	    },
	  
		
		buildActionButtons:function(headers, i, thNode){
		// summary:
		// build EDIT/REMOVE buttons
			
			var opEditWidget = this.buildThNodeContentActionNode(headers, i, "EDIT");
			var opRemoveWidget  = this.buildThNodeContentActionNode(headers, i, "DEL");
			
			thNode.appendChild(opEditWidget);
			thNode.appendChild(opRemoveWidget);
		},
		
		
		buildThNodeContentActionNode:function(headers, i, symbol){
		// summary:
	    // helper function to build action node
			
			 var actionWidget = document.createElement("button");
		    	$( actionWidget).button({
		    		label: symbol		    	      
		    	    });
			actionWidget.symbol=symbol;
			actionWidget.treeintable=this;		
			/*actionWidget.onclick =function(e){
										var table = this.treeintable;
										table.actionClickHandler(actionWidget);
										return false;};			*/
			$(actionWidget ).bind( "click", function() {
				var table = this.treeintable;
				table.actionClickHandler(actionWidget);
				return false;
			});
			return actionWidget;	
		},
		
		operatorClickHandler:function(opWidget){
			if (opWidget.symbol=="AND"){
				if(this.debug) console.log("operator.AND onclick");
				this.invokeLogicalOperator(opWidget);
			}else if (opWidget.symbol=="OR"){
				if(this.debug) console.log("operator.OR onclick");
				this.invokeLogicalOperator(opWidget);
			}else if (opWidget.symbol=="NOT"){
				if(this.debug) console.log("operator.NOT onclick");
				this.invokeLogicalOperator(opWidget);
			}else{
				if(this.debug) console.log("NOT SUPPORT OPERATOR onclick");
			}
		},
		
		invokeLogicalOperator:function(opWidget){
			if (!this.selectedRow) return;	
			var selectedNode = this.selectedRow;
			//window.alert(opWidget.symbol + " click is being implemented");
			this.buildNewLogicalOperatorTrRow(opWidget, selectedNode);
		},
		
		buildNewLogicalOperatorTrRow:function(opWidget, selectedNode){
			var dataObj={};
	    	var obj = {};
	    	
	    	obj.isLeafNode=false;
	    	obj.expanded=true;
	    	obj.dataItem= dataObj;
            obj.indentLevel = selectedNode.treetableArrayItem.indentLevel;
                       
            var operator ="ERROR";
            if (opWidget.symbol=="AND"){
				operator="&&";
				obj.type="LogicalExpression";
			}else if (opWidget.symbol=="OR"){
				operator="||";
				dataObj.type="LogicalExpression";
			}else if (opWidget.symbol=="NOT"){
				operator="!";
				dataObj.type="UnaryExpression";
			}
			dataObj["operator"]=operator;
            dataObj["expression"]=operator
            
           
            var i = this.getAllRowNodes().length;
            var trNode = this.buildTableRow(this.store, obj, i, this.tableNode);
            //this.moveTreeNode(trNode, selectedNode );
            $(trNode).insertBefore(this.selectedRow);
            this.setTreetableDragOne(trNode);
            this.setTreetableDropOne(trNode);
		}, 
		
		buildNewConditionTrRow:function(opWidget, selectedNode){
			var dataObj={};
	    	var obj = {};
	    	
	    	obj.isLeafNode=true;
	    	obj.expanded=false;
	    	obj.dataItem= dataObj;
		    if (this.isParentItem(this.selectedRow.treetableArrayItem.dataItem)){
		    	 obj.indentLevel = selectedNode.treetableArrayItem.indentLevel+1;
		    }else{
	            obj.indentLevel = selectedNode.treetableArrayItem.indentLevel;
			}
              
            obj.type="BinaryExpression";
            dataObj["expression"]="[field]==[value]";            
           
            var i = this.getAllRowNodes().length;
            var trNode = this.buildTableRow(this.store, obj, i, this.tableNode);
            //this.moveTreeNode(trNode, selectedNode );
            if (this.isParentItem(this.selectedRow.treetableArrayItem.dataItem)){
            	 $(trNode).insertAfter(this.selectedRow);
		    }else{
		    	$(trNode).insertBefore(this.selectedRow);
			}
            this.setTreetableDragOne(trNode);
            this.setTreetableDropOne(trNode);
            
		}, 
		
		actionClickHandler:function(opWidget){
			if (opWidget.symbol=="EDIT"){
				if(this.debug) console.log("operator.EDIT onclick");
				this.invokeActionEdit(opWidget);
			}else if (opWidget.symbol=="DEL"){
				if(this.debug) console.log("operator.DEL onclick");
				this.invokeActionDelete(opWidget);
			}else if (opWidget.symbol=="Condition"){
				if(this.debug)console.log("operator.Condition onclick");
				this.invokeActionCondtion(opWidget);
			}else{
				this.actionClickHandlerExtra(opWidget);
			}
		},
		
		actionClickHandlerExtra:function(opWidget){
			if(this.debug) console.log("NOT SUPPORT ACTION onclick");
		},
		
		invokeActionEdit:function(opWidget){
			this.invokeConditionEditor();
		},
		
		invokeActionCondtion:function(opWidget){			
			if (!this.selectedRow) return;	
			var selectedNode = this.selectedRow;			
			this.buildNewConditionTrRow(opWidget, selectedNode);
			
		},
		
		invokeActionDelete:function(opWidget){
		// summary:
		// remove selectedRow and selectedRow.subTree nodes
			
			if (!this.selectedRow) return;			
			var r = confirm("Are you sure to delete?");
			if (r == true) {
				var selectedNode = this.selectedRow;
				var subTree = this.getSubTree(selectedNode);
				var len = subTree.length;
				for (i=len-1;i>=0; i--){
					var currentRow = subTree[i];
					currentRow.parentNode.removeChild(currentRow);
				}
				selectedNode.parentNode.removeChild(selectedNode);
			} else {
			   return;
			}
			
		}, 
		
		fillColumnNode:function(columnNode, values,trNode, treetableArrayItem, treetableArray,store,repeaterItem, attributes, attributeIndex){
			// summary:
			// override super api
			
			var textValue = values;
			var imageNode = document.createElement("img"); 
			var imagePath ="img/condition.gif";
			//var bool =(dataItem.type == "LogicalExpression" || dataItem.type == "UnaryExpression")
			if (values == "!"){
				imagePath= "img/not.gif";
				textValue="NOT";
			}else if (values == "&&"){
				imagePath= "img/and.gif";
				textValue="AND";
			}else if (values == "||"){
				imagePath= "img/or.gif";
				textValue="OR";
			}
			imageNode.setAttribute("src", imagePath );
			var newText = document.createTextNode(textValue);
			$(imageNode).addClass("cceRowImage");
			$(newText).addClass("cceRowText");		
			$(columnNode).append(imageNode);
			$(columnNode).append(newText);
			columnNode.imageNode = imageNode;
			columnNode.textNode = newText;
			return columnNode;
			//*/
			//this._super(columnNode, values,trNode, treetableArrayItem, treetableArray,store,repeaterItem, attributes, attributeIndex);
		},
		
		oncpmtableRowNodeDoubleClick: function(cpmtableRowNode) {
		// summary:
		// invoke condition editor
				
				//console.log("double click on\n" +JSON.stringify(this.getTreeNodeJSON(this.selectedRow), null, 5));
			    this.invokeConditionEditor();
		},
		
		setDialogContent:function(){
		// summary:
		// This is an overridable api to set an editor in the dialog.
			
			 var contentNode = $(this.dialog);
			 if (!this.selectedRow) return;
			 var formNode = null;
			 if (this.isParentItem(this.selectedRow.treetableArrayItem.dataItem)){
				 formNode = this.buildBooleanOpeartorEditForm();
			 }else{
				  formNode = this.buildConditionEditForm();
			 }
			 contentNode.empty();
			 contentNode.append(formNode);
			 this.populateConditionEditorValue();
		},
		
		populateConditionEditorValue:function(){
			if (this.isParentItem(this.selectedRow.treetableArrayItem.dataItem)){
				 this.populateConditionEditorLogicalValue()
			 }else{
				this.populateConditionEditorExpressionValue();
			 }
		},
		
		populateConditionEditorLogicalValue:function(){
			 var contentNode = $(this.dialog);
			 var values = this.selectedRow.treetableArrayItem.dataItem.operator;
			 var textValue ="";
			 if (values == "!"){
				 textValue="NOT";
			 }else if (values == "&&"){
				 textValue="AND";
			 }else if (values == "||"){
				 textValue="OR";
			 }
			 contentNode.find("#selectOperator").val(textValue);
		},
		
		populateConditionEditorExpressionValue:function(){
			 var contentNode = $(this.dialog);
			 var currentItem = this.selectedRow.treetableArrayItem;
			 var opLeft = currentItem.dataItem.left
			 var opRight = currentItem.dataItem.right;
			 var operator = currentItem.dataItem.operator;
			 
			 var leftValue = (opLeft && opLeft.name)?opLeft.name: "";
			 var opValue = (operator)? operator: "";
			 var rightValue = (opRight && opRight.value)? opRight.value: "";
			 $( contentNode.find("input")[0]).val(leftValue);
			 $( contentNode.find("input")[1]).val(opValue);
			 $( contentNode.find("input")[2]).val(rightValue);
		},
		
		buildConditionEditForm:function(){
			var formString = ["<form>",
								"<fieldset>",
									"<div>" ,
										"<label  for=’field’>Field:</label>",
										"<input id=’field’ name=’field’ title=’Please provide field name.’>",
									"</div>",
									"<div>",
										"<label for=’operator’>Operator:</label>",
										"<input id=’operator’ name=’operator’ title=’Please provide operator.’>",
									"</div>",
									"<div>",
										"<label for=’value’>Value:</label>",
										"<input id=’value’ name=’value’ title=’value.’>"	,
									"</div>",
								"</fieldset>"	,	
							"</form>"].join('\n');
			var formNode = $(formString);
			return formNode;
		},
		
		buildBooleanOpeartorEditForm:function(){
			var formString =   ["<label for=’selectOperator’>Logical Operator:</label>",
			                    "<select id='selectOperator'>",
				      			"<option value='AND'>AND</option>",
				      			"<option value='OR'>OR</option>",
				      			"<option value='NOT'>NOT</option>",
				      			"</select>"].join('\n');
			var formNode = $(formString);
			return formNode;
		}, 
		
		updateCondition:function(){
			if (this.debug) console.log( "ConditionEditor.updateCondition() called" );
			if (this.isParentItem(this.selectedRow.treetableArrayItem.dataItem)){
				 this.updateConditionEditorLogicalValue()
			 }else{
				this.updateConditionEditorExpressionValue();
			 }
		}, 
		
		updateConditionEditorLogicalValue:function(){
			var contentNode = $(this.dialog);
			 var values = contentNode.find("#selectOperator").val();			 
			 var textValue ="";
			 if (values == "NOT"){
				 textValue="!";
			 }else if (values == "AND"){
				 textValue="&&";
			 }else if (values == "OR"){
				 textValue="||";
			 }
			 this.selectedRow.treetableArrayItem.dataItem.operator=textValue;
			 this.selectedRow.treetableArrayItem.dataItem.expression=textValue;
			 var imagePath="";
			 if (textValue == "!"){
					imagePath= "img/not.gif";
				}else if (textValue == "&&"){
					imagePath= "img/and.gif";
				}else if (textValue == "||"){
					imagePath= "img/or.gif";
				}
			 $(this.selectedRow).find("img")[0].setAttribute("src", imagePath);
			 $(this.selectedRow).find("td")[0].textNode.nodeValue=values;
			 $(this.selectedRow).hide().fadeIn('fast');
		},
		
		updateConditionEditorExpressionValue:function(){
			var contentNode = $(this.dialog);
			var currentItem = this.selectedRow.treetableArrayItem;

			var inputFieldName =  $( contentNode.find("input")[0]).val();
			var inputOperator = $( contentNode.find("input")[1]).val();
			var inputValue = $( contentNode.find("input")[2]).val();

			if (! currentItem.dataItem.left) currentItem.dataItem.left={};
			currentItem.dataItem.left.name =inputFieldName
			if (! currentItem.dataItem.right) currentItem.dataItem.right={};
			currentItem.dataItem.right.value = inputValue;			
			currentItem.dataItem.operator = inputOperator;

			var expressionString =  inputFieldName + " " + inputOperator + " \"" + inputValue + "\"";
			currentItem.dataItem['expression']=expressionString
			$(this.selectedRow).find("td")[0].textNode.nodeValue=expressionString;

		},
		
		invokeConditionEditor:function(){
		// summary:
		// This api invoke a dialog to let user change selected-row.
			
			if (!this.selectedRow) return;
			if (!this.dialog){
				this.instantiateDialog();	
			}
			
			this.dialog.dialog("open");
			this.setDialogContent();
		},
		
		getConditionEditorDialogHeigh:function(){
			return 330;
		},
		
		getConditionEditorDialogWidth:function(){
			return 350;
		},
		
		getConditionEditorDialogTitle:function(){
			return "Condition Editor";
		},
		
		instantiateDialog:function(){
		// summary:
		// Intantiate a dialog.
			
			this.dialog =$( "<div class='conditionEditorDialog'></div>" )
	 		    .appendTo( "body" ).dialog({
	 		      autoOpen: false,
	 		      dialogClass: "no-close", 
	 		      height: this.getConditionEditorDialogHeigh(),
	 		      width: this.getConditionEditorDialogWidth(),
	 		      modal: true,	 		      
	 		      title:this.getConditionEditorDialogTitle(),
	 		     buttons: {
	 		    	 OK: function() {
	 		    		//retrieve the conditionEditor and call its updateConditon() api
	 		    		$(this).data("uiDialog").conditionEditor.updateCondition();
	 		    		$(this).data("uiDialog").close();
		 		     },
	 		        Cancel: function() {
	 		        	$(this).data("uiDialog").close();
	 		        }
	 		      },
	 		      close: function() {
	 		        /*form[ 0 ].reset();
	 		        allFields.removeClass( "ui-state-error" );*/
	 		      }
	 		      
	 		    });
			// link the dialog to the outter conditionEditor
			this.dialog.data("uiDialog").conditionEditor =this;
		}, 

    	debug:true
    });  // end widget
})(jQuery);
