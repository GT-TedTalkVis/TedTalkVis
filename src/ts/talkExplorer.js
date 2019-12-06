import { createRatingsBaseVis, updateRatingsVis } from "./ratingsBreakdown";

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

export default function(div, data)
{
    const margin = {
        top: 30,
        right: 30,
        bottom: 30,
        left: 30,
    };

    // Set sizing constants
    const svgHeight = 400;
    const svgWidth = 900;
    const barHeight = svgWidth / 30;
    const iconHeight = barHeight * 0.8;
    const iconOffset = (barHeight - iconHeight) / 2;
    const pieOuterRadius = svgHeight * 0.22;
    const pieInnerRadius = pieOuterRadius * 0.78;

    // Create menu and vis locations
    const menu = div.append("div").attr("class", "menu");
    const resultsMenu = menu.append("div").attr("class", "resultsMenu submenu");
    const selectorMenu = menu.append("div").attr("class", "selectMenu submenu");
    const vis = div.append("div").attr("class", "vis");

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
    selectorMenu.append("label").attr("for", "talkSelector").html("Select Talk:");
    const talkSelector = selectorMenu.append("select").attr("id", "talkSelector");
    selectorMenu.append("label").attr("for", "speakerSelector").html("Select Speaker:");
    const speakerSelector = selectorMenu.append("select").attr("id", "speakerSelector");
    selectorMenu.append("label").attr("for", "professionSelector").html("Select Speaker Profession:");
    const professionSelector = selectorMenu.append("select").attr("id", "professionSelector");
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
    talkSelector.on("change", updateCharts);
    speakerSelector.on("change", updateCharts);
    professionSelector.on("change", updateCharts);


    // Add the different visualizations
    createRatingsBaseVis(vis);
    updateRatingsVis(data);

    function updateCharts(newData) {

    }
}