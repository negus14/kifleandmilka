/**
 * Google Apps Script for handling RSVP form submissions
 * 
 * This version uses robust JSON parsing for text/plain content
 * to ensure compatibility with no-cors requests.
 */

var SHEET_ID = "1ZLvdGJhHxvOU0QMiJZSfsL_9zJ-5G6Nkhmop7wPBIW8"; // Your Google Sheet ID

function doPost(e) {
  try {
    // Robustly parse the incoming contents
    var contents = e.postData.contents;
    var data;
    
    try {
      data = JSON.parse(contents);
    } catch (parseError) {
      // Return error if parsing fails
      return ContentService.createTextOutput("Error: Failed to parse JSON").setMimeType(ContentService.MimeType.TEXT);
    }
    
    // Log to the Google Sheet
    if (SHEET_ID) {
      var ss = SpreadsheetApp.openById(SHEET_ID);
      var sheet = ss.getSheets()[0]; // Log to the first tab
      sheet.appendRow([
        new Date(), 
        data.name || "N/A", 
        data.email || "N/A", 
        data.attending === 'yes' ? 'Accepts' : 'Declines',
        data.guests || 0, 
        data.dietary || 'None', 
        data.message || 'No message'
      ]);
    }

    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
