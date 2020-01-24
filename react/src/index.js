import getRoutes from "./Routes";

let harnessApi = {};

function setHarnessApi(api) {
    harnessApi = api;
}

export {
    getRoutes,
    setHarnessApi,
    harnessApi
};