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
        var source = new ol.source.TileImage({
            projection: projection,
			tileGrid: tileGrid,
            tileUrlFunction: function (tileCoord, pixelRatio, proj) {
               
				var z = o.zeroPad(tileCoord[0], 2, 10);
				var x = o.zeroPad(tileCoord[1], 8, 16);
				var y = o.zeroPad(-tileCoord[2] - 1, 8, 16);
                return GlobalObj.map.pic + "hmp0-19/" + "L" + z + "/" + "R" + y + "/" + "C" + x + ".png";
            }
        });
        var layer = new ol.layer.Tile({
			source: source
        });

        return layer;
    };

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
		var projection = ol.proj.get('EPSG:4326');
		var origin = [-400, 400];
		var resolutions = [
			0.7031250000029744,
			0.3515625000014872,
			0.1757812499888463,
			0.08789062499442316,
			0.04394531250910888,
			0.021972656242657134,
			0.010986328121328567,
			0.00549316407256159,
			0.0027465820243834896,
			0.0013732910240890498,
			6.866455120445249E-4,
			3.433227441249574E-4,
			1.7166138395978374E-4,
			8.583068008258684E-5,
			4.291534004129342E-5,
			2.145767002064671E-5,
			9.658089455004757E-6,
			5.364423453814192E-6,
			2.682199829602067E-6,
			1.3411118121060625E-6,
		];
		var tileGrid = new ol.tilegrid.TileGrid({
			tileSize: 256,
			origin: origin,
			resolutions: resolutions
		});
     
        var mp = new ol.control.MousePosition();
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
	 	eDuShiLayer =  new ol.layer.Tile({
                       source: new ol.source.TileImage({
                           projection: projection,
                           tileGrid: tileGrid,
                           tileUrlFunction: function (tileCoord, pixelRatio, proj) {
                               var z = o.zeroPad(tileCoord[0], 2, 10);
                               var x = o.zeroPad(tileCoord[1], 8, 16);
                               var y = o.zeroPad(-tileCoord[2] - 1, 8, 16);
                               return "http://localhost:8080/oldemo/hmp0-19/" + "L" + z + "/" + "R" + y + "/" + "C" + x + ".png";
                           }
                       }),
                   });
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
				center: [108.934625, 34.292462],
	            resolutions: resolutions,
				resolution: 3.433227441249574E-4,
				projection: projection,
				maxZoom: 19,
			}),
	        controls:[
				mp
	        ]
	    });

	    // 地图加载完成事件	    
	//	map.once("moveend", function(e){
	//	  console.log(e.target.getView().getZoom())
	//	  setTimeout(function(){
	//		  map.getView().setZoom(20);
	//	  }, 100)
	//	})

	    //  $.getJSON("data/ceshiyh.js", function (data) {
     	//    		var geojsonVectorSource = new ol.source.Vector({
		// 		  features: (new ol.format.GeoJSON()).readFeatures(data)
		// 		});

		// 	    var geojsonVectorLayer = new ol.layer.Vector({
		// 		 	source: geojsonVectorSource,
		// 		 	style: new ol.style.Style({
		// 		 		fill: new ol.style.Fill({
		// 		 			color: 'rgba(255,255,33,0.0)'
		// 		 		}) 
		// 		 	}),
		// 		 	visible: true
		// 		});	

		// 		map.addLayer(geojsonVectorLayer);
		// 		//map.on('moveend', function(e){
		// 			// console.log(e.map.getView().getZoom())
		// 			// if( e.map.getView().getZoom() >= 16){
		// 			// 	geojsonVectorLayer.setVisible(true);
		// 			// }else{
		// 			// 	geojsonVectorLayer.setVisible(false);
		// 			// }
		// 		//})
        //     });


     //      image: new ol.style.Icon({
    	//       anchor: [0.5, 46],
     //    	  anchorXUnits: 'fraction',
     //      	  anchorYUnits: 'pixels',
     //      	  opacity: 0.75,
     //          src: 'data/icon.png'
    	// })
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
	    	// if(e.dragging){
	     //   	    $(element).popover('destroy');// 疑问
		    //     return;
		    // }
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


	
		
		
	    // display popup on click
	    // map.on('click', function(evt){
	    //   var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer){
	    //     return feature;
	    //   });
	    //   if(feature){
	    //     popup.setPosition(evt.coordinate);
	    //     $(element).popover({
	    //       'placement': 'top',
	    //       'html': true,
	    //       'content': '<html><h4>'+(feature.get('JID')==''?'信息未录入':feature.get('JID'))+
	    //       '</h4><img width="120" height="120" src="data/title.png"/><br><div style="width:300px;">地址:'+(feature.get('Address')==''?'信息未录入':feature.get('Address'))+'</div></html>'
	    //     });
	    //     $(element).popover('show');
	    //   }else{
	    //     $(element).popover('destroy');
	    //   }
	    // });

        return map;
    };
   
})(MapManger);

