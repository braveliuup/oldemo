//require('log.js')
// 要素单击事件
map.on('singleclick', function (evt) {
    if (map.measureActivated || map.markActivated) {
        _log.info('自主标绘或测距已激活，要素暂不响应点击')
        return;
    }
    var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        return feature;
    });
    if (feature) {
        var propObj = feature.getProperties();
        _log.info(propObj);
        var copyObj = _propObjCopy(propObj);
        api.FeatureSingleClick(evt.coordinate, copyObj)
    }
});
// 要素双击事件
map.on('dblclick', function (evt) {
    if (map.measureActivated || map.markActivated) {
        _log.info('自主标绘或测距状态已激活，要素暂不响应点击')
        return;
    }
    var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
        return feature;
    });
    if (feature) {
        var propObj = feature.getProperties();
        var copyObj = _propObjCopy(propObj);
        api.FeatureDoubleClick(evt.coordinate, copyObj)
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


