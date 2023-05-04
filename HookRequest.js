(() => {
    var globalVariable = new Map();
    var unsafeWindow = window.unsafeWindow || document.defaultView || window;
    var FetchMapList = new Map();
    var XhrMapList = new Map();

    function hookFetch() {
        const originalFetch = unsafeWindow.fetch;
        globalVariable.set('Fetch', originalFetch);
        unsafeWindow.fetch = (...args) => {
            let apply = originalFetch.apply(this, args);
            let U = args[0];
            if (U.indexOf('http') == -1) {
                if (U[0] !== '/') {
                    let pathname = new URL(location.href).pathname;
                    U = pathname + U;
                }
                U = location.origin + U;
            }
            (() => {
                let url = new URL(U),
                    pathname = url.pathname,
                    callback = FetchMapList.get(pathname);
                if (callback == null) return;
                if (callback.length == 0) return;
                let deliveryTask = (callback, text) => {
                    let newText = text;
                    for (let i = 0; i < callback.length; i++) {
                        let tempText = null;
                        try {
                            tempText = callback[i](newText, args);
                        } catch (e) {
                            new Error(e);
                        }
                        if (tempText == null) { 
                            continue;
                        }
                        newText = tempText;
                    }
                    return newText;
                };
                apply.then((response) => {
                    let text = response.text,
                        json = response.json;
                    response.text = () => {
                        return text.apply(response).then((text) => {
                            return deliveryTask(callback, text);
                        });
                    };
                    response.json = () => {
                        return json.apply(response).then((json) => {
                            let text = JSON.stringify(json);
                            return JSON.parse(deliveryTask(callback, text));
                        });
                    };
                });
            })();
            return apply;
        };
    }

    function hookXhr() {
        const originalXhrOpen = unsafeWindow.XMLHttpRequest.prototype.open;
        const originalXhrSend = unsafeWindow.XMLHttpRequest.prototype.send;
        globalVariable.set('XhrOpen', originalXhrOpen);
        globalVariable.set('XhrSend', originalXhrSend);
        unsafeWindow.XMLHttpRequest.prototype.open = (...args) => {
        };
        unsafeWindow.XMLHttpRequest.prototype.send = (...args) => {
        };
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
