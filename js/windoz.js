var lbConfig = {
  // This setting enables a black background overlay
	showBlackBGLayer: false,
  
  // Every time a light box is created, it assigns highest z-index to it. 
  // All the Z-index-es of the windows currently active are pushed to this array
  // This array is popped when ever a window minimizes / closes
  zIndices: {},
  
  // Every time a light box is created it adds to this stack. 
  // The stack pops out when a window/overlay is minimized or closed.
  lbStack: {},
  
  // Initialize the global variable scrollBackDivId
  // This divName should be the id of the link which triggers the light box action
  // Soon after the lightbox closes, the window should scrolled to focus this div
  scrollBackDivId: null
};


// This function is to delete a particular window details from the global zIndices which matches the timestamp
function popZIndices(tStamp){
  // iterating the hashtable and removing the entry where key = tStamp
  zIndex = null;
  Object.keys(lbConfig.zIndices).forEach(function (key) { 
    if(key == tStamp){
      zIndex = lbConfig.zIndices[key];
      delete lbConfig.zIndices[key];
    }
  })
  return [tStamp, zIndex];
}

// This function is to delete a particular window details from the global stack which matches the timestamp
function poplbStack(tStamp){
  // iterating the hashtable and removing the entry where key = tStamp
  options = null;
  Object.keys(lbConfig.lbStack).forEach(function (key) { 
    if(key == tStamp){
      options = lbConfig.lbStack[key];
      delete lbConfig.lbStack[key];
    }
  })
  return [tStamp, options];
}

// This function is to know what is the highest z-index used by the windows created by lightbox.
function getHighestZIndex(){
  // iterating the hashtable and removing the entry where key = tStamp
  highestVal = null;
  Object.keys(lbConfig.zIndices).forEach(function (key) { 
    if(lbConfig.zIndices[key] > highestVal){
      highestVal = lbConfig.zIndices[key];
    }
  })
  return highestVal;
}

// This function will return the details of the window
// it will fetch data from lbStack and is mostly called when maximizing / re-showing the window.
function getWindowOptions(tStamp){
  // iterating the hashtable and removing the entry where key = tStamp
  options = null;
  Object.keys(lbConfig.lbStack).forEach(function (key) { 
    if(key == tStamp){
      options = lbConfig.lbStack[key];
    }
  })
  return options;
}

// Create the background overlay so that the page content blurs to highlight the lightbox
// The overlay is automatically appended to body
function getBlackBGLayer() {
    var lbBlackBGOverlay = $('#lb_overlay.backdrop');
    if (!lbBlackBGOverlay.length) {
        // Generating the timestamp to manage multiple lighboxes
      	var lbBlackBGOverlay = $('<div/>', {
          id: "lb_overlay",
          class: "backdrop"
      	});
        $('body').append(lbBlackBGOverlay);
    }
    return lbBlackBGOverlay;
}

// Show a black overlay to highlight the lighbox window
function showBlackBGLayer(){
	// Get the page height and width
	xdoc = xDocSize();
	page_width = xdoc.w;
	page_height = xdoc.h;
	
  var lbBlackBGOverlay = getBlackBGLayer();
  
  // Set width and height dynamically depending upon the page width / height
  $(lbBlackBGOverlay).css("width",page_width);
	$(lbBlackBGOverlay).css("height",page_height);
  
  $(lbBlackBGOverlay).show();
}

// Create a Main Container if it doesn't exists else return the container.
// The container is automatically appended to body
function getLbContainerMain() {
    var lbContainerMain = $('#lb_container_main');
    if (!lbContainerMain.length) {
        // Generating the timestamp to manage multiple lighboxes
      	var lbContainerMain = $('<div/>', {
          id: "lb_container_main",
          class: "lightbox"
      	});
        $('body').append(lbContainerMain);
    }
    return lbContainerMain;
}

// Create a Main Container if it doesn't exists else return the container.
// The container is automatically appended to body
function getMinimizedLbContainerMain() {
    var minLbContainerMain = $('#min_lb_container_main');
    if (!minLbContainerMain.length) {
        // Generating the timestamp to manage multiple lighboxes
      	var minLbContainerMain = $('<div/>', {
          id: "min_lb_container_main"
      	});
        $('body').append(minLbContainerMain);
    }
    return minLbContainerMain;
}

function getLbMinWindow(tStamp){
  
  // Fetch window object
  var lblMinWindow = $('#div_min_light_box_container_' + tStamp);
  
  if (!lblMinWindow.length) {
    
  	var lbMinWindow = $('<div/>', {
  		id: 'div_min_light_box_container_' + tStamp,
      class: 'window minimized',
      "data-timestamp": tStamp
  	});

  	var lbWindowHeader = $('<div/>', {
      class: 'header'
  	});

  	var closeButton = $('<button/>', {
      type: 'button',
      class: 'action action-close',
      html: 'x'
  	});

  	var showButton = $('<button/>', {
      type: 'button',
      class: 'action action-show',
      html: 'o'
  	});

    var heading = $("#div_light_box_container_" + tStamp + " .header h3").text();
  	
    var lbHeading = $('<h3/>', {
      html: heading
  	});

    // Creating the minimized window
  	$(lbWindowHeader).append(closeButton);
  	$(lbWindowHeader).append(showButton);
  	$(lbWindowHeader).append(lbHeading);
    $(lbMinWindow).append(lbWindowHeader);

  }
  
  // Bind the onclick event for hiding and closing the window
  $(lbMinWindow).on("click",'.action-close',function(e) {
    
    var lbMinWindow = $(this).closest('.window');
    var tStamp = $(lbMinWindow).data("timestamp");
    var lbWindow = $('#div_light_box_container_' + tStamp);
    
    // pop fro global zindices array (InCase if its still there.)
    popZIndices(tStamp);
    
    // remove the window details from the stack
    poplbStack(tStamp);
    
    // Destory the min window
    lbMinWindow.remove();
    
    // Destory the window
    lbWindow.remove();
  });
  
  $(lbMinWindow).on("click",'.action-show',function(e) {
    
    var lbMinWindow = $(this).closest('.window');
    var tStamp = $(lbMinWindow).data("timestamp");
    var lbWindow = $('#div_light_box_container_' + tStamp);
    
    // Get Window Option
    options = getWindowOptions(tStamp);
    
    // hide the active window
    positionWindow(lbWindow, options);
    lbWindow.show();
    lbMinWindow.hide();
    
    // Store the ZIndex of the newly created window
    lbConfig.zIndices[tStamp] = zIndex;
  
  });
  
  // Get/Create  Minimized LightBox Container ()
  var minLbContainerMain = getMinimizedLbContainerMain();
  $(minLbContainerMain).append(lbMinWindow);
  
  return lblMinWindow;
  
}

// Create a new window and append to lb container
// var options = {'width': 300, 'height':120, 'content':content, 'showHeader':false, 'divId':null}
// createWindow(options);
function createWindow(options){
  
	// Parsing the options
  var width = options['width'] == null ? 700 : options['width']; 
  var height = options['height'] == null ? 320 : options['height']; 
  var content = options['content'] == null ? "No data has been provided." : options['content'];
  var heading = options['heading'] == null ? "LB Heading" : options['heading']; 
  var showHeader = options['showHeader'] == null ? true : options['showHeader']; 
  var showCloseButton = options['showCloseButton'] == null ? true : options['showCloseButton']; 
  var divId = options['divId'] == null ? null : options['divId']; 
  var showWindow = options['showWindow'] == null ? true : options['showWindow']; 
  
	// Storing the id of the div where the scroll was previously. will scroll to this div once the lightbox closes.
	scrollBackDivId = divId || null;
  
  // Generating the timestamp to manage multiple lighboxes
  var tStamp = new Date().getTime();
  var zIndex = getHighestZIndex() + 1;
  options['zIndex'] = zIndex;
  
	var lbWindow = $('<div/>', {
		id: 'div_light_box_container_' + tStamp,
    class: 'window active',
    "data-timestamp": tStamp
	});
  
	var lbWindowHeader = $('<div/>', {
    class: 'header'
	});
  
	var closeButton = $('<button/>', {
    type: 'button',
    class: 'action action-close',
    html: 'x'
	});
  
	var hideButton = $('<button/>', {
    type: 'button',
    class: 'action action-hide',
    html: '-'
	});
  
	var showButton = $('<button/>', {
    type: 'button',
    class: 'action action-show',
    html: 'o',
    style: 'display:none;'
	});
  
	var lbHeading = $('<h3/>', {
    html: heading
	});
  
	var lbBody = $('<div/>', {
    class: 'padding-10 body',
    html: content
	});
  
	// Show header and close button if required.
	if(showHeader==true){
		$(lbWindowHeader).append(closeButton);
		$(lbWindowHeader).append(showButton);
		$(lbWindowHeader).append(hideButton);
    if(showCloseButton==true){
		  $(lbWindowHeader).append(lbHeading);
    }
    $(lbWindow).append(lbWindowHeader);
	}
  
  // Bind the onclick event for hiding and closing the window
  $(lbWindow).on("click",'.action-close',function(e) {
    
    var lbWindow = $(this).closest('.window');
    var tStamp = $(lbWindow).data("timestamp");
    var lblMinWindow = $('#div_min_light_box_container_' + tStamp);
    
    // pop fro global zindices array
    popZIndices(tStamp);
    
    // remove the window details from the stack
    poplbStack(tStamp);
    
    // Destory the window
    lbWindow.remove();
    
    // Destory the min window
    lblMinWindow.remove();
  });

  $(lbWindow).on("click",'.action-hide',function(e) {
    
    var lbWindow = $(this).closest('.window');
    var tStamp = $(lbWindow).data("timestamp");
    var lbMinWindow = getLbMinWindow(tStamp);
    
    // hide the active window
    lbWindow.hide();
    lbMinWindow.show();
    
    // pop from global stack
    popZIndices(tStamp);
    
  });
  
  // Append the body
  $(lbWindow).append(lbBody);
  
  var lbContainerMain = getLbContainerMain();
  $(lbContainerMain).append(lbWindow);
  
  // Show Background Overlay if showWindow option is passed
  if(showWindow){
    //showBlackBGLayer();
    positionWindow(lbWindow, options);
  }
  
  // Store the ZIndex of the newly created window
  lbConfig.zIndices[tStamp] = zIndex;
  
  // push to global stack (HashTable)
  lbConfig.lbStack[tStamp] = options;
  
}

function positionWindow(lbWindow, options){
  
	// Parsing the options
  var width = options['width'] == null ? 700 : options['width']; 
  var height = options['height'] == null ? 320 : options['height']; 
  var content = options['content'] == null ? "No data has been provided." : options['content'];
  var heading = options['heading'] == null ? "LB Heading" : options['heading']; 
  var showHeader = options['showHeader'] == null ? true : options['showHeader']; 
  var showCloseButton = options['showCloseButton'] == null ? true : options['showCloseButton']; 
  var divId = options['divId'] == null ? null : options['divId']; 
  var showWindow = options['showWindow'] == null ? true : options['showWindow']; 
  var zIndex = options['zIndex'] == null ? true : options['zIndex']; 
  
	// Get the page height and width
	xdoc = xDocSize();
	page_width = xdoc.w;
	page_height = xdoc.h;
	
	// Get the top pixels.
	// if the height of the popup box is less than 200 make it middle
	// else show the pop up starting 100 px from top :)
	if(height < 300){
		//screen.height
		top_val = ( page_height - height)/2 - 20;
	} else if(height > 500) {
		top_val = 30;
	} else {
		top_val = 100;
	}
	top_val = 100;
	// screen.width
	left_val = ( page_width - width)/2;
	
	// Setting up the container main
	$(lbWindow).css("top", top_val);
	$(lbWindow).css("left", left_val);
	//$(lbWindow)..css("width",width);
	//$(lbWindow)..css("height",height);
	$(lbWindow).css("z-index", zIndex);
	$(lbWindow).css("position", "absolute");
	
	container_width = (width - (2 * 22) - 20);
	container_height = (height - (2 * 6) - 20);
	$(lbWindow).css("width",container_width);
	//$(lbWindow).css("height",container_height);
	
	// Adjusting the height of the top box container
	// 20 is for the padding
	frame_height = (height - (2 * 6));
	//    $(lbWindow).css("height",frame_height);
	//    $(lbWindow).css("height",frame_height);

	// Setting up the container
	$("#DIVID_LIGHT_BOX_CONTAINER").html(content);
	$("#DIVID_LIGHT_BOX_CONTAINER").css("background-color", "#FFF");
	
  javascript:scroll(0,0);
	// // lock scroll position, but retain settings for later
	// 	var scrollPosition = [
	// 	self.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
	// 	self.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
	// 	];
	// 	var html = $('html'); // it would make more sense to apply this to body, but IE7 won't have that
	//html.data('scroll-position', scrollPosition);
	//html.data('previous-overflow', html.css('overflow'));
	//html.css('overflow', 'hidden');
	//window.scrollTo(scrollPosition[0], scrollPosition[1]);
}

// xDocSize r1, Copyright 2007 Michael Foster (Cross-Browser.com)
// Part of X, a Cross-Browser Javascript Library, Distributed under the terms of the GNU LGPL
function xDocSize(){
	var b=document.body, e=document.documentElement;
	var esw=0, eow=0, bsw=0, bow=0, esh=0, eoh=0, bsh=0, boh=0;
	if (e) {
		esw = e.scrollWidth;
		eow = e.offsetWidth;
		esh = e.scrollHeight;
		eoh = e.offsetHeight;
	}
	if (b) {
		bsw = b.scrollWidth;
		bow = b.offsetWidth;
		bsh = b.scrollHeight;
		boh = b.offsetHeight;
	}
	//  alert('compatMode: ' + document.compatMode + '\n\ndocumentElement.scrollHeight: ' + esh + '\ndocumentElement.offsetHeight: ' + eoh + '\nbody.scrollHeight: ' + bsh + '\nbody.offsetHeight: ' + boh + '\n\ndocumentElement.scrollWidth: ' + esw + '\ndocumentElement.offsetWidth: ' + eow + '\nbody.scrollWidth: ' + bsw + '\nbody.offsetWidth: ' + bow);
	return {
		w:Math.max(esw,eow,bsw,bow),
		h:Math.max(esh,eoh,bsh,boh)
	};
}

function popUp() {
  var options = {'width': 300, 'height':120, 'showHeader':true, 'divId':null, content: 'Joshi'};
  createWindow(options);
}
