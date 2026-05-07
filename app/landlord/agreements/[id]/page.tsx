"use client";

import { useAuth } from "@/context/authcontext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Loader2, ArrowLeft, PenTool, CheckCircle2, AlertTriangle, ShieldCheck, Mail } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useFileUpload } from "@/hooks/useFileUpload";

export default function AgreementSignPage({
  params,
}: {
  params: { id: string };
}) {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { handleFileUpload, uploadedFiles } = useFileUpload(token);

  const [agreement, setAgreement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchAgreement = async () => {
      if (!token) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/upgrade-agreements/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setAgreement(data.data);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load agreement.",
          });
          router.push("/landlord");
        }
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAgreement();
  }, [token, params.id, router, toast]);

  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upgrade-agreements/${params.id}/send-otp`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (res.ok) {
        setOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "Please check your registered email for the verification code.",
        });
      } else {
        throw new Error("Failed to send OTP");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send OTP.",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSign = async () => {
    const signatureFile = uploadedFiles.find((f) => f.type === "others" && f.url);
    if (!signatureFile) {
      toast({
        variant: "destructive",
        title: "Signature Required",
        description: "Please upload an image of your signature first.",
      });
      return;
    }
    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP sent to your email.",
      });
      return;
    }

    setSigning(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upgrade-agreements/${params.id}/sign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            otp,
            signature_url: signatureFile.url,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setAgreement(data.data);
        toast({
          title: "Agreement Signed",
          description: "You have successfully signed the upgrade financing agreement.",
        });
      } else {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to sign agreement");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setSigning(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!agreement) return null;

  const isSigned = agreement.status === "signed";
  const signatureFile = uploadedFiles.find((f) => f.type === "others");

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild className="text-slate-500 hover:text-slate-900">
            <Link href="/landlord">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
          {isSigned && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full text-sm font-bold border border-emerald-200">
              <CheckCircle2 className="h-5 w-5" /> Legally Signed
            </div>
          )}
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black font-raleway text-slate-900 tracking-tight">
            Property Upgrade Agreement
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Please carefully review the financing and repayment terms before completing the digital signature process.
          </p>
        </div>

        {/* Document Viewer */}
        <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-white">
          <div className="bg-[#fcfbf9] border-b border-slate-100 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Official Document</p>
                <p className="text-xs text-slate-500">ID: {agreement.unique_id}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-8 sm:p-12 font-serif text-slate-800 leading-relaxed max-w-3xl mx-auto prose prose-slate prose-headings:font-sans prose-headings:font-bold prose-a:text-primary prose-img:rounded-md">
            <ReactMarkdown>
              {agreement.agreement_text}
            </ReactMarkdown>
          </CardContent>
        </Card>

        {/* Signing Section */}
        {!isSigned && (
          <Card className="border border-slate-200 shadow-lg rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-900 px-8 py-6 text-white flex items-center gap-4">
              <PenTool className="h-6 w-6 text-emerald-400" />
              <div>
                <h3 className="font-bold text-lg">Digital Signature Validation</h3>
                <p className="text-sm text-slate-400">Two-factor authentication required</p>
              </div>
            </div>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Step 1: Signature Upload */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs">1</span>
                      Upload Signature
                    </h4>
                    <p className="text-xs text-slate-500">Please upload a clear image of your physical signature.</p>
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50 relative group">
                    {signatureFile?.url ? (
                      <div className="relative">
                        <img src={signatureFile.url} alt="Signature" className="max-h-24 mx-auto" />
                        <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                           <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileUpload(e.target.files[0], "others");
                                }
                              }}
                            />
                            <Button size="sm" variant="secondary">Replace</Button>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(e.target.files[0], "others");
                            }
                          }}
                        />
                        <PenTool className="h-8 w-8 text-slate-300 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <Button type="button" variant="outline" className="pointer-events-none">Choose Image</Button>
                        {signatureFile?.uploading && <p className="text-xs text-primary mt-2 animate-pulse">Uploading...</p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2: OTP Verification */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs">2</span>
                      Identity Verification
                    </h4>
                    <p className="text-xs text-slate-500">Enter the 6-digit code sent to your email.</p>
                  </div>

                  {!otpSent ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                      <Mail className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                      <Button onClick={handleSendOtp} disabled={sendingOtp} className="w-full bg-blue-600 hover:bg-blue-700">
                        {sendingOtp ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Send Verification Code
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Security Code (OTP)</Label>
                        <Input
                          type="text"
                          maxLength={6}
                          placeholder="000000"
                          className="text-center tracking-[0.5em] text-xl font-bold h-14 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                      <Button
                        className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                        onClick={handleSign}
                        disabled={signing || otp.length !== 6 || !signatureFile?.url}
                      >
                        {signing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
                        I Agree & Sign
                      </Button>
                      <button onClick={handleSendOtp} disabled={sendingOtp} className="text-xs text-slate-500 hover:text-primary underline w-full text-center">
                        Resend Code
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
