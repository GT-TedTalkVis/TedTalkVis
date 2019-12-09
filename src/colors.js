/* File: colors.ts
 * Author: Steven Hillerman
 * Date: 10/31/2019
 * ----------------
 * This file contains the color codes for the display.
 */

const DARK_BG = "#333333"; // Main background color
const LIGHTER_BG = "#5F5F5F"; // Navigation bar background color
const LIGHT_GREY = "#ACACAC"; // Grey used in graphs to stand out
const TITLE_WHITE = "#DADADA"; // Bright grey used in the title of each vis
const TEAL = "#00C89D"; // Teal used as an accent or highlight
const SELECTION_GREEN = "#A0C29E"; // Used to mark which view is selected in the navigation bar
const TED_RED = "#E62B1E"; // Used in the circle packing charts as circle fill (LIGHT_GREY text and outlines)
const DARK_RED = "#b32015";
const BRIGHT_GREEN = "#13B100"; // Good ratings in the ratings breakdown
const BRIGHT_RED = "#B10007"; // Bad ratings in the ratings breakdown
const BRIGHT_ORANGE = "#B17D00"; // Mediocre ratings in ratings breakdown
const HIGHLIGHT_COLOR = TEAL;

const COLORS = { DARK_BG, LIGHTER_BG, LIGHT_GREY, TITLE_WHITE, TEAL, SELECTION_GREEN, TED_RED, BRIGHT_GREEN, BRIGHT_RED,
    BRIGHT_ORANGE, HIGHLIGHT_COLOR, DARK_RED };

export default COLORS;
