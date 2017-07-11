// require('popup.js')
// require('mark.js')
var api = {
    b_isRegistFeatureSigClick: false,
    b_isRegistFeatureDblClick: false,
    layerManager: {
        getLayer: function (name) {
            var layer = this[name];
            if(typeof layer ==='undefined'){
                alert(name+'自定义图层不存在')
                return false;
            }
            return layer;
        }
    },
    ExLocate: function (lon, lat, zoom) { // 接口 定位 参数：经度，纬度，缩放级别
        var center = [lon, lat];
        var view = map.getView();
        view.setCenter(center);
        view.setZoom(zoom);
    },
    ExAddIcon: function (lon, lat, picUrl, propsObj) { // 添加图片点
        var center = [lon, lat]; 
        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(center)
        });
        iconFeature.setProperties(propsObj);
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
        var source = defaultVectorLayer.getSource();
        source.addFeature(iconFeature);
    },
    ExAddLabel: function (lon, lat, lablTxt) {
        var coordinate = [lon, lat];
        var lblEle = document.createElement('div');
        lblEle.className = 'labeltip';
        var lblOverlay =new ol.Overlay({
            element: lblEle,
            offset: [0, -25]
        });
        lblEle.innerHTML = labelTxt;
        lblOverlay.setPosition(coordinate);
        map.addOverlay(lblOverlay);
        return lblEle;
    },
    ActiveMark: function () { // 激活自主标绘
        map.markActivated = true;
        map.on('singleclick',this.common.markPlace);
    },
    DeactiveMark: function () { // 取消激活自主标绘
        map.markActivated = false;
        map.un('singleclick', this.common.markPlace);
    },
    ActiveMeasureDis: function () {
        map.measureActivated = true;
    },
    DeactiveMeasureDis: function() {
        map.measureActivated = false;
    },
    AddLayer: function (layerName) {
        if (this.layerManager[layerName] != null) {
            alert("图层名称不能重复");
            return false;
        }
        var layer = new ol.layer.Vector({
            style: function (feature) {
                return feature.get('style');
            },
            source: new ol.source.Vector()
        })
        map.getLayers().push(layer);
        this.layerManager[layerName] = layer;
        return true;
    },
    AddImageOnLayer: function (layerName, lon , lat) {
        var iconFeature = new ol.Feature(new ol.geom.Point([lon, lat]));
        iconFeature.set('style', this.common.createDefaultIconStyle());
        var layer = this.layerManager.getLayer(layerName);
        if(layer)
            layer.getSource().addFeature(iconFeature);
    },
    HideLayer: function (layerName) {
        var layer = this.layerManager.getLayer(layerName);
        if(layer)
            layer.setVisible(false)
    },
    ShowLayer: function (layerName) {
        var layer = this.layerManager.getLayer(layerName);
        if(layer)
            layer.setVisible(true)
    },
    RemoveLayer: function (layerName) {
        var layer = this.layerManager.getLayer(layerName);
        if(layer)
        {
            map.removeLayer(layer);
            this.layerManager[layerName] = undefined;
        }
    },
    AddLabelOnLayer: function (layerName, lon, lat, labelTxt) {
        var lblEle = document.createElement('div');
        lblEle.className = 'labeltip ' + layerName;
        var lblOverlay = new ol.Overlay({
            element: lblEle,
            offset: [0, -25]
        });
        lblEle.innerHTML = labelTxt;
        lblOverlay.setPosition([lon, lat]);
        map.addOverlay(lblOverlay);
        return lblEle;
    },
    HideLabelOnLayer: function (layerName) {
        $('.' + layerName).addClass('hideElement');
    },
    ShowLabelOnLayer: function (layerName) {
        $('.' + layerName).removeClass('hideElement');
    },
    WfsQuery: function (queryStr) { // wfs属性字段查询
        queryHighLightVecSource.clear();
        var featureRequest = this.common.createGetFeatureRequest(queryStr);
        var bodyReq = new XMLSerializer().serializeToString(featureRequest);
        $.ajax({
            type: 'POST',
            url: GlobalObj.map.geoserver + '/wfs',
            data: bodyReq,
            contentType: 'application/json',
            datType: 'json',
            success: function (data) {
                var features = new ol.format.GeoJSON({
                    defaultDataProjection: "EPSG:3857",
                    featureProjection: 'EPSG:4326'
                }).readFeatures(data);
                queryHighLightVecSource.addFeatures(features);
                map.getView().fit(queryHighLightVecSource.getExtent());
            },
            error: function (data) {
                alert(data);
            }
        });
    },
    RegistFeaturSingleClick: function () { // 注册单击要素事件
        this.b_isRegistFeatureSigClick = true;
    },
    FeatureSingleClick: function (coordinate, propObj) {// 要素点击回调
        if(!this.b_isRegistFeatureSigClick){
            alert('请先注册要素点击接口');
            return;
        }
        var html = this.common.createFeatureInfo(propObj);
        com_popup.show(coordinate, html);
    }, 
    RegistFeatureDoubleClick: function () { // 注册双击要素事件
        this.b_isRegistFeatureDblClick = true;
    },
    FeatureDoubleClick: function (coordinate, propObj) { // 要素双击回调
        if(!this.b_isRegistFeatureDblClick){
            alert('请先注册要素点击接口');
            return;
        }
        var html = this.common.createFeatureInfo(propObj);
        com_popup.show(coordinate, html);
    },
    common: {
        createFeatureInfo: function (propObj) {
            var html = "<p>要素信息</p>";
            var requireFields = ['Color', 'JID', 'QKID', 'STID', 'NAME', 'ADDRESS', 'STPHOTO', 'PICTURE'];
            requireFields.forEach(function (item) {
                html+= '<p>'+item+':'+propObj[item]+'</p>';
            });
            html+='<p>图片示例(./images/hot/5.jpg):<img src="./images/hot/5.jpg" ></img></p>'
            return html;
        },
        createGetFeatureRequest: function (querystr) { // generate a GetFeature request
            var featureRequest = new ol.format.WFS().writeGetFeature({
                srsName: 'EPSG:3857',
                featurePrefix: GlobalObj.map.featurePrefix,
                featureTypes: GlobalObj.map.featureTypes,
                outputFormat: 'application/json',
                filter: ol.format.filter.or(
                ol.format.filter.like('NAME', querystr),
                ol.format.filter.like('ADDRESS', querystr)
                )
            });
            return featureRequest;
        },
        createDefaultIconStyle: function (){
            return new ol.style.Style({
                image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                    anchor: [0.5, 0.96],
                    src: 'images/pin_red.png'
                }))
            });
        },
        markPlace: function (evt) {
            com_mark.markPlace(evt);
        }
    }
}