import { NextRequest, NextResponse } from 'next/server'

function getUserserviceUrl() {
  return process.env.USERSERVICE_URL || 'http://userservice:8000'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const USERSERVICE_URL = getUserserviceUrl()
    
    const res = await fetch(`${USERSERVICE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data.detail || 'Login failed' }, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

