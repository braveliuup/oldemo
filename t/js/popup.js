var com_popup = {
    overlay: null,
    content: null,
    initialized: false,
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
        this.overlay = overlay;
        this.initialized = true;
    },

    show: function (coordinate, innerHTML) {
        if(!this.initialized)
            this.init(); 
        this.content.innerHTML = innerHTML;
        this.overlay.setPosition(coordinate);
    }
}