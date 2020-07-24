(function jjjjddddhhhhaaaacccckkkk() {
    const jdBookHackKey = "hoho-jd-book-hack";

    // 删除监听事件
    function cRemoveListener(el, option) {
        if (!el || !option) {
            return;
        }
        el.removeEventListener(option.type, option.listener, option.useCapture || false);
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
        styleEl.textContent = `
                /*  允许选择 */
                * {
                        user-select: auto !important;
                  }

                  /*  pre 节点样式 */
                  pre.pre-hacked {
                      margin:0;
                      padding:0;
                      border:none
                  }

                  .page_container.page_container{
                      height: auto !important;
                      overflow: hidden;
                  }

                   /* code 正常布局后，会导致单个Page边长  */
                  .JD_page.JD_page{
                    overflow: auto; 
                    height: auto !important;
                    padding-bottom: 20px;
                  }
                `
        document.body.append(styleEl);

    }

    // 创建节点
    function createElement(tagName) {
        const el = document.createElement(tagName);
        return el;
    }

    // 包裹code节点
    function adoptCodeNode(el) {
        if (!el || el.tagName !== "CODE") return;

        const parent = el.parentElement;
        // 节点前插入
        const preElement = createElement("pre");
        preElement.classList.add("pre-hacked");
        parent.insertBefore(preElement, el);
        // 导入节点
        preElement.appendChild(el);
        el.classList.add("code-hacked");
    };

    function adoptAllCodes() {
        const codesEls = Array.from(document.querySelectorAll("code[id]:not(.code-hacked) "));
        for (let i = codesEls.length - 1; i >= 0; i--) {
            adoptCodeNode(codesEls[i]);
        }
    }


    // 监听高度变化
    // https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver
    function hackLoadmore() {
        const targetNode = document.scrollingElement;

        // 观察器的配置（需要观察什么变动）
        const config = { childList: true, subtree: true };

        let preScrollHeight = targetNode.scrollHeight;
        // 当观察到变动时执行的回调函数
        const callback = function (mutationsList, observer) {
            // Use traditional 'for loops' for IE 11
            console.log("MutationObserver");
            for (let mutation of mutationsList) {
                if (mutation.type !== 'childList') {
                    return;
                }
                const scollHeight = targetNode.scrollHeight
                if (scollHeight == preScrollHeight) {
                    return;
                }
                preScrollHeight = scollHeight;
                setTimeout(() => {
                    adoptAllCodes();
                }, 2000)
            }

        };

        // 创建一个观察器实例并传入回调函数
        const observer = new MutationObserver(callback);

        // 以上述配置开始观察目标节点
        observer.observe(targetNode, config);
    }


    function hackhackhack() {

        if (window[jdBookHackKey]) {
            console.log("已经修复，无需再修复");
            return;
        }
        window[jdBookHackKey] = true;

        // 创建style节点
        createHackStyle();

        // 允许 ctl + c 复制
        // document.body keydown 事件
        cRemoveListeners(document, "keydown");


        // 允许右键
        // document.body contextmenu 事件
        cRemoveListeners(document, "contextmenu");

        // 调整code节点
        adoptAllCodes();

        // 页面加载更多内容时
        setTimeout(() => {
            hackLoadmore();
        }, 0)

    }

    hackhackhack();

})()

