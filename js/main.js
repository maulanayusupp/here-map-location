jQuery(document).ready(function($) {
  /* global variable */
  var mapCounter = 0;
  var mapVariation = [];

  /* create field map */
  function createFieldMap() {
    mapCounter++;
    var containerId = 'map-variation-' + mapCounter;
    var $container = $(`<div id="${containerId}" class="map-variation-component"></div>`);

    $('#location-field').append($container);
  }

  /* add location */
  function initAddLocation() {
    $('#add-location').on('click', function(event) {
      createLocation();
    });
  }

  /* create location */
  function createLocation() {
    createFieldMap();

    var config = {
      id: 'map-variation-' + mapCounter,
      mapCounter: mapCounter,
    };
    var map = new MapLocation(config);
    mapVariation.push(map);
  }

  /* remove map */
  function initRemoveMap(){
    $('body').on('click', '.btn-remove-map-location', function(event) {
      $(this).closest('.map-container').remove();
    });
  }

  /* init drop marker */
  function initDropMarker(){
    $('body').on('click', '#map-drop-in', function(event) {
      onDropMarker();
    });
  }

  /* on drop marker */
  function onDropMarker() {
    var lat=-6.864856, lng=107.579930;
    addDraggableMarker(map, behavior, lat, lng);
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

    /* event tap for bubble info */
    group.addEventListener('tap', function (evt) {
      selectedGroupID = group.getId();
      var bubble =  new H.ui.InfoBubble(evt.target.getPosition(), {
        // read custom data
        content: evt.target.getData()
      });
      // show info bubble
      ui.addBubble(bubble);
    }, false);

    var html = `
                  <div class="info-container clearfix">
                    <div class="pull-left">
                        <div class="btn btn-warning">Pixel House Studio</div>
                    </div>
                    <div class="pull-right">
                      <a href=\'http://managix.id/\' target="blank">
                        <div class="btn btn-primary">Managix</div>
                      </a>
                    </div>
                  </div>
                  <div>
                    Jl. Gegerkalong Tonggoh III No.15, Gegerkalong, Sukasari, Kota Bandung, Jawa Barat 40153, Indonesia
                  </div>
                `;

    // create marker
    var marker = new H.map.Marker({lat:lat, lng:lng});

    // Ensure that the marker can receive drag events
    marker.draggable = true;
    marker.setData(html);
    group.addObject(marker);

    // create area in marker
    var area = new H.map.Circle(
      // The central point of the circle
      {lat:lat, lng:lng},
      // The radius of the circle in meters
      radius,
      {
        style: {
          strokeColor: 'rgba(55, 85, 170, 0.6)', // Color of the perimeter
          lineWidth: 1,
          fillColor: 'rgba(8, 138, 254, 0.43)'  // Color of the circle
        }
      }
    );
    group.addObject(area);

    // disable the default draggability of the underlying map
    // when starting to drag a marker object:
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


    // re-enable the default draggability of the underlying map
    // when dragging has completed
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

    // Listen to the drag event and move the position of the marker
    // as necessary
    group.addEventListener('drag', function(ev) {
      var target = ev.target;
      var pointer = ev.currentPointer;
      // var coord = map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
      // console.log(coord)
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

  /* init remove marker */
  function initRemoveMarker(){
    $('body').on('click', '#map-remove-marker', function(event) {
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
      }
    }
  }

  /* init change radius */
  function initChangeRadius(){
    $('body').on('click', '#map-change-radius', function(event) {
      onChangeRadius();
    });
  }

  /* on change radius in marker */
  function onChangeRadius() {
    // Add the click event listener.
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
              fillColor: 'rgba(8, 138, 254, 0.43)'  // Color of the circle
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
              fillColor: 'rgba(8, 138, 254, 0.43)'  // Color of the circle
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


  function init(){
    initAddLocation();
    initRemoveMap();
    initDropMarker();
    initRemoveMarker();
    initChangeRadius();
    createLocation();
  }

  /* initialize */
  init();
});
