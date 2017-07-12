var com_popup = {
    overlay: null,
    content: null,
    initialized: false,
    popup: null,
    init: function () {
        var container = document.getElementById('feature-popup');
        this.content = document.getElementById('feature-popup-content');
        var closer = document.getElementById('feature-popup-closer');
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
        this.popup = container;
        this.initialized = true;
    },

    show: function (coordinate, innerHTML) {
        if(!this.initialized)
            this.init(); 
        this.content.innerHTML = innerHTML;
        this.overlay.setPosition(coordinate);
        this.popup.style.display = 'block'
    }       

}

// module.exports = com_popup;

