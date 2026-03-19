
"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, Check, X, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function UploadPage() {
  const [files, setFiles] = useState<{name: string, size: string, status: 'uploading' | 'done'}[]>([]);

  const handleFileDrop = (e: any) => {
    e.preventDefault();
    const newFiles = [
      { name: "W-2_양식_2024.pdf", size: "1.2 MB", status: 'done' },
      { name: "임대차_계약서.jpg", size: "2.4 MB", status: 'done' }
    ] as any;
    setFiles([...files, ...newFiles]);
  };

  return (
    <div className="min-h-screen flex flex-col font-body bg-accent/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold font-headline tracking-tight">문서 센터</h1>
            <p className="text-muted-foreground">세금 양식 및 재무 기록을 안전하게 업로드하세요.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>문서 업로드</CardTitle>
                <CardDescription>W-2, 1040NR 및 기타 증빙 서류를 끌어서 놓으세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-primary/20 rounded-2xl p-12 text-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group"
                >
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">파일을 클릭하거나 여기로 드래그하세요</h3>
                  <p className="text-sm text-muted-foreground">PDF, JPEG 또는 PNG (파일당 최대 10MB)</p>
                  <input type="file" className="hidden" multiple />
                </div>

                {files.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">업로드된 파일</h4>
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-white shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-accent rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50">
                            <Check className="h-3 w-3 mr-1" /> 준비됨
                          </Badge>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                  <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">보안 제일</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm opacity-90 leading-relaxed">
                    당사는 민감한 데이터를 보호하기 위해 AES-256 암호화를 사용합니다. 귀하의 문서는 환급 절차 중에 공인 세무 전문가만 접근할 수 있습니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">체크리스트</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>W-2 또는 1042-S 양식</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>여권 사본 (사진 면)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>비자 또는 I-94 기록</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6" variant="outline">
                    체크리스트 PDF 다운로드
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
