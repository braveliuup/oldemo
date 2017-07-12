// import map from './mapHelper';

var com_disMeasure = {
    draw: null,
    wgs84Sphere : new ol.Sphere(6378137),
    measureSource: new ol.source.Vector(),
    helpTooltip: null, 
    helpTooltipElement: null, 
    measureTooltip:null,
    measureTooltipElement: null,
    sketch: null,
    init: function () {
        var that  = this;
        map.getViewport().addEventListener('mouseout', function () {
        if (that.helpTooltipElement)
            that.helpTooltipElement.classList.add('hidden');
        });
        var measureVectorLayer = new ol.layer.Vector({
            source: that.measureSource,
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
        map.addLayer(measureVectorLayer);
    },
    activeMeasureDis: function () {
        this.addInteraction();
        this.createMeasureTooltip();
        this.createHelpTooltip();
        this.addMeasureListen();
        map.on('pointermove', this.pointerMoveHandler);
    }, 
    deactiveMeasureDis: function () {
        map.removeInteraction(this.draw);
        map.un('pointermove', this.pointerMoveHandler);
        this.measureSource.clear();
        $('.tooltip-static').remove()
    },
    pointerMoveHandler: function (evt) {
        if (evt.dragging) {
            return;
        }
   
        var helpMsg = '单击开始绘制';

        if (com_disMeasure.sketch) {
            var geom = (com_disMeasure.sketch.getGeometry());
            if (geom instanceof ol.geom.LineString) {
            helpMsg = '继续点击进行绘制';
            }
        }

        com_disMeasure.helpTooltipElement.innerHTML = helpMsg;
        com_disMeasure.helpTooltip.setPosition(evt.coordinate);
        com_disMeasure.helpTooltipElement.classList.remove('hidden');
    },
    addInteraction: function () {
        var type = 'LineString';
        var that  = this;
        var draw = new ol.interaction.Draw({
            source: that.measureSource,
            type:  (type),
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(255, 204, 51, 0.5)',
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
        this.draw = draw;
    },
    createMeasureTooltip: function () {
        if (this.measureTooltipElement) {
            this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement);
        }
        var measureTooltipElement = document.createElement('div')
        measureTooltipElement.className = 'tooltip tooltip-measure'
        var measureTooltip = new ol.Overlay({
            element: measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        map.addOverlay(measureTooltip);
        this.measureTooltip = measureTooltip;
        this.measureTooltipElement = measureTooltipElement;
    },
    createHelpTooltip: function () {
        if (this.helpTooltipElement) {
            this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
        }
        var helpTooltipElement = document.createElement('div');
        helpTooltipElement.className = 'tooltip hidden';
        helpTooltip = new ol.Overlay({
            element: helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        map.addOverlay(helpTooltip);
        this.helpTooltipElement = helpTooltipElement;
        this.helpTooltip = helpTooltip;
    },
    addMeasureListen: function () {
        var listener;
        var that = this;
        this.draw.on('drawstart',
            function (evt) {
                // set sketch
                that.sketch = evt.feature;
              
                var tooltipCoord = evt.coordinate;
                listener = that.sketch.getGeometry().on('change', function (evt) {
                    var geom = evt.target;
                    var output;
                    if (geom instanceof ol.geom.LineString) {
                        output = that.formatLength(geom);
                        tooltipCoord = geom.getLastCoordinate();
                    }
                    that.measureTooltipElement.innerHTML = output;
                    that.measureTooltip.setPosition(tooltipCoord);
            });
        }, this);
        this.draw.on('drawend',
            function () {
                that.measureTooltipElement.className = 'tooltip tooltip-static';
                that.measureTooltip.setOffset([0, -7]);
                // unset sketch
                that.sketch = null;
                // unset tooltip so that a new one can be created
                that.measureTooltipElement = null;
                that.createMeasureTooltip();
                ol.Observable.unByKey(listener);
        }, this);
    }, 
    formatLength: function (line) {
        var length;
        var edsLength;
        var coordinates = line.getCoordinates();
        length = 0;
        edsLength = 0;
        var sourceProj = map.getView().getProjection();
        for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
            var c1 = ol.proj.transform((coordinates[i]), sourceProj, 'EPSG:4326');
            var c2 = ol.proj.transform((coordinates[i + 1]), sourceProj, 'EPSG:4326');
            length += this.wgs84Sphere.haversineDistance(c1, c2);

            var edsc1 = ol.proj.transform(MapManger.rat_ori(coordinates[i]), sourceProj, 'EPSG:4326');
            var edsc2 = ol.proj.transform(MapManger.rat_ori(coordinates[i + 1]), sourceProj, 'EPSG:4326');
            edsLength += this.wgs84Sphere.haversineDistance(edsc1, edsc2);
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
    }
}

com_disMeasure.init();

// module.exports = com_disMeasure;