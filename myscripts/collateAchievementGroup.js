const xgroup = getExcel('AchievementGoalExcelConfigData');
const xreward = getExcel('RewardExcelConfigData');
const xmat = getExcel('MaterialExcelConfigData');

function collateAchievementGroup(lang) {
	const language = getLanguage(lang);
	let myachievementgroup = xgroup.reduce((accum, obj) => {
		let data = {};
		data.Id = obj.Id;

		data.name = language[obj.NameTextMapHash];
		data.sortorder = obj.OrderId;

		if(obj.FinishRewardId) {
			const rewards = xreward.find(e => e.RewardId === obj.FinishRewardId).RewardItemList.filter(f => f.ItemId);
			if(rewards.length > 1) console.log(`achievementgroup ${obj.Id} has multiple rewards`);
			data.reward = rewards.map(ele => {
				return {
					name: language[xmat.find(mat => mat.Id === ele.ItemId).NameTextMapHash], 
					// count: ele.ItemCount
				}; 
			})[0];
		}

		data.nameicon = obj.IconPath;


		let filename = makeFileName(getLanguage('EN')[obj.NameTextMapHash]);
		if(filename === '') return accum;
		if(accum[filename] !== undefined) console.log('filename collision: ' + filename);
		accum[filename] = data;
		return accum;
	}, {});

	return myachievementgroup;
}

module.exports = collateAchievementGroup;