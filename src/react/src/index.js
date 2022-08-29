import getRoutes from "./Routes";

let harnessApi = null;
let project = null;
let isGWLab = null;
let isGWLandscape = null;
let isGWCloud = null;

function setHarnessApi(api) {
    harnessApi = api;
    project = harnessApi.currentProject();
    isGWLab = project.name === 'GWLab';
    isGWLandscape = project.name === 'GWLandscape';
    isGWCloud = project.name === 'GWCloud';
}

export {
    getRoutes,
    setHarnessApi,
    harnessApi,
    isGWLab,
    isGWLandscape,
    isGWCloud
};
