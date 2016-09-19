/// <reference path="common.js" />

//地图相关操作类
var MapManger = {};
var measureActivated = false;
var tianDiTuLayer;
var tianDiTuLayer_label;
var eDuShiLayer;
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
                // console.log(tileCoord);
                // var z = 'png'+ (parseInt(tileCoord)) ;
                // var x = tileCoord[1] - Math.pow(2, tileCoord[0] - 1) - 5247*Math.pow(2, tileCoord[0] );
                // var y = -tileCoord[2] - 1 - 6869*Math.pow(2, tileCoord[0] - 14);
                // return "huaDongShiFan/"+z+"/"+x+","+y+".png";
            }
        });
        var layer = new ol.layer.Tile({
            source: source,
            zIndex: 0
        });

        return layer;
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
        // var extent = ol.proj.transformExtent([122.232009,40.661048,122.235807,40.664596], "EPSG:4326", "EPSG:3857");
        // var lb = ol.proj.transform([122.232009,40.661048], "EPSG:4326", "EPSG:3857");
        // var rb = ol.proj.transform([122.235807,40.661048], "EPSG:4326", "EPSG:3857");
        // var rt = ol.proj.transform([122.235807,40.664596], "EPSG:4326", "EPSG:3857");
        // var lt = ol.proj.transform([122.232009,40.664596], "EPSG:4326", "EPSG:3857");
        // var polyCoords = [[o.ori_rat(lb), o.ori_rat(rb), o.ori_rat(rt), o.ori_rat(lt)]];
        

        // console.log(extent);
        // // var extent = [13810632.715937,3790132.436177,13811884.372275, 3790834.701374];
        // var  poly = ol.geom.Polygon.fromExtent(extent);
        // var geo = new ol.geom.Polygon(polyCoords);
        //   var feature = new ol.Feature({
        //     geometry: geo,
        //     name: "my polygon",
        //     id: "poly1"
        //   });
        // source.addFeature(feature);
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

	    map = new ol.Map({
	        interactions: ol.interaction.defaults({
	            doubleClickZoom: false,
	            altShiftDragRotate: false,
	            pinchRotate: false
	        }),
	        target: document.getElementById('map'),
	        layers: [
	            eDuShiLayer,tianDiTuLayer,tianDiTuLayer_label,vector
	            //, o.createChinaGrid()
	        ],
	        view: new ol.View({
	             center: center,
	            //center: ([13804000.625313, 3795092.288458]), // 营口
	            //center: [12126808,4061432,12127152,4061630], // 西安莲花小区
	            // center: [13810256.473694, 3796092.487915 ],
	            zoom: GlobalObj.map.zoom,
	            maxZoom: GlobalObj.map.maxZoom,
	            minZoom: GlobalObj.map.minZoom
		        }),
	        controls:[
	                mp
	        ]
	    });

	    // 地图加载完成事件	    
		map.once("moveend", function(e){
		  console.log(e.target.getView().getZoom())
		  setTimeout(function(){
			  map.getView().setZoom(20);
		  }, 100)
		})

	     $.getJSON("data/ceshiyh.js", function (data) {
     	   		var geojsonVectorSource = new ol.source.Vector({
				  features: (new ol.format.GeoJSON()).readFeatures(data)
				});

			    var geojsonVectorLayer = new ol.layer.Vector({
				 	source: geojsonVectorSource,
				 	style: new ol.style.Style({
				 		fill: new ol.style.Fill({
				 			color: 'rgba(255,255,33,0.0)'
				 		}) 
				 	}),
				 	visible: true
				});	

				map.addLayer(geojsonVectorLayer);
				//map.on('moveend', function(e){
					// console.log(e.map.getView().getZoom())
					// if( e.map.getView().getZoom() >= 16){
					// 	geojsonVectorLayer.setVisible(true);
					// }else{
					// 	geojsonVectorLayer.setVisible(false);
					// }
				//})
            });


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
		      map.getTarget().style.cursor = hit ? 'pointer' : '';
		      // console.log(ol.proj.transform(e.coordinate, "EPSG:3857", 'EPSG:4326'));
		      var feature = map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
		        return feature;
		      });
		       if(lastHigthLightFeature){
		       	lastHigthLightFeature.setStyle(defaultStyle);
		       }
		       // console.log(feature.getGeometry().getType())
		       if(feature && feature.getGeometry().getType() == "Polygon"){
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

