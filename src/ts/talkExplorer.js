import { createRatingsBaseVis, updateRatingsVis } from "./ratingsBreakdown";
import * as jq from "jquery";
import * as d3 from "d3"
import d3Tip from "d3-tip"
import * as select2 from "select2";

const selectors = { TALK: 0, SPEAKER: 1, PROFESSION: 2 };
let lastChanged = selectors.TALK;
let fullData = [];
let numResults = 5;

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

export function talkExplorer(div, data)
{
    fullData = data;

    // Create menu and vis locations
    const menu = div.append("div").attr("class", "menu");
    const resultsMenu = menu.append("div").attr("class", "resultsMenu submenu");
    const selectorMenu = menu.append("div").attr("class", "selectMenu submenu");
    const vis_section = div.append("div").attr("class", "vis-section");
    const title = vis_section.append("div").attr("class", "vis-title-div");
    const vis = vis_section.append("div").attr("class", "vis");

    div.append("div")
        .attr("class", "d3-tip title-tip")
        .html('Test');

    // Initialize title
    const visTitle = title.append("a")
        .data([data])
        .attr("class", "vis-title")
        .attr("target", "_blank")
        .attr("rel", "noopener noreferrer")
        .html("All Talks")
        .on("mouseover", function(d) {
            const tip = d3.select(".title-tip");
            tip.style("left", (d3.mouse(div.node())[0] - tip.node().getBoundingClientRect().width / 2) + "px");
            tip.style("top", (jq(".explorerDiv").offset().top + d3.mouse(div.node())[1] + 10) + "px");
            tip.html(() => {
                let contents = d[0].name + "<br><br>";
                contents += "Speaker: " + d[0].main_speaker + "<br><br>";
                contents += "Duration: " + (d[0].duration / 60).toFixed(2) + " min" + "<br><br>";
                contents += "Views: " + (+d[0].views).toLocaleString() + "<br><br>";
                contents += "<img src='" + d[0].thumbnail_url + "' style='max-width: 100%;'/>"
                return contents;
            });
            if (d.length === 1) tip.style("visibility", "visible");
        })
        .on("mouseout", function(d) {
            if (d.length === 1) d3.select(".title-tip").style("visibility", "hidden");
        });

    // Initialize results menu
    resultsMenu.append("div")
        .attr("class", "rating-result-label")
        .append("label")
        .attr("id", "rating-result-header");
    for (let i = 0; i < numResults; i++) {
        resultsMenu.append("p")
            .attr("id", "rating-result-" + i)
            .attr("class", "rating-menu-result clipped")
            .on("click", (d) => {
                console.log(d);
                jq("#talkSelector").val(d);
                jq("#talkSelector").trigger("change");
            });
    }

    // Create important arrays
    let speakers = [];
    let professions = [];
    for (let i = 0; i < data.length; i++) {
        speakers.push(data[i]["main_speaker"]);
        professions.push(data[i]["grouped_occupation"]);
    }
    speakers = speakers.filter(onlyUnique);
    professions = professions.filter(onlyUnique);

    // Create menu selection tools
    const talkLabel = selectorMenu.append("label").attr("for", "talkSelector").html("Select Talk:");
    const talkSelector =
        talkLabel.append("select").attr("id", "talkSelector").attr("class", "ratingSelector");
    const speakerLabel = selectorMenu.append("label").attr("for", "speakerSelector").html("Select Speaker:");
    const speakerSelector =
        speakerLabel.append("select").attr("id", "speakerSelector").attr("class", "ratingSelector");
    const professionLabel = selectorMenu.append("label").attr("for", "professionSelector").html("Select Profession:");
    const professionSelector =
        professionLabel.append("select").attr("id", "professionSelector").attr("class", "ratingSelector");
    talkSelector.append("option").attr("value", "All").text("All");
    speakerSelector.append("option").attr("value", "All").text("All");
    professionSelector.append("option").attr("value", "All").text("All");
    for (let i = 0; i < data.length; i++) {
        talkSelector
            .append("option")
            .attr("value", data[i]["name"])
            .text(data[i]["name"]);
    }
    for (let i = 0; i < speakers.length; i++) {
        speakerSelector
            .append("option")
            .attr("value", speakers[i])
            .text(speakers[i]);
    }
    for (let i = 0; i < professions.length; i++) {
        professionSelector
            .append("option")
            .attr("value", professions[i])
            .text(professions[i]);
    }

    jq(document).ready(function() {
        jq('.ratingSelector').select2({
            dropdownAutoWidth: true,
        });
    });
    jq('#talkSelector').on("change", () => {
        updateCharts(selectors.TALK);
    });
    jq('#speakerSelector').on("change", () => {
        updateCharts(selectors.SPEAKER);
        updateResults("good", true);
        d3.select("#rating-result-header").html("Best " + jq('#speakerSelector').select2('data')[0].text + " Talks");
    });
    jq('#professionSelector').on("change", () => {
        updateCharts(selectors.PROFESSION);
        updateResults("good", true);
        d3.select("#rating-result-header").html("Best " + jq('#professionSelector').select2('data')[0].text + " Talks");
    });


    // Add the different visualizations
    createRatingsBaseVis(vis, data);

    function updateCharts(changed) {
        // Get ratings for selected talk or talks
        const selectedTalks = jq('#talkSelector').select2('data');
        const selectedSpeakers = jq('#speakerSelector').select2('data');
        const selectedProfessions = jq('#professionSelector').select2('data');
        let titleText = "All Talks";
        let link = null;

        let newData = data;
        switch (changed) {
            case selectors.TALK:
                lastChanged = selectors.TALK;
                jq("#speakerSelector").val("All");
                jq("#professionSelector").val("All");
                jq("#speakerSelector").trigger("change.select2");
                jq("#professionSelector").trigger("change.select2");
                if (!includesText(selectedTalks, "All")) newData = getTalkByName(selectedTalks);
                titleText = selectedTalks[0].text;
                link = newData[0].url;
                break;
            case selectors.SPEAKER:
                lastChanged = selectors.SPEAKER;
                jq("#talkSelector").val("All");
                jq("#professionSelector").val("All");
                jq("#talkSelector").trigger("change.select2");
                jq("#professionSelector").trigger("change.select2");
                if (!includesText(selectedSpeakers, "All")) newData = getTalksBySpeaker(selectedSpeakers);
                titleText = "Talks by " + selectedSpeakers[0].text;
                break;
            case selectors.PROFESSION:
                lastChanged = selectors.PROFESSION;
                jq("#speakerSelector").val("All");
                jq("#talkSelector").val("All");
                jq("#speakerSelector").trigger("change.select2");
                jq("#talkSelector").trigger("change.select2");
                if (!includesText(selectedProfessions, "All")) newData = getTalksByProfession(selectedProfessions);
                if (selectedProfessions[0].text === "Visionary") titleText = "Talks by Visionaries";
                else if (selectedProfessions[0].text === "Businessman") titleText = "Talks by Businessmen";
                else if (selectedProfessions[0].text === "Military") titleText = "Talks by the Military";
                else if (selectedProfessions[0].text === "Miscellaneous") titleText = "Talks by Miscellaneous Professions";
                else titleText = "Talks by " + selectedProfessions[0].text + "s";
                break;
        }

        // Update title
        if (titleText === "All" || titleText === "Talks by All" || titleText === "Talks by Alls") {
            titleText = "All Talks";
            link = null;
        }
        visTitle
            .data([newData])
            .html(titleText)
            .attr("href", link);

        updateRatingsVis(newData);

        console.log("updated charts");
    }
    updateResults("good", true);
}

// Checks if the select2 data array contains the given value
function includesText(array, value) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].text === value) return true;
    }
    return false;
}

// Finds and returns all talks with the given talk name
function getTalkByName(names) {
    let talks = [];
    for (let i = 0; i < fullData.length; i++) {
        if (includesText(names, fullData[i]["name"])) talks.push(fullData[i]);
    }
    return talks;
}

// Finds and returns all talks by the given speaker
function getTalksBySpeaker(speakers) {
    let talks = [];
    for (let i = 0; i < fullData.length; i++) {
        if (includesText(speakers, fullData[i]["main_speaker"])) talks.push(fullData[i]);
    }
    return talks;
}

// Finds and returns all talks by speakers with the given profession
function getTalksByProfession(professions) {
    let talks = [];
    for (let i = 0; i < fullData.length; i++) {
        if (includesText(professions, fullData[i]["grouped_occupation"])) talks.push(fullData[i]);
    }
    return talks;
}

/* Updates the results section of the vis based on the data provided
 * Parameters:
 *      category: string indicating the category (rating) to sort by (uppercase first letter)
 *      fromChange: called from an on-change function.  Prevents infinite looping
 */
export function updateResults(category, fromChange)
{
    let data = fullData;
    switch (lastChanged) {
        case selectors.TALK:
            jq("#talkSelector").val("All");
            break;
        case selectors.SPEAKER:
            const selectedSpeakers = jq('#speakerSelector').select2('data');
            if (!includesText(selectedSpeakers, "All")) data = getTalksBySpeaker(selectedSpeakers);
            break;
        case selectors.PROFESSION:
            const selectedProfessions = jq('#professionSelector').select2('data');
            if (!includesText(selectedProfessions, "All")) data = getTalksByProfession(selectedProfessions);
            break;
    }

    // give each talk a percentage value for the category provided
    for (let i = 0; i < data.length; i++)
    {
        // count ratings
        const rawString = data[i]["ratings"];
        const ratingsString = rawString.replace(/'/g, '"');
        const ratingList = JSON.parse(ratingsString);
        data[i].good = 0;
        data[i].bad = 0;
        let ratingOfInterest = 0;
        let totalCount = 0;
        for (let j = 0; j < ratingList.length; j++) {
            switch (ratingList[j]["name"].toLowerCase()) {
                case "confusing":
                case "longwinded":
                case "unconvincing":
                case "obnoxious":
                case "ok":
                    data[i].bad += ratingList[j]["count"];
                    break;
                default:
                    data[i].good += ratingList[j]["count"];
            }
            if (ratingList[j]["name"] === category) ratingOfInterest = ratingList[j]["count"];
            totalCount += ratingList[j]["count"];
        }
        data[i]["percentageOfInterest"] = ratingOfInterest / totalCount;
        if (category === "good") data[i]["percentageOfInterest"] = data[i].good / totalCount;
        if (category === "bad") data[i]["percentageOfInterest"] = data[i].bad / totalCount;
    }

    const sorted_views = data.sort((a, b) => (b.good + b.bad) - (a.good + a.bad));
    const sorted = sorted_views.sort((a, b) => b["percentageOfInterest"] - a["percentageOfInterest"]);

    d3.select("#rating-result-header")
        .html(() => {
            if (category === "good") {
                if (data.length < fullData.length) {
                    if (lastChanged === selectors.SPEAKER) return "Best " + data[0]["main_speaker"] + " Talks";
                    if (lastChanged === selectors.PROFESSION) return "Best " + data[0]["grouped_occupation"] + " Talks";
                }
                return "Best Overall Talks:";
            }
            if (category === "bad") {
                if (lastChanged === selectors.SPEAKER) return "Worst " + data[0]["main_speaker"] + " Talks";
                if (lastChanged === selectors.PROFESSION) return "Worst " + data[0]["grouped_occupation"] + " Talks";
                return "Worst Overall Talks:";
            }
            else return "By " + category + " Ratings:";
        });
    for (let i = 0; i < numResults; i++) {
        if (i < sorted.length) {
            d3.select("#rating-result-" + i)
                .data([sorted[i].name])
                .html((i + 1) + ". " + sorted[i].name);
        } else {
            d3.select("#rating-result-" + i)
                .html("");
        }
    }

    if (!fromChange) {
        jq("#talkSelector").val(sorted[0].name);
        jq("#talkSelector").trigger("change");
    }

}