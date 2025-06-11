import { Viewer, ViewerOptions } from "mapillary-js";

const container = document.createElement("div");
container.style.width = "400px";
container.style.height = "300px";
document.body.appendChild(container);

const options: ViewerOptions = {
  accessToken: "<your access token>",
  container,
  imageId: "<your image ID for initializing the viewer>",
};
const viewer = new Viewer(options);
