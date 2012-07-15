var lastkey = 0;
var fakeText = true;

document.onkeypress = function(e) {
  if (fakeText && editor.getValue() !== "") shrinkFakeText(e);
}

var shrinkFakeText = function(e) {

    if (e !== undefined) {
      var theEvent = e || window.event;
      var key = theEvent.keyCode || theEvent.which;
      key = String.fromCharCode(key);
    } else key = '';

    var currentCaption = $('#caption').html();
    var shorterCaption = currentCaption.substring(0, currentCaption.length - 1);
    $('#caption').html(shorterCaption + key + "|");
    $('#fakeStartingBlinkingCursor').html('');

    $("#toMove").animate({
      opacity: 0,
      margin: -100,
      fontSize: 300,
      left: 0
    }, "fast");

    setTimeout('$("#formCode").animate({opacity: 1}, "fast");', 120);
    setTimeout('$("#justForFakeCursor").hide();', 200);
    setTimeout('$("#toMove").hide();', 200);
    //setTimeout('clearTimeout(fakeCursorInterval);',200);
    fakeText = false;

  }

var fakeCursorInterval;

function fakeCursorBlinking() {
  $("#fakeStartingBlinkingCursor").animate({
    opacity: 0.2
  }, "fast", "swing").animate({
    opacity: 1
  }, "fast", "swing");
}
