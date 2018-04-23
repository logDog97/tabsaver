/*Helper methods */

function quickSave(){      
    chrome.storage.sync.clear();
    var tabList = document.getElementsByName('tabsOpen');
    var tabArr = [];
    for(var i = 0; i < tabList.length; i++){
        if(tabList[i].checked) tabArr.push(tabList[i].value);
    }   
    chrome.storage.sync.set({'QuickSave':tabArr});
}

function populateStates(){  
    var tabList = document.getElementById('tabList');
    chrome.windows.getAll({populate:true}, function(windows){
        windows.forEach(function(window){
            window.tabs.forEach(function(tab){
                var label = document.createElement('label');    
                label.setAttribute("class", "btn btn-secondary active");
                var inputBox = document.createElement('input');
                inputBox.setAttribute("type", "checkbox");
                inputBox.setAttribute("autocomplete", "off");
                inputBox.setAttribute("name", "tabsOpen");
                inputBox.setAttribute("checked","");
                inputBox.setAttribute("value", tab.url);
                label.innerHTML = tab.title;

                label.appendChild(inputBox);
                tabList.appendChild(label);
            });
        });
    });
}

function quickLoad(){
    chrome.storage.sync.get("QuickSave", function(loadArr){
        loadArr["QuickSave"].forEach(function(urlEl){
            chrome.tabs.create({url:urlEl});
        });
    });
}

function clearTabs(){
    chrome.windows.getAll({populate:true}, function(windows){
        windows.forEach(function(window){
            window.tabs.forEach(function(tab){
                chrome.tabs.remove(tab.id);
            });
        });
    });
    chrome.tabs.create({});
}

function saveCurrentSession(){
    var tabList = document.getElementsByName('tabsOpen');
    var sessionName = document.getElementById('saveName').value;
    var tabArr = [];
    for(var i = 0; i < tabList.length; i++){
        if(tabList[i].checked) tabArr.push(tabList[i].value);
    }
    var entry = {};
    entry[sessionName] = tabArr;   
    chrome.storage.sync.set(entry);
    refreshSessions(sessionName);
    //console.log(sessionName + " saved");
}

function refreshSessions(sessionName){
    var sessionList = document.getElementById('sessionList');
    chrome.storage.sync.get(sessionName, function(data){
        var newEntry = Object.keys(data)[0];
        var label = document.createElement('label');
        label.setAttribute("class", "btn btn-secondary");
        var inputBox = document.createElement('input');
        inputBox.setAttribute("type", "radio");
        inputBox.setAttribute("autocomplete", "off");
        inputBox.setAttribute("name", "sessions");
        inputBox.setAttribute("value", newEntry);
        label.innerHTML = newEntry;

        label.appendChild(inputBox);
        sessionList.appendChild(label);
    })
}

function populateSessions(){
    var sessionList = document.getElementById('sessionList');
    while(sessionList.firstChild){
        sessionList.removeChild(sessionList.firstChild);
    }
    chrome.storage.sync.get(null, function(data){
        var sessionsArray = Object.keys(data);
        var putActive = true;
        for(var keyNo in sessionsArray){  //Object.keys() returns Array of keys
            if(sessionsArray[keyNo] != "QuickSave"){
                var label = document.createElement('label');    
                if(putActive){
                    label.setAttribute("class", "btn btn-secondary active");
                    putActive = false;
                }
                else label.setAttribute("class", "btn btn-secondary");
                var inputBox = document.createElement('input');
                inputBox.setAttribute("type", "radio");
                inputBox.setAttribute("autocomplete", "off");
                inputBox.setAttribute("name", "sessions");
                inputBox.setAttribute("value", sessionsArray[keyNo]);
                label.innerHTML = sessionsArray[keyNo];

                label.appendChild(inputBox);
                sessionList.appendChild(label);
            }
        }
        document.getElementsByName('sessions')[0].setAttribute("checked","");
    });
}

function loadSelectedSession(){
    var sessionsList = document.getElementsByName('sessions');
    var sessionName;
    for(var i = 0; i < sessionsList.length; i++){
        if(sessionsList[i].checked){
            sessionName = sessionsList[i].value;
            break;
        }
    }
    chrome.storage.sync.get(sessionName, function(loadArr){
        loadArr[sessionName].forEach(function(urlEl){
            chrome.tabs.create({url:urlEl});
        });
    });  
}

function deleteSelectedSession(){
    var sessionsList = document.getElementsByName('sessions');
    var sessionName;
    for(var i = 0; i < sessionsList.length; i++){
        if(sessionsList[i].checked){
            sessionName = sessionsList[i].value;
            break;
        }
    }
    chrome.storage.sync.get(sessionName, function(loadArr){
        chrome.storage.sync.remove(sessionName, function(){
            populateSessions();
        });
    });
}

/*Main extension */

populateStates();
populateSessions();

var getStates = document.getElementById('quickSaveState');
getStates.onclick = quickSave;

var loadState = document.getElementById('quickLoadState');
loadState.onclick = quickLoad;

var clear = document.getElementById('clearTabs');
clear.onclick = clearTabs;

var saveSession = document.getElementById('saveSession');
saveSession.onclick = saveCurrentSession;

var loadSession = document.getElementById('loadSession');
loadSession.onclick = loadSelectedSession;

var delSession = document.getElementById('deleteSession');
delSession.onclick = deleteSelectedSession;