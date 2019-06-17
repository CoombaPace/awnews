/* ===========================================================================
                             FUNCTIONS & BUTTONS
   =========================================================================== */

// Grab the articles as a json

$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    
    $("#articles").append(
    `
    <div class="card" id="entry">
    <p data-id=${data[i]._id}><h4 id="articleTitle">${data[i].title}</h4>
    </br> 
    <h5>${data[i].summary}</h5>
    </br>
    ${data[i].link}
    <div class="btn-group" role="group" aria-label="Basic example">
      <button type="button" class="btn btn-outline-secondary" id="notesBtn" data-id=${data[i]._id}>Add Note</button>
      <button type="button" class="btn btn-outline-secondary" id="deleteBtn" data-id=${data[i]._id}>Remove</button>
    </div>
    </div>
    `
    // Continue reading link comes in with result.summary data.
    // We add a URL for the results that do not have a link included.
    );
  }
});



$(document).on("click", "#scrape", function (e) {
  e.preventDefault();

  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "GET",
    url: "/scrape/"
  }).then();
  console.log("This ID: " + thisId);
  $.getJSON("/articles", function(data) {
    location.reload();
  });
  
  
});

// When User clicks the delete button.
$(document).on("click", "#deleteBtn", function (e) {
  e.preventDefault();
  
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "DELETE",
    url: "/articles/" + thisId
  }).then();
  console.log(thisId);
  location.reload();
  
});

// Whenever User clicks the add note button.
$(document).on("click", "#notesBtn", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the save note button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
