"use server";

import { ILogin, IRegister } from "@/app/(Auth)/_components/types";
import { createClient } from "@/integrations/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: ILogin) {
  const supabase = await createClient();

  const data = {
    email: formData.email,
    password: formData.password,
  };

  const { error, data: resp } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message }; // Return error message
  }

  return { success: true, email: data.email, data: resp };
}

export async function signup(formData: IRegister) {
  const supabase = await createClient();

  const data = {
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.name,
      },
    },
  };

  const { error, data: resp } = await supabase.auth.signUp(data);

  if (error) {
    return { error: error.message }; // Return error message
  }

  return { success: true, email: data.email, data: resp };
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/call");
}
