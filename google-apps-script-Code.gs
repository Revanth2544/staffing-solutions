// Google Apps Script - Job Application Form Handler
// 
// SETUP INSTRUCTIONS:
// 1. Go to https://script.google.com
// 2. Click "New Project"
// 3. Delete the default code and paste this entire file
// 4. Click "Deploy" > "New deployment"
// 5. Select type: "Web app"
// 6. Set "Execute as": "Me"
// 7. Set "Who has access": "Anyone"
// 8. Click "Deploy" and authorize when prompted
// 9. Copy the Web App URL and paste it in job-application.html 
//    (replace 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL')
// 10. Done! Form submissions will be emailed to the address below.

var RECIPIENT_EMAIL = "revanthkumar2544@gmail.com";
var EMAIL_SUBJECT = "New Job Application - Right Roll Solutions";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // Build email body as HTML table
    var htmlBody = '<h2 style="color:#2c3e6b;">New Job Application - Right Roll Solutions</h2>';
    htmlBody += '<table style="border-collapse:collapse; width:100%; max-width:600px; font-family:Arial,sans-serif;">';
    
    // Personal Information
    htmlBody += sectionHeader("Personal Information");
    htmlBody += tableRow("First Name", data.first_name);
    htmlBody += tableRow("Last Name", data.last_name);
    htmlBody += tableRow("Date of Birth", data.date_of_birth);
    htmlBody += tableRow("Gender", data.gender);
    htmlBody += tableRow("Education", data.education);
    htmlBody += tableRow("Email", data.email);
    htmlBody += tableRow("Phone", data.phone);
    htmlBody += tableRow("Leisure Interests", data.leisure_interests);
    
    // Address
    htmlBody += sectionHeader("Address");
    htmlBody += tableRow("Street Address", data.street_address);
    htmlBody += tableRow("Address Line 2", data.address_line_2);
    htmlBody += tableRow("City", data.city);
    htmlBody += tableRow("State/Region", data.state);
    htmlBody += tableRow("Postal Code", data.postal_code);
    htmlBody += tableRow("Country", data.country);
    
    // Employment
    htmlBody += sectionHeader("Previous/Current Employment");
    htmlBody += tableRow("Company Name", data.company_name);
    htmlBody += tableRow("Date of Joining", data.date_of_joining);
    htmlBody += tableRow("Date of Leaving", data.date_of_leaving);
    htmlBody += tableRow("Designation", data.designation);
    
    // Reference 1
    htmlBody += sectionHeader("Reference #1");
    htmlBody += tableRow("Name", (data.ref1_first_name || "") + " " + (data.ref1_last_name || ""));
    htmlBody += tableRow("Email", data.ref1_email);
    htmlBody += tableRow("Phone", data.ref1_phone);
    
    // Reference 2
    htmlBody += sectionHeader("Reference #2");
    htmlBody += tableRow("Name", (data.ref2_first_name || "") + " " + (data.ref2_last_name || ""));
    htmlBody += tableRow("Email", data.ref2_email);
    htmlBody += tableRow("Phone", data.ref2_phone);
    
    htmlBody += '</table>';
    
    // Prepare email options
    var emailOptions = {
      htmlBody: htmlBody
    };
    
    // Handle resume attachment if present
    if (data.resume_base64 && data.resume_name) {
      var fileBlob = Utilities.newBlob(
        Utilities.base64Decode(data.resume_base64),
        data.resume_type || "application/octet-stream",
        data.resume_name
      );
      emailOptions.attachments = [fileBlob];
    }
    
    // Send email
    GmailApp.sendEmail(
      RECIPIENT_EMAIL,
      EMAIL_SUBJECT + " - " + (data.first_name || "") + " " + (data.last_name || ""),
      "New job application received. View as HTML for details.",
      emailOptions
    );
    
    // Also save to Google Sheet (optional but useful)
    saveToSheet(data);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Application submitted" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "Job Application API is running" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper: Create table row
function tableRow(label, value) {
  value = value || "-";
  return '<tr>' +
    '<td style="padding:8px 12px; border:1px solid #ddd; background:#f8f8f8; font-weight:bold; width:35%;">' + label + '</td>' +
    '<td style="padding:8px 12px; border:1px solid #ddd;">' + value + '</td>' +
    '</tr>';
}

// Helper: Section header
function sectionHeader(title) {
  return '<tr><td colspan="2" style="padding:12px; background:#2c3e6b; color:#fff; font-weight:bold; font-size:14px;">' + title + '</td></tr>';
}

// Optional: Save submissions to a Google Sheet for record-keeping
function saveToSheet(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return; // No spreadsheet linked, skip
    
    var sheet = ss.getSheetByName("Applications") || ss.insertSheet("Applications");
    
    // Add headers if first row
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", "First Name", "Last Name", "DOB", "Gender", "Education",
        "Email", "Phone", "Street", "City", "State", "Postal Code", "Country",
        "Company", "Joining Date", "Leaving Date", "Designation",
        "Ref1 Name", "Ref1 Email", "Ref1 Phone",
        "Ref2 Name", "Ref2 Email", "Ref2 Phone",
        "Leisure Interests", "Resume Filename"
      ]);
    }
    
    sheet.appendRow([
      new Date(),
      data.first_name, data.last_name, data.date_of_birth, data.gender, data.education,
      data.email, data.phone, data.street_address, data.city, data.state, data.postal_code, data.country,
      data.company_name, data.date_of_joining, data.date_of_leaving, data.designation,
      (data.ref1_first_name || "") + " " + (data.ref1_last_name || ""), data.ref1_email, data.ref1_phone,
      (data.ref2_first_name || "") + " " + (data.ref2_last_name || ""), data.ref2_email, data.ref2_phone,
      data.leisure_interests, data.resume_name || ""
    ]);
  } catch (e) {
    // Sheet saving is optional, don't fail the whole request
    Logger.log("Sheet save error: " + e.toString());
  }
}
