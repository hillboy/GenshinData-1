const xdungeon = getExcel('DungeonExcelConfigData');
const xpreview = getExcel('RewardPreviewExcelConfigData');
const xdungeonentry = getExcel('DungeonEntryExcelConfigData'); // adventure handbook
const xdisplay = getExcel('DisplayItemExcelConfigData');
const xdisorder = getExcel('DungeonLevelEntityConfigData'); // ley line disorder
const xcity = getExcel('CityConfigData');

const xmonster = getExcel('MonsterExcelConfigData');
const xcodex = getExcel('AnimalCodexExcelConfigData');
const xdescribe = getExcel('MonsterDescribeExcelConfigData');
const xspecial = getExcel('MonsterSpecialNameExcelConfigData');

//xmanualtext
/*
UI_CODEX_ANIMAL_CATEGORY_ELEMENTAL
UI_CODEX_ANIMAL_CATEGORY_HILICHURL
*/

function round(number, decimalplaces) {
	let mult = Math.pow(10, decimalplaces);
	let out = Math.round(number * mult) / mult;
if(out === null) console.log('enemy null resistance rounding');
	return out;
}


function collateEnemy(lang) {
	const language = getLanguage(lang);
	const xmat = getExcel('MaterialExcelConfigData');

	let mymonster = xcodex.reduce((accum, obj) => {
		if(obj.Type !== 'CODEX_MONSTER') return accum;
		if(obj.IsDeleteWatcherAfterFinish) return accum;
		if(obj.Id === 29010101) obj.Id = 29010104; // use correct stormterror
		let mon = xmonster.find(m => m.Id === obj.Id);
		let des = xdescribe.find(d => d.Id === obj.DescribeId);
		let spe = xspecial.find(s => s.SpecialNameLabID === des.SpecialNameLabID);
		let inv = findInvestigation(obj.Id);
		if(!spe) console.log('no special for '+obj.Id);

		let data = {};
		data.Id = obj.Id;

		data.NameTextMapHash = des.NameTextMapHash;
		data.name = language[des.NameTextMapHash];
		data.specialname = language[spe.SpecialNameTextMapHash];
		if(inv) {
			data.investigation = {};
			data.investigation.name = language[inv.NameTextMapHash];
			data.investigation.category = language[xmanualtext.find(e => e.TextMapId === `INVESTIGATION_${inv.MonsterCategory.toUpperCase()}_MONSTER`).TextMapContentTextMapHash];
			data.investigation.description = language[inv.DescTextMapHash];
			if(language[inv.LockDescTextMapHash] !== "") data.investigation.lockdesc = language[inv.LockDescTextMapHash];
			data.investigationicon = inv.Icon;
			// REWARD PREVIEW
			let rewardpreview = xpreview.find(pre => pre.Id === inv.RewardPreviewId).PreviewItems.filter(pre => pre.Id);
			data.rewardpreview = mapRewardList(rewardpreview, language);
		} else {
			if(obj.Id === 20020101) { // Eye of the Storm
				data.rewardpreview = mapRewardList(eyestormreward, language);
			} else if(obj.Id === 21011501) { // Unusual Hilichurl
				data.rewardpreview = mapRewardList(unusualreward, language);
			} else if(obj.Id === 22030101 || obj.Id === 22020101 || obj.Id === 22030201 ||
				      obj.Id === 26060201 || obj.Id === 26060101 || obj.Id === 26060301) {
				// Abyss Lector: Violet Lightning, Abyss Herald: Wicked Torrents, Abyss Lector: Fathomless Flames
				// Hydro Cicin, Electro Cicin, Cryo Cicin
				data.rewardpreview = [];
			} else if(obj.Id === 29010104) { // dvalin lvl90
				let rewardpreview = xpreview.find(pre => pre.Id === 15005).PreviewItems.filter(pre => pre.Id);
				data.rewardpreview = mapRewardList(rewardpreview, language);
			} else if(obj.Id === 29020101) { // wolfboss lvl90
				let rewardpreview = xpreview.find(pre => pre.Id === 15010).PreviewItems.filter(pre => pre.Id);
				data.rewardpreview = mapRewardList(rewardpreview, language);
			} else if(obj.Id === 29030101) { // childe lvl90
				let rewardpreview = xpreview.find(pre => pre.Id === 15014).PreviewItems.filter(pre => pre.Id);
				data.rewardpreview = mapRewardList(rewardpreview, language);
			} else if(obj.Id === 29040101) { // azhdaha lvl90
				let rewardpreview = xpreview.find(pre => pre.Id === 15018).PreviewItems.filter(pre => pre.Id);
				data.rewardpreview = mapRewardList(rewardpreview, language);
			} else if(obj.Id === 29050101) { // signora lvl90
				let rewardpreview = xpreview.find(pre => pre.Id === 15034).PreviewItems.filter(pre => pre.Id);
				data.rewardpreview = mapRewardList(rewardpreview, language);
			} else if(obj.Id === 26050801) {
				let rewardpreview = xpreview.find(pre => pre.Id === 15177).PreviewItems.filter(pre => pre.Id);
				data.rewardpreview = mapRewardList(rewardpreview, language);
			} else if(obj.Id === 29060201) { // raiden shogun lvl90
				let rewardpreview = xpreview.find(pre => pre.Id === 15038).PreviewItems.filter(pre => pre.Id);
				data.rewardpreview = mapRewardList(rewardpreview, language);
			}
		}
		if(!data.rewardpreview) {
			console.log('no reward list for '+data.name); 
			data.rewardpreview = [];
		}

		let sub = obj.SubType || 'CODEX_SUBTYPE_ELEMENTAL';
		sub = sub.slice(sub.lastIndexOf('_')+1);
		// console.log(obj.Id);
		// console.log(sub);
		sub = xmanualtext.find(m => m.TextMapId === `UI_CODEX_ANIMAL_CATEGORY_${sub}`).TextMapContentTextMapHash;
		data.enemytype = mon.SecurityLevel || 'COMMON';
		data.category = language[sub];
		data.imageicon = des.Icon;
		data.description = sanitizeDescription(language[obj.DescTextMapHash]);

		data.aggrorange = mon.VisionLevel;
		data.bgm = mon.CombatBGMLevel;
		data.budget = mon.EntityBudgetLevel;

		// particle drops
		let drops = [];
		for(let x of mon.HpDrops) {
			if(x.DropId) drops.push(x.DropId);
		}
		drops.push(mon.KillDropId);
		data.drops = drops;

		let stats = {};
		stats.resistance = {};
		stats.resistance.physical = round(mon.PhysicalSubHurt, 2) || 0;
		stats.resistance.pyro = round(mon.FireSubHurt, 2) || 0;
		stats.resistance.dendro = round(mon.GrassSubHurt, 2) || 0;
		stats.resistance.hydro = round(mon.WaterSubHurt, 2) || 0;
		stats.resistance.geo = round(mon.RockSubHurt, 2) || 0;
		stats.resistance.anemo = round(mon.WindSubHurt, 2) || 0;
		stats.resistance.cryo = round(mon.IceSubHurt, 2) || 0;
		stats.resistance.electro = round(mon.ElecSubHurt, 2) || 0;
		stats.base = {};
		stats.base.hp = mon.HpBase;
		stats.base.attack = mon.AttackBase;
		stats.base.defense = mon.DefenseBase;
		stats.curve = {};
		try {
			// if(obj.Id === 29010101) console.log(mon.PropGrowCurves);
			stats.curve.hp = mon.PropGrowCurves.find(ele => ele.Type === 'FIGHT_PROP_BASE_HP').GrowCurve;
			stats.curve.attack = mon.PropGrowCurves.find(ele => ele.Type === 'FIGHT_PROP_BASE_ATTACK').GrowCurve;
			stats.curve.defense = mon.PropGrowCurves.find(ele => ele.Type === 'FIGHT_PROP_BASE_DEFENSE').GrowCurve;
		} catch(e) {
			console.log(obj.Id + " - " + data.name + " - failed PropGrowCurves");
		}

		data.stats = stats;

		let filename = makeFileName(getLanguage('EN')[des.NameTextMapHash]);
		if(filename === '') return accum;

		accum[filename] = data;
		return accum;
	}, {});
	return mymonster;
}

function findInvestigation(monId) {
	const xinvest = getExcel('InvestigationMonsterConfigData');
	if(monId === 21011601) monId = 21010601; // Electro Hilichurl Grenadier
	else if(monId === 21020701) monId = 21020101; // Crackling Axe Mitachurl
	else if(monId === 21020801) monId = 21020401; // Thunderhelm Lawachurl
	else if(monId === 21030601) monId = 21030101; // Electro Samachurl
	else if(monId === 22010401) monId = 22010101; // Electro Abyss Mage
	else if(monId === 26010301) monId = 26010201; // Electro Whopperflower
	else if(monId === 20060601) monId = 20060201; // Pyro Specter
	else if(monId === 20060501) monId = 20060201; // Electro Specter
	else if(monId === 20060401) monId = 20060201; // Cryo Specter
	// else if

	// Hydro Cicin
	// Electro Cicin
	// Cryo Cicin
	// Stormterror
	// Lupus Boreas, Dominator of Wolves
	// Childe
	// Azhdaha
	// La Signora

	return xinvest.find(i => i.MonsterIdList.includes(monId));
}

function mapRewardList(rewardlist, language) {
	const xmat = getExcel('MaterialExcelConfigData');
	const xdisplay = getExcel('DisplayItemExcelConfigData');
	return rewardlist.map(repre => {
		let mat = xmat.find(m => m.Id === repre.Id);
		if(mat) { // is material
			let reward = { name: language[mat.NameTextMapHash] };
			if(repre.Count && repre.Count !== "") reward.count = parseFloat(repre.Count);
			return reward;
		} else { // is artifact
			let disp = xdisplay.find(d => d.Id === repre.Id);
			return { name: language[disp.NameTextMapHash], rarity: disp.RankLevel+'' };
		}
	});
}

const eyestormreward = [
    {
        "Id": 202
    },
    {
        "Id": 400022
    },
    {
        "Id": 400032
    },
    {
        "Id": 400042
    },
    {
        "Id": 400062
    },
    {
        "Id": 400023
    },
    {
        "Id": 400033
    },
    {
        "Id": 400043
    }
];

const unusualreward = [
	{
		"Id": 102 // Adventure EXP
	},
    {
        "Id": 202 // Mora
    },
    {
    	"Id": 100018// Cabbage
    }
]


// use id: 21010101
function fixAnimalCodexSubType() {
	const fs = require('fs');
	let obfu = require('../[Obfuscated] ExcelBinOutput/AnimalCodexExcelConfigData.json');
	let out = require('../ExcelBinOutput/AnimalCodexExcelConfigData.json');
	for(let ob of obfu) {
		let match = out.find(ele => ele.Id === ob.KABAHENDGOO); // replace with ID
		match.SubType = ob.JKOLEMPKHMI; // replace with CODEX_SUBTYPE_HILICHURL
	}
	// manual fixes for 2.6 update
	out.find(ele => ele.Id === 22080101).SubType = "CODEX_SUBTYPE_ABYSS";
	out.find(ele => ele.Id === 24010401).SubType = "CODEX_SUBTYPE_AUTOMATRON";
	out.find(ele => ele.Id === 26090101).SubType = "CODEX_SUBTYPE_BEAST";

	out = JSON.stringify(out, null, '\t');
	fs.writeFileSync('../ExcelBinOutput/AnimalCodexExcelConfigData.json', out);
}
fixAnimalCodexSubType();

function fixInvestigationMonsterList() {
	const fs = require('fs');
	let obfu = require('../[Obfuscated] ExcelBinOutput/InvestigationMonsterConfigData.json');
	let out = require('../ExcelBinOutput/InvestigationMonsterConfigData.json');

	for(let ob of obfu) {
		let match = out.find(ele => ele.Id === ob.JNAAGOAENLE); // replace with ID
		match.MonsterIdList = ob.ENEMLKMDNFJ; // replace with CODEX_SUBTYPE_HILICHURL
	}

	out = JSON.stringify(out, null, '\t');
	fs.writeFileSync('../ExcelBinOutput/InvestigationMonsterConfigData.json', out);
}
fixInvestigationMonsterList();

module.exports = collateEnemy;
