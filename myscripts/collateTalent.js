const xtalent = getExcel('AvatarSkillExcelConfigData'); // combat talents
const xpassive = getExcel('ProudSkillExcelConfigData'); // passive talents

// object map that converts index to the talent type
const talentCombatTypeMap = { '0': 'combat1', '1': 'combat2', '2': 'combatsp', '4': 'combat3' };

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

module.exports = collateTalent;