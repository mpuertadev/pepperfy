let saveMockVariableName = "save_mock";
let mockVariableName = "mock";
let mockToolUrl;

document.getElementById("mock-name").focus()
const mockNameInput = document.getElementById("mock-name")
const previousMockName = localStorage.getItem("previousMockName")
!previousMockName ? "" : mockNameInput.value = previousMockName;

const mockVariableNamesLocalStorage = localStorage.getItem("variableNames");
if(mockVariableNamesLocalStorage){
  const [ saveMockVarName, mockVarName, mockToolRedirectUrl ] = mockVariableNamesLocalStorage.split("*");
  saveMockVariableName = saveMockVarName;
  mockVariableName = mockVarName;
  mockToolUrl = mockToolRedirectUrl;
} else {
  getCurrentTabUrl(function(url) {
    mockToolUrl = `${getHost(url)}/mocky_tool`;
  });
}
localStorage.getItem("tab") == "config" ? editConfig() : returnHome();

mockNameInput.addEventListener("input", function() {
  localStorage.setItem("previousMockName", mockNameInput.value);
});

const clearMockBtn = document.getElementById("clearMock");
clearMockBtn.addEventListener('click', clearCurrentMockFromUrl, false);

function clearCurrentMockFromUrl(){
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentUrl = tabs[0].url;
    let parts = currentUrl.split("?");
    let urlWithoutQueryParam = parts[0];

    if (parts.length > 1 && currentUrl.includes(`${mockVariableName}=`)) {
      let queryParams = parts[1].split("&");
      let filteredParams = queryParams.filter(param => !param.startsWith(`${mockVariableName}=`));
      if (filteredParams.length > 0) {
        urlWithoutQueryParam += `?${filteredParams.join("&")}`;
      }
    }
    chrome.tabs.update({ url: urlWithoutQueryParam });
    showToast("success", "Variable de mock borrada de la url!")
  });
}

const createMockBtn = document.getElementById("createMock");
createMockBtn.addEventListener('click', validateMockValueAndMock, false);
function validateMockValueAndMock() {
  const mockNameBox = document.getElementById("mock-name");
  const mockName = replaceSpacesWithUnderscores(mockNameBox.value);
  const pageType = selectedPageType().toLowerCase();
  if (!mockName || pageType == 'none' ){
    return showToast("error", "Escribe un nombre para el mock!");
  }
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentUrl = tabs[0].url;
    const mockedUrl = buildMockUrls(currentUrl, mockName)
    if (!mockedUrl.length) return;
    chrome.tabs.update(tabs[0].id, { url: mockedUrl[0] });
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (info.status === 'complete' && tabId === tabs[0].id) {
        chrome.tabs.update(tabs[0].id, { url: mockedUrl[1] });
        chrome.tabs.onUpdated.removeListener(listener);
        chrome.tabs.create({ url: `${mockToolUrl}/${pageType}/${mockName}/`, active: false });
        mockNameBox.value = "";
        localStorage.setItem("previousMockName", "");
        showToast("success", "Mock creado!")
      }
    });
  });
}

function selectedPageType(){
  const isPlpChecked = document.getElementById("plpchecker").checked;
  const isPdpChecked = document.getElementById("pdpchecker").checked;

  if (isPlpChecked || isPdpChecked ){
    return isPlpChecked ? 'PLP' : 'PDP';
  }
  return 'none';
}

function buildMockUrls(currentUrl, mockName){
  const hasQueryString = currentUrl.indexOf('?') == -1 ? false : true;
  const isMockUrl = currentUrl.indexOf('mockName') == -1 ? false : true;
  const mockUrls = [];
  if (!isMockUrl){
    if (hasQueryString){
      mockUrls.push(`${currentUrl}&${saveMockVariableName}=${mockName}`)
      mockUrls.push(`${currentUrl}&${mockVariableName}=${mockName}`)
    } else {
      mockUrls.push(`${currentUrl}?${saveMockVariableName}=${mockName}`)
      mockUrls.push(`${currentUrl}?${mockVariableName}=${mockName}`)
    }
  }
  return mockUrls;
}

function replaceSpacesWithUnderscores(str) {
  if (str.includes(" ")) {
    return str.replace(/ /g, "_");
  }
  return str;
}

function getHost(url) {
  const parsedUrl = new URL(url);
  const port = parsedUrl.port ? `:${parsedUrl.port}` : ''
  const host = `${parsedUrl.protocol}//${parsedUrl.hostname}${port}`
  return host
}

function getCurrentTabUrl(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var currentUrl = tabs[0].url;
    callback(currentUrl);
  });
}

function showToast(type, message){
  const element = document.getElementById("toast")
  element.innerHTML = message;
  element.classList.add("on");   
  element.classList.add(type); 
  setTimeout(() => {
      element.classList.remove("on"); 
      element.classList.add(type);
      element.classList.remove(type);
  }, "3000")
}

const saveSettingsBtn = document.getElementById("save");
saveSettingsBtn.addEventListener('click', saveConfiguration, false);

const resetConfiguration = document.getElementById("reset-config");
resetConfiguration.addEventListener('click', resetConfig, false);

function saveConfiguration(){
  const saveVariableName = document.getElementById("save-variable-name").value;
  const mock = document.getElementById("mock-variable-name").value;
  const mockTool = document.getElementById("mock-tool-url").value;
  saveMockVariableName = saveVariableName;
  mockVariableName = mock 
  mockToolUrl = mockTool
  localStorage.setItem("variableNames", `${saveMockVariableName}*${mockVariableName}*${mockToolUrl}`);
  showToast("success", "Configuración guardada")
}

function resetConfig(){
  saveMockVariableName = "save_mock";
  mockVariableName = "mock";
  getCurrentTabUrl(function(url) {
    mockToolUrl = `${getHost(url)}/mocky_tool`;
  });
  localStorage.setItem("variableNames", `${saveMockVariableName}*${mockVariableName}*${mockToolUrl}`);
  document.getElementById("save-variable-name").value = saveMockVariableName;
  document.getElementById("mock-variable-name").value = mockVariableName;
  document.getElementById("mock-tool-url").value = mockToolUrl;
  showToast("success", "Configuración guardada")
}

const openSettingsBtn = document.getElementById("config");
openSettingsBtn.addEventListener('click', editConfig, false);

const returnHomeBtn = document.getElementById("home");
returnHomeBtn.addEventListener('click', returnHome, false);

function returnHome(){
  const settingsPage = document.getElementById("settings")
  const homePage = document.getElementById("new-mock")
  settingsPage.classList.add("hidden")
  homePage.classList.remove("hidden")
  localStorage.setItem("tab", "home");
}

function editConfig(){
  const settingsPage = document.getElementById("settings");
  const homePage = document.getElementById("new-mock");
  settingsPage.classList.remove("hidden");
  homePage.classList.add("hidden");
  localStorage.setItem("tab", "config");
  document.getElementById("save-variable-name").value = saveMockVariableName;
  document.getElementById("mock-variable-name").value = mockVariableName;
  document.getElementById("mock-tool-url").value = mockToolUrl;
}
