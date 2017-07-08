// 要素单击事件
map.on('singleclick', function (evt) {
    if (map.measureActivated || map.markActivated) {
        alert('你正处于激活标绘状态，请先关闭标绘状态')
        return;
    }
    var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        return feature;
    });
    if (feature) {
        var propObj = feature.getProperties();
        _log.info(propObj);
        var copyObj = _propObjCopy(propObj);
        if(api.registFeaturSingleClick)
            api.registFeaturSingleClick(evt.coordinate, copyObj)
    }
});
// 要素双击事件
map.on('dblclick', function (evt) {
    if (map.measureActivated || map.markActivated) {
        alert('你正处于激活标绘状态，请先关闭标绘状态')
        return;
    }
    var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        return feature;
    });
    if (feature) {
        var propObj = feature.getProperties();
        var copyObj = _propObjCopy(propObj);
        if(api.registFeaturDoubleClick)
            api.registFeaturDoubleClick(evt.coordinate, copyObj)
    }
});

function _propObjCopy(source) {
    var result={};
    for (var key in source) {
        if(typeof source[key] === 'object')
            continue;
        result[key] = source[key];
    } 
    return result; 
}


