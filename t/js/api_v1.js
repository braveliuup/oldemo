// require('popup.js')
var api = {
    /** 
     * 单击要素事件处理
     * @param propObj 要素属性对象
     */
    registFeaturSingleClick: function (coordinate, propObj) {
        com_popup.show(coordinate, propObj);
    }, 
    /**
     * 双击要素事件处理
     * @param propObj 要属性对象
     */
    registFeatureDoubleClick: function (coordinate, propObj) {

    }
}