import Header from "@/components/header/header";
import React from "react";

export default function Layout({ children }: any) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
