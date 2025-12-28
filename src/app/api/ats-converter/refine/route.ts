import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { authOptions } from '@/lib/auth/auth-options';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '',
    baseURL: process.env.OPENROUTER_API_KEY
      ? 'https://openrouter.ai/api/v1'
      : 'https://api.openai.com/v1',
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to use this feature' },
        { status: 401 }
      );
    }

    const { currentResume, instruction } = await request.json();

    if (!currentResume || !instruction) {
      return NextResponse.json(
        { error: 'Current resume and instruction are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI API key not configured.' },
        { status: 500 }
      );
    }

    const prompt = `You are a helpful assistant that refines ATS-optimized resumes based on user instructions.

CURRENT RESUME:
${currentResume}

USER INSTRUCTION:
${instruction}

Apply the user's requested changes to the resume. Keep the ATS-friendly format intact (simple text, clear sections, bullet points). Only modify what the user asks for.

Respond with ONLY the updated resume text, no explanations or commentary.`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 3000,
      temperature: 0.5,
    });

    const refinedResume = completion.choices[0]?.message?.content || '';

    if (!refinedResume) {
      return NextResponse.json(
        { error: 'Failed to refine resume' },
        { status: 500 }
      );
    }

    return NextResponse.json({ convertedResume: refinedResume });
  } catch (error) {
    console.error('Refine API Error:', error);
    return NextResponse.json(
      { error: 'Failed to refine resume. Please try again.' },
      { status: 500 }
    );
  }
}
