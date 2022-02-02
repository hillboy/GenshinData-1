const xview = getExcel('ViewCodexExcelConfigData');
// const xsource = getExcel('MaterialSourceDataExcelConfigData');
const xcity = getExcel('CityConfigData');
const xarea = getExcel('WorldAreaConfigData');

function collageGeography(lang) {
	const language = getLanguage(lang);
	let mygeography = xview.reduce((accum, obj) => {

		let data = {};
		data.Id = obj.Id;

		data.name = language[obj.NameTextMapHash];
		data.area = language[xarea.find(area => area.ID === obj.WorldAreaId).AreaNameTextMapHash];
		data.description = sanitizeDescription(language[obj.DescTextMapHash]);
		data.region = language[xcity.find(city => city.CityId === obj.CityId).CityNameTextMapHash];
		data.hiddenactive = obj.IsSeenActive ? true : undefined;
		data.sortorder = obj.SortOrder;


		// console.log(obj.CityID);

		data.nameimage = obj.Image;

		let filename = makeFileName(getLanguage('EN')[obj.NameTextMapHash]);
		if(filename === '') return accum;
		if(accum[filename] !== undefined) console.log('filename collision: ' + filename);
		accum[filename] = data;
		return accum;
	}, {});

	return mygeography;
}

module.exports = collageGeography;