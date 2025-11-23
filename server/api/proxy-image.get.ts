export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const imageUrl = query.url as string

    if (!imageUrl) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Image URL is required',
        })
    }

    try {
        const response = await fetch(imageUrl)
        if (!response.ok) {
            throw createError({
                statusCode: response.status,
                statusMessage: 'Failed to fetch image',
            })
        }

        const blob = await response.blob()
        const arrayBuffer = await blob.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        setHeader(event, 'Content-Type', blob.type)
        setHeader(event, 'Cache-Control', 'public, max-age=3600')

        return buffer
    } catch (error) {
        console.error('Proxy error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch image',
        })
    }
})
