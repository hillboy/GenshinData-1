const xconstellation = getExcel('AvatarTalentExcelConfigData');

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
					name: sanitizeDescription(language[stars[i-1].NameTextMapHash]),
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

module.exports = collateConstellation;