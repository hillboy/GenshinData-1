const xtalent = getExcel('AvatarSkillExcelConfigData'); // combat talents
const xpassive = getExcel('ProudSkillExcelConfigData'); // passive talents. also talent upgrade costs

// object map that converts index to the talent type
const talentCombatTypeMap = { '0': 'combat1', '1': 'combat2', '2': 'combatsp', '4': 'combat3' };

const moraNameTextMapHash = getExcel('MaterialExcelConfigData').find(ele => ele.Id === 202).NameTextMapHash;

function collateTalent(lang) {
	const language = getLanguage(lang);
	const xmat = getExcel('MaterialExcelConfigData');
	let mytalent = xplayableAvatar.reduce((accum, obj) => {
		// bad practice to declare functions inside loop but i need to be able to call it multiple times for players
		function dowork() {
			let data = {};
			let depot = xskilldepot.find(ele => ele.Id === obj.SkillDepotId);
			if(depot === undefined || depot.EnergySkill === undefined) return; // not a finished (traveler) character
			if(depot.TalentStarName === '') return; // unfinished

			let filename = avatarIdToFileName[isPlayer(obj) ? obj.SkillDepotId : obj.Id];

			data.name = language[obj.NameTextMapHash]; // client-facing name
			if(isPlayer(obj)) data.name += ` (${language[elementTextMapHash[getPlayerElement(obj.SkillDepotId)]]})`

			let combat = depot.Skills.concat([depot.EnergySkill]) // get array of combat skills IDs
			// console.log(depot.InherentProudSkillOpens)
			let passive = depot.InherentProudSkillOpens.reduce((accum2, proud, index) => { // get array of passive skill IDs
				if(filename === 'raidenshogun' && index === 2) return accum2; // skip hidden cannot cook passive
				if(proud.ProudSkillGroupId) accum2.push(proud.ProudSkillGroupId);
				return accum2;
			}, []);
			let parameters = {};
			let costs = {};
			combat.forEach((skId, index) => {
				if(skId === 0) return;
				let talent = xtalent.find(tal => tal.Id === skId);
				let combatTypeProp = talentCombatTypeMap[index];
				let ref = data[combatTypeProp] = {};
				
				ref.name = language[talent.NameTextMapHash];
				let desc = language[talent.DescTextMapHash].split('\\n\\n<i>'); // extract out the italicized part
				ref.info = sanitizeDescription(desc[0]);
				if(desc[1]) ref.description = sanitizeDescription(desc[1]);

				ref.labels = [];
				// build the labels
				let attTalent = xpassive.find(tal => (tal.ProudSkillGroupId === talent.ProudSkillGroupId && tal.Level === 1));
				for(let labelTextMap of attTalent.ParamDescList) {
					if(language[labelTextMap] === "") continue;
					ref.labels.push(replaceLayout(language[labelTextMap]));
				}

				parameters[combatTypeProp] = {};
				for(let lvl = 1; lvl <= 15; lvl++) {
					if(lvl !== 1 && index === 2) continue; // sprint skills don't have level-up
					let attTalent = xpassive.find(tal => (tal.ProudSkillGroupId === talent.ProudSkillGroupId && tal.Level === lvl));
					attTalent.ParamList.forEach((value, paramIndex) => {
						const name = `param${paramIndex+1}`;
						if(value === 0) { // exclude those with values of 0
							if(lvl !== 1 && parameters[combatTypeProp][name] !== undefined) console.log(`talent ${ref.name} value 0`);
							return;
						}
						if(parameters[combatTypeProp][name] === undefined) parameters[combatTypeProp][name] = [];
						parameters[combatTypeProp][name].push(value);
					});
					if(lvl >= 2 && lvl <= 10) { // get upgrade costs
						costs['lvl'+lvl] = [{
							name: language[moraNameTextMapHash],
							count: attTalent.CoinCost
						}];
						for(let items of attTalent.CostItems) {
							if(items.Id === undefined) continue;
							costs['lvl'+lvl].push({
								name: language[xmat.find(ele => ele.Id === items.Id).NameTextMapHash],
								count: items.Count
							})
						}
					}
				}
			});

			passive.forEach((skId, index) => {
				let talent = xpassive.find(pas => pas.ProudSkillGroupId === skId);
				let ref = data['passive'+(index+1)] = {}; // store reference in variable to make it easier to access

				ref.name = language[talent.NameTextMapHash];
				ref.info = sanitizeDescription(language[talent.DescTextMapHash]);
			});
			data.costs = costs;
			data.parameters = parameters;

			accum[filename] = data;
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