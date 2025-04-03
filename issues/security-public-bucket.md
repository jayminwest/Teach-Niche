# Security Issue: Public Storage Bucket for Video Content

## Description
Currently, our application uses a public Supabase storage bucket for video content. While this approach works and simplifies video playback, it introduces potential security risks as users could potentially share direct video URLs, bypassing our permission checks and payment requirements.

## Current Implementation
- The "videos" bucket is set to public access
- Our API (`/api/get-video-url`) checks permissions before returning URLs
- We rely on URL obscurity for security (hard-to-guess paths)

## Risks
1. Once a user has a video URL, they can share it with others
2. No expiration on URLs means they can be used indefinitely
3. No way to revoke access to specific videos if needed

## Proposed Solutions

### Option 1: Private Bucket with Signed URLs (Recommended)
- Change the bucket back to private
- Fix permission issues with signed URLs
- Implement short expiration times (15-30 minutes)
- Add client-side URL refresh when URLs expire

### Option 2: Implement a Streaming Proxy
- Keep the bucket private
- Create an API endpoint that streams video content
- Validate permissions on each request

### Option 3: Add Token-Based Security
- Generate short-lived tokens for each video request
- Include tokens in URLs
- Validate tokens server-side

## Implementation Priority
**High** - This represents a potential revenue loss if paid content can be freely shared.

## Assigned To
@CharlieHelps

## Timeline
Please investigate and implement a solution within the next sprint.
