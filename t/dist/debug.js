function debug_locate() {
    var queryStr = $('#locate_string').val().trim();
    if (queryStr === '') return;
    var ary = queryStr.split(',');
    if(ary.length < 3)  return;
    var lon = Number(ary[0]), lat = Number(ary[1]), zoom = Number(ary[2]);
    api.ExLocate(lon, lat, zoom);
}

function debug_addIcon() {
    var center  = map.getView().getCenter(),
        picUrl = 'data/icon.png';
    var propsObj = {
        NAME : '名称',
        JID: 'ID',
        ADDRESS: '地址'
    }
    api.ExAddIcon(center[0], center[1], picUrl, propsObj);
}

function debug_addLabel() {
    var center = map.getView().getCenter()
        labelTxt = '测试文本';
    api.ExAddLabel(center[0], center[1], labelTxt);
}

$("[name='switch-checkbox']").bootstrapSwitch();
$('input[name="switch-checkbox"]').on('switchChange.bootstrapSwitch', function(event, state) {
    if(this.id === 'debug_mark'){
        state? api.ActiveMark() : api.DeactiveMark();
    }
    if(this.id === 'debug_measureDis'){
        state? api.ActiveMeasureDis() : api.DeactiveMeasureDis();
    }
});

function debug_addLayer() {
    var layerName = '测试图层';
    var addResult = api.AddLayer(layerName);
    if(addResult)
        alert(layerName + ' 自定义图层添加成功')
}

function debug_addImageOnLayer() {
    var layerName = '测试图层';
    var center = map.getView().getCenter();
    api.AddImageOnLayer(layerName, center[0], center[1]);
}

function debug_hideLayer() {
    var layerName = '测试图层'
    api.HideLayer(layerName)
}

function debug_showLayer() {
    var layerName = '测试图层'
    api.ShowLayer(layerName)
}

function debug_removeLayer() {
    var layerName = '测试图层'
    api.RemoveLayer(layerName)
}

function debug_addLabelOnLayer() {
    var layerName = '测试图层'
    var center = map.getView().getCenter();
    api.AddLabelOnLayer(layerName, center[0], center[1], '搜狐大厦')
}

function debug_hideLabelOnLayer() {
    var layerName = '测试图层'
    api.HideLabelOnLayer(layerName)
}

function debug_showLabelOnLayer() {
    var layerName = '测试图层'
    api.ShowLabelOnLayer(layerName)
}

function debug_query() {
    var queryStr = $('#query_string').val().trim();
    if (queryStr === '') {
        return;
    }
    queryStr += '*';
    api.WfsQuery(queryStr);
}

function debug_registFeaturSingleClick() {
    api.RegistFeaturSingleClick();
}

function debug_registFeatureDoubleClick() {
    api.RegistFeatureDoubleClick();
}

// 轨迹回放接口测试
function debug_trackReplay() {
    var data = ""; //测试数据
}
