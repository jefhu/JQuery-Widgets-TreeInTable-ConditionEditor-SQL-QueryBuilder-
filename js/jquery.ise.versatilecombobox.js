/*
 * @author : Jie Jeffery Hu (Jeff)
 * 
 *
 * Copyright 2015, Jie Jeffery Hu
 * Dual licensed under the MIT 
 */

//

/**
 * jquery.ise.versatilecombobox.js widget is a composite widget.  It contains a JQuery-UI autocomplete widget and a drop-down button.
 * If user keys in text in the "input" part, it will provide suggestions.  If user clicks on the drop-down, all options will display.
 * 
 * 
 * Developer can provide a "url" to fetch options from server.  Or provide "selectOptions" - an array of [ {label:a, value:a}, {label: b, value:b}...]
 * 
 * 
 * See test_jquery_versatilecomboBox.html for detail
 * 
 * This code is referenced from http://codepen.io/tessa-lt/pen/nhyEC.html 
 */
(function( $ ) {
		$.widget( "ise.versatilecombobox", {
			//define widget properties
			selectOptions:[],
			selectedValue:null,
			defaultValue:null,
			
			boolMustSelect:true,
			boolInputReadOnly:false,
			
			_create: function() {
				if(this.options.defaultValue){
					this.defaultValue = this.options.defaultValue;					
				}
				if(this.options.boolInputReadOnly != undefined && (this.options.boolInputReadOnly || !this.options.boolInputReadOnly)){
					this.boolInputReadOnly = (this.options.boolInputReadOnly);					
				}				
				if(this.options.boolMustSelect != undefined && (this.options.boolMustSelect || !this.options.boolMustSelect)){
					this.boolMustSelect = this.options.boolMustSelect;					
				}
				if(this.options.selectOptions){
					this.selectOptions = this.options.selectOptions;					
				}
				if(this.options.url && this.selectOptions.length ==0 ){
					this.url = this.options.url;
					this.getSelectOptions();
				}
				
				if(this.options.onValueSetCompleted ){
					this.onValueSetCompleted = this.options.onValueSetCompleted;					
				}
				
				if (this.options.createComplete){
					this.createComplete = this.options.createComplete;
				}
				
				if (this.options.dropdownEnabledTooltipText){
					this.dropdownEnabledTooltipText=this.options.dropdownEnabledTooltipText;
				}
				
				if (this.options.dropdownDisabledTooltipText){
					this.dropdownDisabledTooltipText=this.options.dropdownDisabledTooltipText;
				}
				
				if (this.options.getSelectOptions){
					this.getSelectOptions = this.options.getSelectOptions;
				}
				
				
				this.wrapper = $( "<span>" )
					.addClass( "versatilecombobox-combobox" )
					.insertAfter( this.element );

				this.element.hide();
				this._createAutocomplete();
				this._createShowAllButton();
				this.createComplete();
			},
			
			//This is an API hook that allow widget user to hook-in customized logic
			createComplete: function(){
				// doing nothing;
			},

			_createAutocomplete: function() {
				var selected = this.element.children( ":selected" ),
					value = selected.val() ? selected.text() : "";
				var self = this;
				this.input = $( "<input>" )
					.appendTo( this.wrapper )
					.val( value )
					.attr( "title", "" )
					.addClass( "versatilecombobox-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
					.autocomplete({
						delay: 0,
						minLength: 0,
						source: $.proxy( this, "filterOptions" )
						//source: this.selectOptions
					})
					.tooltip({
						tooltipClass: "ui-state-highlight"
					});

				this._on( this.input, {
					autocompleteselect: function( event, ui ) {
						ui.item.option.selected = true;
						// save the selected value to widget's selectedValue property
						self.selectedValue = {
								label:ui.item.label,
								value:ui.item.value
						}
						this._trigger( "select", event, {
							item: ui.item.option
						});
					},

					autocompletechange: "onValueSet"
						//"_removeIfInvalid"
				});
				
				if (this.defaultValue){
					 //this.input.val(this.defaultValue);
					 this.setValue(this.defaultValue);
					 
					 
				}
				if (this.boolInputReadOnly){
					this.input.attr('readonly','readonly');
				}
			},

			_createShowAllButton: function() {
				var input = this.input,
					wasOpen = false;

				this.dropdown = $( "<a>" )
					.attr( "tabIndex", -1 )
					.attr( "title", this.dropdownEnabledTooltipText() )
					.tooltip()
					.appendTo( this.wrapper )
					.button({
						icons: {
							primary: "ui-icon-triangle-1-s"
						},
						text: false
					})
					.removeClass( "ui-corner-all" )
					.addClass( "versatilecombobox-combobox-toggle ui-corner-right" )
					.mousedown(function() {
						wasOpen = input.autocomplete( "widget" ).is( ":visible" );
					})
					.click(function() {
						input.focus();

						// Close if already visible
						if ( wasOpen ) {
							return;
						}

						// Pass empty string as value to search for, displaying all results
						input.autocomplete( "search", "" );
					});
			},

			filterOptions: function( request, response ) {		
			/*
			 * This API is the filter data to present options for user select. It links to autocomplete.source() API (see doc for detail)
			 * It is override-able.
			 */
				var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
				//if (this.url){		
				if (this.selectOptions && this.selectOptions.length >0){	
					if (!this.selectOptions || this.selectOptions.length==0){
						return;
					}
					var fitleredData =[];
					this.selectOptions.map(function( item, itemIndex){
						 var text = item.label;
						 if ( !request.term || matcher.test(text)  ){
							 var myItem = {
										label: item.label,
										value: item.value,
										option: this
									};
							 fitleredData.push(myItem);
						 }
					 });
					 
					 response(fitleredData);
				}
				else{
					//This block of code assume that the widget is on a "<select> <option> a </option> ...</select>" node. It uses the "options" values to filter
					response( this.element.children( "option" ).map(function() {
						var text = $( this ).text();
						if ( this.value && ( !request.term || matcher.test(text) ) )
							return {
								label: text,
								value: text,
								option: this
							};
					}) );
				}
			},
			
			
			setValue:function( newValue){
				this.input.val(newValue);
				this.selectedValue = {
		                 label: newValue,
		                 value:newValue
                      };
				this.onValueSetCompleted(null, null, this);
			},
			
			getSelectOptions: function( ) {
			/*
			 * This api use AJAX to fetch data from server.
			 */
				var self = this; // get the reference of widget
	            $.ajax({
	                url: this.url,
	                dataType: "json",
	                type: "post",
	               /* data: {
	                    //maxRows: 15,
	                    term: request.term
	                },*/
	                error: function (xhr, status) {
                        console.error("Unable to retrieve network resource. Please check your network connection.");
                        alert("Unable to retrieve network resource. Please check your network connection." + xhr.status + " " +  this.url );
                    },
	                success: function(data, response ) {	    
	                	self.selectOptions= data;
	                }
	            })
	        },
	        
	        onValueSet:function(event, ui){
	        	var isValid = this._removeIfInvalid(event, ui);
	        	if (isValid){
	        		this.onValueSetCompleted(event, ui, this );
	        	}
	        },

			_removeIfInvalid: function( event, ui ) {
				
				if (!this.boolMustSelect){
					this.selectedValue = this.selectedValue = {
			                 label: this.input.val(),
			                 value: this.input.val()
	                       }; 
					
					return true;
				}

				// Selected an item, nothing to do
				if ( ui.item ) {					
					return true;
				}

				// Search for a match (case-insensitive)
				var value = this.input.val(),
					valueLowerCase = value.toLowerCase(),
					valid = false;
				if (this.selectOptions && this.selectOptions.length >0){	
					this.selectOptions.map(function( item, itemIndex){
						 var text = item.label;
						 if ( text.toLowerCase() === valueLowerCase ) {
								this.selected = valid = true;
								return false;
						 }
					 });
				}else{
					this.element.children( "option" ).each(function() {
						if ( $( this ).text().toLowerCase() === valueLowerCase ) {
							this.selected = valid = true;
							return false;
						}
					});
				}

				// Found a match, nothing to do
				if ( valid ) {					
					return true;
				}

				// Remove invalid value
				this.input
					.val( "" )
					.attr( "title", value + " didn't match any item" )
					.tooltip( "open" );
				this.element.val( "" );
				this._delay(function() {
					this.input.tooltip( "close" ).attr( "title", "" );
				}, 2500 );
				this.input.autocomplete( "instance" ).term = "";
				return false;
			},

			onValueSetCompleted:function(event, ui, widget ){
				console.log(widget.element + " onValueSetCompleted() called.  " +  this.selectedValue);
				
			},
			
			disable:function(){
				this.input.autocomplete( "disable" );
				this.dropdown.attr( "title", this.dropdownDisabledTooltipText());
			},
			
			enable:function(){
				this.input.autocomplete( "enable" );
				this.dropdown.attr( "title", this.dropdownEnabledTooltipText() )
			},
			
			dropdownEnabledTooltipText:function(){
				return "Show All Items";
			},
			
			dropdownDisabledTooltipText:function(){
				return "Disabled";
			},
			
			reset:function(){
				this.input.val("");
				this.selectedValue = null;
			}, 
			
			_destroy: function() {
				this.wrapper.remove();
				this.element.show();
			}
		});
	})( jQuery );