import { NextRequest, NextResponse } from 'next/server'

function getBalanceReaderUrl() {
  return process.env.BALANCE_READER_URL || 'http://balance-reader:8081'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    const token = request.headers.get('Authorization')

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 })
    }

    const BALANCE_READER_URL = getBalanceReaderUrl()
    const res = await fetch(`${BALANCE_READER_URL}/balance/${accountId}`, {
      headers: token ? { 'Authorization': token } : {},
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data.detail || 'Failed to get balance' }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Balance error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

