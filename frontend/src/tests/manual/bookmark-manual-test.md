# Bookmark API Integration Manual Test Plan

## Phase 1: Basic API Connectivity

### Test 1: Health Check
- [ ] Navigate to `http://localhost:3001/api/health`
- [ ] Should return: `{"status": "OK", "message": "Server is running"}`

### Test 2: Load Bookmarks (Empty State)
- [ ] Open Browser DevTools
- [ ] Navigate to Bookmarks page
- [ ] Check API call to `/api/bookmarks`
- [ ] Should receive empty bookmarks array (first time)

### Test 3: Check Mock Data Loading
- [ ] Click "サンプルデータを読み込む" button
- [ ] Verify mock bookmarks are displayed
- [ ] Check that BookmarkButton shows correct state

## Phase 2: CRUD Operations

### Test 4: Create Bookmark via API
- [ ] Navigate to a question page (if available)
- [ ] Click bookmark button (empty state)
- [ ] Check DevTools for POST request to `/api/bookmarks`
- [ ] Verify optimistic UI update
- [ ] Verify final state after API response

### Test 5: Update Bookmark Memo
- [ ] Go to Bookmarks page
- [ ] Click edit memo on a bookmark
- [ ] Add/edit memo content
- [ ] Save memo
- [ ] Check DevTools for PUT request to `/api/bookmarks/:id`
- [ ] Verify memo is updated in UI

### Test 6: Delete Bookmark
- [ ] Click delete button on a bookmark
- [ ] Confirm deletion (double-click pattern)
- [ ] Check DevTools for DELETE request to `/api/bookmarks/:id`
- [ ] Verify bookmark is removed from UI

### Test 7: Toggle Bookmark (Remove)
- [ ] Navigate to question with existing bookmark
- [ ] Click bookmark button (filled state)
- [ ] Verify DELETE API call
- [ ] Verify UI state change

## Phase 3: Error Handling

### Test 8: Network Error Simulation
- [ ] Stop backend server
- [ ] Try to create/update/delete bookmark
- [ ] Verify error messages are shown
- [ ] Verify UI rollback (optimistic updates reversed)
- [ ] Restart server and retry operations

### Test 9: Invalid Data Handling
- [ ] Use DevTools to simulate API errors (Network tab)
- [ ] Try bookmark operations with simulated 400/500 errors
- [ ] Verify appropriate error messages

## Phase 4: Filter and Search

### Test 10: Filter Bookmarks
- [ ] Add bookmarks with different categories/difficulties
- [ ] Use filter controls on Bookmarks page
- [ ] Verify API calls include filter parameters
- [ ] Verify filtered results

### Test 11: Search Bookmarks
- [ ] Enter search term in search box
- [ ] Verify debounced API call (500ms delay)
- [ ] Check search parameter in API request
- [ ] Verify search results

## Phase 5: Performance and UX

### Test 12: Loading States
- [ ] Verify loading indicators during API calls
- [ ] Check that buttons are disabled during operations
- [ ] Verify loading states don't persist incorrectly

### Test 13: Optimistic Updates
- [ ] Verify immediate UI feedback for all operations
- [ ] Test rollback on API failures
- [ ] Check that optimistic updates are replaced by server data

### Test 14: Data Persistence
- [ ] Add bookmarks
- [ ] Refresh page
- [ ] Verify bookmarks are reloaded from API
- [ ] Check localStorage for filter persistence

## Phase 6: Cross-browser Testing

### Test 15: Browser Compatibility
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Edge
- [ ] Test on mobile browsers

### Test 16: Mobile Responsiveness
- [ ] Test bookmark operations on mobile view
- [ ] Verify touch interactions work
- [ ] Check mobile-specific UI elements

## Phase 7: Production Environment

### Test 17: Vercel Deployment
- [ ] Test API integration on deployed version
- [ ] Verify production API endpoints work
- [ ] Check CORS configuration
- [ ] Test with production database

## Expected API Endpoints

- `GET /api/bookmarks` - List bookmarks with filters
- `POST /api/bookmarks` - Create bookmark
- `PUT /api/bookmarks/:id` - Update bookmark memo
- `DELETE /api/bookmarks/:id` - Delete bookmark
- `GET /api/bookmarks/question/:questionId` - Check bookmark status

## Error Scenarios to Test

1. Network timeout
2. Server unavailable (503)
3. Invalid request data (400)
4. Bookmark not found (404)
5. Duplicate bookmark creation (409)
6. Server error (500)

## Success Criteria

- [ ] All CRUD operations work via API
- [ ] Error handling is user-friendly
- [ ] UI remains responsive during operations
- [ ] Optimistic updates work correctly
- [ ] Data persistence works
- [ ] Performance is acceptable (<2s for operations)
- [ ] Mobile functionality works
- [ ] Production deployment works

## Notes

- Use browser DevTools Network tab to monitor API calls
- Check Console for any JavaScript errors
- Verify database state using backend logs or database tools
- Test with both empty and populated bookmark lists
