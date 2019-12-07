import { createRatingsBaseVis, updateRatingsVis } from "./ratingsBreakdown";
import * as jq from "jquery";
import * as select2 from "select2";

const selectors = { TALK: 0, SPEAKER: 1, PROFESSION: 2 };

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
    const talkLabel = selectorMenu.append("label").attr("for", "talkSelector").html("Select Talk:");
    const talkSelector =
        talkLabel.append("select").attr("id", "talkSelector").attr("class", "ratingSelector");
    const speakerLabel = selectorMenu.append("label").attr("for", "speakerSelector").html("Select Speaker:");
    const speakerSelector =
        speakerLabel.append("select").attr("id", "speakerSelector").attr("class", "ratingSelector");
    const professionLabel = selectorMenu.append("label").attr("for", "professionSelector").html("Select Speaker Profession:");
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
    jq('#talkSelector').on("change", () => { updateCharts(selectors.TALK); });
    jq('#speakerSelector').on("change", () => { updateCharts(selectors.SPEAKER); });
    jq('#professionSelector').on("change", () => { updateCharts(selectors.PROFESSION); });


    // Add the different visualizations
    createRatingsBaseVis(vis, data);

    function updateCharts(changed) {
        // Get ratings for selected talk or talks
        const selectedTalks = jq('#talkSelector').select2('data');
        const selectedSpeakers = jq('#speakerSelector').select2('data');
        const selectedProfessions = jq('#professionSelector').select2('data');

        let newData = data;
        switch (changed) {
            case selectors.TALK:
                jq("#speakerSelector").val("All");
                jq("#professionSelector").val("All");
                jq("#speakerSelector").trigger("change.select2");
                jq("#professionSelector").trigger("change.select2");
                if (!selectedTalks.includes("All")) newData = getTalkByName(selectedTalks);
                break;
            case selectors.SPEAKER:
                jq("#talkSelector").val("All");
                jq("#professionSelector").val("All");
                jq("#talkSelector").trigger("change.select2");
                jq("#professionSelector").trigger("change.select2");
                if (!selectedSpeakers.includes("All")) newData = getTalksBySpeaker(selectedSpeakers);
                break;
            case selectors.PROFESSION:
                jq("#speakerSelector").val("All");
                jq("#talkSelector").val("All");
                jq("#speakerSelector").trigger("change.select2");
                jq("#talkSelector").trigger("change.select2");
                if (!selectedProfessions.includes("All")) newData = getTalksByProfession(selectedProfessions);
                break;
        }

        updateRatingsVis(newData);
    }

    function includesText(array, value) {
        for (let i = 0; i < array.length; i++) {
            if (array[i].text === value) return true;
        }
        return false;
    }

    // Finds and returns all talks with the given talk name
    function getTalkByName(names) {
        let talks = [];
        console.log(names);
        for (let i = 0; i < data.length; i++) {
            if (includesText(names, data[i]["name"])) talks.push(data[i]);
        }
        console.log(talks);
        return talks;
    }

    // Finds and returns all talks by the given speaker
    function getTalksBySpeaker(speakers) {
        let talks = [];
        for (let i = 0; i < data.length; i++) {
            if (includesText(speakers, data[i]["main_speaker"])) talks.push(data[i]);
        }
        return talks;
    }

    // Finds and returns all talks by speakers with the given profession
    function getTalksByProfession(professions) {
        let talks = [];
        for (let i = 0; i < data.length; i++) {
            if (includesText(professions, data[i]["grouped_occupation"])) talks.push(data[i]);
        }
        return talks;
    }
}