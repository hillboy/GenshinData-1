const xmat = getExcel('MaterialExcelConfigData');
const xsource = getExcel('MaterialSourceDataExcelConfigData');
const xfly = getExcel('AvatarFlycloakExcelConfigData');

function collateWindGlider(lang) {
	const language = getLanguage(lang);
	let mydata = xfly.reduce((accum, obj) => {
		let data = {};
		data.Id = obj.FlycloakId;

		data.name = language[obj.NameTextMapHash];
		data.description = sanitizeDescription(language[obj.DescTextMapHash]);

		let flymat = xmat.find(ele => ele.Id === obj.MaterialId) || {};

		data.rarity = flymat.RankLevel+"";
		data.sortorder = obj.FlycloakId;
		data.ishidden = obj.Hide ? true : undefined;

		// let sauce = xsource.find(ele => ele.Id === obj.Id);
		// data.source = sauce.TextList.map(ele => language[ele]).filter(ele => ele !== '');
		data.source = getMatSourceText(obj.MaterialId, language);

		data.nameicon = flymat.Icon;
		data.namegacha = obj.Icon;


		let filename = makeFileName(getLanguage('EN')[obj.NameTextMapHash]);
		if(filename === '') return accum;
		if(accum[filename] !== undefined) console.log('filename collision: ' + filename);
		accum[filename] = data;
		return accum;
	}, {});

	return mydata;
}

module.exports = collateWindGlider;