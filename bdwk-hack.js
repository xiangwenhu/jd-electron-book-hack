// https://wkstatic.bdimg.com/static/wkview/pkg/xreaderview_eb47b63.js
(function hack() {
    const HACK_KEY = "bd-wk-hack";

    // 删除监听事件
    function cRemoveListener(el, option) {
        if (!el || !option) {
            return;
        }
        el.removeEventListener(option.type, option.listener, false);
        el.removeEventListener(option.type, option.listener, true);
    }

    // 删除指定的监听事件
    function cRemoveListeners(el, eventName) {
        var allListeners = getEventListeners(el);
        var listeners = allListeners[eventName];
        if (listeners && listeners.length > 0) {
            for (let i = listeners.length - 1; i >= 0; i--) {
                const lsOption = listeners[i];
                cRemoveListener(el, lsOption);
            }
        }
    }

    function createHackStyle() {
        // 允许选择
        var styleEl = document.createElement("style");
        styleEl.textContent = ``
        document.body.append(styleEl);
    }




    const docReaderEl = document.querySelector(".doc-reader")
    const xReaderEl = document.querySelector(".reader-container.xreader");
    function hackhackhack() {

        if (window[HACK_KEY]) {
            console.log("已经修复，无需再修复");
            return;
        }
        // window[HACK_KEY] = true;

        // 创建style节点
        createHackStyle();

        // 允许 ctl + c 复制, + 右键允许复制
        cRemoveListeners(docReaderEl, "copy");
        cRemoveListeners(xReaderEl, "copy");
        docReaderEl.oncopy = function () { return true };


        // 去掉百度自己的操作悬浮选项
        cRemoveListeners(xReaderEl, "mouseup");    

    }

    hackhackhack();

})()

