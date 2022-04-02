const xmat = getExcel('MaterialExcelConfigData');
const xsource = getExcel('MaterialSourceDataExcelConfigData');

function collateNamecard(lang) {
	const language = getLanguage(lang);
	let mynamecard = xmat.reduce((accum, obj) => {
		if(obj.MaterialType !== 'MATERIAL_NAMECARD') return accum;

		let data = {};
		data.Id = obj.Id;
		// data.RankLevel = obj.RankLevel; // all rarity 4

		data.name = language[obj.NameTextMapHash];
		data.description = sanitizeDescription(language[obj.DescTextMapHash]);
		data.sortorder = obj.Id;

		let sauce = xsource.find(ele => ele.Id === obj.Id);
		data.source = sauce.TextList.map(ele => language[ele]).filter(ele => ele !== '');


		data.nameicon = obj.Icon;
		data.namebanner = obj.UseParam[0] !== "" ? obj.UseParam[0] : undefined;
		data.namebackground = obj.UseParam[1];

		let filename = makeFileName(getLanguage('EN')[obj.NameTextMapHash]);
		if(filename === '') return accum;
		if(accum[filename] !== undefined) console.log('filename collision: ' + filename);
		accum[filename] = data;
		return accum;
	}, {});

	return mynamecard;
}

module.exports = collateNamecard;