// See https://stackoverflow.com/questions/13917047/how-to-get-a-content-script-to-load-after-a-pages-javascript-has-executed
// https://stackoverflow.com/questions/11901074/javascript-call-a-function-after-specific-time-period

console.log("Starting experimental leveling system");

window.addEventListener("load", myMain, false);

function myMain(evt) {
  var jsInitChecktimer = setTimeout(replaceIt, 1000);

  function replaceIt() {
    document.querySelectorAll("a").forEach((link) => {
      if (link.className.indexOf("orm-Card-link") > -1) {
        let title = encodeURIComponent(link.innerText);
        let img = document.createElement("img");
        //img.src = `https://localhost:8081?format=svg&title=${title}`;
        img.src = `https://us-central1-gpt3-experiments-sparktime.cloudfunctions.net/gpt3_content_level_classifier?format=svg&title=${title}`;
        link.parentNode.replaceChild(img, link);
      }
    });
  }
}
