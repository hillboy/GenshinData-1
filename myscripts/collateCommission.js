const xmat = getExcel('MaterialExcelConfigData');
const xsource = getExcel('MaterialSourceDataExcelConfigData');
const xdaily = getExcel('DailyTaskExcelConfigData');
const xcity = getExcel('CityConfigData');
const xarea = getExcel('WorldAreaConfigData');
const xtaskreward = getExcel('DailyTaskRewardExcelConfigData');
const xpreview = getExcel('RewardPreviewExcelConfigData');

const mapRewardToAR = [
	'AR1to5',
	'AR6to10',
	'AR11to15',
	'AR16to20',
	'AR21to25',
	'AR26to30',
	'AR31to35',
	'AR36to40',
	'AR41to45',
	'AR46to50',
	'AR51to55',
	'AR56to60'
]


function collateCommission(lang) {
	const language = getLanguage(lang);
	let mydata = xdaily.reduce((accum, obj) => {
		let data = {};
		data.Id = obj.ID;

		data.name = language[obj.TitleTextMapHash];
		data.description = sanitizeDescription(language[obj.DescriptionTextMapHash]);
		data.target = sanitizeDescription(language[obj.TargetTextMapHash]);

		data.city = language[xcity.find(e => e.CityId === obj.CityId).CityNameTextMapHash];

		const taskreward = xtaskreward.find(e => e.ID === obj.TaskRewardId);
		data.rewardpreviews = {};
		for(let i = 0; i < 12; i++) {
			let rewardpreview = xpreview.find(pre => pre.Id === taskreward.DropVec[i].PreviewRewardId).PreviewItems.filter(pre => pre.Id);
			data.rewardpreviews[mapRewardToAR[i]] = rewardpreview.map(repre => {
				let mat = xmat.find(m => m.Id === repre.Id);
				let reward = { name: language[mat.NameTextMapHash] };
				reward.count = parseInt(repre.Count);
				if(repre.Count.includes(';')) reward.countmax = parseInt(repre.Count.substring(repre.Count.indexOf(';')+1));
				return reward;
			});
		}


		data.TaskRewardId = obj.TaskRewardId


		let filename = makeFileName(getLanguage('EN')[obj.TitleTextMapHash]);
		if(filename === '') return accum;
		while(accum[filename] !== undefined) {
			filename += 'a';
		}
		// if(accum[filename] !== undefined) {
		// 	console.log('filename collision: ' + filename);
		// }
		accum[filename] = data;
		return accum;
	}, {});

	return mydata;
}

module.exports = collateCommission;