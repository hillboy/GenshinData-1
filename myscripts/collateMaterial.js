/*
MATERIAL_AVATAR_MATERIAL is talent level-up material, etc.

*/

const filter = ['MATERIAL_EXCHANGE', 'MATERIAL_WOOD', 'MATERIAL_AVATAR_MATERIAL'];

// Mora, Apple, Sunsettia
const includeMatId = [202, 100001, 100002];
// Crafted Items, Primordial Essence, Raw Meat (S), Fowl (S)
const excludeMatId = [110000, 112001, 100086, 100087];

function collateMaterial(lang) {
	const language = getLanguage(lang);
	const xsource = getExcel('MaterialSourceDataExcelConfigData');
	const xmat = getExcel('MaterialExcelConfigData');
	const xarchive = getExcel('MaterialCodexExcelConfigData');
	const xdungeon = getExcel('DungeonExcelConfigData');

	let mymaterial = xmat.reduce((accum, obj) => {
		if(!obj.MaterialType) return accum;
		if(excludeMatId.includes(obj.Id)) return accum;
		if(!filter.includes(obj.MaterialType) && !includeMatId.includes(obj.Id)) return accum;

		let data = {};
		data.name = language[obj.NameTextMapHash];
		if(data.name === '') return accum;
		// data.Id = obj.Id;
		data.description = language[obj.DescTextMapHash];
		data.category = obj.MaterialType.slice(9);
		data.materialtype = language[obj.TypeDescTextMapHash];
		if(obj.RankLevel) data.rarity = ''+obj.RankLevel;

		let tmp = xsource.find(ele => ele.Id === obj.Id);
		let dungeonlist = tmp.DungeonList.filter(ele => ele !== 0);
		if(dungeonlist > 0) {
			if(dungeonlist.length > 1) console.log(`${data.name} drops from more than one dungeon!`);
			data.dropdomain = language[xdungeon.find(ele => ele.Id === dungeonlist[0]).DisplayNameTextMapHash];
			data.daysofweek = getDayWeekList(dungeonlist[0], language); 
		}
		data.source = tmp.TextList.map(ele => language[ele]).filter(ele => ele !== '');

		let filename = makeFileName(getLanguage('EN')[obj.NameTextMapHash]);
		if(filename === '') return accum;
		accum[filename] = data;
		return accum;
	}, {});
	return mymaterial;
}

// format returned is translated and sorted array ["Monday", "Thursday", "Sunday"]
function getDayWeekList(dungeonId, langmap) {
	const xdailyd = getExcel('DailyDungeonConfigData');
	const mapENtoNum = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
	let mylist = [];
	for(const ele of xdailyd)
		for(const [key, value] of Object.entries(mapENtoNum))
			if(ele[key].includes(dungeonId)) mylist.push(value);
	mylist = mylist.sort((a, b) => a - b);
	return mylist.map(ele => langmap[dayOfWeek(ele)]);
}

module.exports = collateMaterial;

// MaterialSourceDataExcelConfigData
// Each object has a duplicate DungeonList property :/
// Remove it.
function cleanupMaterialSourceFile() {
	const fs = require('fs');
	let data = fs.readFileSync('../ExcelBinOutput/MaterialSourceDataExcelConfigData.json', 'utf8');
	data = data.replace(/("DungeonList"[^\]]*?],)\s*"DungeonList".*?],/gs, '$1');
	fs.writeFileSync('../ExcelBinOutput/MaterialSourceDataExcelConfigData.json', data);
}

cleanupMaterialSourceFile();