var passwordcheck = "jfuahfuiwha9fh829afh"
let typedKeys = "";

document.addEventListener("keydown", function(event) {
  typedKeys += event.key;
  if (typedKeys === "1576") {
    var passwordcheck = "cheese53"
  } else if (typedKeys.length > 4) {
    typedKeys = "";
  }
});
