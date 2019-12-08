export default class InfoController {
  constructor() {
    this.fixedInfoBox = document.getElementById("fixed-info-box")
    this.titleElement = document.getElementById("fixed-info-title");
    this.thumbnailElement = document.getElementById("video-thumbnail");
    this.descriptionElement = document.getElementById("video-description");
    this.videoAnchorTag = document.getElementById("video-url");

    this.isOpen = false;

    this.closeButton = document.getElementById("fixed-info-box-exit");
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
    this.descriptionElement.innerHTML = description;
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