"use client";

import EditPropertyView from "@/app/components/landlord/EditPropertyView";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";

export default function EditListingPage({
  params,
}: {
  params: { codename: string };
}) {
  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      <Header />
      <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* We pass a placeholder token/user_id here, but in real app, these come from context or props.
            EditPropertyView will use useAuth hook internally or take it from props.
            Let's structure it to fetch correctly if we need to. */}
        <EditPropertyViewWrapper propertyId={params.codename} />
      </main>
      <Footer />
    </div>
  );
}

// Client component wrapper to provide user token

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/authcontext";

function EditPropertyViewWrapper({ propertyId }: { propertyId: string }) {
  const { token, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  if (!token || !user) {
    return <div>Loading...</div>; // Or redirect
  }

  return (
    <EditPropertyView
      token={token}
      user_id={String(user.id)}
      propertyId={propertyId}
      onSuccess={() => router.push("/landlord")}
      onCancel={() => router.push("/landlord")}
      toast={toast}
    />
  );
}
