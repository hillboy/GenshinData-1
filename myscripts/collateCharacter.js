// avatar extra info
const xextrainfo = getExcel('FetterInfoExcelConfigData');

// object map that converts player's avatar id to TextMapHash
const playerIdToTextMapHash = { 10000005: 2329553598, 10000007: 3241049361 };
const moraNameTextMapHash = getExcel('MaterialExcelConfigData').find(ele => ele.Id === 202).NameTextMapHash;
const xmat = getExcel('MaterialExcelConfigData');


function collateCharacter(lang) {
	const language = getLanguage(lang);
	const xsubstat = getExcel('AvatarPromoteExcelConfigData');
	// console.log(xplayableAvatar.map(ele => ele.ImageName));
	// console.log(avatarIdToFileName)
	let myavatar = xplayableAvatar.reduce((accum, obj) => {
		let data = {};
		let extra = xextrainfo.find(ele => ele.AvatarId === obj.Id);

		data.name = language[obj.NameTextMapHash];
		if(isPlayer(obj)) data.name = language[playerIdToTextMapHash[obj.Id]];

		data.fullname = data.name;
		if(!isPlayer(obj)) {
			let cardimgname = obj.IconName.slice(obj.IconName.lastIndexOf('_')+1);
			cardimgname = `UI_AvatarIcon_${cardimgname}_Card`;
			let charmat = xmat.find(ele => ele.Icon === cardimgname);
			data.fullname = language[charmat.NameTextMapHash];
		}

		if(data.name !== data.fullname) console.log(`fullname diff ${lang}: ${data.name} | ${data.fullname}`);


		//if(data.name === 'Traveler') data.name = capitalizeFirst(avatarIdToFileName[obj.Id]);
		data.description = sanitizeDescription(language[obj.DescTextMapHash]);
		data.weapontype = language[weaponTextMapHash[obj.WeaponType]];
		data.body = obj.BodyType.slice(obj.BodyType.indexOf('BODY_')+5);
		data.rarity = obj.QualityType === 'QUALITY_PURPLE' ? '4' : '5';
		if(!isPlayer(obj)) {
			data.birthmonth = extra.InfoBirthMonth;
			data.birthday = extra.InfoBirthDay;
		}	
		if(isPlayer(obj) && (data.birthmonth || data.birthday)) console.log('warning player has birthday');
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

		const xsubstat = getExcel('AvatarPromoteExcelConfigData');
		const xmanualtext = getExcel('ManualTextMapConfigData');

		let substat = xsubstat.find(ele => ele.AvatarPromoteId === obj.AvatarPromoteId).AddProps[3].PropType;
		data.substat = language[xmanualtext.find(ele => ele.TextMapId === substat).TextMapContentTextMapHash];

		data.icon = obj.IconName;
		data.sideicon = obj.SideIconName;

		// get the promotion costs
		let costs = {};
		for(let i = 1; i <= 6; i++) {
			let apromo = xsubstat.find(ele => ele.AvatarPromoteId === obj.AvatarPromoteId && ele.PromoteLevel === i);
			costs['ascend'+i] = [{
				name: language[moraNameTextMapHash],
				count: apromo.ScoinCost
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

module.exports = collateCharacter;