const xweapon = getExcel('WeaponExcelConfigData');
const xrefine = getExcel('EquipAffixExcelConfigData');

const moraNameTextMapHash = getExcel('MaterialExcelConfigData').find(ele => ele.Id === 202).NameTextMapHash;
const xmat = getExcel('MaterialExcelConfigData');

const xplayableWeapon = xweapon.filter(obj => {
	if(obj.RankLevel >= 3 && obj.SkillAffix[0] === 0) return false;
	if(obj.SkillAffix[1] !== 0) { console.log('danger'); return false };
	if(getLanguage('EN')[obj.NameTextMapHash] === '') return false;
	return true;
});

function collateWeapon(lang) {
	const language = getLanguage(lang);
	const xsubstat = getExcel('WeaponPromoteExcelConfigData');
	let myweapon = xplayableWeapon.reduce((accum, obj) => {

		let data = {};
		let filename = makeFileName(getLanguage('EN')[obj.NameTextMapHash]);
		if(accum[filename] !== undefined) console.log(filename+' IS NOT UNIQUE');

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
				if(filename === 'swordofdescension') { // has extra color
					effect = effect.replace(/<color=#.*?>/i, '').replace(/<\/color>/i, '');
					effect = effect.replace(/<color=#.*?>/i, '').replace(/<\/color>/i, '');
				}

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

		// get the promotion costs
		let costs = {};
		for(let i = 1; i <= (obj.RankLevel <= 2 ? 4 : 6); i++) {
			// 1 and 2 star weapons only have 4 ascensions instead of 6
			let apromo = xsubstat.find(ele => ele.WeaponPromoteId === obj.WeaponPromoteId && ele.PromoteLevel === i);
			costs['ascend'+i] = [{
				name: language[moraNameTextMapHash],
				count: apromo.CoinCost
			}];

			for(let items of apromo.CostItems) {
				if(items.Id === undefined) continue;
				costs['ascend'+i].push({
					name: language[xmat.find(ele => ele.Id === items.Id).NameTextMapHash],
					count: items.Count
				})
			}
		}
		data.costs = costs;

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

		accum[filename] = data;
		return accum;
	}, {});
	
	return myweapon;
}

module.exports = collateWeapon;