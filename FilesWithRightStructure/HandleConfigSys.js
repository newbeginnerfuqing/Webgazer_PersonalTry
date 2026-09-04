//Configs
Config_Source = { "ExperimentConfig": "./Config/Json/ExperimentConfig.json", "PageConfig": "./Config/Json/PageConfig.json", "PicConfig": "./Config/Json/PicConfig.json" }
AllRawConfigs = {} //ExperimentConfig,  PageConfig,  PicConfig
AllConfigs = {} //ExperimentConfig,  PageConfig,  PicConfig


async function ReadTheConfigs() {
    for (const [cfgName, cfgAddress] of Object.entries(Config_Source)) {
        if (Object.hasOwn(AllRawConfigs, cfgName)) {
            continue;
        }

        var cfgFile = await fetch(cfgAddress);
        var cfg = await cfgFile.json();

        AllRawConfigs[cfgName] = cfg;
        console.log(`${cfgName} already loaded.`);
    }

    DealingWithRawConfigs();
}

function DealingWithRawConfigs() {
    DealWithExperimentConfig();
    DealWithPageConfig();
    DealWithPicConfig();
}


// to {ExperimentId : PageList}
function DealWithExperimentConfig() {
    var rawCfg = AllRawConfigs['ExperimentConfig'];
    

    var ExperimentCfgs = {};
    rawCfg.forEach(cfg => {
        var key = cfg['ExperimentId'];
        var pageList = [];
        for (var i = 1; i <= cfg['PageNum']; i++) {
            pageList.push(cfg[`Page_${i}`]);
        }

        ExperimentCfgs[String(key)] = pageList;
    });

    console.log(ExperimentCfgs);
    AllConfigs['ExperimentConfig'] = ExperimentCfgs;
}


// to {PageID : (PicA,PicB,PicC,PicD, AudioName, IsFiller)}
// Prefix : {official : './Source/audio/', test : './Source/test/audio/'}
function DealWithPageConfig() {
    var prefix = './Source/test/audio/';

    var rawCfg = AllRawConfigs['PageConfig'];

    var PageCfgs = {};
    rawCfg.forEach(cfg => {
        var key = cfg['PageID'];
        cfg['AudioAddress'] = prefix.concat(cfg['AudioName']);
        PageCfgs[key] = cfg;
    });

    console.log(PageCfgs);
    AllConfigs['PageConfig'] = PageCfgs;
}

// to {PicID : PicName}
// Prefix : {official : './Source/img/', test : './Source/test/img/'}
function DealWithPicConfig() {
    var prefix = './Source/test/img/';

    var rawCfg = AllRawConfigs['PicConfig'];

    var PicCfgs = {};
    rawCfg.forEach(cfg => {
        var key = cfg['PicID'];
        var picValue = {};
        picValue = {};
        picValue['PicName'] = cfg['PicName'];
        picValue['PicAddress'] = prefix.concat(cfg['PicName']);
        PicCfgs[key] = picValue;
    });

    console.log(PicCfgs);
    AllConfigs['PicConfig'] = PicCfgs;
}
