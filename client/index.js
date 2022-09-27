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
        let url = `https://localhost:8081?format=svg&title=${title}`;
        let img = document.createElement("img");
        img.src = url;
        img.style = "width: 200px; height: 100px;";
        //link.parentNode.insertBefore(img, link.nextSibling);
        link.parentNode.replaceChild(img, link);
        console.log("Replacing", url);
      }
    });
  }
}
