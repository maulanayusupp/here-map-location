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
      onRemove: function (index) {
        mapVariation.splice(index, 1);
      }
    };
    var map = new MapLocation(config);
    mapVariation.push(map);
  }

  function init(){
    initAddLocation();
    createLocation();
  }

  /* initialize */
  init();
});
