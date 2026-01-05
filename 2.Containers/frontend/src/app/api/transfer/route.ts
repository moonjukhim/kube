import { NextRequest, NextResponse } from 'next/server'

function getLedgerWriterUrl() {
  return process.env.LEDGER_WRITER_URL || 'http://ledger-writer:8083'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = request.headers.get('Authorization')

    const LEDGER_WRITER_URL = getLedgerWriterUrl()
    const res = await fetch(`${LEDGER_WRITER_URL}/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': token } : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data.detail || 'Transfer failed' }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Transfer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

