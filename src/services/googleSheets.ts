import { BirthdayWish, RsvpSubmission } from '../types';

// Live Google Apps Script Web App Endpoint
const GOOGLE_SHEETS_WEB_APP_URL =
  import.meta.env.VITE_GOOGLE_SHEETS_URL ||
  'https://script.google.com/macros/s/AKfycbx8pgw7sRmBT-3Phf5H5u-j_29oMGXrqSOWFHNWIcHId_DKpbMEV_hZgpPZoT-M5n_8nA/exec';

/**
 * Complete Google Apps Script code handling RSVPs, Wishes, and Guest Photo Google Drive Uploads:
 * Paste this in Google Sheets > Extensions > Apps Script:
 * 
 * ```javascript
 * function doGet(e) {
 *   var type = (e && e.parameter && e.parameter.type) || 'wishes';
 *   var ss = SpreadsheetApp.getActiveSpreadsheet();
 *   
 *   if (type === 'rsvps') {
 *     var sheet = ss.getSheetByName('RSVPs') || ss.getSheets()[0];
 *     var data = sheet.getDataRange().getValues();
 *     var rsvps = [];
 *     for (var i = 1; i < data.length; i++) {
 *       if (data[i][0]) {
 *         rsvps.push({
 *           id: String(data[i][0]),
 *           guestName: String(data[i][1]),
 *           attending: String(data[i][2]),
 *           adultsCount: parseInt(data[i][3] || 0),
 *           kidsCount: parseInt(data[i][4] || 0),
 *           birthdayWish: String(data[i][5] || ''),
 *           submittedAt: String(data[i][6] || '')
 *         });
 *       }
 *     }
 *     return ContentService.createTextOutput(JSON.stringify(rsvps))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 *   
 *   if (type === 'photos') {
 *     var photoSheet = ss.getSheetByName('GuestPhotos');
 *     if (!photoSheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
 *     var photoData = photoSheet.getDataRange().getValues();
 *     var photos = [];
 *     for (var p = 1; p < photoData.length; p++) {
 *       if (photoData[p][0]) {
 *         photos.push({
 *           id: String(photoData[p][0]),
 *           uploaderName: String(photoData[p][1]),
 *           caption: String(photoData[p][2] || ''),
 *           imageUrl: String(photoData[p][3]),
 *           createdAt: String(photoData[p][4] || ''),
 *           likes: parseInt(photoData[p][5] || 1)
 *         });
 *       }
 *     }
 *     return ContentService.createTextOutput(JSON.stringify(photos))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 *   
 *   // Default: Wishes
 *   var wishSheet = ss.getSheetByName('Wishes') || ss.getSheets()[0];
 *   var wishData = wishSheet.getDataRange().getValues();
 *   var wishes = [];
 *   for (var j = 1; j < wishData.length; j++) {
 *     if (wishData[j][0]) {
 *       wishes.push({
 *         id: String(wishData[j][0]),
 *         sender: String(wishData[j][1]),
 *         message: String(wishData[j][2]),
 *         sticker: String(wishData[j][3] || '🐱'),
 *         likes: parseInt(wishData[j][4] || 0),
 *         timestamp: String(wishData[j][5] || '')
 *       });
 *     }
 *   }
 *   return ContentService.createTextOutput(JSON.stringify(wishes))
 *     .setMimeType(ContentService.MimeType.JSON);
 * }
 * 
 * function doPost(e) {
 *   var ss = SpreadsheetApp.getActiveSpreadsheet();
 *   var params = JSON.parse(e.postData.contents);
 *   
 *   if (params.action === 'addRsvp') {
 *     var rsvpSheet = ss.getSheetByName('RSVPs') || ss.getSheets()[0];
 *     var rsvpRow = [
 *       params.id,
 *       params.guestName,
 *       params.attending,
 *       params.adultsCount,
 *       params.kidsCount,
 *       params.birthdayWish || '',
 *       new Date().toLocaleString()
 *     ];
 *     rsvpSheet.appendRow(rsvpRow);
 *     return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 *   
 *   if (params.action === 'addWish') {
 *     var wishSheet = ss.getSheetByName('Wishes') || ss.getSheets()[0];
 *     var wishRow = [
 *       params.id,
 *       params.sender,
 *       params.message,
 *       params.sticker || '🐱',
 *       0,
 *       new Date().toLocaleString()
 *     ];
 *     wishSheet.appendRow(wishRow);
 *     return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 *   
 *   if (params.action === 'addGuestPhoto') {
 *     var folders = DriveApp.getFoldersByName('Celestine Party Photos');
 *     var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder('Celestine Party Photos');
 *     var base64Data = params.imageUrl.split(',')[1];
 *     var decodedBlob = Utilities.newBlob(
 *       Utilities.base64Decode(base64Data),
 *       'image/jpeg',
 *       params.uploaderName.replace(/\s+/g, '_') + '_' + Date.now() + '.jpg'
 *     );
 *     var file = folder.createFile(decodedBlob);
 *     file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
 *     var fileUrl = 'https://lh3.googleusercontent.com/d/' + file.getId();
 * 
 *     var photoSheet = ss.getSheetByName('GuestPhotos') || ss.insertSheet('GuestPhotos');
 *     photoSheet.appendRow([
 *       params.id,
 *       params.uploaderName,
 *       params.caption || '',
 *       fileUrl,
 *       new Date().toLocaleString(),
 *       1
 *     ]);
 *     return ContentService.createTextOutput(JSON.stringify({ status: 'success', fileUrl: fileUrl }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 *   
 *   if (params.action === 'likeWish') {
 *     var wishSheetLike = ss.getSheetByName('Wishes') || ss.getSheets()[0];
 *     var data = wishSheetLike.getDataRange().getValues();
 *     for (var k = 1; k < data.length; k++) {
 *       if (data[k][0] == params.id) {
 *         var currentLikes = parseInt(data[k][4] || 0) + 1;
 *         wishSheetLike.getRange(k + 1, 5).setValue(currentLikes);
 *         return ContentService.createTextOutput(JSON.stringify({ status: 'success', likes: currentLikes }))
 *           .setMimeType(ContentService.MimeType.JSON);
 *       }
 *     }
 *   }
 *   
 *   return ContentService.createTextOutput(JSON.stringify({ status: 'error' }))
 *     .setMimeType(ContentService.MimeType.JSON);
 * }
 * ```
 */

export const fetchWishesFromGoogleSheet = async (): Promise<BirthdayWish[] | null> => {
  if (!GOOGLE_SHEETS_WEB_APP_URL) return null;

  try {
    const res = await fetch(`${GOOGLE_SHEETS_WEB_APP_URL}?type=wishes`, {
      method: 'GET'
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch (error) {
    console.warn('Google Sheets wishes fetch failed:', error);
    return null;
  }
};

export const postWishToGoogleSheet = async (wish: BirthdayWish): Promise<boolean> => {
  if (!GOOGLE_SHEETS_WEB_APP_URL) return false;

  try {
    await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'addWish',
        ...wish
      })
    });
    return true;
  } catch (error) {
    console.warn('Google Sheets wish post failed:', error);
    return false;
  }
};

export const likeWishInGoogleSheet = async (wishId: string): Promise<boolean> => {
  if (!GOOGLE_SHEETS_WEB_APP_URL) return false;

  try {
    await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'likeWish',
        id: wishId
      })
    });
    return true;
  } catch (error) {
    console.warn('Google Sheets like failed:', error);
    return false;
  }
};

export const fetchRsvpsFromGoogleSheet = async (): Promise<RsvpSubmission[] | null> => {
  if (!GOOGLE_SHEETS_WEB_APP_URL) return null;

  try {
    const res = await fetch(`${GOOGLE_SHEETS_WEB_APP_URL}?type=rsvps`, {
      method: 'GET'
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch (error) {
    console.warn('Google Sheets rsvps fetch failed:', error);
    return null;
  }
};

export const postRsvpToGoogleSheet = async (rsvp: RsvpSubmission): Promise<boolean> => {
  if (!GOOGLE_SHEETS_WEB_APP_URL) return false;

  try {
    await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'addRsvp',
        ...rsvp
      })
    });
    return true;
  } catch (error) {
    console.warn('Google Sheets rsvp post failed:', error);
    return false;
  }
};

export const fetchGuestPhotosFromGoogleSheet = async (): Promise<any[] | null> => {
  if (!GOOGLE_SHEETS_WEB_APP_URL) return null;

  try {
    const res = await fetch(`${GOOGLE_SHEETS_WEB_APP_URL}?type=photos`, {
      method: 'GET'
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch (error) {
    console.warn('Google Sheets guest photos fetch failed:', error);
    return null;
  }
};

export const postGuestPhotoToGoogleSheet = async (photo: any): Promise<boolean> => {
  if (!GOOGLE_SHEETS_WEB_APP_URL) return false;

  try {
    await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'addGuestPhoto',
        ...photo
      })
    });
    return true;
  } catch (error) {
    console.warn('Google Sheets guest photo post failed:', error);
    return false;
  }
};
