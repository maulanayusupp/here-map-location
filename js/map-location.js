var MapLocation = function (config) {
	var self = this;
	self.config = config;
	self.$container = $('#' + config.id);
	var locationCounter = config.mapCounter;
	var mapID = 'map-' + config.id;

	/* map */
	var myMarkers = [];
	var dropped = false;
	var markerID = 0;
	var selectedGroupID = '';

	/* connection variable */
	var platform = '';
	var defaultLayers = '';
	var map = '';
	var behavior = '';
	var ui = '';

	/* on add location */
	function initCreateElement() {
	  	var dom  = $(`
	              	<div class="container map-variation">
	                	<div class="map-container">
		                  	<div class="card">
		                    	<div class="card-header">
									<div class="float-left">
										Location ${locationCounter}
									</div>
		                      		<div class="btn btn-danger btn-sm btn-remove-map-location float-right">
		                      			Remove Map
		                      		</div>
		                    	</div>
			                    <div class="card-body">
			                      	<div class="row">
			                        	<div class="col-sm-2">
				                          	<div class="btn btn-sm btn-primary btn-block map-drop-in" >Drop In</div>
				                          	<div class="btn btn-sm btn-danger btn-block map-remove-marker">Remove Marker</div>
				                          	<div class="btn btn-sm btn-warning btn-block map-change-radius" >Change Radius</div>
				                        </div>
                                        <div class="col-sm-7">
                                          	<div id="map-container">
                                        	    <div id="${mapID}" class="map-location"></div>
                                        	</div>
                                        </div>
                                        <div class="col-sm-3">
                							<ul class="list-marker-location">
                							</ul>
                                        </div>
			                        </div>
			                    </div>
		                  	</div>
	                	</div>
	              	</div>
	            `);
	  	self.$container.append(dom);
	}

	/* init drop marker */
	function initDropMarker(){
	  	self.$container.find('.map-drop-in').on('click', function(event) {
	 		checkDropMarker();
	  	});
	}

	/* check dropin marker */
	function checkDropMarker() {
   		if (dropped) {
   			dropped = false;
   			self.$container.find('.map-drop-in').html('Drop In');
   			self.$container.find('.map-location').removeClass('targetting');
   		} else {
   			dropped = true;
   			self.$container.find('.map-drop-in').html('Droped');
   			self.$container.find('.map-location').addClass('targetting');
   		}
	}

	/* add draggable marker */
	function addDraggableMarker(map, behavior, lat, lng){
	  	markerID++;
	  	var radius = 1000;
	  	var dragged = false;

	  	/* create group object */
	  	var group = new H.map.Group();
	  	var groupID = group.getId();

	  	/* add group to the map object */
	  	map.addObject(group);

	  	var html = `
	                <div class="info-container clearfix">
	                  <div class="float-left">
	                      	<a href=\'http://pixelhouse.id/\' target="blank">
		                      <div class="btn btn-sm btn-warning">Pixel House ID</div>
		                    </a>
	                  </div>
	                  <div class="float-right">
	                    <a href=\'http://managix.id/\' target="blank">
	                      <div class="btn btn-sm btn-primary">Managix</div>
	                    </a>
	                  </div>
	                </div>
	                <div>
						<div class="label-lat-lng">${lat}, ${lng}</div>
	                </div>
	              `;

	  	/* create marker */
	  	var pathIcon = 'css/cursor/location-droppin.png';
	  	var icon = new H.map.Icon(pathIcon);
  		var coords = {lat:lat, lng:lng};
	  	var marker = new H.map.Marker(coords, {icon: icon});

	  	/* Ensure that the marker can receive drag events */
	  	marker.draggable = true;
	  	marker.setData(html);
	  	group.addObject(marker);

	  	/* event tap for bubble info */
	  	marker.addEventListener('tap', function (evt) {
	  		var target = evt.target;
  		    /* set selected group id */
	    	selectedGroupID = group.getId();
	    	var bubble =  new H.ui.InfoBubble(target.getPosition(), {
	      		content: target.getData()
	    	});

	    	/* show bubble */
	    	ui.addBubble(bubble);
	  	}, false);

	  	/* create area in marker */
	  	var area = new H.map.Circle(
	    	{lat:lat, lng:lng},
	    	radius,
	    	{
	      		style: {
			        strokeColor: 'rgba(55, 85, 170, 0.6)', // Color of the perimeter
			        lineWidth: 1,
			        fillColor: 'rgba(169, 205, 238, 0.43)'  // Color of the circle
	      		}
	    	}
	  	);
	  	group.addObject(area);

	  	/* when starting to drag a marker object */
	  	group.addEventListener('dragstart', function(ev) {
	    	console.log("Start Dragged - Group ID: " + groupID);
	    	selectedGroupID = group.getId();
	    	dragged = true;
	    	var target = ev.target;
	    	var coord = map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
	    	removeArea(groupID);

	    	if (target instanceof H.map.Marker) {
	      		behavior.disable();
	    	}
	  	}, false);


	  	/* when dragging has completed */
	  	group.addEventListener('dragend', function(ev) {
	    	var target = ev.target;
	    	console.log("dragged")

	    	var coord = map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);

	    	if (dragged) {
	      		changeArea(groupID, coord.lat, coord.lng);
	    	}
	    	dragged = false;

	    	if (target instanceof mapsjs.map.Marker) {
	      		behavior.enable();
	    	}
	  	}, false);

	  	/* shile dragging */
	  	group.addEventListener('drag', function(ev) {
	    	var target = ev.target;
	    	var pointer = ev.currentPointer;
	    	/* get coordinate */
	    	var coord = map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);

	    	if (target instanceof mapsjs.map.Marker) {
	      		target.setPosition(map.screenToGeo(pointer.viewportX, pointer.viewportY));
	    	}
	  	}, false);

	   	/* push to array */
		myMarkers.push({
			id: markerID,
			group_id: groupID,
			group: group,
			area: area,
			radius: radius,
			lat: lat,
			lng: lng
		})
	}

	/* click with mouse listener */
	function mouseClickListener(map) {
		map.addEventListener('tap', function (evt) {
			var coords =  map.screenToGeo(evt.currentPointer.viewportX, evt.currentPointer.viewportY);
	      	var lat = coords.lat;
	      	var lng = coords.lng;
	      	if (dropped) {
		      	addDraggableMarker(map, behavior, lat, lng);
		      	checkDropMarker();
		      	checkMarkerData();
		    }
	    }, false);
	}

	/* check marker data */
	function checkMarkerData() {
		self.$container.find('.marker-item').remove();
		for (var i = 0; i < myMarkers.length; i++) {
			var current = myMarkers[i];
			var dom = `<li class="marker-item">${current.lat}, ${current.lng}</li>`;
			$('.list-marker-location').append(dom);
		}
	}

	/* function mouse enter the map */
	function pointerEnteredMap() {
		map.addEventListener('pointerenter', function (evt) {
			/* simpen ipen didieu wa */
		}, false);
	};

	/* function mouse left the map */
	function pointerLeftMap() {
		map.addEventListener('pointerleave', function (evt) {
			/* simpen ipen didieu wa */
		}, false);
	};

	/* init remove marker */
	function initRemoveMarker(){
	  self.$container.find('.map-remove-marker').on('click', function(event) {
	    onRemoveMarker();
	  });
	}

	/* on remove marker */
	function onRemoveMarker(){
	  for (var i = 0; i < myMarkers.length; i++) {
	    var current = myMarkers[i];
	    if (current.group_id == selectedGroupID) {
	      console.log("remove")
	      map.removeObject(current.group);
	      myMarkers.splice(i, 1);
	      checkMarkerData();
	    }
	  }
	}

	/* init change radius */
	function initChangeRadius(){
	  self.$container.find('.map-change-radius').on('click', function(event) {
	    onChangeRadius();
	  });
	}

	/* on change radius in marker */
	function onChangeRadius() {
	  for (var i = 0; i < myMarkers.length; i++) {
	    var current = myMarkers[i];

	    if (current.group_id == selectedGroupID) {
	      console.log("change radius")
	      current.group.removeObject(current.area);
	      var radius = current.radius + 100;
	      var area = new H.map.Circle(
	        /* position center */
	        {lat:current.lat, lng:current.lng},
	        /*radius */
	        radius,
	        {
	          style: {
	            strokeColor: 'rgba(55, 85, 170, 0.6)', // Color of the perimeter
	            lineWidth: 1,
	            fillColor: 'rgba(169, 205, 238, 0.43)'  // Color of the circle
	          }
	        }
	      );
	      current.group.addObject(area);
	      current.area = area;
	      current.radius = radius;
	    }
	  }
	}

	/* remove area in group */
	function removeArea(groupID){
	  for (var i = 0; i < myMarkers.length; i++) {
	    var current = myMarkers[i];
	    if (current.group_id == groupID) {
	      current.group.removeObject(current.area);
	      break;
	    }
	  }
	}

	/* change area in group */
	function changeArea(groupID, lat, lng){
	  for (var i = 0; i < myMarkers.length; i++) {
	    var current = myMarkers[i];

	    if (current.group_id == groupID) {
	      var area = new H.map.Circle(
	        /* position center */
	        {lat:lat, lng:lng},
	        /*radius */
	        current.radius,
	        {
	          style: {
	            strokeColor: 'rgba(55, 85, 170, 0.6)', // Color of the perimeter
	            lineWidth: 1,
	            fillColor: 'rgba(169, 205, 238, 0.43)'  // Color of the circle
	          }
	        }
	      );
	      current.group.addObject(area);
	      current.area = area;
	      current.lat = lat;
	      current.lng = lng;
	      break;
	    }
	  }
	};

	/* remove map */
	function initRemoveMap(){
	  	self.$container.find('.btn-remove-map-location').on('click', function(event) {
	    	const itemDom = $(this).closest('.map-variation');
			const index = itemDom.index();
			self.config.onRemove(index);
			itemDom.remove();
	  	});
	}

	/* connection to here map */
	function connection() {
	  /* Step 1: initialize communication with the platform */
	  platform = new H.service.Platform({
	    app_id: 'DemoAppId01082013GAL',
	    app_code: 'AJKnXv84fjrb0KIHawS0Tg',
	    useCIT: true,
	    useHTTPS: true
	  });
	  defaultLayers = platform.createDefaultLayers();

	  /* Step 2: initialize a map - this map is centered */
	  map = new H.Map(document.getElementById(mapID),
	    defaultLayers.normal.map,{
	    center: {lat:-6.864856, lng:107.579930},
	    zoom: 13
	  });

	  /* Step 3: make the map interactive */
	  behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

	  /* Step 4: Create the default UI */
	  ui = H.ui.UI.createDefault(map, defaultLayers, 'en-US');
	}

	/* initialize */
	function init() {
		initCreateElement();
		connection();
		initDropMarker();
		initRemoveMarker();
		initRemoveMap();
		initChangeRadius();
		mouseClickListener(map);
		pointerEnteredMap();
		pointerLeftMap();
	}

	/* run init */
	init();
}