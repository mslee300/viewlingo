import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  console.log('TTS API called with text:', text);
  if (!text) {
    console.log('Missing text');
    return NextResponse.json({ error: 'Missing text' }, { status: 400 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  console.log('ELEVENLABS_API_KEY present:', !!apiKey);
  if (!apiKey) {
    console.log('Missing ElevenLabs API key');
    return NextResponse.json({ error: 'Missing ElevenLabs API key' }, { status: 500 });
  }

  const elevenlabs = new ElevenLabsClient({ apiKey });
  try {
    const audio = await elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
      text,
      modelId: 'eleven_multilingual_v2',
      outputFormat: 'mp3_44100_128',
    });
    console.log('TTS audio generated successfully');
    return new NextResponse(audio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="speech.mp3"',
      },
    });
  } catch (e: any) {
    console.error('TTS error:', e);
    return NextResponse.json({ error: e.message || 'TTS failed' }, { status: 500 });
  }
} 