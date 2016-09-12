//////////extern API//////////////

var view = map.getView();
var zoom = new ol.control.Zoom();
map.addControl(zoom);

// 页面功能
$('#disBtn').on('click', function(){
  if(!measureActivated){
    addInteraction();
    map.on('pointermove', pointerMoveHandler);
    measureActivated = true;
  }else{
    map.removeInteraction(draw);
    map.un('pointermove', pointerMoveHandler);
    meatureSource.clear();
    $('.tooltip-static').remove()
    measureActivated = false;
  }
  
});

/**
 * The help tooltip element.
 * @type {Element}
 */
var helpTooltipElement;


/**
 * Overlay to show the help messages.
 * @type {ol.Overlay}
 */
var helpTooltip;


/**
 * The measure tooltip element.
 * @type {Element}
 */
var measureTooltipElement;

/**
 * Currently drawn feature.
 * @type {ol.Feature}
 */
var sketch;

/**
 * Overlay to show the measurement.
 * @type {ol.Overlay}
 */
var measureTooltip;

var meatureSource = new ol.source.Vector();

var meatureVector = new ol.layer.Vector({
  source: meatureSource,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
      color: '#ffcc33',
      width: 2
    }),
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        color: '#ffcc33'
      })
    })
  })
});

var layers = map.getLayers();
map.addLayer(meatureVector);
var draw ;

function addInteraction() {
      var type = 'LineString';
      draw = new ol.interaction.Draw({
        source: meatureSource,
        type: /** @type {ol.geom.GeometryType} */ (type),
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          }),
          stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0.5)',
            lineDash: [10, 10],
            width: 2
          }),
          image: new ol.style.Circle({
            radius: 5,
            stroke: new ol.style.Stroke({
              color: 'rgba(0, 0, 0, 0.7)'
            }),
            fill: new ol.style.Fill({
              color: 'rgba(255, 255, 255, 0.2)'
            })
          })
        })
      });
      map.addInteraction(draw);

      createMeasureTooltip();
      createHelpTooltip();

      var listener;
      draw.on('drawstart',
          function(evt) {
            // set sketch
            sketch = evt.feature;

            /** @type {ol.Coordinate|undefined} */
            var tooltipCoord = evt.coordinate;

            listener = sketch.getGeometry().on('change', function(evt) {
              var geom = evt.target;
              var output;
              if (geom instanceof ol.geom.LineString) {
                output = formatLength(geom);
                tooltipCoord = geom.getLastCoordinate();
              }
              measureTooltipElement.innerHTML = output;
              measureTooltip.setPosition(tooltipCoord);
            });
          }, this);

      draw.on('drawend',
          function() {
            measureTooltipElement.className = 'tooltip tooltip-static';
            measureTooltip.setOffset([0, -7]);
            // unset sketch
            sketch = null;
            // unset tooltip so that a new one can be created
            measureTooltipElement = null;
            createMeasureTooltip();
            ol.Observable.unByKey(listener);
          }, this);
}

var wgs84Sphere = new ol.Sphere(6378137);
/**
 * Format length output.
 * @param {ol.geom.LineString} line The line.
 * @return {string} The formatted length.
 */
var formatLength = function(line) {
  var length;
  var edsLength;
  var coordinates = line.getCoordinates();
  length = 0;
  edsLength = 0;
  var sourceProj = map.getView().getProjection();
  for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
    var c1 = ol.proj.transform((coordinates[i]), sourceProj, 'EPSG:4326');
    var c2 = ol.proj.transform((coordinates[i + 1]), sourceProj, 'EPSG:4326');
    length += wgs84Sphere.haversineDistance(c1, c2);

    var edsc1 = ol.proj.transform(MapManger.rat_ori(coordinates[i]), sourceProj, 'EPSG:4326');
    var edsc2 = ol.proj.transform(MapManger.rat_ori(coordinates[i + 1]), sourceProj, 'EPSG:4326');
    edsLength += wgs84Sphere.haversineDistance(edsc1, edsc2);
  }
  var output;
  if (length > 100) {
    output = (Math.round(length / 1000 * 100) / 100) +
        ' ' + 'km';
  } else {
    output = (Math.round(length * 100) / 100) +
        ' ' + 'm';
  }

  var edsOutput;
  if (edsLength > 100) {
    edsOutput = (Math.round(edsLength / 1000 * 100) / 100) +
        ' ' + 'km';
  } else {
    edsOutput = (Math.round(edsLength * 100) / 100) +
        ' ' + 'm';
  }
  return edsOutput;
};

/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */
var continueLineMsg = 'Click to continue drawing the line';


/**
 * Handle pointer move.
 * @param {ol.MapBrowserEvent} evt The event.
 */
var pointerMoveHandler = function(evt) {
  if (evt.dragging) {
    return;
  }
  /** @type {string} */
  var helpMsg = 'Click to start drawing';

  if (sketch) {
    var geom = (sketch.getGeometry());
     if (geom instanceof ol.geom.LineString) {
      helpMsg = continueLineMsg;
    }
  }

  helpTooltipElement.innerHTML = helpMsg;
  helpTooltip.setPosition(evt.coordinate);

  helpTooltipElement.classList.remove('hidden');
};


map.getViewport().addEventListener('mouseout', function() {
  if(helpTooltipElement)
  helpTooltipElement.classList.add('hidden');
});

/**
 * Creates a new help tooltip
 */
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'tooltip hidden';
  helpTooltip = new ol.Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left'
  });
  map.addOverlay(helpTooltip);
}


/**
 * Creates a new measure tooltip
 */
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'tooltip tooltip-measure';
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  });
  map.addOverlay(measureTooltip);
}

// 单击事件
map.on('singleclick', function(evt){
      if(measureActivated){
        return;
      }
      var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer){
        return feature;
      });
      if(feature){
          alert('单击事件---点击对象的Jid为：'+feature.get('JID'));
      }
});

// 双击事件
map.on('dblclick', function(evt){
     if(measureActivated){
        return;
      }
      var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer){
        return feature;
      });
      if(feature){
         alert('双击事件---点击对象的Jid为：'+feature.get('JID'));
      }
});


// 接口 加载图标 参数：经度，纬度，图片地址url，名称，地址
function ExAddIcon(lon, lat, picUrl, jid, name, address){
	var pos = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
  	var center = MapManger.ori_rat(pos);
	var iconFeature = new ol.Feature({
    	geometry: new ol.geom.Point(center),
    	NAME: name,
      JID: jid,
    	ADDRESS: address
  	});
  	// set iconStyle
  	var iconStyle = new ol.style.Style({
        image: new ol.style.Icon({
	      anchor: [0.5, 46],
    	  anchorXUnits: 'fraction',
      	  anchorYUnits: 'pixels',
      	  opacity: 0.75,
          src: picUrl
    	})
  	});
	iconFeature.setStyle(iconStyle);
	var source = map.getLayers().item(1).getSource();
  console.log(source);
	source.addFeature(iconFeature);
}

// 接口 定位 参数：经度，纬度，缩放级别(14-19)
function ExLocate(lon, lat, zoom){
	var c = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
  	var center = MapManger.ori_rat(c);
  	var view = map.getView();
  	view.setZoom(zoom);
  	view.setCenter(center);
}

//////////////本地测试//////////////////////// 

// 添加图片测试
$("#debug_addIcon").on("click", function(){
	var lon = 108.90536, lat = 34.28138, picUrl = "data/icon.png", name = "这里表示图片名称", address = "这里表示地址名称";
	ExAddIcon(lon, lat, picUrl, 'JID001', name, address);
})

// 定位测试
$("#debug_locate").on('click', function(){
    var lon = 108.90536, lat = 34.28138, zoom = 19;
    ExLocate(lon, lat, zoom);// api 定位接口
})

