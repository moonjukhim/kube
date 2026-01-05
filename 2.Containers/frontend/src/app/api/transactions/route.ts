import { NextRequest, NextResponse } from 'next/server'

function getTransactionHistoryUrl() {
  return process.env.TRANSACTION_HISTORY_URL || 'http://transaction-history:8082'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    const token = request.headers.get('Authorization')

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 })
    }

    const TRANSACTION_HISTORY_URL = getTransactionHistoryUrl()
    const res = await fetch(`${TRANSACTION_HISTORY_URL}/transactions/${accountId}`, {
      headers: token ? { 'Authorization': token } : {},
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data.detail || 'Failed to get transactions' }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Transactions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

