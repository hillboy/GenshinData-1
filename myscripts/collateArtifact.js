// object map that converts relic EquipType to a property name
const relicTypeToPropertyName = { 'EQUIP_BRACER': 'flower', 'EQUIP_NECKLACE': 'plume', 'EQUIP_SHOES': 'sands', 'EQUIP_RING': 'goblet', 'EQUIP_DRESS': 'circlet'};

function collateArtifact(lang) {
	const language = getLanguage(lang);
	const xsets = getExcel('ReliquarySetExcelConfigData');
	const xrelics = getExcel('ReliquaryExcelConfigData');
	const xreliccodex = getExcel('ReliquaryCodexExcelConfigData');
	const xrefine = getExcel('EquipAffixExcelConfigData');

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

module.exports = collateArtifact;