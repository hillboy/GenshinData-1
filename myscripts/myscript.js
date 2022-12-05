const fs = require('fs');



global.getExcel = function(file) { return require(`../ExcelBinOutput/${file}.json`); }
global.getTextMap = function(langcode) { return require(`../TextMap/TextMap${langcode}.json`); }

global.getReadable = function(name, langcode) { 
	let path = `../Readable/${langcode}/${name}.txt`

	if (fs.existsSync(path)) {
		return fs.readFileSync(path, 'utf8') 
	} else {
		return '';
	}
}

const xavatar = getExcel('AvatarExcelConfigData');    // array

global.xskilldepot = getExcel('AvatarSkillDepotExcelConfigData');

global.xmanualtext = getExcel('ManualTextMapConfigData');

const langcodes = ['CHS', 'CHT', 'DE', 'EN', 'ES', 'FR', 'ID', 'JP', 'KR', 'PT', 'RU', 'TH', 'VI'];

/* ========================================================================================== */


// const weaponIdToFileName = xweapon.reduce((accum, obj) => {
// 	accum[obj.id] = 

// }, {})


// UNUSED object map that converts AvatarAssocType into a TextMapHash
const assocTextMapHash = ['ASSOC_TYPE_MONDSTADT', 'ASSOC_TYPE_LIYUE', 'ASSOC_TYPE_FATUI'];

global.isPlayer = function(data) { return data.candSkillDepotIds && data.candSkillDepotIds.length !== 0; }
global.getPlayerElement = function(SkillDepotId) { let tmp = xskilldepot.find(ele => ele.id === SkillDepotId); return tmp === undefined ? tmp : tmp.talentStarName.split('_').pop(); }
global.getLanguage = function(abbriev) { return getTextMap(abbriev.toUpperCase()); }
global.normalizeStr = function(str) { return str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
global.makeFileName = function(str, lang) { return normalizeStr(str).toLowerCase().replace(/[^a-z0-9]/g,''); }
global.convertBold = function(str) { return str.replace(/<color=#FFD780FF>(.*?)<\/color>/gi, '**$1**'); }
global.stripHTML = function(str) { return (str || '').replace(/(<([^>]+)>)/gi, ''); }
global.capitalizeFirst = function(str) { return str[0].toUpperCase() + str.toLowerCase().slice(1); }
global.replaceLayout = function(str) { return str.replace(/{LAYOUT_MOBILE#.*?}{LAYOUT_PC#(.*?)}{LAYOUT_PS#.*?}/gi,'$1').replace('#','').replaceAll('{NON_BREAK_SPACE}', ' '); }
global.replaceNewline = function(str) { return str.replace(/\\n/gi, '\n'); }
global.sanitizeDescription = function(str) { return replaceNewline(replaceLayout(stripHTML(convertBold(str || '')))); }
global.getMatSourceText = function(id, textmap) { return getExcel('MaterialSourceDataExcelConfigData').find(e => e.id === id).textList.map(e => textmap[e]).filter(e => e !== '' && e !== undefined); }
/* ======================================================================================= */

// object map that converts the genshin coded element into a TextMapHash
global.elementTextMapHash = ['Fire', 'Water', 'Grass', 'Electric', 'Wind', 'Ice', 'Rock'].reduce((accum, element) => {
	accum[element] = xmanualtext.find(ele => ele.textMapId === element).textMapContentTextMapHash;
	return accum;
}, {});

global.xplayableAvatar = xavatar.filter(obj => obj.avatarPromoteId !== 2 || obj.id === 10000002); // array
// object map that converts an avatar Id or traveler SkillDepotId to filename
global.avatarIdToFileName = xplayableAvatar.reduce((accum, obj) => {
	if(obj.id === 10000005) accum[obj.id] = 'aether';
	else if(obj.id === 10000007) accum[obj.id] = 'lumine';
	else accum[obj.id] = makeFileName(getLanguage('EN')[obj.nameTextMapHash]);
	if(isPlayer(obj)) { // 
		obj.candSkillDepotIds.forEach(skdeId => {
			let trelement = elementTextMapHash[getPlayerElement(skdeId)];
			if(trelement === undefined) return;
			accum[skdeId] = makeFileName(getLanguage('EN')[obj.nameTextMapHash] + getLanguage('EN')[trelement]); 
		})
	}
	return accum;
}, {});

// object map that converts a WeaponType into a TextMapHash
global.weaponTextMapHash = ['WEAPON_SWORD_ONE_HAND', 'WEAPON_CATALYST', 'WEAPON_CLAYMORE', 'WEAPON_BOW', 'WEAPON_POLE'].reduce((accum, str) => {
	accum[str] = xmanualtext.find(ele => ele.textMapId === str).textMapContentTextMapHash;
	return accum;
}, {});

// translates day of the week. 1 => Monday, etc. Returns textmaphash
global.dayOfWeek = function(num) {
	return xmanualtext.find(ele => ele.textMapId === 'UI_ABYSSUS_DATE'+num).textMapContentTextMapHash;
}

const uniqueLog = {};
// if it isn't unique, then appends "a" to end. or "b". all the way to "z".
global.makeUniqueFileName = function(textmaphash, map) {
	let name = getLanguage('EN')[textmaphash];
	if(name === "" || name === undefined) return "";
	let filename = makeFileName(name);
	if(map[filename] === undefined) return filename;

	let i = 1;
	while(map[filename+"-"+("0" + i).slice(-2)] !== undefined) { i++; }
	if(i > 99) console.log("cannot make unique filename for " + name);
	else {
		// if (!uniqueLog[name + ' ' + i])
		// 	console.log('  dupe made: '+name + ' ' + i)
		return filename+"-"+("0" + i).slice(-2);
	}
}

const dupelogskip = [118002, 11419, 100934, 28030501, 80032, 82010];
global.checkDupeName = function(data, namemap) {
	let name = data.name;
	let key = name.toLowerCase().replace(/[ ["'·\.「」…！\!？\?(\)。，,《》—『』«»<>\]#{\}]/g, '');
	let id;
	if (namemap[key]) {
		namemap[key].dupealias = namemap[key].name + ' 0';
		id = namemap[key].id || namemap[key].id[0] || -1;
	} else {
		namemap[key] = data;
		return false;
	}
	let i = 1;
	while (namemap[key+i]) { i++; }
	data.dupealias = name+' '+i;
	if(!dupelogskip.includes(id)) console.log(" dupealias added " + id + ": "+data.dupealias);
	namemap[key+i] = data;
	return true;
}

const xcity = getExcel('CityConfigData');
// adds Snezhnaya manually
if(!xcity.find(ele => getLanguage('EN')[ele.cityNameTextMapHash] === 'Snezhnaya')) {
	getLanguage('CHS')['Snezhnaya'] = '至冬国';
	getLanguage('CHT')['Snezhnaya'] = '至冬國';
	getLanguage('DE')['Snezhnaya'] = 'Snezhnaya';
	getLanguage('EN')['Snezhnaya'] = 'Snezhnaya';
	getLanguage('ES')['Snezhnaya'] = 'Snezhnaya';
	getLanguage('FR')['Snezhnaya'] = 'Snezhnaya';
	getLanguage('ID')['Snezhnaya'] = 'Snezhnaya';
	getLanguage('JP')['Snezhnaya'] = 'スネージナヤ';
	getLanguage('KR')['Snezhnaya'] = '스네즈나야';
	getLanguage('PT')['Snezhnaya'] = 'Snezhnaya';
	getLanguage('RU')['Snezhnaya'] = 'Снежная';
	getLanguage('TH')['Snezhnaya'] = 'Snezhnaya';
	getLanguage('VI')['Snezhnaya'] = 'Snezhnaya';

	xcity.push({ cityId: 8758412, cityNameTextMapHash: 'Snezhnaya'})
}

/* =========================================================================================== */

function exportCurve(folder, file) {
	const xcurve = getExcel(file);
	let output = {};
	xcurve.forEach(ele => {
		let curveinfo = {};
		ele.curveInfos.forEach(ele => {
			curveinfo[ele.type] = ele.value;
		});
		output[ele.level] = curveinfo;
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

exportData('characters', require('./collateCharacter.js'));
exportCurve('characters', 'AvatarCurveExcelConfigData');
exportData('constellations', require('./collateConstellation'));
exportData('talents', require('./collateTalent.js'));
exportData('weapons', require('./collateWeapon.js'));
exportCurve('weapons', 'WeaponCurveExcelConfigData')
exportData('artifacts', require('./collateArtifact.js'));
exportData('foods', require('./collateFood'));
exportData('materials', require('./collateMaterial')); // change: used both TextList/JumpList.
exportData('domains', require('./collateDomain')); // run twice
exportData('enemies', require('./collateEnemy'));
exportCurve('enemies', 'MonsterCurveExcelConfigData');

exportData('domains', require('./collateDomainMonsterList')); // MUST do run only after both domains and enemies have run. sync.

exportData('outfits', require('./collateOutfit'));
exportData('windgliders', require('./collateWindGlider'));
exportData('animals', require('./collateAnimal'));
exportData('namecards', require('./collateNamecard'));
exportData('geographies', require('./collateGeography'));
exportData('achievements', require('./collateAchievement'));
exportData('achievementgroups', require('./collateAchievementGroup'));
exportData('adventureranks', require('./collateAdventureRank'));
exportData('crafts', require('./collateCraft'));

// exportData('commissions', require('./collateCommission'), true); // unfinished
// exportData('voiceovers', require('./collateVoiceover'), true); // unfinished

// // exportData('fishingpoints', require('./collateFishingPoint'));  // unfinished

//console.log(collateCharacter('EN'))
//console.log(collateConstellation('EN').hutao)
//console.log(collateTalent('EN').mona)
//console.log(collateWeapon('EN'));
// console.log(collateArtifact('EN'));
