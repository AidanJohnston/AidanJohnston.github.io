window.onscroll = function () { scrollFunction() };
function scrollFunction() {
  if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
    document.querySelector("#aidanjohnston").classList.add("navHero");
  } else {
    document.querySelector("#aidanjohnston").classList.remove("navHero");
  }
}
