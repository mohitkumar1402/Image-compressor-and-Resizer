(function() {

let originalImage, preivewImage, ogRatio, blobURL, isNa;
let $ = (selector) => document.querySelector(selector);

let setNaturalDimension = () => {
  let {naturalWidth, naturalHeight} = originalImage;
  ogRatio = naturalWidth / naturalHeight;
  $("#width").value = naturalWidth;
  $("#height").value = naturalHeight;
  $(".original-dimension").textContent = $(".resized-dimension").textContent = `${naturalWidth} x ${naturalHeight}`;
};

let sizeFormat = (bytes) => {
  let kb = Math.floor(bytes / 1024 * 100) / 100;
  return kb >= 1024 ? (Math.floor(kb / 1024 * 100) / 100) + " MB" : kb + " KB";
};

$("#filepicker").addEventListener("change", (e) => {
  // Getting first selected file
  let file = e.target.files[0];

  // Return if user hasn't selected any file
  if (!file) return;

  // Converting file to image preview src
  blobURL = URL.createObjectURL(file);
  originalImage = new Image();
  originalImage.src = blobURL;
  preivewImage = originalImage.cloneNode(); // just to show

  $(".preview").innerHTML = "";
  $(".preview").appendChild(preivewImage);

  // Reset info
  $(".original-size").textContent = $(".cur-size").textContent = sizeFormat(file.size);
  $(".compressed-size").textContent = "N/A";
  $(".quality-level").textContent = "100%";
  $("#compressor").value = 1;

  originalImage.onload = setNaturalDimension;
  isNa = true;
});

let resizeAndCompress = (compressing) => {
  let canvas = document.createElement("canvas"),
  quality = +$("#compressor").value,
  ctx = canvas.getContext("2d");

  // Setting canvas height and width according to input values
  canvas.height = $("#height").value;
  canvas.width = $("#width").value;

  // Drawing the currently selected iamge onto the canvas
  ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    // Setting the compressed size when compressing
    if (!isNa || compressing) $(".compressed-size").textContent = sizeFormat(blob.size);
    $(".cur-size").textContent = sizeFormat(blob.size); // Setting current size

    // Override blobURL and Converting blob to and image preview src
    blobURL = URL.createObjectURL(blob);

    if (compressing) {
      // Set the Quality level to showing in precentage
      $(".quality-level").textContent = ((quality / 1) * 100) + "%";
      preivewImage.src = blobURL;
      isNa = false;
    }
  }, "image/jpeg", quality);
};

$("#compressor").addEventListener("input", resizeAndCompress);
$("#reset").addEventListener("click", () => (setNaturalDimension(), resizeAndCompress(true)));

let updateResizeDimension = () => {
  $(".resized-dimension").textContent = `${$("#width").value} x ${$("#height").value}`;
  resizeAndCompress();
};

$("#width").addEventListener("input", () => {
  // Maintaining aspect ratio of image height, if ratio is checked
  if ($("#ratio").checked) $("#height").value = Math.floor($("#width").value / ogRatio);
  updateResizeDimension();
});

$("#height").addEventListener("input", () => {
  // Maintaining aspect ratio of image width, if ratio is checked
  if ($("#ratio").checked) $("#width").value = Math.floor($("#height").value * ogRatio);
  updateResizeDimension();
});

$("#download").addEventListener("click", () => {
  let link = document.createElement("a");
  // Passing canvas blob url as href value of <a> element
  link.href = blobURL;
  link.download = Date.now(); // Passing current date as download value
  link.click(); // Clicking <a> element so the image download
});

})();