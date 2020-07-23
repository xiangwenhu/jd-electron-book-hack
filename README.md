
京东有电子书可以购买，可以多端阅读。比如PC客户端，移动端，以及本文提到的**PC网站端**。

先换个镜头，读书要记笔记（电子版本）， 方便以后查阅。

镜头换回来，但是，我们为了方便肯定是想复制，下载啊，分享啊等，但是服务商一般是不允许你这么做的。

我了，在京东买了几本书，程序相关的，为了获取好的体验，在**PC网站端**阅读， 发现精彩之处，想去复制到笔记里面去。

结果，呵呵哒，结果连选中都不让。

更关键的是，这代码部分的显示是这样的。 辣眼睛啊。
![](https://img2020.cnblogs.com/blog/1097840/202007/1097840-20200723150703315-1770373657.png)



所以，我打算hack一些，提升阅读体验。

1. 允许选中
2. 允许快捷复制， Control + C
3. 允许右键复制
4. 美化代码


经过网页的内容和节点分析，京东电子书PC网站端，是采用普通的div, p ,code等html标签，而不是pdf的插件或者canvas等。
那么我就有信心把你搞得面目全非，错了，服服帖帖。

### 1. 允许选中

#### 原理
是通过在div上的style `user-select: none` 来实现的 
```
<div class="JD_page" style="width: 675px;overflow: hidden;height: 100%;float: left;background-color: rgb(240, 240, 240);margin-top: 5px;font-size: 16px;/* user-select: none; */z-index: 0;" ... >....</div>
```
#### 方案
那么就好办了，音乐起。为了省去麻烦，来个暴力模式。
```css
* {
    user-select: auto !important;
 }
```
之后，就是创建一个style的标签，写入样式，挂载到head或者body里面就ok拉。


### 2. 允许快捷复制

#### 原理：
拦截keydown，让你的键盘事件失灵。

#### 方案：

1. F12手动删除注册keydown的事件
2. 代码删除注册keydown的事件 

这里采用2方案，问题来了，如何找到某个元素注册的事件。
chrome 控制台提供了一个 getEventListeners的方法，有那味了，战歌起:
```js
    // 删除监听事件
    function cRemoveListener(el, option) {
        if (!el || !option) {
            return;
        }
        el.removeEventListener(option.type, option.listener, option.useCapture || false);
    }

    // 删除指定的监听事件
    function cRemoveListeners(el, eventName) {
        var allListeners = getEventListeners(document);
        var listeners = allListeners[eventName];
        if (listeners && listeners.length > 0) {
            for (let i = listeners.length - 1; i >= 0; i--) {
                const lsOption = listeners[i];
                cRemoveListener(el, lsOption);
            }
        }
    }

    // 允许 ctl + c 复制
    // document.body keydown 事件
    cRemoveListeners(document, "keydown");
```


### 3. 允许右键复制
#### 原理
右键菜单一般都是通过contextmenu事件，所以同上
#### 方案
同允许快捷复制
```
    // 允许右键
    // document.body contextmenu 事件
    cRemoveListeners(document, "contextmenu");
```

### 4. 美化代码
#### 原理
京东电子书，是对代码部分使用code标签来展示的。

#### 方案
为了保持断行，只需要使用pre标签来包裹一下。
**简单的包裹会产生两个问题**

1. 包裹一下后，代码占据的页面内容会变长，而京东电子书这块，限定了一个页面的高度为900px,超过部分隐藏。
所以，我们在使用pre包裹code节点的同事，还需要调整页面块这里的样式。 
2. 电子是采取的分页加载，在分页加载之后，我们需要对新生成的code标签进行包裹。
   

包裹code元素的思路
1. 选择出所有带id的code节点（经过观察，code节点分两类，一类是有id标签，一类是没有，简单说就是对应markdown里面的 \`\`\` 和 \`）
2. 找到每个code节点的父节点
3. 创建pre节点
4. 插入pre节点到code节点之前
5. code节点 挂载到 pre下
6. code添加code-hacked class，标签已经被hacked，避免重复被hacked

战歌起，上代码
```js
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
        const codesEls = Array.from(document.querySelectorAll("code[id]:not(.code-hacked)"));
        for (let i = codesEls.length - 1; i >= 0; i--) {
            adoptCodeNode(codesEls[i]);
        }
    }

    adoptAllCodes();

```

分页加载后的想到的方案
1. 可以起个定时器，几秒处理一下
2. 监听document.scrollingElement(document.body)的高度变化
3. 监听document.scrollingElement(document.body)的scroll事件
4. 采用MutationObserver监听子节点是否有变化
5. 拦截分页数据的HTTP请求
6. 拦截执行滚动加载的事件

第一种方式简单粗暴，其实我很喜欢。
第二种方式不太好实现，分页加载后，window本身没有触发resize事件，window外的节点本身没有监听resize的能力（IE除外），当然可以通过 [节点resize监听](https://xiangwenhu.github.io/TakeItEasy/resize/), 但是高度的变化依旧没法。
第三种方式，倒是可行，不过scroll事件触发频率很高，当然可以节流，也还不错。
第四种 ，可行性高，PC兼容性行也不错，性能也相对好一点。
第五种， 代码复杂度会高一些。


战歌起：
```js

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

```

到此为止，四个hack都解释完毕，来一份完整的代码：
```js
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
        var allListeners = getEventListeners(document);
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

```


基本的问题都解决了，上图。

 ![](https://img2020.cnblogs.com/blog/1097840/202007/1097840-20200723150727609-161705305.jpg)


 上图可以看到
 * 代码已经格式化
 * 可以右键选择
  当然ctrl + c这种效果用截图是表达不出来的，得视频，但是木有。

![](https://img2020.cnblogs.com/blog/1097840/202007/1097840-20200723150734474-1737488262.png)


上图，可以看到，因为代码被格式化，页面边长，但是内容都已经能完整显示。



最后，感谢大家的阅读，也希望能帮助到大家。

哦，忘了，怎么使用，还是截图。
![](https://img2020.cnblogs.com/blog/1097840/202007/1097840-20200723150743778-756167970.png)
