// Copyright (c) 2012 Web Notes Technologies Pvt Ltd (http://erpnext.com)
// 
// MIT License (MIT)
// 
// Permission is hereby granted, free of charge, to any person obtaining a 
// copy of this software and associated documentation files (the "Software"), 
// to deal in the Software without restriction, including without limitation 
// the rights to use, copy, modify, merge, publish, distribute, sublicense, 
// and/or sell copies of the Software, and to permit persons to whom the 
// Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in 
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
// CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE 
// OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

if(!console) {
	var console = {
		log: function(txt) {
			// suppress
		}
	}
}

$(document).ready(function() {
	wn.assets.check();
	wn.provide('wn.app');
	$.extend(wn.app, new wn.Application());
});

wn.Application = Class.extend({
	init: function() {
		this.load_startup();
	},

	load_startup: function() {
		var me = this;
		if(window.app) {
			wn.call({
				method: 'startup',
				callback: function(r, rt) {
					wn.provide('wn.boot');
					wn.boot = r;
					if(wn.boot.profile.name=='Guest') {
						window.location = 'index.html';
						return;
					}
					me.startup();
				}
			})
		} else {
			this.startup();
		}		
	},
	startup: function() {
		// load boot info
		this.load_bootinfo();

		// page container
		this.make_page_container();
		
		// navbar
		this.make_nav_bar();
			
		// favicon
		this.set_favicon();
		
		if(user!="Guest") this.set_user_display_settings();

		// trigger app startup
		$(document).trigger('startup');
		
		if(wn.boot) {
			// route to home page
			wn.route();	
		}
		
		$(document).trigger('app_ready');
	},
	
	set_user_display_settings: function() {
		if(wn.boot.profile.background_image) {
			wn.ui.set_user_background(wn.boot.profile.background_image);
		}
		if(wn.boot.profile.theme) {
			wn.ui.set_theme(wn.boot.profile.theme);
		}		
	},
	
	load_bootinfo: function() {
		if(wn.boot) {
			wn.control_panel = wn.boot.control_panel;
			this.set_globals();
		} else {
			this.set_as_guest();
		}
	},
	set_globals: function() {
		// for backward compatibility
		profile = wn.boot.profile;
		user = wn.boot.profile.name;
		user_fullname = wn.user_info(user).fullname;
		user_defaults = profile.defaults;
		user_roles = profile.roles;
		user_email = profile.email;
		sys_defaults = wn.boot.sysdefaults;		
	},
	set_as_guest: function() {
		// for backward compatibility
		profile = {name:'Guest'};
		user = 'Guest';
		user_fullname = 'Guest';
		user_defaults = {};
		user_roles = ['Guest'];
		user_email = '';
		sys_defaults = {};
	},
	make_page_container: function() {
		if($("#body_div").length) {
			wn.temp_container = $("<div id='#temp-container' style='display: none;'>")
				.appendTo("body");
			wn.container = new wn.views.Container();
			wn.views.make_403();
			wn.views.make_404();			
		}
	},
	make_nav_bar: function() {
		// toolbar
		if(wn.boot) {
			wn.container.wntoolbar = new wn.ui.toolbar.Toolbar();
		}
	},
	logout: function() {
		var me = this;
		me.logged_out = true;
		wn.call({
			method:'logout',
			callback: function(r) {
				if(r.exc) {
					console.log(r.exc);
				}
				me.redirect_to_login();
			}
		})
	},
	redirect_to_login: function() {
		window.location.href = 'index.html';
	},
	set_favicon: function() {
		var link = $('link[type="image/x-icon"]').remove().attr("href");
		var favicon ='\
			<link rel="shortcut icon" href="' + link + '" type="image/x-icon"> \
			<link rel="icon" href="' + link + '" type="image/x-icon">'

		$(favicon).appendTo('head');
	}
})