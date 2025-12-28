import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { extractText } from 'unpdf';
import { authOptions } from '@/lib/auth/auth-options';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Initialize OpenAI client lazily
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
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to use this feature' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('resume') as File | null;
    const jobDescription = formData.get('jobDescription') as string;
    const companyName = formData.get('companyName') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const tone = formData.get('tone') as string || 'professional';

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    // Parse resume if provided
    let resumeText = '';
    if (file) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = new Uint8Array(bytes);
        const { text } = await extractText(buffer, { mergePages: true });
        resumeText = text || '';
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        // Continue without resume text
      }
    }

    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI API key not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const prompt = `You are an expert cover letter writer. Generate a compelling, personalized cover letter based on the following information.

${resumeText ? `CANDIDATE'S RESUME:
${resumeText.slice(0, 6000)}

` : ''}JOB DESCRIPTION:
${jobDescription.slice(0, 4000)}

${companyName ? `COMPANY: ${companyName}` : ''}
${jobTitle ? `POSITION: ${jobTitle}` : ''}
TONE: ${tone}

Generate a professional cover letter that:
1. Opens with a compelling hook that shows genuine interest
2. Highlights 2-3 most relevant experiences/skills from the resume that match the job
3. Demonstrates knowledge of the company (if company name provided)
4. Shows enthusiasm and cultural fit
5. Ends with a strong call to action

IMPORTANT:
- Keep it concise (250-350 words)
- Use a ${tone} tone
- Don't use generic phrases like "I am writing to apply for"
- Be specific about achievements and how they relate to the job
- Make it feel personalized, not templated

Respond with ONLY the cover letter text, no additional commentary or formatting marks.`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    });

    const coverLetter = completion.choices[0]?.message?.content || '';

    if (!coverLetter) {
      return NextResponse.json(
        { error: 'Failed to generate cover letter. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error('Cover Letter API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover letter. Please try again.' },
      { status: 500 }
    );
  }
}
