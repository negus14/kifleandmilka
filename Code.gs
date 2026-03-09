/**
 * Google Apps Script for handling RSVP form submissions
 * 
 * This version ONLY logs to a Google Sheet and does NOT send emails.
 */

var SHEET_ID = "1ZLvdGJhHxvOU0QMiJZSfsL_9zJ-5G6Nkhmop7wPBIW8"; // Your Google Sheet ID

function doPost(e) {
  try {
    // When using no-cors from fetch, data usually arrives in e.postData.contents
    var data = JSON.parse(e.postData.contents);
    
    // Log to the Google Sheet
    if (SHEET_ID) {
      var ss = SpreadsheetApp.openById(SHEET_ID);
      var sheet = ss.getSheets()[0]; // Log to the first tab
      sheet.appendRow([
        new Date(), 
        data.name, 
        data.email, 
        data.attending === 'yes' ? 'Accepts' : 'Declines',
        data.guests, 
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
