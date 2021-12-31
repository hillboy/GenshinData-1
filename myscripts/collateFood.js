const xrecipe = getExcel('CookRecipeExcelConfigData');
const xmaterial = getExcel('MaterialExcelConfigData');
const xsource = getExcel('MaterialSourceDataExcelConfigData');
const xspecialty = getExcel('CookBonusExcelConfigData');
const xavatar = getExcel('AvatarExcelConfigData');

function getSpecialty(id) { return xspecialty.find(ele => ele.RecipeId === id); }
function getMaterial(id) { return xmaterial.find(ele => ele.Id === id); }
function getAvatar(id) { return xavatar.find(ele => ele.Id === id); }
function getManualTextMapHash(id) { 
	if(id === 'COOK_FOOD_DEFENSE') id = 'COOK_FOOD_DEFENCE';
	return xmanualtext.find(ele => ele.TextMapId === id).TextMapContentTextMapHash;
}

const mapQualityToProp = {
	'FOOD_QUALITY_STRANGE': 'suspicious',
	'FOOD_QUALITY_ORDINARY': 'normal',
	'FOOD_QUALITY_DELICIOUS': 'delicious',
}

function collateFood(lang) {
	const language = getLanguage(lang);

	let myfood = xrecipe.reduce((accum, obj) => {
		//if(obj.Id !== 1003) return accum;

		let data = {};

		data.name = language[obj.NameTextMapHash];
		data.Id = obj.Id;
		data.rarity = obj.RankLevel;
		data.foodtype = 'NORMAL';
		data.foodfilter = language[getManualTextMapHash(obj.FoodType)];
		data.foodcategory = undefined;
		data.effect = obj.EffectDesc.reduce((accum, eff) => {
			const tmp = replaceLayout(stripHTML(language[eff]));
			if(tmp) accum.push(tmp);
			return accum;
		}, []).join('\n');
		data.description = sanitizeDescription(language[obj.DescTextMapHash]);
		// check error
		for(let i = 2; i <= 3; i++) { const tmp = language[obj.EffectDesc[i]]; if(tmp) console.log(`${obj.Id} ${data.name}: ${tmp}`); }

		// get suspicious, normal, delicious
		for(let xd of obj.QualityOutputVec) {
			xd = getMaterial(xd.Id);
			let subdata = {};
			if(language[xd.InteractionTitleTextMapHash]) console.log(`food ${obj.Id} has interaction`);
			if(language[xd.SpecialDescTextMapHash]) console.log(`food ${obj.Id} has special`);
			subdata.effect = language[xd.EffectDescTextMapHash];
			subdata.description = sanitizeDescription(language[xd.DescTextMapHash]);
			data[mapQualityToProp[xd.FoodQuality]] = subdata;
			data.foodcategory = xd.EffectIcon.substring(13);
		}
		data.ingredients = obj.InputVec.reduce((accum, ing) => {
			if(ing.Id === undefined) return accum;
			const mat = getMaterial(ing.Id);
			accum.push({ name: language[mat.NameTextMapHash], count: ing.Count });
			return accum;
		}, []);
		// data.source = 
		data.imagename = obj.Icon;

		accum[makeFileName(getLanguage('EN')[obj.NameTextMapHash])] = data;

		// check if there is a specialty
		let myspec = getSpecialty(obj.Id);
		if(myspec === undefined) return accum;
		let xd = getMaterial(myspec.ParamVec[0]);
		// if(xd === undefined) return accum;
		let foodfilter = data.foodfilter;
		let basedish = data.name;
		let ingredients = data.ingredients;

		let spdata = {};
		spdata.name = language[xd.NameTextMapHash];
		spdata.rarity = xd.RankLevel;
		spdata.foodtype = 'SPECIALTY';
		spdata.foodfilter = foodfilter;
		spdata.foodcategory = xd.EffectIcon.substring(13);

		if(language[xd.InteractionTitleTextMapHash]) console.log(`specialty ${obj.Id} has interaction`);
		if(language[xd.SpecialDescTextMapHash]) console.log(`specialty ${obj.Id} has special`);
		spdata.effect = replaceLayout(language[xd.EffectDescTextMapHash]);
		spdata.description = sanitizeDescription(language[xd.DescTextMapHash]);

		spdata.basedish = basedish;
		spdata.character = language[getAvatar(myspec.AvatarId).NameTextMapHash];
		
		spdata.ingredients = ingredients;
		spdata.imagename = xd.Icon;

		accum[makeFileName(getLanguage('EN')[xd.NameTextMapHash])] = spdata;
		return accum;
	}, {});
	// console.log(myfood);

	return myfood;
}

module.exports = collateFood;