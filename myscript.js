const fs = require('fs');

const xavatar = require(".../ExcelBinOutput/AvatarExcelConfigData.json"); // array
// avatar extra info
const xextrainfo = require('.../ExcelBinOutput/FetterInfoExcelConfigData.json');

const xskilldepot = require('.../ExcelBinOutput/AvatarSkillDepotExcelConfigData.json');
const xtalent = require('.../ExcelBinOutput/AvatarSkillExcelConfigData.json'); // combat talents
const xpassive = require('.../ExcelBinOutput/ProudSkillExcelConfigData.json'); // passive talents
const xconstellation = require('.../ExcelBinOutput/AvatarTalentExcelConfigData.json');

const xweapon = require('.../ExcelBinOutput/WeaponExcelConfigData.json');
const xrefine = require('.../ExcelBinOutput/EquipAffixExcelConfigData.json');

const xmanualtext = getExcel('ManualTextMapConfigData'); //require('.../ExcelBinOutput/ManualTextMapConfigData.json');

const langcodes = ['CHS', 'CHT', 'DE', 'EN', 'ES', 'FR', 'ID', 'JA', 'KO', 'PT', 'RU', 'TH', 'VI'];

function getExcel(file) {
	return require(`.../ExcelBinOutput/${file}.json`);
}

/* ========================================================================================== */

// object map that converts the genshin coded element into a TextMapHash
const elementTextMapHash = ['Fire', 'Water', 'Grass', 'Electric', 'Wind', 'Ice', 'Rock'].reduce((accum, element) => {
	accum[element] = xmanualtext.find(ele => ele.TextMapId === element).TextMapContentTextMapHash;
	return accum;
}, {});

const xplayableWeapon = xweapon.filter(obj => {
	if(obj.RankLevel >= 3 && obj.SkillAffix[0] === 0) return false;
	if(obj.SkillAffix[1] !== 0) { console.log('danger'); return false };
	if(getLanguage('EN')[obj.NameTextMapHash] === '') return false;
	return true;
})

const xplayableAvatar = xavatar.filter(obj => obj.AvatarPromoteId !== 2); // array
// object map that converts an avatar Id or traveler SkillDepotId to filename
const avatarIdToFileName = xplayableAvatar.reduce((accum, obj) => {
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

// const weaponIdToFileName = xweapon.reduce((accum, obj) => {
// 	accum[obj.Id] = 

// }, {})

// object map that converts a WeaponType into a TextMapHash
const weaponTextMapHash = ['WEAPON_SWORD_ONE_HAND', 'WEAPON_CATALYST', 'WEAPON_CLAYMORE', 'WEAPON_BOW', 'WEAPON_POLE'].reduce((accum, str) => {
	accum[str] = xmanualtext.find(ele => ele.TextMapId === str).TextMapContentTextMapHash;
	return accum;
}, {});

// UNUSED object map that converts AvatarAssocType into a TextMapHash
const assocTextMapHash = ['ASSOC_TYPE_MONDSTADT', 'ASSOC_TYPE_LIYUE', 'ASSOC_TYPE_FATUI'];

// object map that converts relic EquipType to a property name
const relicTypeToPropertyName = { 'EQUIP_BRACER': 'flower', 'EQUIP_NECKLACE': 'plume', 'EQUIP_SHOES': 'sands', 'EQUIP_RING': 'goblet', 'EQUIP_DRESS': 'circlet'};

// object map that converts index to the talent type
const talentCombatTypeMap = { '0': 'combat1', '1': 'combat2', '2': 'combatsp', '4': 'combat3' };

// object map that converts player's avatar id to TextMapHash
const playerIdToTextMapHash = { 10000005: 2329553598, 10000007: 3241049361 };

function isPlayer(data) { return data.CandSkillDepotIds.length !== 0; }
function getPlayerElement(SkillDepotId) { let tmp = xskilldepot.find(ele => ele.Id === SkillDepotId); return tmp === undefined ? tmp : tmp.TalentStarName.split('_').pop(); }
function getLanguage(abbriev) { return require("./TextMap/Text"+abbriev.toUpperCase()+".json"); }
function makeFileName(str) { return str.toLowerCase().replace(/[^a-z]/g,''); }
function convertBold(str) { return str.replace(/<color=#FFD780FF>(.*?)<\/color>/gi, '**$1**'); }
function stripHTML(str) { return str.replace(/(<([^>]+)>)/gi, ''); }
function capitalizeFirst(str) { return str[0].toUpperCase() + str.toLowerCase().slice(1); }
function replaceLayout(str) { return str.replace(/{LAYOUT_MOBILE#Tap}{LAYOUT_PC#Press}{LAYOUT_PS#Press}/gi,'Press').replace('#',''); }
function replaceNewline(str) { return str.replace(/\\n/gi, '\n'); }
function sanitizeDescription(str) { return replaceNewline(replaceLayout(stripHTML(convertBold(str)))); }

function collateCharacter(lang) {
	const language = getLanguage(lang);
	const xsubstat = require('.../ExcelBinOutput/AvatarPromoteExcelConfigData.json');
	let myavatar = xplayableAvatar.reduce((accum, obj) => {
		let data = {};
		let extra = xextrainfo.find(ele => ele.AvatarId === obj.Id);

		data.name = language[obj.NameTextMapHash];
		if(isPlayer(obj)) data.name = language[playerIdToTextMapHash[obj.Id]];
		//if(data.name === 'Traveler') data.name = capitalizeFirst(avatarIdToFileName[obj.Id]);
		data.description = language[obj.DescTextMapHash];
		data.weapontype = language[weaponTextMapHash[obj.WeaponType]];
		data.body = obj.BodyType.slice(obj.BodyType.indexOf('BODY_')+5);
		data.rarity = obj.QualityType === 'QUALITY_PURPLE' ? '4' : '5';
		data.birthmonth = extra.InfoBirthMonth;
		data.birthday = extra.InfoBirthDay;
		data.affiliation = isPlayer(obj) ? '' : language[extra.AvatarNativeTextMapHash];
		data.element = language[extra.AvatarVisionBeforTextMapHash];
		data.constellation = language[extra.AvatarConstellationBeforTextMapHash];
		if(obj.Id === 10000030) data.constellation = language[extra.AvatarConstellationAfterTextMapHash]; // Zhongli exception
		data.title = language[extra.AvatarTitleTextMapHash];
		data.association = extra.AvatarAssocType.slice(extra.AvatarAssocType.indexOf('TYPE_')+5);
		data.cv = {
			english: language[extra.CvEnglishTextMapHash],
			chinese: language[extra.CvChineseTextMapHash],
			japanese: language[extra.CvJapaneseTextMapHash],
			korean: language[extra.CvKoreanTextMapHash]
		};

		const xsubstat = require('.../ExcelBinOutput/AvatarPromoteExcelConfigData.json');
		const xmanualtext = require('.../ExcelBinOutput/ManualTextMapConfigData.json');

		let substat = xsubstat.find(ele => ele.AvatarPromoteId === obj.AvatarPromoteId).AddProps[3].PropType;
		data.substat = language[xmanualtext.find(ele => ele.TextMapId === substat).TextMapContentTextMapHash];

		data.icon = obj.IconName;
		data.sideicon = obj.SideIconName;

		// INFORMATION TO CALCULATE STATS AT EACH LEVEL
		let stats = { base: {}, curve: {} };
		stats.base.hp = obj.HpBase;
		stats.base.attack = obj.AttackBase;
		stats.base.defense = obj.DefenseBase;
		stats.base.critrate = obj.Critical;
		stats.base.critdmg = obj.CriticalHurt;

		stats.curve.hp = obj.PropGrowCurves.find(ele => ele.Type === 'FIGHT_PROP_BASE_HP').GrowCurve;
		stats.curve.attack = obj.PropGrowCurves.find(ele => ele.Type === 'FIGHT_PROP_BASE_ATTACK').GrowCurve;
		stats.curve.defense = obj.PropGrowCurves.find(ele => ele.Type === 'FIGHT_PROP_BASE_DEFENSE').GrowCurve;
		stats.specialized = substat;
		stats.promotion = xsubstat.reduce((accum, ele) => {
			if(ele.AvatarPromoteId !== obj.AvatarPromoteId) return accum;
			let promotelevel = ele.PromoteLevel || 0;
			accum[promotelevel] = {
				maxlevel: ele.UnlockMaxLevel,
				hp: ele.AddProps.find(ele => ele.PropType === 'FIGHT_PROP_BASE_HP').Value || 0,
				attack: ele.AddProps.find(ele => ele.PropType === 'FIGHT_PROP_BASE_ATTACK').Value || 0,
				defense: ele.AddProps.find(ele => ele.PropType === 'FIGHT_PROP_BASE_DEFENSE').Value || 0,
				specialized: ele.AddProps.find(ele => ele.PropType === substat).Value || 0,
			};
			return accum;
		}, []);
		data.stats = stats;

		accum[avatarIdToFileName[obj.Id]] = data;
		return accum;
	}, {})
	return myavatar;
}

function collateConstellation(lang) {
	const language = getLanguage(lang);
	let myconstellation = xplayableAvatar.reduce((accum, obj) => {
		// bad practice to declare functions inside loop but i need to be able to call it multiple times for players
		function dowork() {
			let data = {};
			let depot = xskilldepot.find(ele => ele.Id === obj.SkillDepotId);
			if(depot === undefined || depot.EnergySkill === undefined) return; // not a finished (traveler) character
			if(depot.TalentStarName === '') return; // unfinished

			data.name = language[obj.NameTextMapHash];
			if(isPlayer(obj)) data.name += ` (${language[elementTextMapHash[getPlayerElement(obj.SkillDepotId)]]})`
			//console.log(depot)
			data.images = {};
			let stars = depot.Talents.map(talentId => xconstellation.find(ele => ele.TalentId === talentId));
			for(let i = 1; i <= 6; i++) {
				data['c'+i] = {
					name: language[stars[i-1].NameTextMapHash],
					effect: sanitizeDescription(language[stars[i-1].DescTextMapHash])
				};
				data.images['c'+i] = `https://upload-os-bbs.mihoyo.com/game_record/genshin/constellation_icon/${stars[i-1].Icon}.png`;
			}

			accum[avatarIdToFileName[isPlayer(obj) ? obj.SkillDepotId : obj.Id]] = data;
		}

		if(isPlayer(obj)) {
			obj.CandSkillDepotIds.forEach(ele => {
				obj.SkillDepotId = ele;
				dowork();
			});
		} else {
			dowork();
		}
		return accum;
	}, {});
	return myconstellation;
}

function collateTalent(lang) {
	const language = getLanguage(lang);
	let mytalent = xplayableAvatar.reduce((accum, obj) => {
		// bad practice to declare functions inside loop but i need to be able to call it multiple times for players
		function dowork() {
			let data = {};
			let depot = xskilldepot.find(ele => ele.Id === obj.SkillDepotId);
			if(depot === undefined || depot.EnergySkill === undefined) return; // not a finished (traveler) character
			if(depot.TalentStarName === '') return; // unfinished

			data.name = language[obj.NameTextMapHash]; // client-facing name
			if(isPlayer(obj)) data.name += ` (${language[elementTextMapHash[getPlayerElement(obj.SkillDepotId)]]})`

			let combat = depot.Skills.concat([depot.EnergySkill]) // get array of combat skills IDs
			let passive = depot.InherentProudSkillOpens.reduce((accum2, proud) => { // get array of passive skill IDs
				if(proud.ProudSkillGroupId) accum2.push(proud.ProudSkillGroupId);
				return accum2;
			}, [])

			combat.forEach((skId, index) => {
				if(skId === 0) return;
				let talent = xtalent.find(tal => tal.Id === skId);
				let ref = data[talentCombatTypeMap[index]] = {};
				
				ref.name = language[talent.NameTextMapHash];
				let desc = language[talent.DescTextMapHash].split('\\n\\n<i>'); // extract out the italicized part
				ref.info = sanitizeDescription(desc[0]);
				if(desc[1]) ref.description = sanitizeDescription(desc[1]);
			});

			passive.forEach((skId, index) => {
				let talent = xpassive.find(pas => pas.ProudSkillGroupId === skId);
				let ref = data['passive'+(index+1)] = {}; // store reference in variable to make it easier to access

				ref.name = language[talent.NameTextMapHash];
				ref.info = sanitizeDescription(language[talent.DescTextMapHash]);
			});

			accum[avatarIdToFileName[isPlayer(obj) ? obj.SkillDepotId : obj.Id]] = data;
		}

		if(isPlayer(obj)) {
			obj.CandSkillDepotIds.forEach(ele => {
				obj.SkillDepotId = ele;
				dowork();
			});
		} else {
			dowork();
		}
		return accum;
	}, {});
	return mytalent;
}

function collateWeapon(lang) {
	const language = getLanguage(lang);
	const xsubstat = require('.../ExcelBinOutput/WeaponPromoteExcelConfigData.json');
	let myweapon = xplayableWeapon.reduce((accum, obj) => {

		let data = {};

		data.name = language[obj.NameTextMapHash];
		data.description = language[obj.DescTextMapHash];
		data.weapontype = language[weaponTextMapHash[obj.WeaponType]];
		data.rarity = ''+obj.RankLevel;

		if(obj.WeaponProp[0].PropType !== 'FIGHT_PROP_BASE_ATTACK') console.log(obj,'weapon did not find base atk');
		data.baseatk = obj.WeaponProp.find(obj => obj.PropType === 'FIGHT_PROP_BASE_ATTACK').InitValue;

		let substat = obj.WeaponProp[1].PropType;
		if(substat !== undefined) {
			data.substat = language[xmanualtext.find(ele => ele.TextMapId === substat).TextMapContentTextMapHash];
			let subvalue = obj.WeaponProp[1].InitValue;
			data.subvalue = subvalue;
		}

		if(obj.SkillAffix[0] !== 0) {
			let affixId = obj.SkillAffix[0] * 10;
			for(let offset = 0; offset < 5; offset++) {
				let ref = xrefine.find(ele => ele.AffixId === affixId+offset);
				if(ref === undefined) break;
				if(offset === 0) data.effectname = language[ref.NameTextMapHash];
				let effect = language[ref.DescTextMapHash];
				effect = effect.replace(/<color=#.*?>/gi, '{').replace(/<\/color>/gi, '}');
				effect = effect.split(/{|}/);
				data['r'+(offset+1)] = [];
				data['effect'] = effect.reduce((accum, ele, i) => {
					if(i % 2 === 0) {
						return accum + ele;
					} else {
						data['r'+(offset+1)].push(ele);
						return accum + `{${(i-1)/2}}`;
					}
				}, '');
			}
		}

		// INFORMATION TO CALCULATE STATS AT EACH LEVEL
		let stats = { base: {}, curve: {} };
		stats.base.attack = obj.WeaponProp[0].InitValue;
		stats.base.specialized = obj.WeaponProp[1].InitValue || 0;

		stats.curve.attack = obj.WeaponProp[0].Type;
		stats.curve.specialized = obj.WeaponProp[1].Type;
		stats.specialized = substat;
		stats.promotion = xsubstat.reduce((accum, ele) => {
			if(ele.WeaponPromoteId !== obj.WeaponPromoteId) return accum;
			let promotelevel = ele.PromoteLevel || 0;
			accum[promotelevel] = {
				maxlevel: ele.UnlockMaxLevel,
				attack: ele.AddProps.find(ele => ele.PropType === 'FIGHT_PROP_BASE_ATTACK').Value || 0
			};
			let special = ele.AddProps.find(ele => ele.PropType === substat);//.Value;
			if(special) special = special.Value;
			if(special !== undefined) {
				console.log('WEAPON SPECIAL SUBSTAT FOUND: ' + obj.Id)
				accum[promotelevel].specialized = special;
			}
			return accum;
		}, [])
		data.stats = stats;

		data.icon = obj.Icon;
		data.awakenicon = obj.AwakenIcon;

		let filename = makeFileName(getLanguage('EN')[obj.NameTextMapHash]);
		if(accum[filename] !== undefined) console.log(filename+' IS NOT UNIQUE');
		accum[filename] = data;
		return accum;
	}, {});
	
	return myweapon;
}

function collateArtifact(lang) {
	const language = getLanguage(lang);
	const xsets = require('.../ExcelBinOutput/ReliquarySetExcelConfigData.json');
	const xrelics = require('.../ExcelBinOutput/ReliquaryExcelConfigData.json');
	const xreliccodex = require('.../ExcelBinOutput/ReliquaryCodexExcelConfigData.json');
	const xrefine = require('.../ExcelBinOutput/EquipAffixExcelConfigData.json');

	let myartifact = xsets.reduce((accum, obj) => {
		if(obj.SetIcon === '') return accum;
		let setname;
		let filename;
		let data = {};

		// get available rarities
		data.rarity = xreliccodex.reduce((accum, relic) => {
			if(obj.SetId !== relic.SuitId) return accum;
			relic.Level = relic.Level.toString();
			if(accum.indexOf(relic.Level) === -1) accum.push(relic.Level);
			return accum;
		}, []);

		// set bonus effects
		obj.SetNeedNum.forEach((ele, ind) => {
			let effect = xrefine.find(e => e.AffixId === obj.EquipAffixId*10 + ind);
			data[ele+'pc'] = language[effect.DescTextMapHash];
			if(setname === undefined) {
				setname = language[effect.NameTextMapHash];
				filename = makeFileName(getLanguage('EN')[effect.NameTextMapHash]);
			}
		});

		data.images = {};
		// relic pieces
		obj.ContainsList.forEach(ele => {
			let relic = xrelics.find(e => e.Id === ele);
			let relicdata = {};
			relicdata.name = language[relic.NameTextMapHash];
			relicdata.relictype = xmanualtext.find(ele => ele.TextMapId === relic.EquipType).TextMapContentTextMapHash;
			relicdata.relictype = language[relicdata.relictype];
			relicdata.description = language[relic.DescTextMapHash];
			data[relicTypeToPropertyName[relic.EquipType]] = relicdata;
			data.images[relicTypeToPropertyName[relic.EquipType]] = `https://upload-os-bbs.mihoyo.com/game_record/genshin/equip/${relic.Icon}.png`;
		});

		data.name = setname;
		accum[filename] = data;
		return accum;
	}, {});
	return myartifact;
}

function exportCurve(folder, file) {
	const xcurve = require(file);
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

function exportData(folder, collateFunc, englishonly) {
	langcodes.forEach(lang => {
		if(englishonly && lang !== 'EN') return;
		let data = collateFunc(lang);
		fs.mkdirSync(`./export/${lang}`, { recursive: true });
		fs.writeFileSync(`./export/${lang}/${folder}.json`, JSON.stringify(data, null, '\t'));
		if(JSON.stringify(data).search('undefined') !== -1) console.log('undefined found in '+folder);
	});
	console.log("done "+folder);
}

exportData('characters', collateCharacter);
exportCurve('characters', '.../ExcelBinOutput/AvatarCurveExcelConfigData.json');
exportData('constellations', collateConstellation);
exportData('talents', collateTalent);
exportData('weapons', collateWeapon);
exportCurve('weapons', '.../ExcelBinOutput/WeaponCurveExcelConfigData.json')
exportData('artifacts', collateArtifact);
exportData('foods', collateFood);

//console.log(collateCharacter('EN'))
//console.log(collateConstellation('EN').hutao)
//console.log(collateTalent('EN').mona)
//console.log(collateWeapon('EN'));
// console.log(collateArtifact('EN'));
