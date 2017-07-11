var com_mark = {
    overlay: null,
    content: null,
    initialized: false,
    delMark: null, 
    delLbl: null,
    markSource: null,
    closer: null,
    init: function () {
        var container = document.getElementById('popup');
        this.content = document.getElementById('popup-content');
        var closer = document.getElementById('popup-closer');
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
            iconFeature.set('style', that._createStyle('images/pin_red.png', undefined));
            that.markSource.addFeature(iconFeature);
            iconFeature.setProperties({
                title: titleInfo,
                remark: remarkInfo
            })
            that.delLbl = that._createLabelOverlay(coordinate, titleInfo);
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
                if(f != null){
                    that.markSource.removeFeature(f);
                    that.delMark = null;
                }
            }
            if (that.delLbl) {
                that.delLbl.parentElement.removeChild(that.delLbl);
            }
        })
    },
    _createLabelOverlay: function (coord, title) {
        if (!title) {
            return;
        }
        var lblEle = document.createElement('div');
        lblEle.className = 'labeltip';
        var lblOverlay = new ol.Overlay({
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
            var titleInfo = feature.get('title');
            var remarkInfo = feature.get('remark');
            $('#us_infoWnd_title').val(titleInfo);
            $('#us_infoWnd_remark').val(remarkInfo);
            this.delMark = feature;
        }
        var coordinate = evt.coordinate;
        _log.debug(coordinate)
        var features = his.markSource.getFeaturesAtCoordinate(coordinate);
        _log.debug(features)
        var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
            coordinate, 'EPSG:4326', 'EPSG:4326'));
        this.overlay.setPosition(coordinate);
    }
} 