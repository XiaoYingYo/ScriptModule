```text
Sample Code
```
```JavaScript
//Please note that whether you are a grease monkey script or any form of Js code injection, please uniformly get the window of the web page context, not the window in the grease monkey script
//请注意无论您是油猴脚本还是任何形式的 Js 代码注入形式,请统一获取到网页上下文的window,而非在油猴脚本中的window
var win = window.unsafeWindow || document.defaultView || window;
// FetchCallback : { add , del }
// add: (pathname, callback) -> return index
// ... pathname 
// ...... English: Path Of Webpage, Does Not Need To Contain The Domain Name, Does Not Need To Contain The Get Parameters, Must Start With /
// ...... Chinese: 网页路径 无需包含域名 无需包含Get参数 必须以 / 开头
// ... callback : (_object, period)
// ...... _object -> (args,text)
// ...... period -> preRequest / done
// del: (pathname, index) -> return true / false
let index = win['__hookRequest__'].FetchCallback.add('/api/auth/session', (_object, period) => {
    if (period !== 'done') { 
        return;
    }
});

// Delete
win['__hookRequest__'].FetchCallback.del('/api/auth/session', index);
```