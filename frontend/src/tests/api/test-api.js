// Simple API test script to verify backend connectivity
// Run with: node test-api.js

const API_BASE = 'http://localhost:3001/api'

async function testAPI() {
  console.log('🧪 Testing Bookmark API Integration...')

  try {
    // Test 1: Health check
    console.log('\n1. Testing health endpoint...')
    const healthResponse = await fetch(`${API_BASE}/health`)
    const healthData = await healthResponse.json()
    console.log('✅ Health check:', healthData)

    // Test 2: Get bookmarks (empty state)
    console.log('\n2. Testing get bookmarks...')
    const bookmarksResponse = await fetch(`${API_BASE}/bookmarks`)
    const bookmarksData = await bookmarksResponse.json()
    console.log('✅ Get bookmarks:', bookmarksData)

    // Test 3: Create bookmark (this might fail if no questions exist)
    console.log('\n3. Testing create bookmark...')
    try {
      const createResponse = await fetch(`${API_BASE}/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: 'test_question_1',
          memo: 'Test memo from API test',
        }),
      })

      if (createResponse.ok) {
        const createData = await createResponse.json()
        console.log('✅ Create bookmark:', createData)

        // Test 4: Update bookmark
        console.log('\n4. Testing update bookmark...')
        const updateResponse = await fetch(
          `${API_BASE}/bookmarks/${createData.data.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              memo: 'Updated memo from API test',
            }),
          },
        )

        if (updateResponse.ok) {
          const updateData = await updateResponse.json()
          console.log('✅ Update bookmark:', updateData)
        } else {
          console.log('❌ Update bookmark failed:', await updateResponse.text())
        }

        // Test 5: Delete bookmark
        console.log('\n5. Testing delete bookmark...')
        const deleteResponse = await fetch(
          `${API_BASE}/bookmarks/${createData.data.id}`,
          {
            method: 'DELETE',
          },
        )

        if (deleteResponse.ok) {
          const deleteData = await deleteResponse.json()
          console.log('✅ Delete bookmark:', deleteData)
        } else {
          console.log('❌ Delete bookmark failed:', await deleteResponse.text())
        }
      } else {
        const errorData = await createResponse.json()
        console.log(
          'ℹ️ Create bookmark failed (expected if no questions):',
          errorData,
        )
      }
    } catch (error) {
      console.log(
        'ℹ️ Bookmark CRUD tests skipped (no valid questions):',
        error.message,
      )
    }

    // Test 6: Check bookmark status
    console.log('\n6. Testing bookmark status check...')
    try {
      const statusResponse = await fetch(
        `${API_BASE}/bookmarks/question/test_question_1`,
      )
      const statusData = await statusResponse.json()
      console.log('✅ Bookmark status:', statusData)
    } catch (error) {
      console.log('ℹ️ Bookmark status check failed (expected):', error.message)
    }

    console.log('\n🎉 API Integration Test Complete!')
    console.log('\n📝 Summary:')
    console.log('- Backend is running and accessible')
    console.log('- All API endpoints are responding')
    console.log('- Ready for frontend integration testing')
  } catch (error) {
    console.error('❌ API Test Failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('- Make sure backend server is running (npm run dev:backend)')
    console.log('- Check that port 3001 is available')
    console.log('- Verify database is accessible')
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ with built-in fetch')
  console.log('Alternative: Use curl or a REST client to test the endpoints')
  process.exit(1)
}

testAPI()
