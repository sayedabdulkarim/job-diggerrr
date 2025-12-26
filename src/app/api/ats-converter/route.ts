import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { extractText } from 'unpdf';
import { authOptions } from '@/lib/auth/auth-options';

export const dynamic = 'force-dynamic';

// Use OpenRouter if available, fallback to OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENROUTER_API_KEY
    ? 'https://openrouter.ai/api/v1'
    : 'https://api.openai.com/v1',
});

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
    const file = formData.get('resume') as File;
    const targetRole = formData.get('targetRole') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer and extract text
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    let resumeText = '';
    try {
      const { text } = await extractText(buffer, { mergePages: true });
      resumeText = text || '';
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return NextResponse.json({
        error: 'Failed to parse PDF. Make sure the file is a valid PDF document.'
      }, { status: 400 });
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json({
        error: 'Could not extract text from PDF. The PDF might be image-based or empty.'
      }, { status: 400 });
    }

    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'AI API key not configured. Please contact support.'
      }, { status: 500 });
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) resume optimizer. Convert the following resume into an ATS-optimized format.

ORIGINAL RESUME:
${resumeText.slice(0, 8000)}

${targetRole ? `TARGET ROLE: ${targetRole}` : ''}

Create an ATS-optimized version following these rules:

1. FORMAT REQUIREMENTS:
   - Use simple, clean formatting (no tables, columns, graphics, headers/footers)
   - Use standard section headings: CONTACT, SUMMARY, EXPERIENCE, SKILLS, EDUCATION, CERTIFICATIONS
   - Use bullet points (•) for lists
   - Use consistent date format (MM/YYYY - MM/YYYY)
   - Keep it to 1-2 pages worth of content

2. CONTENT OPTIMIZATION:
   - Add a professional summary at the top (2-3 sentences)
   - Start bullet points with action verbs
   - Include quantifiable achievements where possible
   - Add relevant keywords for ${targetRole || 'the industry'}
   - Ensure contact info is complete and properly formatted

3. OUTPUT FORMAT:
   Respond with a JSON object containing:
   {
     "convertedResume": "The full ATS-optimized resume text with proper formatting",
     "changes": ["List of key changes made to improve ATS compatibility"],
     "addedKeywords": ["Keywords that were added or emphasized"],
     "tips": ["Additional tips for this specific resume"]
   }

Respond with ONLY valid JSON, no markdown code blocks.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.5,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Parse JSON response
    let result;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({
        error: 'Failed to process resume. Please try again.'
      }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('ATS Converter API Error:', error);
    return NextResponse.json(
      { error: 'Failed to convert resume. Please try again.' },
      { status: 500 }
    );
  }
}
