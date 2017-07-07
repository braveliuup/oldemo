/// <reference path="common.js" />

//地图相关操作类
var MapManger = {};
var measureActivated = false;
var tianDiTuLayer;
var tianDiTuLayer_label;
var eDuShiLayer;
var wfsLayer;
(function (o) {
	
   	o.loadXYZLayerTiandDiTu = function(){
   		var layer = new ol.layer.Tile({
   			source: new ol.source.XYZ({
   				 url: "http://t2.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}"
   			}),
   			visible: false
   		});
   		return layer;
   	}

 	o.loadXYZLayerTiandDiTu_label = function(){
   		var layer = new ol.layer.Tile({
   			source: new ol.source.XYZ({
   				 url: "http://t2.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}"
   			}),
   			visible: false
   		});
   		return layer;
   	}

    o.loadXYZLayerCustom = function () {
        var source = new ol.source.XYZ({
          
            wrapX: false,
            projection: ol.proj.get("EPSG:3857"),
            tileUrlFunction: function (tileCoord, pixelRatio, proj) {
               
                if (!tileCoord) {
                    return "";
                }
                var z = 'L' + (tileCoord[0]);
                var x = tileCoord[1] - Math.pow(2, tileCoord[0] - 1);
                var y = -tileCoord[2] - 1;
                var f = "C" + parseInt(x * Math.pow(2, 19 - tileCoord[0]) / 512) + "R" + parseInt(y * Math.pow(2, 19 - tileCoord[0]) / 512);
                return GlobalObj.map.pic + f + "/1/" + z + "/" + x + "," + y + ".png";
			
            }
        });
        var layer = new ol.layer.Tile({
            source: source,
            zIndex: 0
        });

        return layer;
    };

	o.loadNewEduShiLayer = function () {
		
	}

	o.zeroPad = function zeroPad(num, len, radix) {
		var str = num.toString(radix || 10);
		while (str.length < len) {
			str = "0" + str;
		}
		return str;
	};
  
    ////3857转edushi
    o.rat_ori = function (a) {
        var xcenter = 1212E4; ycenter = 406E4;
        return [(a[0] - xcenter) * Math.sqrt(2) * .5 - (a[1] - ycenter) * Math.sqrt(2) / .65 * .5 + xcenter, (a[0] - xcenter) * Math.sqrt(2) * .5 + (a[1] - ycenter) * Math.sqrt(2) / .65 * .5 + ycenter]
    };
    //edushi转3857
    o.ori_rat = function (a) {
        var xcenter = 1212E4; ycenter = 406E4;
        return [(a[1] - ycenter + (a[0] - xcenter)) / Math.sqrt(2) + xcenter, .65 * (a[1] - ycenter - (a[0] - xcenter)) / Math.sqrt(2) + ycenter]
    }
    //地图初始化
    o.init = function () {
        //debugger;
        var c = ol.proj.transform(GlobalObj.map.center, 'EPSG:4326', 'EPSG:3857');
      //  console.log("3857---", c);
        var center = o.ori_rat(c);
      //  console.log("edushi转3857---", center);
        center = ol.proj.transform(center, 'EPSG:3857', 'EPSG:4326');
      //  console.log("3857-4326--", center);
        center = ol.proj.transform(center, 'EPSG:4326', 'EPSG:3857');
      //  console.log("4326转3857---", center);
        var mp = new ol.control.MousePosition({
            coordinateFormat:function(coord){
                var p = ol.proj.transform(o.rat_ori(coord), "EPSG:3857", "EPSG:4326");
               return p;
            }
        });

        var source = new ol.source.Vector({wrapX: false});
       
     	var vector = new ol.layer.Vector({
	        source: source,
	        style: new ol.style.Style({
	          fill: new ol.style.Fill({
	            color: 'rgba(255, 255, 0, 0.2)'
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
	 
	 	tianDiTuLayer = o.loadXYZLayerTiandDiTu();
	 	tianDiTuLayer_label = o.loadXYZLayerTiandDiTu_label();
	 	eDuShiLayer = o.loadXYZLayerCustom();
		wmsLayer = new ol.layer.Tile({
			source: new ol.source.TileWMS({
				url: 'http://localhost:9999/geoserver/wms',
				params: {'LAYERS': 'ww:ceshiyh', 'TILED': true},
				serverType: 'geoserver'
			})
		});

		var wfsVectorSource = new ol.source.Vector({
				format: new ol.format.GeoJSON(),
				url: function(extent) {
				return 'http://localhost:9999/geoserver/wfs?service=WFS&' +
					'version=1.1.0&request=GetFeature&typename=ww:ceshiyh&' +
					'outputFormat=application/json&srsname=EPSG:3857&' +
					'bbox=' + extent.join(',') + ',EPSG:3857';
				},
				strategy: ol.loadingstrategy.bbox
			});


		wfsLayer = new ol.layer.Vector({
			source: wfsVectorSource,
			style: new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: 'rgba(0, 0, 255, 0)',
					width: 2
				}),
				fill: new ol.style.Fill({
					color: 'rgba(144,144,0, 0)'
				})

			})
		});

	    map = new ol.Map({
	        interactions: ol.interaction.defaults({
	            doubleClickZoom: false,
	            altShiftDragRotate: false,
	            pinchRotate: false
	        }),
	        target: document.getElementById('map'),
	        layers: [
	            eDuShiLayer,tianDiTuLayer,tianDiTuLayer_label,vector,  wfsLayer
	            //, o.createChinaGrid()
	        ],
	        view: new ol.View({
	             center: center,
	            zoom: GlobalObj.map.zoom,
	            maxZoom: GlobalObj.map.maxZoom,
	            minZoom: GlobalObj.map.minZoom
		        }),
	        controls:[
	                mp
	        ]
	    });

	    var defaultStyle = new ol.style.Style({
					 		fill: new ol.style.Fill({
			       				color: 'rgba(255,33,33,0.0)'
			       			})
					 	});
	   	var lastHigthLightFeature ;
	    map.on('pointermove', function(e){
	    	if(measureActivated){
    		   if(lastHigthLightFeature){
		       	lastHigthLightFeature.setStyle(defaultStyle);
		       }
	    		return;
	    	}
		      var pixel = map.getEventPixel(e.originalEvent);
		      var hit = map.hasFeatureAtPixel(pixel);
			//   console.log(hit);
		      map.getTarget().style.cursor = hit ? 'pointer' : '';
		      // console.log(ol.proj.transform(e.coordinate, "EPSG:3857", 'EPSG:4326'));
		      var feature = map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
		        return feature;
		      });
		       if(lastHigthLightFeature){
		       	lastHigthLightFeature.setStyle(defaultStyle);
		       }
		    //    console.log(feature.getGeometry().getType())
		       if(feature && (feature.getGeometry().getType() == "Polygon" || feature.getGeometry().getType() == "MultiPolygon")){
		       		lastHigthLightFeature = feature;
		       		feature.setStyle(
		       			new ol.style.Style({
			       			fill: new ol.style.Fill({
			       				color: 'rgba(255,33,33,0.2)'
			       			}),
			       			stroke: new ol.style.Stroke({
			       				color: '#ffcc33',
			       				width: 2
			       			})
		       			})
	       			);
		       }
	    });

        return map;
    };
   
})(MapManger);

