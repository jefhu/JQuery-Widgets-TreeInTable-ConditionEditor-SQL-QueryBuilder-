/*
 * @author : Jie Jeffery Hu (Jeff)
 * 
 *
 * Copyright 2015, Jie Jeffery Hu
 * Dual licensed under the MIT 
 */

//
(function( $ ) {
		$.widget( "ise.versatilecombobox", {
			
			_create: function() {
				this.selectOptions=[];
				if(this.options.url){
					this.url = this.options.url;
					this._getSelectOptions();
				}
				this.wrapper = $( "<span>" )
					.addClass( "versatilecombobox-combobox" )
					.insertAfter( this.element );

				this.element.hide();
				this._createAutocomplete();
				this._createShowAllButton();
			},

			_createAutocomplete: function() {
				var selected = this.element.children( ":selected" ),
					value = selected.val() ? selected.text() : "";

				this.input = $( "<input>" )
					.appendTo( this.wrapper )
					.val( value )
					.attr( "title", "" )
					.addClass( "versatilecombobox-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
					.autocomplete({
						delay: 0,
						minLength: 0,
						source: $.proxy( this, "_source" )
						//source: this.selectOptions
					})
					.tooltip({
						tooltipClass: "ui-state-highlight"
					});

				this._on( this.input, {
					autocompleteselect: function( event, ui ) {
						ui.item.option.selected = true;
						this._trigger( "select", event, {
							item: ui.item.option
						});
					},

					autocompletechange: "_removeIfInvalid"
				});
			},

			_createShowAllButton: function() {
				var input = this.input,
					wasOpen = false;

				$( "<a>" )
					.attr( "tabIndex", -1 )
					.attr( "title", "Show All Items" )
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

			_source: function( request, response ) {				
				var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
				if (this.url){					
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

			
			_getSelectOptions: function(request, callback) {
				var self = this; // get the reference of widget
	            $.ajax({
	                url: this.url,
	                dataType: "json",
	                type: "post",
//	                data: {
//	                    maxRows: 15,
//	                    term: request.term
//	                },
	                error: function (xhr, status) {
                        console.error("Unable to retrieve network resource. Please check your network connection.");
                    },
	                success: function(data, response ) {	    
	                	self.selectOptions= data;
	                }
	            })
	        },

			_removeIfInvalid: function( event, ui ) {

				// Selected an item, nothing to do
				if ( ui.item ) {
					return;
				}

				// Search for a match (case-insensitive)
				var value = this.input.val(),
					valueLowerCase = value.toLowerCase(),
					valid = false;
				this.element.children( "option" ).each(function() {
					if ( $( this ).text().toLowerCase() === valueLowerCase ) {
						this.selected = valid = true;
						return false;
					}
				});

				// Found a match, nothing to do
				if ( valid ) {
					return;
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
			},

			_destroy: function() {
				this.wrapper.remove();
				this.element.show();
			}
		});
	})( jQuery );