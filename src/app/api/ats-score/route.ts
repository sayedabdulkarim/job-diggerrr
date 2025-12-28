import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { extractText } from 'unpdf';

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
    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    // Parse PDF using unpdf
    let resumeText = '';
    try {
      const { text } = await extractText(buffer, { mergePages: true });
      resumeText = text || '';
      console.log('PDF parsed, text length:', resumeText.length);
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return NextResponse.json({
        error: 'Failed to parse PDF. Make sure the file is a valid PDF document.'
      }, { status: 400 });
    }

    if (!resumeText || resumeText.trim().length < 50) {
      console.log('Resume text too short or empty:', resumeText.length);
      return NextResponse.json({
        error: 'Could not extract text from PDF. The PDF might be image-based or empty. Try a different resume format.'
      }, { status: 400 });
    }

    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY && !process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'AI API key not configured. Please contact support.'
      }, { status: 500 });
    }

    // Analyze with OpenAI
    const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze the following resume and provide a detailed ATS compatibility assessment.

Resume Content:
${resumeText.slice(0, 8000)}

Provide your analysis in the following JSON format (respond with ONLY valid JSON, no markdown):
{
  "score": <number 0-100>,
  "summary": "<1-2 sentence summary of the resume's ATS compatibility>",
  "good": [
    "<list of things done well, max 5 items>"
  ],
  "warnings": [
    "<list of things that need improvement, max 5 items>"
  ],
  "issues": [
    "<list of critical issues that may cause ATS rejection, max 3 items>"
  ],
  "keywords": {
    "found": ["<relevant tech/skill keywords found in resume, max 10>"],
    "missing": ["<important keywords that should be added based on common job requirements, max 8>"]
  },
  "suggestions": [
    "<actionable suggestions to improve ATS score, max 5 items>"
  ]
}

Scoring criteria:
- Contact info present: +10
- Clear section headers: +10
- Relevant keywords: +20
- Quantifiable achievements: +15
- Clean formatting (no tables/graphics): +10
- Proper date formats: +5
- Skills section present: +10
- Work experience with bullet points: +10
- Education section: +5
- No spelling/grammar issues: +5

Be honest and helpful. Focus on actionable feedback.`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Parse JSON response
    let result;
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Return a default response if parsing fails
      result = {
        score: 65,
        summary: 'Analysis completed but response formatting failed. Please try again.',
        good: ['Resume was successfully parsed'],
        warnings: ['Could not complete full analysis'],
        issues: [],
        keywords: { found: [], missing: [] },
        suggestions: ['Try uploading again for a complete analysis'],
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('ATS Score API Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume. Please try again.' },
      { status: 500 }
    );
  }
}
