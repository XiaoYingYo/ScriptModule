(() => {
    var globalVariable = new Map();
    var unsafeWindow = document.defaultView;
    var FetchMapList = new Map();

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
                    for (let i = 0; i < callback.length; i++) {
                        try {
                            callback[i](text);
                        } catch (e) {
                            new Error(e);
                        }
                    }
                };
                apply.then((response) => {
                    let text = response.text,
                        json = response.json;
                    response.text = () => {
                        return text.apply(response).then((text) => {
                            deliveryTask(callback, text);
                            return text;
                        });
                    };
                    response.json = () => {
                        return json.apply(response).then((json) => {
                            let text = JSON.stringify(json);
                            deliveryTask(callback, text);
                            return json;
                        });
                    };
                });
            })();
            return apply;
        };
    }

    hookFetch();

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
