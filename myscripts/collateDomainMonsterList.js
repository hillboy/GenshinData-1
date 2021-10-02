const fuzzysort = require('fuzzysort');

const xdungeon = getExcel('DungeonExcelConfigData');


const monsterMap = {
	"bless autumn hunt i": ['hili berserk', 'el hili grenad', 'ele hili shoot', 'el slime', 'crack axe mita'],
	"bless autumn hunt ii": ['el hili grenad', 'la el slime', 'mu el slime', 'crack axe mita'],
	"bless autumn hunt iii": ['la el slime', 'mu el slime', 'el ab mage'],
	"bless autumn hunt iv": ['la el slime', 'el ab mage', 'thunder lawa'],

	"bless dance steel i": ['treasure ho cr po', 'treasure handy', 'treasure grave', 'treasure sea', 'treasure pug'],
	"bless dance steel ii": ['fa py agent', 'treasure scout', 'pyro potioneer', 'hydro potioneer', 'handyman', 'pugilist', 'crusher'],
	"bless dance steel iii": ['pyro agent', 'fa el ci mage', 'th scout', 'th py potion', 'th el potion', 'th handyman', 'th grave', 'th pugilist', 'th crusher'],
	"bless dance steel iv": ['pyro agent', 'fa el ci mage', 'th pyro pot', 'th hy pot', 'th el pot', 'th cry pot', 'th seaman'],
	"bless dance steel v": ['pyro agent', 'fa el ci mage', 'th cry pot'],

	"bless elegaic r i": ['cr slime', 'la cry slime', 'ice shield mita'],
	"bless elegaic r ii": ['cr slime', 'la cr slime', 'cr hili grenad', 'ice shield mita'],
	"bless elegaic r iii": ['la cr slime', 'cr hili grenad', 'ice shield mita', 'cr ab mage'],
	"bless elegaic r iv": ['frostarm lawa', 'cr ab mage'],

	"bless fire puri i": ['cryo slime', 'large cryo slime', 'large hydro slime', 'wood shield hili guard', 'cryo mage'],
	"bless fire puri ii": ['elec slime', 'lar elec slime', 'muta ele slime', 'fat ele cic mage'],
	"bless fire puri iii": ['cry slime', 'lar cry slime', 'cr ab mage'],
	"bless fire puri iv": ['hy slime', 'la hy sl', 'hy sama', 'hy ab mage'],
	"bless fire puri v": ['la cr slime', 'cr ab mage'],
	"bless fire puri vi": ['la el slime', 'mu el slime', 'fa el ci mage'],

	"bless frost i": ['la el slime', 'mu el slime', 'hy slime', 'la hy slime'],
	"bless frost ii": ['la py slime', 'bla ax mitachurl', 'py ab mage'],
	"bless frost iii": ['la el slime', 'mu ele slime', 'hili fighter', 'fa el ci mage'],
	"bless frost iv": ['la py slime', 'bla axe mitachurl', 'py ab mage'],

	"bless spring i": ['hy slime', 'la hy slime', 'hy ab mage'],
	"bless spring ii": ['py slime', 'la py slime', 'py ab mage'],
	"bless spring iii": ['cr slime', 'la cr slime', 'cr ab mage'],
	"bless spring iv": ['hy slime', 'la hy slime', 'hili fighter', 'hy samachurl', 'hy aby mage'],
	"bless spring v": ['py ab mage', 'ruin guard'],
	"bless spring vi": ['hili fighter', 'cr ab mage', 'ruin hunter'],

	"bless stone chamber i": ['py ab mage', 'cr abyss mage'],
	"bless stone chamber ii": ['py ab mage', 'cr aby mage'],
	"bless stone chamber iii": ['py ab mage', 'cr ab mage', 'hy ab mage'],

	"bless unyield i": ['py slime', 'la py slime', 'hili berserk'],
	"bless unyield ii": ['la py slime', 'hili berserk', 'blaz axe mita'],
	"bless unyield iii": ['la py slime', 'blaz axe mita', 'rock shield mita'],
	"bless unyield iv": ['geovish'],

	"forge alt sand i": ['hy slime', 'la hy slime', 'py slime', 'la py slime'],
	"forge alt sand ii": ['la hy slime', 'la py slime'],
	"forge alt sand iii": ['la hy slime', 'la py slime', 'hy ab mage', 'py ab mage'],
	"forge alt sand iv": ['el hili grenad', 'la el slime', 'mu el slime', 'crack axe mita'],

	"forge city reflect i": ['hy slime', 'la hy slime'],
	"forge city reflect ii": ['hy slime', 'la hy slime', 'wood shield hili guard'],
	"forge city reflect iii": ['hy slime', 'la hy slime', 'hy samachurl', 'hy ab mage'],
	"forge city reflect iv": ['la hy slime', 'hy ab mage'],

	"forge ruin capital i": ['hy slime', 'la hy slime'],
	"forge ruin capital ii": ['hy slime', 'la hy slime', 'wood shield hili guard'],
	"forge ruin capital iii": ['hy slime', 'la hy slime', 'hy samachurl', 'hy ab mage'],
	"forge ruin capital iv": ['la hy slime', 'hy ab mage'],

	"forge sand burial i": ['hy slime', 'la hy slime', 'py slime', 'la py slime'],
	"forge sand burial ii": ['la hy slime', 'la py slime'],
	"forge sand burial iii": ['la hy slime', 'la py slime', 'hy ab mage', 'py ab mage'],
	"forge sand burial iv": ['el hili grenad', 'la el slime', 'mu el slime', 'crack axe mita'],

	"forge sub valley i": ['hy slime', 'la hy slime'],
	"forge sub valley ii": ['hy slime', 'la hy slime', 'wood shield hili guard'],
	"forge sub valley iii": ['hy slime', 'la hy slime', 'hy samachurl', 'hy ab mage'],
	"forge sub valley iv": ['la hy slime', 'hy ab mage'],

	"forge sunke sand i": ['hy slime', 'la hy slime', 'py slime', 'la py slime'],
	"forge sunke sand ii": ['la hy slime', 'la py slime'],
	"forge sunke sand iii": ['la hy slime', 'la py slime', 'hy ab mage', 'py ab mage'],
	"forge sunke sand iv": ['el hili grenad', 'la el slime', 'mu el slime', 'crack axe mita'],

	"forge thunder alt i": ['el slime', 'la el slime', 'mu el slime'],
	"forge thunder alt ii": ['el slime', 'la el slime', 'mu el slime'],
	"forge thunder alt iii": ['la el slime', 'mu el slime', 'fa el ci mage'],
	"forge thunder alt iv": ['la el slime', 'mu el slime', 'fa el ci mage'],

	"forge thunder ruin i": ['el slime', 'la el slime', 'mu el slime'],
	"forge thunder ruin ii": ['el slime', 'la el slime', 'mu el slime'],
	"forge thunder ruin iii": ['la el slime', 'mu el slime', 'fa el ci mage'],
	"forge thunder ruin iv": ['la el slime', 'mu el slime', 'fa el ci mage'],

	"forge trial thunder i": ['el slime', 'la el slime', 'mu el slime'],
	"forge trial thunder ii": ['el slime', 'la el slime', 'mu el slime'],
	"forge trial thunder iii": ['la el slime', 'mu el slime', 'fa el ci mage'],
	"forge trial thunder iv": ['la el slime', 'mu el slime', 'fa el ci mage'],

	"maste alt flame i": ['py slime', 'la py slime', 'py ab mage'],
	"maste alt flame ii": ['py slime', 'la py slime', 'py ab mage'],
	"maste alt flame iii": ['la py slime', 'py ab mage'],
	"maste alt flame iv": ['blaz axe mita', 'pyro agent'],

	"maste cir ember i": ['py slime', 'la py slime', 'py ab mage'],
	"maste cir ember ii": ['py slime', 'la py slime', 'py ab mage'],
	"maste cir ember iii": ['la py slime', 'py ab mage'],
	"maste cir ember iv": ['blaz axe mita', 'pyro agent'],

	"maste frost alt i": ['cr slime', 'la cr slime', 'cr ab mage'],
	"maste frost alt ii": ['cr slime', 'la cr slime', 'hili fight', 'cr ab mage'],
	"maste frost alt iii": ['cr slime', 'la cr slime', 'cr ab mage'],
	"maste frost alt iv": ['la cr slime', 'cr ab mage'],

	"maste froz abyss i": ['cr slime', 'la cr slime', 'cr ab mage'],
	"maste froz abyss ii": ['cr slime', 'la cr slime', 'hili fight', 'cr ab mage'],
	"maste froz abyss iii": ['cr slime', 'la cr slime', 'cr ab mage'],
	"maste froz abyss iv": ['la cr slime', 'cr ab mage'],

	"maste heart flame i": ['py slime', 'la py slime', 'py ab mage'],
	"maste heart flame ii": ['py slime', 'la py slime', 'py ab mage'],
	"maste heart flame iii": ['la py slime', 'py ab mage'],
	"maste heart flame iv": ['blaz axe mita', 'pyro agent'],

	"maste realm slumb i": ['cr slime', 'la cr slime', 'cr ab mage'],
	"maste realm slumb ii": ['cr slime', 'la cr slime', 'hili fight', 'cr ab mage'],
	"maste realm slumb iii": ['cr slime', 'la cr slime', 'cr ab mage'],
	"maste realm slumb iv": ['la cr slime', 'cr ab mage'],

	"maste reign violet i": ['hili', 'el hili grenad', 'el hili shoot', 'crack axe mita'],
	"maste reign violet ii": ['nobu jintou', 'nobu hitsuke', 'nobu kikou', 'th pyro pot', 'th elec pot'],
	"maste reign violet iii": ['nobu hitsuke', 'nobu kikou', 'th pyro pot', 'th el pot', 'kairagi fiery'],
	"maste reign violet iv": ['th cryo pot', 'kairagi thunder', 'kairagi fiery'],

	"maste thund valley i": ['hili', 'el hili grenad', 'el hili shoot', 'crack axe mita'],
	"maste thund valley ii": ['nobu jintou', 'nobu hitsuke', 'nobu kikou', 'th pyro pot', 'th elec pot'],
	"maste thund valley iii": ['nobu hitsuke', 'nobu kikou', 'th pyro pot', 'th el pot', 'kairagi fiery'],
	"maste thund valley iv": ['th cryo pot', 'kairagi thunder', 'kairagi fiery'],

	"maste vine ruin i": ['hili', 'el hili grenad', 'el hili shoot', 'crack axe mita'],
	"maste vine ruin ii": ['nobu jintou', 'nobu hitsuke', 'nobu kikou', 'th pyro pot', 'th elec pot'],
	"maste vine ruin iii": ['nobu hitsuke', 'nobu kikou', 'th pyro pot', 'th el pot', 'kairagi fiery'],
	"maste vine ruin iv": ['th cryo pot', 'kairagi thunder', 'kairagi fiery'],
}

function autocomplete(input, dict) {
    let result = fuzzysort.go(input, dict, { limit: 1 })[0];
    if(result === undefined) console.log('DomainMonsterList: no match found for '+input);
    return result === undefined ? undefined : result.target;
}

const ENmonster = require('./export/EN/enemies.json');
const ENmonsterNames = Object.values(ENmonster).map(ele => ele.name);

const ENdomain = require('./export/EN/domains.json');
const ENdomainNames = Object.values(ENdomain).map(ele => ele.name);

const autoMonsterMap = {};
for(let [dom, monList] of Object.entries(monsterMap)) {
	dom = autocomplete(dom, ENdomainNames);
	if(dom === undefined) continue;
	monList = monList.map(ele => autocomplete(ele, ENmonsterNames));
	autoMonsterMap[dom] = monList;
}

function collateDomainMonsterList(lang) {
	const language = getLanguage(lang);
	let mydomain = require(`./export/${lang}/domains.json`);

	for(let [dom, monList] of Object.entries(autoMonsterMap)) {
		const domId = Object.values(ENdomain).find(ele => ele.name === dom).Id;
		const monNameHashList = monList.map(ele => Object.values(ENmonster).find(tmp => tmp.name === ele).NameTextMapHash);

		const monsterlist = monNameHashList.map(NameTextMapHash => language[NameTextMapHash]);

		Object.values(mydomain).find(ele => ele.Id === domId).monsterlist = monsterlist;
	}

	for(let dom of Object.values(mydomain)) {
		if(!dom.monsterlist) console.log(dom.name + ' has no monsterlist');
	}

	return mydomain
}

module.exports = collateDomainMonsterList;
