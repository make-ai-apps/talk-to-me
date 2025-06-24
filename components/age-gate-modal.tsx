"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";

const AGE_GATE_KEY = "ageConfirmed";

export function AgeGateModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const confirmed = localStorage.getItem(AGE_GATE_KEY);
    if (!confirmed) {
      setOpen(true);
    }
  }, []);

  const handleContinue = () => {
    localStorage.setItem(AGE_GATE_KEY, "true");
    setOpen(false);
  };

  const handleCancel = () => {
    router.back();
  };
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="fixed p-5 max-w-[90%] md:max-w-[700px] mx-auto backdrop-blur-[50px]  bg-[#252525d1] rounded-3xl border-none  h-fit top-[90%] translate-y-[-85%]  md:translate-y-[-50%] md:top-[50%]">
        <AlertDialogHeader>
          <div className="flex justify-between">
              <Image
                src={"/bg-img.jpg"}
                alt="portrait image"
                width={64}
                height={64}
                className="rounded-full object-cover w-16 h-16 image-cover  "
              />
            <div
              onClick={handleCancel}
              className="size-6 bg-[#7F7F7F80]  flex rounded-full items-center justify-center cursor-pointer"
            >
              <X className="size-4 text-[#252525d1]" />
            </div>
          </div>
          <AlertDialogTitle className="text-white text-[32px] leading-[39px] font-normal text-start">
            Are you 18 or older?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#7f7f7f80] text-[15px] leading-[20px] font-medium text-start">
            The website contains adult material and is only suitable for those
            18 years or older. Click &apos;Continue&apos; only if you are 18 years or
            older
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col gap-4 text-[17px] leading-[22px] font-medium text-white tracking-[0.2px]">
          <button
            className="w-full  py-4 bg-[#F43030E5] rounded-full "
            onClick={handleContinue}
          >
            Continue
          </button>
          <button
            className="w-full py-4 bg-[#7F7F7F66] rounded-full"
            onClick={handleCancel}
          >
            Exit
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}