import { BirthdayWish } from '../types';

// Optional: Set your Google Apps Script Web App URL here or in .env (VITE_GOOGLE_SHEETS_URL)
const GOOGLE_SHEETS_WEB_APP_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL || '';

/**
 * Google Apps Script backend code (Paste this into Google Sheets > Extensions > Apps Script):
 * 
 * ```javascript
 * function doGet(e) {
 *   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *   var data = sheet.getDataRange().getValues();
 *   var wishes = [];
 *   for (var i = 1; i < data.length; i++) {
 *     wishes.push({
 *       id: data[i][0],
 *       senderName: data[i][1],
 *       message: data[i][2],
 *       sticker: data[i][3],
 *       likes: parseInt(data[i][4] || 0),
 *       createdAt: data[i][5]
 *     });
 *   }
 *   return ContentService.createTextOutput(JSON.stringify(wishes))
 *     .setMimeType(ContentService.MimeType.JSON);
 * }
 * 
 * function doPost(e) {
 *   var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *   var params = JSON.parse(e.postData.contents);
 *   
 *   if (params.action === 'addWish') {
 *     var newRow = [
 *       params.id,
 *       params.senderName,
 *       params.message,
 *       params.sticker,
 *       0,
 *       new Date().toLocaleString()
 *     ];
 *     sheet.appendRow(newRow);
 *     return ContentService.createTextOutput(JSON.stringify({ status: 'success', wish: params }))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 *   
 *   if (params.action === 'likeWish') {
 *     var data = sheet.getDataRange().getValues();
 *     for (var i = 1; i < data.length; i++) {
 *       if (data[i][0] == params.id) {
 *         var currentLikes = parseInt(data[i][4] || 0) + 1;
 *         sheet.getRange(i + 1, 5).setValue(currentLikes);
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
    const res = await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('Google Sheets fetch failed, using local storage fallback:', error);
    return null;
  }
};

export const postWishToGoogleSheet = async (wish: BirthdayWish): Promise<boolean> => {
  if (!GOOGLE_SHEETS_WEB_APP_URL) return false;

  try {
    await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors', // Apps Script web app redirect compatibility
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'addWish',
        ...wish
      })
    });
    return true;
  } catch (error) {
    console.warn('Google Sheets post failed:', error);
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
