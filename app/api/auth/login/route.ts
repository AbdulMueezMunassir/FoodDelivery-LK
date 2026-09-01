import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Demo credentials
    if (email === 'demo@example.com' && password === 'password123') {
      const user = {
        id: '1',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'customer'
      };

      const response = NextResponse.json({
        success: true,
        user: user,
        message: 'Login successful'
      });

      // Set user cookie directly (no JWT needed for demo)
      response.cookies.set({
        name: 'user',
        value: JSON.stringify(user),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid credentials. Use demo@example.com / password123' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
