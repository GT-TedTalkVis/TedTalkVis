import * as d3 from "d3";
export default class InfoController {
  constructor() {
    this.fixedInfoBox = document.getElementById("fixed-info-box")
    this.titleElement = document.getElementById("fixed-info-title");
    this.thumbnailElement = document.getElementById("video-thumbnail");
    this.descriptionElement = document.getElementById("video-description");
    this.videoAnchorTag = document.getElementById("video-url");

    this.isOpen = false;

    this.closeButton = document.getElementById("fixed-info-box-exit");
    d3.select("#fixed-info-box-exit").style("visibility", "hidden").style("pointer-events", "none");
    this.closeButton.addEventListener('click', () => {
      console.log("Closed.");
      this.close();
    })
  }

  setTitle(title) {
    this.titleElement.innerText = title;
  }

  setThumbnail(thumbnailURL) {
    this.thumbnailElement.src = "";
    this.thumbnailElement.style.visibility = "hidden";
    requestAnimationFrame(() => {
      this.thumbnailElement.src = thumbnailURL;
      this.thumbnailElement.style.visibility = "visible";
    })
  }

  setLink(videoLink) {
    this.videoAnchorTag.href = videoLink;
  }

  setDescription(description) {
    this.descriptionElement.innerHTML = description + "<br><br><br><span style='font-style: italic; font-size: 12pt'>Click to view talk</span>";
  }

  open() {
    this.fixedInfoBox.style.right = "0";
    this.isOpen = true;
  }

  close() {
    this.fixedInfoBox.style.right = "-40vw";
    this.isOpen = false;
  }
}