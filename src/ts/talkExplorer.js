import { createRatingsBaseVis, updateRatingsVis } from "./ratingsBreakdown";
import * as jquery from "jquery";

const selectors = { TALK: 0, SPEAKER: 1, PROFESSION: 2 };
let lastUpdate = selectors.TALK;

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

export default function(div, data)
{
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
    talkSelector.on("change", () => {
        updateCharts(selectors.TALK);
    });
    speakerSelector.on("change", () => {
        updateCharts(selectors.SPEAKER);
    });
    professionSelector.on("change", () => {
        updateCharts(selectors.PROFESSION);
    });

    // Add the different visualizations
    createRatingsBaseVis(vis, data);

    function updateCharts(changed) {
        // Get ratings for selected talk or talks
        const selectedTalk = talkSelector._groups[0][0].options[talkSelector._groups[0][0].selectedIndex].value;
        const selectedSpeaker = speakerSelector._groups[0][0].options[speakerSelector._groups[0][0].selectedIndex].value;
        const selectedProfession = professionSelector._groups[0][0].options[professionSelector._groups[0][0].selectedIndex].value;

        let newData = data;
        switch (changed) {
            case selectors.TALK:
                if (selectedTalk !== "All") newData = getTalkByName(selectedTalk);
                jquery("#speakerSelector").val("All");
                jquery("#professionSelector").val("All");
                break;
            case selectors.SPEAKER:
                if (selectedSpeaker !== "All") newData = getTalksBySpeaker(selectedSpeaker);
                jquery("#talkSelector").val("All");
                jquery("#professionSelector").val("All");
                break;
            case selectors.PROFESSION:
                if (selectedProfession !== "All") newData = getTalksByProfession(selectedProfession);
                jquery("#speakerSelector").val("All");
                jquery("#talkSelector").val("All");
                break;
        }

        updateRatingsVis(newData);
    }

    // Finds and returns all talks with the given talk name
    function getTalkByName(name) {
        let talks = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i]["name"] === name) talks.push(data[i]);
        }
        return talks;
    }

    // Finds and returns all talks by the given speaker
    function getTalksBySpeaker(speaker) {
        let talks = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i]["main_speaker"] === speaker) talks.push(data[i]);
        }
        return talks;
    }

    // Finds and returns all talks by speakers with the given profession
    function getTalksByProfession(profession) {
        let talks = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i]["grouped_occupation"] === profession) talks.push(data[i]);
        }
        return talks;
    }
}