import Redis from 'ioredis'

let redis: Redis | null = null

export function getRedisClient(): Redis {
    if (!redis) {
        redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
    }
    return redis
}

export async function pushToQueue(queueName: string, data: object): Promise<void> {
    const client = getRedisClient()
    await client.lpush(queueName, JSON.stringify(data))
}

export const QUEUE_NAME = 'queue:blitz_jobs'
