/**
 * [서버 전용 API Route]
 * 번역 데이터를 서버에서만 처리하여 클라이언트 번들에 노출되지 않도록 합니다.
 * GET /api/translations/[lang]
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Language } from '@/lib/translations/config';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lang: string }> | { lang: string } }
) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as Language;

  try {
    let data: Record<string, string> = {};

    // Explicit dynamic imports for better Turbopack compatibility
    try {
      let moduleRaw;
      switch (lang) {
        case 'en': moduleRaw = await import('@/lib/translations/en'); break;
        case 'ko': moduleRaw = await import('@/lib/translations/ko'); break;
        case 'vi': moduleRaw = await import('@/lib/translations/vi'); break;
        case 'zh': moduleRaw = await import('@/lib/translations/zh'); break;
        case 'km': moduleRaw = await import('@/lib/translations/km'); break;
        case 'ne': moduleRaw = await import('@/lib/translations/ne'); break;
        case 'uz': moduleRaw = await import('@/lib/translations/uz'); break;
        case 'my': moduleRaw = await import('@/lib/translations/my'); break;
        case 'id': moduleRaw = await import('@/lib/translations/id'); break;
        case 'th': moduleRaw = await import('@/lib/translations/th'); break;
        case 'si': moduleRaw = await import('@/lib/translations/si'); break;
        case 'mn': moduleRaw = await import('@/lib/translations/mn'); break;
        case 'bn': moduleRaw = await import('@/lib/translations/bn'); break;
        case 'kk': moduleRaw = await import('@/lib/translations/kk'); break;
        case 'ur': moduleRaw = await import('@/lib/translations/ur'); break;
        default: moduleRaw = { [lang]: {} };
      }
      const module = moduleRaw as any;
      data = module[lang] || module.default || {};
    } catch (e) {
      console.error(`Failed to load translation for ${lang}:`, e);
      data = {};
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Translation API Error:', error);
    return NextResponse.json({}, { status: 200 });
  }
}
