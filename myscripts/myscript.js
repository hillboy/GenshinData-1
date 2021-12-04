const fs = require('fs');

global.getExcel = function(file) { return require(`../ExcelBinOutput/${file}.json`); }
global.getTextMap = function(langcode) { return require(`../TextMap/TextMap${langcode}.json`); }

const xavatar = getExcel('AvatarExcelConfigData');    // array

global.xskilldepot = getExcel('AvatarSkillDepotExcelConfigData');

global.xmanualtext = getExcel('ManualTextMapConfigData');

const langcodes = ['CHS', 'CHT', 'DE', 'EN', 'ES', 'FR', 'ID', 'JP', 'KR', 'PT', 'RU', 'TH', 'VI'];

/* ========================================================================================== */


// const weaponIdToFileName = xweapon.reduce((accum, obj) => {
// 	accum[obj.Id] = 

// }, {})


// UNUSED object map that converts AvatarAssocType into a TextMapHash
const assocTextMapHash = ['ASSOC_TYPE_MONDSTADT', 'ASSOC_TYPE_LIYUE', 'ASSOC_TYPE_FATUI'];

global.isPlayer = function(data) { return data.CandSkillDepotIds.length !== 0; }
global.getPlayerElement = function(SkillDepotId) { let tmp = xskilldepot.find(ele => ele.Id === SkillDepotId); return tmp === undefined ? tmp : tmp.TalentStarName.split('_').pop(); }
global.getLanguage = function(abbriev) { return getTextMap(abbriev.toUpperCase()); }
global.normalizeStr = function(str) { return str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
global.makeFileName = function(str, lang) { return normalizeStr(str).toLowerCase().replace(/[^a-z]/g,''); }
global.convertBold = function(str) { return str.replace(/<color=#FFD780FF>(.*?)<\/color>/gi, '**$1**'); }
global.stripHTML = function(str) { return (str || '').replace(/(<([^>]+)>)/gi, ''); }
global.capitalizeFirst = function(str) { return str[0].toUpperCase() + str.toLowerCase().slice(1); }
global.replaceLayout = function(str) { return str.replace(/{LAYOUT_MOBILE#.*?}{LAYOUT_PC#(.*?)}{LAYOUT_PS#.*?}/gi,'$1').replace('#','').replaceAll('{NON_BREAK_SPACE}', ' '); }
global.replaceNewline = function(str) { return str.replace(/\\n/gi, '\n'); }
global.sanitizeDescription = function(str) { return replaceNewline(replaceLayout(stripHTML(convertBold(str)))); }
/* ======================================================================================= */

// object map that converts the genshin coded element into a TextMapHash
global.elementTextMapHash = ['Fire', 'Water', 'Grass', 'Electric', 'Wind', 'Ice', 'Rock'].reduce((accum, element) => {
	accum[element] = xmanualtext.find(ele => ele.TextMapId === element).TextMapContentTextMapHash;
	return accum;
}, {});

global.xplayableAvatar = xavatar.filter(obj => obj.AvatarPromoteId !== 2 || obj.Id === 10000002); // array
// object map that converts an avatar Id or traveler SkillDepotId to filename
global.avatarIdToFileName = xplayableAvatar.reduce((accum, obj) => {
	if(obj.Id === 10000005) accum[obj.Id] = 'aether';
	else if(obj.Id === 10000007) accum[obj.Id] = 'lumine';
	else accum[obj.Id] = makeFileName(getLanguage('EN')[obj.NameTextMapHash]);
	if(isPlayer(obj)) { // 
		obj.CandSkillDepotIds.forEach(skdeId => {
			let trelement = elementTextMapHash[getPlayerElement(skdeId)];
			if(trelement === undefined) return;
			accum[skdeId] = makeFileName(getLanguage('EN')[obj.NameTextMapHash] + getLanguage('EN')[trelement]); 
		})
	}
	return accum;
}, {});

// object map that converts a WeaponType into a TextMapHash
global.weaponTextMapHash = ['WEAPON_SWORD_ONE_HAND', 'WEAPON_CATALYST', 'WEAPON_CLAYMORE', 'WEAPON_BOW', 'WEAPON_POLE'].reduce((accum, str) => {
	accum[str] = xmanualtext.find(ele => ele.TextMapId === str).TextMapContentTextMapHash;
	return accum;
}, {});

// translates day of the week. 1 => Monday, etc. Returns textmaphash
global.dayOfWeek = function(num) {
	return xmanualtext.find(ele => ele.TextMapId === 'UI_ABYSSUS_DATE'+num).TextMapContentTextMapHash;
}

/* =========================================================================================== */

function exportCurve(folder, file) {
	const xcurve = getExcel(file);
	let output = {};
	xcurve.forEach(ele => {
		let curveinfo = {};
		ele.CurveInfos.forEach(ele => {
			curveinfo[ele.Type] = ele.Value;
		});
		output[ele.Level] = curveinfo;
	});
	fs.mkdirSync(`./export/curve`, { recursive: true });
	fs.writeFileSync(`./export/curve/${folder}.json`, JSON.stringify(output, null, '\t'));
}

function exportData(folder, collateFunc, englishonly, skipwrite) {
	langcodes.forEach(lang => {
		if(englishonly && lang !== 'EN') return;
		let data = collateFunc(lang);
		fs.mkdirSync(`./export/${lang}`, { recursive: true });
		if(!skipwrite) {
			fs.writeFileSync(`./export/${lang}/${folder}.json`, JSON.stringify(data, null, '\t'));
			if(JSON.stringify(data).search('undefined') !== -1) console.log('undefined found in '+folder);
			if(data[""]) console.log('empty key found in '+folder);
		}
	});
	console.log("done "+folder);
}

// exportData('characters', require('./collateCharacter.js'));
// exportCurve('characters', 'AvatarCurveExcelConfigData');
// exportData('constellations', require('./collateConstellation'));
// exportData('talents', require('./collateTalent.js'));
// exportData('weapons', require('./collateWeapon.js'));
// exportCurve('weapons', 'WeaponCurveExcelConfigData')
// exportData('artifacts', require('./collateArtifact.js'));
// exportData('foods', require('./collateFood'));
// exportData('materials', require('./collateMaterial')); // run twice
// exportData('domains', require('./collateDomain')); // run twice // remember to add back recommendedelements and disorder and entrypicpath
exportData('enemies', require('./collateEnemy'), true);
// exportData('domains', require('./collateDomainMonsterList')); // run only after both domains and enemies have run. sync
// exportCurve('enemies', 'MonsterCurveExcelConfigData');


//console.log(collateCharacter('EN'))
//console.log(collateConstellation('EN').hutao)
//console.log(collateTalent('EN').mona)
//console.log(collateWeapon('EN'));
// console.log(collateArtifact('EN'));
