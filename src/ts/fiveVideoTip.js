import { infoController } from "./introvis";
const thumbnailDirectory = "./images/thumbnails/";

export default class FiveVideoTip {
  constructor() {
    this.fvContainer = document.getElementById("five-videos-container");

    this.isOpen = false;
    this.x = -40;
    this.y = -20;
    this.frozen = false;
  }

  open(x, y) {
    if (x !== undefined && y !== undefined) {
      this.fvContainer.style.left = `${x}vw`;
      this.fvContainer.style.top = `${y}vh`;
      this.fvContainer.style.visibility = "visible";
    } else {
      this.fvContainer.style.left = `${this.x}vw`;
      this.fvContainer.style.top = `${this.y}vh`;
      this.fvContainer.style.visibility = "visible";
    }
  }

  close() {
    this.fvContainer.style.left = `-50vw`;
    this.fvContainer.style.top = `-50vh`;
    this.fvContainer.style.visibility = "visible";
  }

  displayVideos(dataRows, thenFreeze, click) {
    if (this.frozen && click === false) {
      return;
    }

    // Remove existing cards
    while (this.fvContainer.firstChild) {
      this.fvContainer.removeChild(this.fvContainer.firstChild);
    }

    dataRows.forEach((d, i) => {
      const fvCard = document.createElement("div");
      fvCard.setAttribute("class", "fv-card");

      const imgContainer = document.createElement("div");
      imgContainer.setAttribute("class", "img-container");

      const titleContainer = document.createElement("div");
      titleContainer.setAttribute("class", "title-container");

      if (i === 2) {
        titleContainer.style.backgroundColor = `rgba(255, 0, 0, 0.3)`;
      }

      const image = document.createElement("img");
      image.src = thumbnailDirectory + d["thumbnail_path"];

      fvCard.appendChild(imgContainer);
      fvCard.appendChild(titleContainer);
      imgContainer.appendChild(image);

      titleContainer.innerText = d["title"];

      this.fvContainer.appendChild(fvCard);
    })

    if (thenFreeze) {
      this.frozen = true;
    }
  }
}