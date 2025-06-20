import { Viewer, ViewerOptions } from "mapillary-js";

const container = document.createElement("div");
container.style.width = "400px";
container.style.height = "300px";
document.body.appendChild(container);

const options: ViewerOptions = {
  accessToken: import.meta.env.VITE_MAPILLARY_ACCESS_TOKEN,
  container,
  imageId: "1234567890",
};
export const viewer = new Viewer(options);
