const xmat = getExcel('MaterialExcelConfigData');
const xsource = getExcel('MaterialSourceDataExcelConfigData');
const xfetter = getExcel('FettersExcelConfigData');

// copied from collateCharacter
const playerIdToTextMapHash = { 10000005: 2329553598, 10000007: 3241049361 };

function collateVoiceover(lang) {
	const language = getLanguage(lang);

	let mynamecard = xplayableAvatar.reduce((accum, obj) => {
		let data = {};
		data.Id = obj.Id;

		data.name = language[obj.NameTextMapHash];
		if(isPlayer(obj)) data.name = language[playerIdToTextMapHash[obj.Id]];

		data.story = [];
		data.combat = [];
		let xvoices = xfetter.filter(ele => ele.AvatarId === obj.Id);
		xvoices.forEach(ele => {
			let tmp = { 
				Id: ele.FetterId, // DEBUG
				title: language[ele.VoiceTitleTextMapHash],
				text: sanitizeDescription(language[ele.VoiceFileTextTextMapHash]),
				unlock: ele.Tips.map(e => language[e]).filter(e => e !== '') // TextList/JumpList
			}
			if(tmp.unlock.length === 0) delete tmp.unlock;
			
			if(ele.IsHiden === 1) data.story.push(tmp);
			else if(ele.IsHiden === 2) data.combat.push(tmp);
			else console.log('unknown voiceover tab: ' + ele.FetterId);
		});


		// data.description = sanitizeDescription(language[obj.DescTextMapHash]);
		// data.sortorder = obj.Id;

		// let sauce = xsource.find(ele => ele.Id === obj.Id);
		// data.source = sauce.TextList.map(ele => language[ele]).filter(ele => ele !== '');


		let filename = makeFileName(getLanguage('EN')[isPlayer(obj) ? playerIdToTextMapHash[obj.Id] : obj.NameTextMapHash]);
		if(filename === '') return accum;
		if(accum[filename] !== undefined) console.log('filename collision: ' + filename);
		accum[filename] = data;
		return accum;
	}, {});

	return mynamecard;
}

module.exports = collateVoiceover;