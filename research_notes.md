# Research Notes

## Telegram Bot API

### sendPhoto Method
- URL: `https://api.telegram.org/bot<token>/sendPhoto`
- Required parameters:
  - `chat_id`: Unique identifier for the target chat
  - `photo`: Photo to send (file_id, URL, or multipart/form-data)
- Optional parameters:
  - `caption`: Photo caption (0-1024 characters)
  - Various formatting options
- Photo requirements:
  - Max size: 10 MB
  - Width and height must not exceed 10000 pixels
  - Width/height ratio must be at most 20

### sendContact Method
- URL: `https://api.telegram.org/bot<token>/sendContact`
- Required parameters:
  - `chat_id`: Unique identifier for the target chat
  - `phone_number`: Contact's phone number
  - `first_name`: Contact's first name
- Optional parameters:
  - `last_name`: Contact's last name
  - `vcard`: Additional data in vCard format (0-2048 bytes)

## User Consent and Privacy Considerations

- Must explicitly ask for user permission before accessing contacts or photos
- Should clearly explain what data will be sent and to whom
- Need to provide privacy policy explaining data usage
- Should allow users to review selected data before sending
- Must not store user data longer than necessary

## Technical Implementation Options

### Web Application
- Pros:
  - Cross-platform compatibility
  - No app store approval needed
  - Easier to update
- Cons:
  - Limited access to device contacts (browser permissions required)
  - More complex photo selection process
  - May require additional authentication

### Mobile Application (Android/iOS)
- Pros:
  - Direct access to device contacts and photos (with permission)
  - Better user experience for selection interfaces
  - Can implement more secure storage
- Cons:
  - Requires app store approval
  - Platform-specific development needed
  - More complex deployment

## Telegram Bot Token and Chat ID
- Bot Token provided: `7418376841:AAFJCKQUVdMyiv26nZXPK39aDnHQwFuSMWM`
- Telegram ID provided: `6839071694` (likely the chat_id to send data to)
