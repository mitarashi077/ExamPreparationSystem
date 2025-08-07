// 簡単な復習機能テストスクリプト
const axios = require('axios')

const BASE_URL = 'http://localhost:3001/api'

async function testReviewFeatures() {
  console.log('復習機能のテストを開始します...\n')

  try {
    // 1. ヘルスチェック
    console.log('1. ヘルスチェック...')
    const healthRes = await axios.get(`${BASE_URL}/health`)
    console.log('✓ サーバーが正常に動作しています:', healthRes.data)

    // 2. 復習スケジュールの取得
    console.log('\n2. 復習スケジュールの取得...')
    const scheduleRes = await axios.get(`${BASE_URL}/review/schedule`)
    console.log(
      '✓ 復習スケジュール:',
      JSON.stringify(scheduleRes.data, null, 2),
    )

    // 3. 復習問題の取得（まだ復習アイテムがない場合は空）
    console.log('\n3. 復習問題の取得...')
    const questionsRes = await axios.get(`${BASE_URL}/review/questions?limit=5`)
    console.log('✓ 復習問題:', JSON.stringify(questionsRes.data, null, 2))

    // 4. 復習統計の取得
    console.log('\n4. 復習統計の取得...')
    const statsRes = await axios.get(`${BASE_URL}/review/stats?period=7`)
    console.log('✓ 復習統計:', JSON.stringify(statsRes.data, null, 2))

    console.log('\n🎉 すべてのテストが成功しました')
  } catch (error) {
    console.error('❌ テスト中にエラーが発生しました:', error.message)
    if (error.response) {
      console.error('レスポンス:', error.response.data)
    }
  }
}

testReviewFeatures()
