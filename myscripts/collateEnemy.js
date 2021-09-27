const xdungeon = getExcel('DungeonExcelConfigData');
const xpreview = getExcel('RewardPreviewExcelConfigData');
const xdungeonentry = getExcel('DungeonEntryExcelConfigData'); // adventure handbook
const xdisplay = getExcel('DisplayItemExcelConfigData');
const xdisorder = getExcel('DungeonLevelEntityConfigData'); // ley line disorder
const xcity = getExcel('CityConfigData');

const xmonster = getExcel('MonsterExcelConfigData');
const xcodex = getExcel('AnimalCodexExcelConfigData');
const xinvest = getExcel('InvestigationMonsterConfigData');
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
		let mon = xmonster.find(m => m.Id === obj.Id);
		let des = xdescribe.find(d => d.Id === obj.DescribeId);
		let spe = xspecial.find(s => s.SpecialNameLabID === des.SpecialNameLabID);
		if(!spe) console.log('no special for '+obj.Id);

		let data = {};
		data.Id = obj.Id;



		data.name = language[des.NameTextMapHash];
		data.specialname = language[spe.SpecialNameTextMapHash];

		let sub = obj.SubType || 'CODEX_SUBTYPE_ELEMENTAL';
		sub = sub.slice(sub.lastIndexOf('_')+1);
		sub = xmanualtext.find(m => m.TextMapId === `UI_CODEX_ANIMAL_CATEGORY_${sub}`).TextMapContentTextMapHash;
		data.type = mon.SecurityLevel || 'COMMON';
		data.category = language[sub];
		data.imageicon = des.Icon;
		data.description = sanitizeDescription(language[obj.DescTextMapHash]);

		data.aggrorange = mon.VisionLevel;
		data.bgm = mon.CombatBGMLevel;
		data.budget = mon.EntityBudgetLevel;

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

module.exports = collateEnemy;
