(() => {
    var unsafeWindow = window.unsafeWindow || document.defaultView || window;
    if (unsafeWindow['__hookRequest__'] != null) { 
        return;
    }
    var globalVariable = new Map();
    var FetchMapList = new Map();
    var XhrMapList = new Map();

    function deliveryTask(callbackList, _object, period) {
        let newObject = _object;
        for (let i = 0; i < callbackList.length; i++) {
            let tempObject = null;
            try {
                tempObject = callbackList[i](newObject, period);
            } catch (e) {
                new Error(e);
            }
            if (tempObject == null) {
                continue;
            }
            newObject = tempObject;
        }
        return newObject;
    }

    function hookFetch() {
        const originalFetch = unsafeWindow.fetch;
        globalVariable.set('Fetch', originalFetch);
        unsafeWindow.fetch = (...args) => {
            let U = args[0];
            if (U.indexOf('http') == -1) {
                if (U[0] !== '/') {
                    let pathname = new URL(location.href).pathname;
                    U = pathname + U;
                }
                U = location.origin + U;
            }
            let apply = null;
            (() => {
                let url = new URL(U),
                    pathname = url.pathname,
                    callback = FetchMapList.get(pathname);
                if (callback == null) return;
                if (callback.length === 0) return;
                let newObject = deliveryTask(callback, { args }, 'preRequest');
                if (newObject && newObject.args) {
                    args = newObject.args;
                }
                apply = originalFetch.apply(this, args);
                apply.then((response) => {
                    let text = response.text,
                        json = response.json;
                    response.text = () => {
                        return text.apply(response).then((text) => {
                            let _object = deliveryTask(callback, { text, args }, 'done');
                            if (_object && _object.text) {
                                text = _object.text;
                            }
                            return text;
                        });
                    };
                    response.json = () => {
                        return json.apply(response).then((json) => {
                            let text = JSON.stringify(json);
                            return JSON.parse(deliveryTask(callback, { text, args }, 'done'));
                        });
                    };
                });
            })();
            if (apply == null) {
                apply = originalFetch.apply(this, args);
            }
            return apply;
        };
    }

    function hookXhr() {
        const XHRProxy = new Proxy(unsafeWindow.XMLHttpRequest, {
            construct(target, args) {
                const xhr = new target(...args);
                const originalOpen = xhr.open;
                const originalSend = xhr.send;
                xhr.open = function () {
                    return originalOpen.apply(xhr, arguments);
                };
                xhr.send = function () {
                    let o = function (args) { 
                        return originalSend.apply(xhr, args);
                    }
                    let args = arguments;
                    let U = xhr.responseURL;
                    if (U.indexOf('http') == -1) {
                        if (U[0] !== '/') {
                            let pathname = new URL(location.href).pathname;
                            U = pathname + U;
                        }
                        U = location.origin + U;
                    }
                    let pathname = new URL(U).pathname;
                    let callback = XhrMapList.get(pathname);
                    if (callback == null) return o(args);
                    if (callback.length === 0) return o(args);
                    let newObject = deliveryTask(callback, { args }, 'preRequest');
                    if (newObject && newObject.args) {
                        args = newObject.args;
                    }
                    const onReadyStateChangeOriginal = xhr.onreadystatechange;
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            let text = xhr.responseText;
                            let newObject = deliveryTask(callback, { text, args }, 'done');
                            if (newObject && newObject.text) {
                                xhr.responseText = newObject.text;
                            }
                        }
                        onReadyStateChangeOriginal && onReadyStateChangeOriginal.apply(xhr, args);
                    };
                    return o(args);
                };
                return xhr;
            }
        });
        unsafeWindow.XMLHttpRequest = XHRProxy;
    }

    hookFetch();
    hookXhr();

    unsafeWindow['__hookRequest__'] = {
        FetchCallback: {
            add: (pathname, callback) => {
                let list = FetchMapList.get(pathname) || (FetchMapList.set(pathname, []), FetchMapList.get(pathname));
                list.push(callback);
                let index = list.length;
                return index;
            },
            del: (pathname, index) => {
                let list = FetchMapList.get(pathname);
                if (list == null) return false;
                list.splice(index - 1, 1);
                return true;
            }
        },
        XhrCallback: {
            add: (pathname, callback) => {
                let list = XhrMapList.get(pathname) || (XhrMapList.set(pathname, []), XhrMapList.get(pathname));
                list.push(callback);
                let index = list.length;
                return index;
            },
            del: (pathname, index) => {
                let list = XhrMapList.get(pathname);
                if (list == null) return false;
                list.splice(index - 1, 1);
                return true;
            }
        },
        globalVariable: {
            get: (key) => {
                return globalVariable.get(key);
            },
            getAll: () => {
                return globalVariable.entries();
            },
            set: (key, value) => {
                globalVariable.set(key, value);
            },
            getOrDrfault: (key, defaultValue) => {
                return globalVariable.get(key) || defaultValue;
            }
        }
    };
})();
