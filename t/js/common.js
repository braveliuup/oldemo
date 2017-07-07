/// <reference path="jquery-2.1.4.min.js" />

//缓存加载JS
var scriptsArray = new Array();
$.cachedScript = function (url, options) {
    for (var s in scriptsArray) {
        if (scriptsArray[s] == url) {
            return {
                done: function (method) {
                    if (typeof method == 'function') {
                        method();
                    }
                }
            }
        }
    };
    options = $.extend(options || {}, {
        dataType: 'script',
        cache: true,
        url: url
    });
    scriptsArray.push(url);
    return $.ajax(options);
};

//初始化JS文件
// $(function () {
//     $.getScript("js/config.js", function () {
//         $.getScript("js/mapHelper.js", function () {
//             $.getScript("js/init.js", function (data, textStatus, jqxhr) {
//                 $.getScript("js/api.js", function () {
                    
//                 });
//             });
//         });
//     });
// });



