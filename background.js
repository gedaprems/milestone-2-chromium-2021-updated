
 // format to format seconds function
 function formatSeconds(seconds) {
    if (seconds < 60) return seconds + ' s';
    else if (seconds < 3600) {
      var minutes = Math.floor(seconds / 60).toFixed(0);
      return '00:' + ((minutes > 9) ? minutes : '0' + minutes);
    } else {
      var hours = Math.floor(seconds / 3600).toFixed(0);
      var minutes = Math.floor((seconds - (hours * 3600)) / 60).toFixed(0);
      return hours + ':' + ((minutes > 9) ? minutes : '0' + minutes);
    }
  };
  // Byte format function 
  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' Bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + ' MB';
    else return (bytes / 1073741824).toFixed(3) + ' GB';
  }
  
  //main.js

  var timeoutId;
var previousCpuInfo;


function initInfo() {
   
  //Operating System info 
 if (/CrOS/.test(navigator.userAgent)) {
  console.log('Operating System :' +'Chrome OS');
} else if (/Mac/.test(navigator.platform)) {
  console.log('Operating System :' +'Mac OS');
} else if (/Win/.test(navigator.platform)) {
  console.log('Operating System :' +'Windows');
} else if (/Android/.test(navigator.userAgent)) {
  console.log('Operating System :' +'Android');
} else if (/Linux/.test(navigator.userAgent)) {
  console.log('Operating System :' +'Linux');
} else {
  console.log('-');
}

  //Chrome Version
console.log('Chrome Version :' +navigator.userAgent.match('Chrome/([0-9]*\.[0-9]*\.[0-9]*\.[0-9]*)')[1]);

console.log('Platform :' +navigator.platform.replace(/_/g, '-'));

console.log('Language :' +navigator.language);

chrome.i18n.getAcceptLanguages(function(languages) {
console.log('Languages :' +languages.join(', '));
});
}

function initBattery() {

    //Battery Status

  if (!navigator.getBattery) {
    console.log('Battery Status :' +'No battery');
  }else{
    navigator.getBattery().then(function(batteryManager) {
        updateBattery(batteryManager);
        function update(event) {
          updateBattery(event.target);
        }    
        batteryManager.onchargingchange = update;
        batteryManager.ondischargingtimechange = update;
        batteryManager.onchargingtimechange = update;
        batteryManager.onlevelchange = update;
      });
  } 
}

function updateBattery(batteryManager) {
    //Battery is charing or not
    if (batteryManager.charging) {
      console.log('Battery Status :' +chrome.i18n.getMessage('batteryChargingState'));
    } else {
      console.log('Battery Status :' +chrome.i18n.getMessage('batteryDischargingState'));
    }
        // Battery charging time
    if (batteryManager.charging) {
      console.log((batteryManager.chargingTime !== Infinity) ?
          formatSeconds(batteryManager.chargingTime) +
          chrome.i18n.getMessage('untilFullText') : '-');
    } else {
       console.log((batteryManager.dischargingTime !== Infinity) ?
          formatSeconds(batteryManager.dischargingTime) +
          chrome.i18n.getMessage('leftText') : '-');
    }

        // Battery level
    var batteryUsed = batteryManager.level.toFixed(2) * 100;
    console.log('Battery Left :' +batteryUsed+'% left');
}

/*
function updateStorage() {
  chrome.system.storage.getInfo(function(storageInfo) {
    if (storageInfo.length === 0) {
      console.log('No battery');
    }
    else{
      for (var i = 0; i < storageInfo.length; i++) {
        var storageUnitHtml =  storageInfo[i].name +
            (storageInfo[i].capacity ? ' - ' + formatBytes(storageInfo[i].capacity) : '');
        if (storageInfo[i].type === 'removable') {
          console.log('external: '+storageUnitHtml) ;
        } else {
          console.log('internal: '+storageUnitHtml) ;
        }
      }
    }
        
  });
}
*/


function initCpu() {
  chrome.system.cpu.getInfo(function(cpuInfo) {

    var cpuName = cpuInfo.modelName.replace(/\(R\)/g, '®').replace(/\(TM\)/, '™');
    console.log('CPU Name :' +cpuName);

    var cpuArch = cpuInfo.archName.replace(/_/g, '-');
    console.log('CPU Architecture :' +cpuArch );

    var cpuFeatures = cpuInfo.features.join(', ').toUpperCase().replace(/_/g, '.') || '-';
    console.log('CPU Features :' +cpuFeatures);
    
    console.log('Total number of Processors :'+ cpuInfo.numOfProcessors);
  });
}



function updateCpuUsage() {
  chrome.system.cpu.getInfo(function(cpuInfo) {

    for (var i = 0; i < cpuInfo.numOfProcessors; i++) {
        var usage = cpuInfo.processors[i].usage;
        var usedSectionWidth = 0;
      if (previousCpuInfo) {
        var oldUsage = previousCpuInfo.processors[i].usage;
        usedSectionWidth = Math.floor((usage.kernel + usage.user - oldUsage.kernel - oldUsage.user) / (usage.total - oldUsage.total) * 100);
      } else {
        usedSectionWidth = Math.floor((usage.kernel + usage.user) / usage.total * 100);
      }
      console.log('Cpu Processor '+i+' Usage :'+usedSectionWidth);
    }
    previousCpuInfo = cpuInfo;
  });
}




function initMemory() {
  chrome.system.memory.getInfo(function(memoryInfo) {

    console.log('Memory capicity : ' + formatBytes(memoryInfo.capacity));
  });
}

function updateMemoryUsage() {
  chrome.system.memory.getInfo(function(memoryInfo) {

    var usedMemory = 100 - Math.round(memoryInfo.availableCapacity / memoryInfo.capacity * 100);
    console.log('Used Memory : '+ usedMemory + '%' );
  });
};


function updateAll() {
  updateCpuUsage();
  updateMemoryUsage();
  //updateStorage();

  timeoutId = setTimeout(updateAll, 30000);
}

chrome.runtime.onSuspend.addListener(function() {
  clearTimeout(timeoutId);
});

chrome.runtime.onSuspendCanceled.addListener(function() {
  updateAll();
});

  
  initInfo();
  initCpu();
  initBattery();
  initMemory();
  updateAll();

