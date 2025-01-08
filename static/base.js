// Get the profile button and dropdown menu
const profileButton = document.getElementById("profileButton");
const dropdownMenu = document.getElementById("dropdownMenu");

// Set the dropdown menu to be hidden by default
dropdownMenu.style.display = "none";

// Add an event listener to toggle the dropdown on click
profileButton.addEventListener("click", function () {
    // console.log("profile button clicked", dropdownMenu.style.display);
    if (dropdownMenu.style.display === "none") {
      dropdownMenu.style.display = "block";
    }else{
      dropdownMenu.style.display = "none";
    }
    // dropdownMenu.classList.add("show");
});

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches(".user-info")) {
      // console.log("window clicked", dropdownMenu.style.display);
    if (dropdownMenu.style.display === "block") {
      dropdownMenu.style.display = "none";
    }
  }
};

// Function to show the dialog box with a custom title and message
function showDialog(title, message) {
    document.getElementById('dialogTitle').innerText = title;
    document.getElementById('dialogMessage').innerText = message;
    document.getElementById('dialogOverlay').style.display = 'flex';
}

