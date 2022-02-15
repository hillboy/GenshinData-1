const xmat = getExcel('MaterialExcelConfigData');
const xsource = getExcel('MaterialSourceDataExcelConfigData');
const xcodex = getExcel('AnimalCodexExcelConfigData');
const xdescribe = getExcel('AnimalDescribeExcelConfigData');
const xcapture = getExcel('CaptureExcelConfigData');

function collateAnimal(lang) {
	const language = getLanguage(lang);
	let mydata = xcodex.reduce((accum, obj) => {
		if(obj.Type === 'CODEX_MONSTER') return accum;
		if(obj.IsDeleteWatcherAfterFinish) return accum;
		let data = {};
		data.Id = obj.Id;

		let mydescribe = xdescribe.find(ele => ele.Id === obj.DescribeId);

		data.name = language[mydescribe.NameTextMapHash];
		data.description = sanitizeDescription(language[obj.DescTextMapHash]);
		data.category = language[xmanualtext.find(ele => ele.TextMapId === `UI_CODEX_ANIMAL_CATEGORY_${obj.SubType.substring(obj.SubType.lastIndexOf('_')+1)}`).TextMapContentTextMapHash]
		data.capturable = xcapture.find(ele => ele.MonsterID === obj.Id) ? true : undefined;
		data.sortorder = obj.SortOrder;

		data.nameicon = mydescribe.Icon;


		let filename = makeFileName(getLanguage('EN')[mydescribe.NameTextMapHash]);
		if(filename === '') return accum;
		if(accum[filename] !== undefined) console.log('filename collision: ' + filename);
		accum[filename] = data;
		return accum;
	}, {});

	return mydata;
}



module.exports = collateAnimal;