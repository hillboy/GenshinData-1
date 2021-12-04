const xdungeon = getExcel('DungeonExcelConfigData');
const xpreview = getExcel('RewardPreviewExcelConfigData');
const xdungeonentry = getExcel('DungeonEntryExcelConfigData'); // adventure handbook
const xdisplay = getExcel('DisplayItemExcelConfigData');
const xdisorder = getExcel('DungeonLevelEntityConfigData'); // ley line disorder
const xcity = getExcel('CityConfigData');

// something inside ManualTextMapConfigData
const domainType = {
	UI_ABYSSUS_RELIC: "UI_ABYSSUS_RELIC",
	UI_ABYSSUS_WEAPON_PROMOTE: "UI_ABYSSUS_WEAPON_PROMOTE",
	UI_ABYSSUS_AVATAR_PROUD: "UI_ABYSSUS_AVATAR_PROUD"
}
function getDomainTypeTextMapHash(domaintype) {
	return xmanualtext.find(ele => ele.TextMapId === domaintype).TextMapContentTextMapHash;
}

/*
"UI_DUNGEON_ENTRY_27", // "Valley of Remembrance"
"UI_DUNGEON_ENTRY_29", // "Forsaken Rift"
"UI_DUNGEON_ENTRY_37", // "Cecilia Garden"
"UI_DUNGEON_ENTRY_35", // "Midsummer Courtyard"
"UI_DUNGEON_ENTRY_46", // "Taishan Mansion"
"UI_DUNGEON_ENTRY_48", // "Domain of Guyun"
"UI_DUNGEON_ENTRY_50", // "Clear Pool and Mountain Cavern"
"UI_DUNGEON_ENTRY_52", // "Hidden Palace of Lianshan Formula"
"UI_DUNGEON_ENTRY_54", // "Hidden Palace of Zhou Formula"
"UI_DUNGEON_ENTRY_282", // "Ridge Watch"
"UI_DUNGEON_ENTRY_221", // "Peak of Vindagnyr"
"UI_DUNGEON_ENTRY_361", // "Momiji-Dyed Court"
"UI_DUNGEON_ENTRY_310", // "Violet Court"
"UI_DUNGEON_ENTRY_368", // "Court of Flowing Sand"
*/
function getDomainEntranceTextMapHash(englishname) {
	englishname = englishname.toLowerCase();
	function mapping(textmapid) { return xmanualtext.find(ele => ele.TextMapId === textmapid).TextMapContentTextMapHash; }

	if(englishname.includes('dance of steel'))
		return mapping("UI_DUNGEON_ENTRY_27");
	else if(englishname.includes('city of reflections') || englishname.includes('submerged valley') || englishname.includes('ruins of thirsting capital'))
		return mapping("UI_DUNGEON_ENTRY_37");
	else if(englishname.includes('frosted altar') || englishname.includes('frozen abyss') || englishname.includes('realm of slumber'))
		return mapping("UI_DUNGEON_ENTRY_29");
	else if(englishname.includes('fires of purification'))
		return mapping("UI_DUNGEON_ENTRY_35");
	else if(englishname.includes('altar of flames') || englishname.includes('heart of the flames') || englishname.includes('circle of embers'))
		return mapping("UI_DUNGEON_ENTRY_46");
	else if(englishname.includes('spring'))
		return mapping("UI_DUNGEON_ENTRY_48");
	else if(englishname.includes('stone chamber'))
		return mapping("UI_DUNGEON_ENTRY_50");
	else if(englishname.includes('thundercloud altar') || englishname.includes('thundering ruins') || englishname.includes('trial grounds of thunder'))
		return mapping("UI_DUNGEON_ENTRY_52");
	else if(englishname.includes('frost'))
		return mapping("UI_DUNGEON_ENTRY_54");
	else if(englishname.includes('unyielding'))
		return mapping("UI_DUNGEON_ENTRY_282");
	else if(englishname.includes('elegaic rime'))
		return mapping("UI_DUNGEON_ENTRY_221");
	else if(englishname.includes('autumn hunt'))
		return mapping("UI_DUNGEON_ENTRY_361");
	else if(englishname.includes('reign of violet') || englishname.includes('thundering valley') || englishname.includes('vine-infested ruins'))
		return mapping("UI_DUNGEON_ENTRY_310");
	else if(englishname.includes('sunken sands') || englishname.includes('altar of sands') || englishname.includes('sand burial'))
		return mapping("UI_DUNGEON_ENTRY_368");
	else if(englishname.includes('necropolis'))
		return mapping("UI_DUNGEON_ENTRY_433")
	else
		console.log('no domain entrance mapping found for '+englishname);
}

// these are removed from the game
function isSundaySpecial(englishname) {
	englishname = englishname.toLowerCase();
	return englishname.includes('altar of the falls') || englishname.includes('electrostatic field') || 
	       englishname.includes('abyss of embers') || englishname.includes('biting frost');
}

function collateDomain(lang) {
	const language = getLanguage(lang);
	const xmat = getExcel('MaterialExcelConfigData');

	let mydomain = xdungeon.reduce((accum, obj) => {
		if(obj.Type !== "DUNGEON_DAILY_FIGHT" || obj.StateType !== "DUNGEON_STATE_RELEASE") return accum;
		if(isSundaySpecial(getLanguage('EN')[obj.NameTextMapHash])) return accum;
		// console.log(obj.Id);
		let data = {};
		data.Id = obj.Id;
		data.name = language[obj.NameTextMapHash];
		// data.displayname = language[obj.DisplayNameTextMapHash]; // doesn't exist for artifact domains
		data.domainentrance = language[getDomainEntranceTextMapHash(getLanguage('EN')[obj.NameTextMapHash])];// obj.EntryPicPath;
		data.description = sanitizeDescription(language[obj.DescTextMapHash]);

		if(obj.Id === 5120 || obj.Id === 5121 || obj.Id === 5122 || obj.Id === 5123) obj.CityID = 1; // Peak of Vindagnyr region fix from Liyue to Mondstadt
		data.region = language[xcity.find(city => city.CityId === obj.CityID).CityNameTextMapHash];

		data.recommendedlevel = obj.ShowLevel;
		// data.recommendedelements = obj.RecommendElementTypes.filter(ele => ele !== 'None').map(ele => language[xmanualtext.find(man => man.TextMapId === ele).TextMapContentTextMapHash]);
		data.daysofweek = getDayWeekList(obj.Id, language);
		if(data.daysofweek.length === 0) delete data.daysofweek;

		data.unlockrank = obj.LimitLevel;
		let rewardpreview = xpreview.find(pre => pre.Id === obj.PassRewardPreviewID).PreviewItems.filter(pre => pre.Id);
		data.rewardpreview = rewardpreview.map(repre => {
			let mat = xmat.find(m => m.Id === repre.Id);
			if(mat) { // is material
				let reward = { name: language[mat.NameTextMapHash] };
				if(mat.MaterialType !== 'MATERIAL_AVATAR_MATERIAL') reward.count = parseInt(repre.Count);
				if((getLanguage('EN')[mat.TypeDescTextMapHash]).includes('Weapon')) {
					data.domaintype = language[getDomainTypeTextMapHash(domainType.UI_ABYSSUS_WEAPON_PROMOTE)];
				} else {
					data.domaintype = language[getDomainTypeTextMapHash(domainType.UI_ABYSSUS_AVATAR_PROUD)];
				}
				return reward;
			} else { // is artifact
				let disp = xdisplay.find(d => d.Id === repre.Id);
				data.domaintype = language[getDomainTypeTextMapHash(domainType.UI_ABYSSUS_RELIC)];
				return { name: language[disp.NameTextMapHash], rarity: disp.RankLevel+'' };
			}
		});
		// data.disorder = xdisorder.filter(d => d.Id+'' === Object.keys(obj.LevelConfigMap)[0]).map(d => language[d.DescTextMapHash]);
		data.imagename = obj.EntryPicPath;

		let filename = makeFileName(getLanguage('EN')[obj.NameTextMapHash]);
		if(filename === '') return accum;
		accum[filename] = data;
		return accum;
	}, {});
	return mydomain;
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

module.exports = collateDomain;

// DungeonExcelConfigData
// Each object has duplicate RecommendElementTypes properties :/
// Remove it.
function cleanupDungeonFile() {
	const fs = require('fs');
	let data = fs.readFileSync('../ExcelBinOutput/DungeonExcelConfigData.json', 'utf8');
	data = data.replace(/("RecommendElementTypes"[^\]]*?],[^\]]*?)"RecommendElementTypes".*?],/gs, '$1');
	fs.writeFileSync('../ExcelBinOutput/DungeonExcelConfigData.json', data);
}

cleanupDungeonFile();