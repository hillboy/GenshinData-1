const xmat = getExcel('MaterialExcelConfigData');
const xsource = getExcel('MaterialSourceDataExcelConfigData');
const xcostume = getExcel('AvatarCostumeExcelConfigData');
const xavatar = getExcel('AvatarExcelConfigData');

// for AvatarCostumeExcelConfigData
const propertyMap = {
	Id: 'OBACDKHOCAM', // 200301
	AvatarId: 'BPAMNILGFPK', // 10000003
	IconName: 'DANEMGDCNIM' // UI_AvatarIcon_QinCostumeSea
}

// taken from collateCharacter.js
const playerIdToTextMapHash = { 10000005: 2329553598, 10000007: 3241049361 };

function collateOutfit(lang) {
	const language = getLanguage(lang);
	let myoutfit = xcostume.reduce((accum, obj) => {

		let data = {};
		data.Id = obj[propertyMap.Id];

		data.name = language[obj.NameTextMapHash];
		data.description = sanitizeDescription(language[obj.DescTextMapHash]);

		data.isdefault = obj.IsDefault === true;

		const AvatarId = obj[propertyMap.AvatarId];
		if(playerIdToTextMapHash[AvatarId])
			data.character = language[playerIdToTextMapHash[AvatarId]];
		else
			data.character = language[xavatar.find(ele => ele.Id === obj[propertyMap.AvatarId]).NameTextMapHash];

		if(obj.ItemId) {
			let sauce = xsource.find(ele => ele.Id === obj.ItemId);
			data.source = sauce.TextList.map(ele => language[ele]).filter(ele => ele !== '');

			data.namecard = xmat.find(ele => ele.Id === obj.ItemId).Icon;
		} else {
			data.namecard = 'UI_AvatarIcon_Costume_Card';
		}

		if(obj[propertyMap.IconName]) {
			data.nameicon = obj[propertyMap.IconName];
			const name = data.nameicon.slice(data.nameicon.lastIndexOf('_')+1);
			data.namesplash = `UI_Costume_${name}`;
		}
		if(obj.SideIconName)
			data.namesideicon = obj.SideIconName;



		// data.nameicon = obj.Icon;
		// data.namebanner = obj.UseParam[0] !== "" ? obj.UseParam[0] : undefined;
		// data.namebackground = obj.UseParam[1];

		let filename = makeFileName(getLanguage('EN')[obj.NameTextMapHash]);
		if(filename === '') return accum;
		if(filename === 'defaultoutfit') return accum;
		if(playerIdToTextMapHash[AvatarId])
			filename += makeFileName(getLanguage('EN')[playerIdToTextMapHash[AvatarId]]);
		if(accum[filename] !== undefined) console.log('filename collision: ' + filename);
		accum[filename] = data;
		return accum;
	}, {});

	return myoutfit;
}

module.exports = collateOutfit;