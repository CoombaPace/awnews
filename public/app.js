/* ===========================================================================
                             FUNCTIONS & BUTTONS
   =========================================================================== */


/* ========== When User clicks Get Articles Button ========== */
$(document).on("click", "#scrape", function (e) {
  e.preventDefault();

  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "GET",
    url: "/scrape/"
  }).then(function() {
    $.getJSON("/articles", function(data) {
      console.log("This ID: " + thisId);
      location.reload();
    });
  });
});

/* ========== When User clicks Remove Button ========== */
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

/* ========== When User clicks Clear All Button ========== */
$(document).on("click", "#clear", function () {
  // e.preventDefault();
  $.ajax({
    method: "GET",
    url: "/articles"
  }).then(function (data) {
    // console.log("data: " + data);
    console.log("data: " + JSON.stringify(data));

    $.ajax({
      method: "DELETE",
      url: "/articles"
    })
    console.log("posted")
    location.reload();
  });
})

/* ========== When User clicks Save Button ========== */
$(document).on("click", "#save-article", function () {
  var thisId = $(this).attr("data-id");
  console.log("this = " + JSON.stringify($(this)))
  console.log("thisId = " + thisId)
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log("data: " + JSON.stringify(data));
      $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          // title: data.title,
          saved: true
        }
      })
      console.log("data: " + JSON.stringify(data));

      console.log("posted")
      // location.reload();
    });
})


/* ========== Whenever User clicks the add note button ========== */
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
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

/* ========== When you click the save note button ========== */
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
    })
  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
}).catch(function(err) {
  res.json(err);
})

/* ========== Unused  ========== */

/*

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
*/

