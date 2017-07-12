var com_mark = {
    overlay: null,
    content: null,
    initialized: false,
    delMark: null, 
    delLbl: null,
    markSource: null,
    closer: null,
    popup: null,
    markIdIdx: 0,
    markIdName: 'marklayer',
    init: function () {
        var container = document.getElementById('mark-popup');
        this.content = document.getElementById('mark-popup-content');
        var closer = document.getElementById('mark-popup-closer');
        var overlay = new ol.Overlay({
            element: container,
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            }
        });
        closer.onclick = function () {
            overlay.setPosition(undefined);
            closer.blur();
            return false;
        };
        map.addOverlay(overlay);
        
        var markSource = new ol.source.Vector();
        var markLayer = new ol.layer.Vector({
            style: function (feature) {
                return feature.get('style');
            },
            source: markSource
        })
        map.getLayers().push(markLayer);
        this.markSource = markSource;
        this.overlay = overlay;
        this.closer = closer;
        this.popup = container;
        this._save();
        this._delete();
        this.initialized = true;
    },
    _save: function () {
        var that = this;
        $('#btnSignSave').on('click', function () {
            var titleInfo = $('#us_infoWnd_title').val();
            var remarkInfo = $('#us_infoWnd_remark').val();
            var coordinate = that.overlay.getPosition();
            var iconFeature = new ol.Feature(new ol.geom.Point(coordinate));
            iconFeature.setId(that.markIdName+(that.markIdIdx++));
            iconFeature.set('style', that._createStyle('images/pin_red.png', undefined));
            that.markSource.addFeature(iconFeature);
            iconFeature.setProperties({
                title: titleInfo,
                remark: remarkInfo
            })
            that.delLbl = that._createLabelOverlay(coordinate, titleInfo, iconFeature.getId());
            that._closePopup();
        })
    },
    _createStyle: function (src, img) {
        return new ol.style.Style({
            image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
            anchor: [0.5, 0.96],
            src: src,
            img: img,
            imgSize: img ? [img.width, img.height] : undefined
            }))
        });
    },
    _closePopup: function () {
        this.overlay.setPosition(undefined);
        this.closer.blur();
    },
    _delete: function () {
        var that = this;
        $('#btnSignDelete').on('click', function () {
            that._closePopup();
            if (that.delMark ) {
                var f = that.markSource.getFeatureById(that.delMark.getId());
                var o = map.getOverlayById(that.delMark.getId());
                if(f != null){
                    that.markSource.removeFeature(f);
                }
                if( o != null) {
                    map.removeOverlay(o);
                }
                that.delMark = null;
            }
        })
    },
    _createLabelOverlay: function (coord, title, id) {
        if (!title) {
            return;
        }
        var lblEle = document.createElement('div');
        lblEle.className = 'labeltip';
        var lblOverlay = new ol.Overlay({
            id: id,
            element: lblEle,
            offset: [0, -25],
            positioning: 'bottom-center'
        });
        lblEle.innerHTML = title;
        lblOverlay.setPosition(coord);
        map.addOverlay(lblOverlay);
        return lblEle;
    },
    markPlace: function (evt) {
        if(!this.initialized)
            this.init(); 
        $('#us_infoWnd_title').val('');
        $('#us_infoWnd_remark').val('');
        var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
            return feature;
        });
        if (feature) {
            var selectedFeature = this.markSource.getFeatureById(feature.getId());
            if(selectedFeature){
                var titleInfo = selectedFeature.get('title');
                var remarkInfo = selectedFeature.get('remark');
                $('#us_infoWnd_title').val(titleInfo);
                $('#us_infoWnd_remark').val(remarkInfo);
                this.delMark = selectedFeature;
            }
        }
        var coordinate = evt.coordinate;
        var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(coordinate, 'EPSG:4326', 'EPSG:4326'));
        this.overlay.setPosition(coordinate);
        this.popup.style.display = 'block'
    }

} 

//  module.exports = com_mark;
