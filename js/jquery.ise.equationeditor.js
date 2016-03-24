/*
 * @author : Jie Jeffery Hu (Jeff)
 * 
 *
 * Copyright 2015, Jie Jeffery Hu
 * Dual licensed under the MIT 
 */
(function($) {
	
	$.widget( "ise.equationeditor", {
		
		//fields
		fieldselectOptions:[],
		fieldselectedValue:null,
		fielddefaultValue:null,
		boolfieldMustSelect:true,
		boolfieldInputReadOnly:false,
		
		//operator
		operatorselectOptions:[],
		operatorselectedValue:null,
		operatordefaultValue:null,
		booloperatorMustSelect:true,
		booloperatorInputReadOnly:false,
		
		//value
		valueselectOptions:[],
		valueselectedValue:null,
		valuedefaultValue:null,
		boolvalueMustSelect:true,
		boolvalueInputReadOnly:false,
		
		_create: function() {
			if(this.options.debug){
				this.debug = this.options.debug;					
			}
			if(this.options.fieldselectOptions){
				this.fieldselectOptions = this.options.fieldselectOptions;					
			}
			
			if(this.options.operatorselectOptions){
				this.operatorselectOptions = this.options.operatorselectOptions;					
			}
			
			if(this.options.valueselectOptions){
				this.valueselectOptions = this.options.valueselectOptions;					
			}
			if (this.options.onFormCreateComplete){
				this.onFormCreateComplete = this.options.onFormCreateComplete;
			}
			this._createForm();
			
		},
		
		_createForm: function(){
			
			this.wrapper = $( "<span>" )
			.addClass( "equationeditor" )
			.appendTo( this.element );
			
			this.addWidgetsToForm();
			var fieldwidget = this.getFieldWidget();
			var operatorwidget = this.getOperatorWidget();
			var valuewidget = this.getValueWidget();
			
			//disable operatorwidget and valuewidget
			operatorwidget.disable();
			valuewidget.disable();
			//operatorwidget.option("disabled", true);
			//valuewidget.option("disabled", true);
			
			this.onFormCreateComplete(fieldwidget, operatorwidget, valuewidget);
		},
		
		/**
		 * Override-able API.  It must be passed in from the "option"
		 * $( "#combobox" ).equationeditor({ onFormCreateComplete :function(fieldwidget, operatorwidget, valuewidget){...} , ... });
		 * 			
		 * Do something when all widgets are set to the form.
		 */
		onFormCreateComplete :function(fieldwidget, operatorwidget, valuewidget){
			
		},
		
		/**
		 *  Add field/operator/value widgets to the form
		 */
		addWidgetsToForm:function(){
		    $( "<br>" ).appendTo( this.wrapper);
			var fieldLabel =$( "<label>" ).text("Field:").appendTo( this.wrapper);
			$( "<br>" ).appendTo( this.wrapper);
			this.createFieldInput();
			
			
			$( "<br>" ).appendTo( this.wrapper);
			
			var operatorLabel =$( "<label>" ).text("Operator:").appendTo( this.wrapper);
			$( "<br>" ).appendTo( this.wrapper);
			this.createOperatorInput();
			
			$( "<br>" ).appendTo( this.wrapper);
			
			var valueLabel =$( "<label>" ).text("Value:").appendTo( this.wrapper);
			$( "<br>" ).appendTo( this.wrapper);
			this.createValueInput();
			
		},
		/**
		 * Override-able API.  
		 * Do something when field has value. 
		 */
		onFieldInputChange:function(widget){
			var fieldwidget = this.getFieldWidget();
			var operatorwidget = this.getOperatorWidget();
			var valuewidget = this.getValueWidget();
			if (this.debug) console.log(JSON.stringify(widget.selectedValue));
		},
		
		/**
		 * Override-able API.  
		 * Do something when operator has value. 
		 */
		onOperatorInputChange:function(widget){
			var fieldwidget = this.getFieldWidget();
			var operatorwidget = this.getOperatorWidget();
			var valuewidget = this.getValueWidget();
			if (this.debug) console.log(JSON.stringify(widget.selectedValue));
		},
		
		/**
		 * Override-able API.  
		 * Do something when value has value. 
		 */
		onValueInputChange:function(widget){
			var fieldwidget = this.getFieldWidget();
			var operatorwidget = this.getOperatorWidget();
			var valuewidget = this.getValueWidget();
			if (this.debug) console.log(JSON.stringify(widget.selectedValue));
		},
		
		getFieldWidget :function(){
			var nodeField = 	$(this.fieldInput )[0];
			var fieldwidget =$(nodeField).data("iseVersatilecombobox");
			return fieldwidget;
		},
		
		getOperatorWidget :function(){
			var nodeField = 	$(this.operatorInput )[0];
			var fieldwidget =$(nodeField).data("iseVersatilecombobox");
			return fieldwidget;
		},
		
		getValueWidget :function(){
			var nodeField = 	$(this.valueInput )[0];
			var fieldwidget =$(nodeField).data("iseVersatilecombobox");
			return fieldwidget;
		},
		
		/*createOperatorInput:function(){
			this.operatorInput = $( "<div>" )
			.appendTo( this.wrapper )
			.versatilecombobox({
				"boolMustSelect":false,
				"defaultValue":"React JS",
				"selectOptions": [
				              	{
				            		"label": "ReactJS",
				            		"value": "React JS"
				            	},
				            	{
				            		"label": "AngularJS",
				            		"value": "Angular JS"
				            	},
				            	{
				            		"label": "KnockoutJS",
				            		"value": "KNockoud JS"
				            	}

				            ]
			});
		},*/
		
		createFieldInput:function(){
			var self =this;
			this.fieldInput = $( "<div>" )
			.appendTo( this.wrapper )
			.val( this.fielddefaultValue )
			.attr( "title", "" )
			.addClass( "equationeditor-fieldInput ui-widget ui-widget-content ui-state-default ui-corner-left" )
			.versatilecombobox({
				"boolMustSelect":this.boolfieldMustSelect,
				"defaultValue": this.fielddefaultValue,
				"selectOptions": this.getFieldselectOptions(),
				onValueSetCompleted: function( event, ui, widget ) {
					self.onFieldInputChange(widget);
				}
			});
		},
		
	
		createOperatorInput:function(){
			var self =this;
			this.operatorInput = $( "<div>" )
			.appendTo( this.wrapper )
			.val( this.operatordefaultValue )
			.attr( "title", "" )
			.addClass( "equationeditor-OperatorInput ui-widget ui-widget-content ui-state-default ui-corner-left" )
			.versatilecombobox({
				"boolInputReadOnly":true,
				"boolMustSelect":this.booloperatorMustSelect,
				"defaultValue": this.operatordefaultValue,
				"selectOptions":  this.getOperatorselectOptions(),	
				onValueSetCompleted: function( event, ui, widget ) {
					self.onOperatorInputChange(widget);
				}
			});
		},
		
		createValueInput:function(){
			var self =this;
			this.valueInput = $( "<div>" )
			.appendTo( this.wrapper )
			.val( this.fielddefaultValue )
			.attr( "title", "" )
			.addClass( "equationeditor-ValueInput ui-widget ui-widget-content ui-state-default ui-corner-left" )
			.versatilecombobox({
				"boolMustSelect":this.boolvalueMustSelect,
				"defaultValue": this.valuedefaultValue,
				"selectOptions": this.getValueselectOptions(),
				onValueSetCompleted: function( event, ui, widget ) {
					self.onValueInputChange(widget);
				}
			});
		},
		
		
		/**
		 * This API controls Field-Combo's selection options.
		 */
		getFieldselectOptions :function(){
			return this.fieldselectOptions;
		},
		
		/**
		 * This API controls Operator-Combo's selection options.
		 */
		getOperatorselectOptions:function(){
			return this.operatorselectOptions;
		},
		
		/**
		 * This API controls Value-Combo's selection options.
		 */
		getValueselectOptions:function(){
			return this.valueselectOptions;
		},
		
		
		debug:true
		
		
		
		
	});//end widget
})(jQuery);