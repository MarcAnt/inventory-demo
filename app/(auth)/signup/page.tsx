"use client";

import { SignupForm } from "@/components/signup-form";
import Image from "next/image";

//Photo by <a href="https://unsplash.com/@p8lm_k5vq2rx?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">UZ Creative Services</a> on <a href="https://unsplash.com/photos/stacks-of-sacks-and-containers-in-a-warehouse-d_BHc47AzLQ?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a
            href="#"
            className="flex items-center gap-2 text-xl font-extrabold"
          >
            Inventario Demo
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/signup/inventory.jpg"
          alt="Login Image"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          priority
        />
      </div>
    </div>
  );
}
