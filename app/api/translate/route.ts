import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Redis for rate limiting (optional)
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() :
                request.headers.get('x-real-ip') ||
                'unknown';

    // Rate limiting check (only if Redis is configured)
    let rateLimitHeaders = {};
    if (ratelimit) {
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);

      if (!success) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'Too many translation requests. Please try again later.',
            reset,
            limit,
            remaining
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': new Date(reset).toISOString(),
            }
          }
        );
      }

      rateLimitHeaders = {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString(),
      };
    }

    // Parse request body
    const body = await request.json();
    const { text, sourceLanguage, targetLanguage } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: text is required and must be a string' },
        { status: 400 }
      );
    }

    if (!sourceLanguage || typeof sourceLanguage !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: sourceLanguage is required and must be a string' },
        { status: 400 }
      );
    }

    if (!targetLanguage || typeof targetLanguage !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input: targetLanguage is required and must be a string' },
        { status: 400 }
      );
    }

    // Check text length (prevent abuse)
    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Text too long: Maximum 10,000 characters allowed' },
        { status: 400 }
      );
    }

    // Check if source and target languages are the same
    if (sourceLanguage === targetLanguage) {
      return NextResponse.json(
        { error: 'Source and target languages cannot be the same' },
        { status: 400 }
      );
    }

    // Create translation prompt
    const translationPrompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Provide only the translation without any additional explanations, notes, or commentary.

Text to translate:
${text}

Translation:`;

    // Call OpenAI API for translation
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional translator. Provide accurate, natural-sounding translations. Only return the translated text without any additional content."
        },
        {
          role: "user",
          content: translationPrompt
        }
      ],
      max_tokens: Math.min(text.length * 2, 4000), // Dynamic token limit based on input length
      temperature: 0.3, // Lower temperature for more consistent translations
    });

    // Extract translation from response
    const translatedText = completion.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      return NextResponse.json(
        { error: 'Translation failed: No translation received from AI service' },
        { status: 500 }
      );
    }

    // Return successful translation response
    return NextResponse.json({
      success: true,
      translatedText,
      sourceLanguage,
      targetLanguage,
      originalTextLength: text.length,
      translatedTextLength: translatedText.length,
    }, {
      headers: rateLimitHeaders
    });

  } catch (error: any) {
    console.error('Translation API error:', error);

    // Handle specific OpenAI errors
    if (error?.code === 'insufficient_quota') {
      return NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          message: 'Translation service quota exceeded. Please try again later.'
        },
        { status: 503 }
      );
    }

    if (error?.code === 'invalid_api_key') {
      return NextResponse.json(
        {
          error: 'Service configuration error',
          message: 'Translation service is not properly configured.'
        },
        { status: 500 }
      );
    }

    if (error?.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          message: 'OpenAI rate limit exceeded. Please try again later.'
        },
        { status: 503 }
      );
    }

    // Handle network/timeouts
    if (error?.code === 'timeout' || error?.code === 'network_error') {
      return NextResponse.json(
        {
          error: 'Service temporarily unavailable',
          message: 'Translation service is experiencing issues. Please try again later.'
        },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'Translation failed',
        message: 'An unexpected error occurred during translation. Please try again.'
      },
      { status: 500 }
    );
  }
}