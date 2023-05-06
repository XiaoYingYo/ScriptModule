```text
English: Please note that whether you are a grease monkey script or any form of Js code injection
please uniformly get the window of the web page context, not the window in the grease monkey script
Only by supporting Fetch
中文: 请注意无论您是油猴脚本还是任何形式的 Js 代码注入形式
请统一获取到网页上下文的window,而非在油猴脚本中的window
仅支持 Fetch
```
```JavaScript
var win = window.unsafeWindow || document.defaultView || window;
```
```text
FetchCallback : { add , del }
add: (pathname, callback) -> return index
... pathname 
...... English: Path Of Webpage, Does Not Need To Contain The Domain Name
Does Not Need To Contain The Get Parameters, Must Start With /
...... Chinese: 网页路径 无需包含域名 无需包含Get参数 必须以 / 开头
... callback : (_object, period)
...... _object -> (args,text)
...... period -> preRequest / done
del: (pathname, index) -> return true / false
```
```JavaScript
let index = win['__hookRequest__'].FetchCallback.add('/api/auth/session', (_object, period) => {
    if (period === 'preRequest') { 
        // 中文: 读取请求参数或尝试修改请求参数 _object.args
        // English: Read the request parameters or try to modify the request parameters _object.args
    }else if(period === 'done'){
        // 中文: 读取响应体或尝试修改响应体 _object.text
        // English: Read the response body or try to modify the response body _object.text
    }
    // 中文: 如果有修改请返回修改后的 _object
    // 否则可不写 return 或 return null
    // English: If there is a modification, please return the modified _object,
    // otherwise you can not write return or return null
    return _object;
});
```
```text
Delete
```
```JavaScript
win['__hookRequest__'].FetchCallback.del('/api/auth/session', index);
```
```text
中文:使用到的脚本
English: Scripts Used

https://greasyfork.org/zh-CN/scripts/464781-pikpak-enhance
```