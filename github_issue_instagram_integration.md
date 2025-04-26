# Add Instagram handles and cross-platform navigation

## Feature Request: Instagram Integration and Cross-Platform Navigation

### Description
Add support for instructors to connect their Instagram profiles and improve navigation between different platforms (website, Instagram, etc.)

### Requirements
- Add Instagram handle field to instructor profiles
- Display Instagram links on instructor lesson pages
- Add social media icons/links to instructor profiles
- Implement easy navigation between platforms

### User Experience
- Instructors can enter their Instagram handle in their profile settings
- Students can easily find and follow instructors on Instagram
- Improved cross-promotion between platforms

### Benefits
- Increases instructor visibility and followership
- Creates a more connected ecosystem between the teaching platform and social media
- Helps instructors promote their content across multiple channels

### Implementation Notes
- Add `instagram_handle` field to instructor_profiles table
- Create UI for adding/editing this field in profile settings
- Add social media display components with proper icons
- Ensure proper validation of handles

### Technical Details
1. Database changes:
   ```sql
   ALTER TABLE public.instructor_profiles 
   ADD COLUMN instagram_handle TEXT;
   ```

2. UI modifications:
   - Add Instagram field to profile edit form
   - Add Instagram icon in instructor profile displays
   - Add social sharing buttons on lesson pages

3. Components needed:
   - Social media button/link component
   - Instagram profile validation
   - Social sharing component for lessons