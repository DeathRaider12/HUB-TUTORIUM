import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, '10 s'),
})

export async function middleware(request: NextRequest) {
    const ip = request.ip ?? '127.0.0.1'
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip)

    if (!success) {
        return new NextResponse('Too Many Requests', {
            status: 429,
            headers: {
                'Retry-After': reset.toString(),
            },
        })
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/api/:path*',
}