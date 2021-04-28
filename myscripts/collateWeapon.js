const xweapon = getExcel('WeaponExcelConfigData');
const xrefine = getExcel('EquipAffixExcelConfigData');

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

module.exports = collateWeapon;